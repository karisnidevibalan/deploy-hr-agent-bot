// Simple JS test to reproduce the bug
const msg = "15-04-2026 to 19-05-2026";

// Test the simpleRange regex from parseRange
const simpleRange = msg.match(/(\d{1,2}(?:st|nd|rd|th)?(?:\s+\w+)?)\s+(?:to|till|-)\s+(\d{1,2}(?:st|nd|rd|th)?(?:\s+\w+)?)/i);
console.log('simpleRange match:', simpleRange);
if (simpleRange) {
    console.log('Left:', simpleRange[1]);
    console.log('Right:', simpleRange[2]);
}

// Test working days calculation
function calculateWorkingDays(startStr, endStr) {
    let start = new Date(startStr);
    let end = new Date(endStr);
    console.log('\nDate parsing:');
    console.log('Start:', start.toISOString(), '(from', startStr + ')');
    console.log('End:', end.toISOString(), '(from', endStr + ')');

    if (end < start) return 0;

    let count = 0;
    let cur = new Date(start);
    while (cur <= end) {
        let day = cur.getDay();
        if (day !== 0 && day !== 6) count++;
        cur.setDate(cur.getDate() + 1);
    }
    return count;
}

// Test with correct ISO format
console.log('\n--- Test 1: Correct ISO format ---');
const days1 = calculateWorkingDays('2026-04-15', '2026-05-19');
console.log('Working days:', days1);

// Test with DD-MM-YYYY format (what user might enter)
console.log('\n--- Test 2: DD-MM-YYYY format ---');
const days2 = calculateWorkingDays('15-04-2026', '19-05-2026');
console.log('Working days:', days2);

// Check if "2534" could be a concatenation
console.log('\n--- Concatenation test ---');
console.log('25 + "34" =', 25 + "34");
console.log('"25" + 34 =', "25" + 34);
console.log('"25" + "34" =', "25" + "34");

// Calendar days calculation
const start = new Date('2026-04-15');
const end = new Date('2026-05-19');
const diffTime = Math.abs(end - start);
const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
console.log('\nCalendar days between 2026-04-15 and 2026-05-19:', diffDays);
