
require('dotenv').config();
import dateParser from './src/services/dateParser';
import { parseISO, format } from 'date-fns';

async function reproduce() {
    console.log('--- ENHANCED REPRODUCTION ---');

    // Test case 1: Standard input
    const start1 = "2026-04-15";
    const end1 = "2026-05-19";
    const days1 = dateParser.calculateInclusiveDays(start1, end1, false, true, []);
    console.log(`[TC1] ${start1} to ${end1} (working days): ${days1}`);

    // Test case 2: Parsing "15-04-2026 to 19-05-2026"
    const msg2 = "15-04-2026 to 19-05-2026";
    const res2 = dateParser.parseDates(msg2);
    console.log(`[TC2] Input: "${msg2}"`);
    console.log(`     Parsed Start: ${res2.startDate}`);
    console.log(`     Parsed End: ${res2.endDate}`);
    if (res2.startDate && res2.endDate) {
        console.log(`     Working Days: ${dateParser.calculateInclusiveDays(res2.startDate, res2.endDate, false, true, [])}`);
    }

    // Test case 3: Parsing "15-04-2026" and "19-05-2026" as separate segments
    // This mimics how parseRangeBoundary might see them
    const res3a = dateParser.parseDates("15-04-2026");
    const res3b = dateParser.parseDates("19-05-2026");
    console.log(`[TC3] Segmented: Start=${res3a.startDate}, End=${res3b.startDate}`);

    // Let's check if 2534 days matches ANY combination of dates nearby
    // 2534 calendar days before/after 2026-04-15
    const dt = new Date("2026-04-15");
    const future = new Date(dt.getTime() + 2534 * 24 * 60 * 60 * 1000);
    console.log(`[INFO] 2026-04-15 + 2534 calendar days = ${future.toISOString().split('T')[0]}`);

    const past = new Date(dt.getTime() - 2534 * 24 * 60 * 60 * 1000);
    console.log(`[INFO] 2026-04-15 - 2534 calendar days = ${past.toISOString().split('T')[0]}`);

    // Wait, 2534 working days?
    // 2534 working days is about 2534 * 7/5 = 3547 calendar days = ~9.7 years.

    // What if the month and day were swapped, and it looped?
    // No, that's unlikely to give a huge number unless the year is wrong.

    console.log('\n--- DATE PARSER STATE CHECK ---');
    // Check if the parser has any weird state
    console.log('--- DONE ---');
}

reproduce().catch(console.error);
