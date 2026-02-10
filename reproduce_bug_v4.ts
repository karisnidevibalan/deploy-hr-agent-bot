
require('dotenv').config();
const { DateParserService } = require('./src/services/dateParser');
const dateParser = new DateParserService();

// Mock dependencies from chatController
function calculateWorkingDays(startDate, endDate, isHalfDay = false, holidays = []) {
    if (!startDate) return null;
    const effectiveEnd = endDate || startDate;
    const total = dateParser.calculateInclusiveDays(startDate, effectiveEnd, isHalfDay, true, holidays);
    if (isHalfDay) return 0.5;
    return total >= 1 ? total : 1;
}

function extractLeaveDetails(message, holidays = []) {
    const parsedDates = dateParser.parseDates(message);
    const durationInfo = dateParser.parseDuration(message);

    console.log('[DEBUG] message:', message);
    console.log('[DEBUG] parsedDates:', JSON.stringify(parsedDates, null, 2));
    console.log('[DEBUG] durationInfo:', JSON.stringify(durationInfo, null, 2));

    let startDate = parsedDates.startDate;
    let endDate = parsedDates.endDate ?? parsedDates.startDate;

    if (startDate && durationInfo.durationDays && (!endDate || durationInfo.hasExplicitDuration)) {
        // Project end date if we have a duration but no end date, or if duration is explicit
        endDate = durationInfo.isHalfDay ? startDate : dateParser.projectEndDate(startDate, durationInfo.durationDays);
    }

    let finalDurationDays = durationInfo.durationDays;
    if (!durationInfo.isHalfDay) {
        const calc = calculateWorkingDays(startDate ?? null, endDate ?? null, false, holidays);
        console.log('[DEBUG] calculateWorkingDays result:', calc);
        finalDurationDays = calc ?? durationInfo.durationDays ?? null;
    }

    return {
        startDate,
        endDate,
        durationDays: finalDurationDays
    };
}

const msg = "Apply for leave 15-04-2026 to 19-05-2026";
console.log('--- Tracing message:', msg);
const result = extractLeaveDetails(msg);
console.log('Result:', JSON.stringify(result, null, 2));

console.log('\n--- Tracing raw dates: "15-04-2026 to 19-05-2026"');
const result2 = extractLeaveDetails("15-04-2026 to 19-05-2026");
console.log('Result2:', JSON.stringify(result2, null, 2));

// Check if there's any weird math
console.log('\n--- Checking weird math ---');
const d1 = "25";
const d2 = "34";
console.log('Concatenation: d1 + d2 =', d1 + d2);
console.log('Sum: Number(d1) + Number(d2) =', Number(d1) + Number(d2));
