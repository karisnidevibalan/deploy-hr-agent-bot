require('dotenv').config();
import dateParser from './src/services/dateParser';
import { PolicyService } from './src/services/policyService';

async function verify() {
    console.log('--- Verifying Day Calculation with Holiday Exclusion ---');

    // June 14 to July 4, 2026
    const start = '2026-06-14'; // Sunday
    const end = '2026-07-04';   // Saturday

    // From my investigation:
    // June 14 (Sun) - Skip
    // June 15-19 (Mon-Fri) - 5 days
    // June 20-21 (Sat-Sun) - Skip
    // June 22-26 (Mon-Fri) - 5 days
    // June 27-28 (Sat-Sun) - Skip
    // June 29-July 3 (Mon-Fri) - 5 days
    // July 4 (Sat) - Skip
    // Total = 15 days.

    const holidaysData = await PolicyService.getPolicy('holidays.json');
    const holidayDates = (holidaysData.holidays || []).map((h: any) => h.date);

    console.log(`Testing range: ${start} to ${end}`);
    console.log(`Holidays used for exclusion: ${holidayDates}`);

    const daysWithWeekends = dateParser.calculateInclusiveDays(start, end, false, false);
    const daysWithoutWeekends = dateParser.calculateInclusiveDays(start, end, false, true);
    const daysWithHolidays = dateParser.calculateInclusiveDays(start, end, false, true, holidayDates);

    console.log(`1. Total Calendar Days: ${daysWithWeekends}`); // Should be 21
    console.log(`2. Working Days (Excluding Weekends): ${daysWithoutWeekends}`); // Should be 15
    console.log(`3. Working Days (Excluding Weekends & Holidays): ${daysWithHolidays}`); // Should be 15 (no holidays in this range)

    // Now test with a known holiday in 2026
    // August 15 (Sat) - Independence Day. Let's try Aug 14 to Aug 17 (Fri-Mon)
    // Aug 14 (Fri) - Work
    // Aug 15 (Sat) - Weekend/Holiday
    // Aug 16 (Sun) - Weekend
    // Aug 17 (Mon) - Work
    // Expected: 2 days (Fri, Mon)
    const startH = '2026-08-14';
    const endH = '2026-08-17';
    const daysH = dateParser.calculateInclusiveDays(startH, endH, false, true, holidayDates);
    console.log(`\nTesting holiday Aug 15: ${startH} to ${endH}`);
    console.log(`Result: ${daysH} day(s) (Expected: 2)`);

    if (daysH === 2) {
        console.log('✅ Holiday exclusion logic verified!');
    } else {
        console.error('❌ Holiday exclusion logic failed!');
    }

    console.log('\n--- Day Calculation Verification DONE ---');
}

verify().catch(console.error);
