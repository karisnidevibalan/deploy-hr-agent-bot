
require('dotenv').config();
import dateParser from './src/services/dateParser';

async function reproduce() {
    console.log('--- Reproducing 2534 Days Bug ---');

    const start = '2026-04-15';
    const end = '2026-05-19';

    console.log(`Testing range: ${start} to ${end}`);

    // Check if calculateInclusiveDays returns something crazy
    const days = dateParser.calculateInclusiveDays(start, end, false, true, []);
    console.log(`Days calculated: ${days}`);

    // Check if parsing "15-04-2026" and "19-05-2026" works correctly
    const message = "15-04-2026 to 19-05-2026";
    const result = dateParser.parseDates(message);
    console.log(`Parsed Start: ${result.startDate}`);
    console.log(`Parsed End: ${result.endDate}`);

    if (result.startDate && result.endDate) {
        const calculated = dateParser.calculateInclusiveDays(result.startDate, result.endDate, false, true, []);
        console.log(`Days from parsed dates: ${calculated}`);
    }

    // What if the year was mixed up?
    // 2534 days is roughly 7 years.
    // 2026 to 2033?

    console.log('\n--- Checking for year 2033 anomaly ---');
    const start2 = '2026-04-15';
    const end2 = '2033-05-19';
    const days2 = dateParser.calculateInclusiveDays(start2, end2, false, true, []);
    console.log(`Days between 2026-04-15 and 2033-05-19: ${days2}`);

    console.log('\n--- DONE ---');
}

reproduce().catch(console.error);
