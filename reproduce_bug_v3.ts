
require('dotenv').config();
import { DateParserService } from './src/services/dateParser';
const dateParser = new DateParserService();
import { extractLeaveType, extractReason } from './src/controllers/chatController';

// Redefine helpers since we can't easily import from chatController
function calculateWorkingDays(startDate: string | null, endDate: string | null, isHalfDay = false, holidays: string[] = []): number | null {
    if (!startDate) return null;
    const effectiveEnd = endDate || startDate;
    const total = dateParser.calculateInclusiveDays(startDate, effectiveEnd, isHalfDay, true, holidays);
    if (isHalfDay) return 0.5;
    return total >= 1 ? total : 1;
}

function extractLeaveDetails(message: string, holidays: string[] = []) {
    const parsedDates = dateParser.parseDates(message);
    const durationInfo = dateParser.parseDuration(message);
    const leaveType = extractLeaveType(message);

    console.log('[DEBUG] parsedDates:', parsedDates);
    console.log('[DEBUG] durationInfo:', durationInfo);

    let startDate = parsedDates.startDate;
    let endDate = parsedDates.endDate ?? parsedDates.startDate;

    if (startDate && durationInfo.durationDays && (!endDate || durationInfo.hasExplicitDuration)) {
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
console.log('Result:', result);

// What if the message was exactly what the user typed?
// "15-04-2026 to 19-05-2026"
console.log('\n--- Tracing raw dates: "15-04-2026 to 19-05-2026"');
const result2 = extractLeaveDetails("15-04-2026 to 19-05-2026");
console.log('Result2:', result2);

// Let's check the JS side math too
console.log('\n--- JS Side Math ---');
const startJS = new Date("2026-04-15");
const endJS = new Date("2026-05-19");
const diffTime = Math.abs(endJS.getTime() - startJS.getTime());
const diffDays = diffTime / (1000 * 60 * 60 * 24);
console.log('Calendar diff:', diffDays);
