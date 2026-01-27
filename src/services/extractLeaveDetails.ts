import { extractDateRangeLocal } from './dateExtractor';

export async function extractLeaveDetails(userMessage: string) {
  const { startDate, endDate } = extractDateRangeLocal(userMessage);

  if (!startDate || !endDate) {
    return {
      errors: ['Unable to understand the requested date.'],
      // ...other fields as needed...
    };
  }

  // Example: Return the extracted dates and any other info you need
  return {
    startDate,
    endDate,
    // ...other extracted fields...
  };
}