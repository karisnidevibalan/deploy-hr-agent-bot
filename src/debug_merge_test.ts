import * as fs from 'fs';
import * as path from 'path';
require('dotenv').config();
import { PolicyService } from './services/policyService';

const dataDir = path.join(process.cwd(), 'src', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Helpers
const backup = (file: string) => {
    const p = path.join(dataDir, file);
    if (fs.existsSync(p)) fs.copyFileSync(p, p + '.bak');
};
const restore = (file: string) => {
    const p = path.join(dataDir, file);
    if (fs.existsSync(p + '.bak')) {
        fs.copyFileSync(p + '.bak', p);
        fs.unlinkSync(p + '.bak');
    }
};
const cleanup = (file: string) => {
    const p = path.join(dataDir, file);
    if (fs.existsSync(p)) fs.unlinkSync(p);
};

async function testMerge() {
    console.log('🧪 Starting Merge Verification...');

    // --- TEST 1: Leave Policy Merge ---
    console.log('\n--- Test 1: Leave Policy Merge ---');
    const leaveFile = 'leavePolicy.json';
    backup(leaveFile);

    // Seed initial data
    const initialLeave = {
        companyName: "Test Corp",
        leaveTypes: {
            annual: { name: "Annual Leave", entitlement: 10 }
        }
    };
    fs.writeFileSync(path.join(dataDir, leaveFile), JSON.stringify(initialLeave));

    // Update with new data
    console.log('Merging "Sick Leave" into existing policy...');
    const result1 = await PolicyService.updatePolicyFromJson('leave', 'Sick Leave: Entitlement is 12 days per year. Documentation required for > 2 days.');

    if (result1.success) {
        const updatedLeave = JSON.parse(fs.readFileSync(path.join(dataDir, leaveFile), 'utf8'));
        if (updatedLeave.leaveTypes.annual && updatedLeave.leaveTypes.sick) {
            console.log('✅ PASS: Both Annual and Sick leave present.');
        } else {
            console.error('❌ FAIL: Merge failed. Data:', JSON.stringify(updatedLeave, null, 2));
        }
    } else {
        console.error('❌ FAIL: Update failed', result1.message);
    }

    // --- TEST 2: Holiday 2026 Append ---
    console.log('\n--- Test 2: Holiday 2026 Append ---');
    const hol26 = 'holidays_2026.json';
    backup(hol26);

    const initialHol26 = {
        year: 2026,
        holidays: [
            { date: "2026-01-01", name: "New Year", day: "Thursday" }
        ]
    };
    fs.writeFileSync(path.join(dataDir, hol26), JSON.stringify(initialHol26));

    console.log('Appending "Republic Day" to 2026...');
    const result2 = await PolicyService.updatePolicyFromJson('holiday', 'Republic Day is on 2026-01-26 (Monday).');

    if (result2.success) {
        const updatedHol26 = JSON.parse(fs.readFileSync(path.join(dataDir, hol26), 'utf8'));
        const hasNewYear = updatedHol26.holidays.some((h: any) => h.name.includes('New Year'));
        const hasRepublic = updatedHol26.holidays.some((h: any) => h.name.includes('Republic'));

        if (hasNewYear && hasRepublic) {
            console.log('✅ PASS: 2026 Holiday appended successfully.');
        } else {
            console.error('❌ FAIL: Append failed. Holidays:', updatedHol26.holidays);
        }
    } else {
        console.error('❌ FAIL: Holiday update failed', result2.message);
    }

    // --- TEST 3: Holiday 2027 New File ---
    console.log('\n--- Test 3: Holiday 2027 Separation ---');
    const hol27 = 'holidays_2027.json';
    cleanup(hol27); // Ensure clean slate

    console.log('Creating 2027 holidays...');
    const result3 = await PolicyService.updatePolicyFromJson('holiday', 'Independence Day 2027 is on August 15th.');

    if (result3.success) {
        if (fs.existsSync(path.join(dataDir, hol27))) {
            const data27 = JSON.parse(fs.readFileSync(path.join(dataDir, hol27), 'utf8'));
            if (data27.year === 2027) {
                console.log('✅ PASS: 2027 file created.');
            } else {
                console.error('❌ FAIL: 2027 file content wrong.');
            }

            // Verify 2026 is untouched (re-read)
            const data26 = JSON.parse(fs.readFileSync(path.join(dataDir, hol26), 'utf8'));
            if (data26.year === 2026 && data26.holidays.length >= 2) { // 2 from previous test
                console.log('✅ PASS: 2026 file preserved.');
            } else {
                console.error('❌ FAIL: 2026 file modified unexpectedly.');
            }
        } else {
            console.error('❌ FAIL: holidays_2027.json not created.');
        }
    }

    // Cleanup / Restore
    console.log('\n--- Cleanup ---');
    restore(leaveFile);
    restore(hol26);
    cleanup(hol27);
    console.log('Done.');
}

if (require.main === module) {
    testMerge().catch(e => {
        console.error('Unhandled Error:', e);
        fs.writeFileSync('test_error.log', e.stack || e.toString());
    });
}
