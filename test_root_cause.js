// Test to see what dates are created from the bad parse
console.log('=== ROOT CAUSE ANALYSIS ===\n');

const msg = "15-04-2026 to 19-05-2026";
const simpleRange = msg.match(/(\d{1,2}(?:st|nd|rd|th)?(?:\s+\w+)?)\s+(?:to|till|-)\s+(\d{1,2}(?:st|nd|rd|th)?(?:\s+\w+)?)/i);

console.log('Input:', msg);
console.log('Regex matched:', simpleRange[0]);
console.log('Left (should be start date):', simpleRange[1]);
console.log('Right (should be end date):', simpleRange[2]);

// Simulate what parseRangeBoundary would do with "26" and "19"
// It would treat them as day numbers in the current month
const now = new Date();
const date1 = new Date(now.getFullYear(), now.getMonth(), 26);
const date2 = new Date(now.getFullYear(), now.getMonth(), 19);

console.log('\nWhat parseRangeBoundary would create:');
console.log('From "26":', date1.toISOString().split('T')[0]);
console.log('From "19":', date2.toISOString().split('T')[0]);

// Calculate working days between these wrong dates
function calculateWorkingDays(start, end) {
    if (end < start) {
        console.log('ERROR: End date is before start date!');
        return 0;
    }

    let count = 0;
    let cur = new Date(start);
    while (cur <= end) {
        let day = cur.getDay();
        if (day !== 0 && day !== 6) count++;
        cur.setDate(cur.getDate() + 1);
    }
    return count;
}

const wrongDays = calculateWorkingDays(date1, date2);
console.log('Working days (wrong):', wrongDays);

// Now let's see what the CORRECT parse should be
console.log('\n=== CORRECT PARSING ===');
// The input "15-04-2026 to 19-05-2026" should be parsed as DD-MM-YYYY format
// But the simpleRange regex is too greedy and matches parts of the year

// What SHOULD happen: parseAbsolute should handle "15-04-2026"
const correctStart = '2026-04-15';
const correctEnd = '2026-05-19';
const start = new Date(correctStart);
const end = new Date(correctEnd);

console.log('Correct start:', correctStart);
console.log('Correct end:', correctEnd);

const correctDays = calculateWorkingDays(start, end);
console.log('Working days (correct):', correctDays);

// Calendar days
const diffTime = Math.abs(end - start);
const calendarDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
console.log('Calendar days:', calendarDays);

console.log('\n=== CONCATENATION TEST ===');
console.log('Is "2534" = "25" + "34"?', "25" + "34" === "2534");
console.log('Working days + Calendar days as strings:', correctDays + "" + calendarDays);
