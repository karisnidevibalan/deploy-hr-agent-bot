
import * as dotenv from 'dotenv';
dotenv.config();
import { PolicyService } from '../src/services/policyService';

async function verify() {
    console.log('Verifying PolicyService.getAllHolidays()...');

    // Determine current year dynamically
    const currentYear = new Date().getFullYear();
    const result = PolicyService.getAllHolidays();

    console.log(`Returned Year: ${result.year}`);
    console.log(`Total Holidays Found: ${result.holidays.length}`);

    if (result.year !== currentYear) {
        console.error(`❌ FAILED: Exepected year ${currentYear}, but got ${result.year}`);
        process.exit(1);
    }

    // Check if we have holidays for the current year
    const currentYearHolidays = result.holidays.filter((h: any) => h.date.startsWith(`${currentYear}-`));
    console.log(`Holidays in ${currentYear}: ${currentYearHolidays.length}`);

    if (currentYearHolidays.length === 0) {
        console.warn(`⚠️ WARNING: No holidays found for ${currentYear}. This might be expected if data is missing, but check carefully.`);
    } else {
        console.log(`✅ Success: Found ${currentYearHolidays.length} holidays for ${currentYear}.`);
        console.log('Sample:', currentYearHolidays.slice(0, 3));
    }

    console.log('✅ Verification Passed');
}

verify().catch(console.error);
