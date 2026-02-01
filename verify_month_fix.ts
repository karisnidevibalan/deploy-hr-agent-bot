require('dotenv').config();
import { AiService } from './src/services/aiService';
import { PolicyService } from './src/services/policyService';

async function verify() {
    console.log('--- Verifying Month Extraction logic ---');
    const aiService = new AiService();

    const testCases = [
        { query: "how many holidays are there in this month", expectedIntent: 'holiday_list', expectedMonth: new Date().getMonth() + 1 },
        { query: "holidays next month", expectedIntent: 'holiday_list', expectedMonth: new Date().getMonth() + 2 > 12 ? 1 : new Date().getMonth() + 2 },
        { query: "holidays in January", expectedIntent: 'holiday_list', expectedMonth: 1 },
    ];

    for (const test of testCases) {
        console.log(`\nTesting query: "${test.query}"`);
        const analysis = await aiService.analyzeUserIntent(test.query, {});
        console.log(`Intent: ${analysis.intent}`);
        console.log(`Entities:`, analysis.entities);

        if (analysis.intent !== test.expectedIntent) {
            console.error(`❌ FAILED: Intent mismatch. Expected ${test.expectedIntent}, got ${analysis.intent}`);
        } else if (analysis.entities.month !== test.expectedMonth) {
            // Handle year rollover logic for "next month" if testing in December
            // But simplistic check:
            console.error(`❌ FAILED: Month mismatch for "${test.query}". Expected ${test.expectedMonth}, got ${analysis.entities.month}`);
        } else {
            console.log(`✅ PASSED: Intent and Month match.`);
        }
    }

    console.log('\n--- Verifying Filtering Logic (Simulation) ---');
    const holidaysData = PolicyService.getAllHolidays();
    const holidays = holidaysData.holidays || [];
    console.log(`Total Holidays in DB (Current Year): ${holidays.length}`);

    // Simulate "this month"
    const currentMonth = new Date().getMonth() + 1;
    const filtered = holidays.filter((h: any) => {
        const hDate = new Date(h.date);
        return (hDate.getMonth() + 1) === currentMonth;
    });
    console.log(`Holidays in current month (${currentMonth}): ${filtered.length}`);
    console.log('Filtered list:', filtered);
}

verify().catch(console.error);
