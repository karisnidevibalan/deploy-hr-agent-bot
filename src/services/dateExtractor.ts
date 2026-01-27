import * as chrono from 'chrono-node';

export function extractDateRangeLocal(userMessage: string): { startDate: Date | null, endDate: Date | null } {
    const results = chrono.parse(userMessage, new Date());
    if (results.length > 0) {
        const { start, end } = results[0];
        return {
            startDate: start ? start.date() : null,
            endDate: end ? end.date() : (start ? start.date() : null)
        };
    }
    return { startDate: null, endDate: null };
}