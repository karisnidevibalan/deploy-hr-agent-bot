require('dotenv').config();
import { PolicyService } from './src/services/policyService';

console.log('--- Verifying Holiday Filtering ---');
const result = PolicyService.getAllHolidays();
console.log(`Script System Year: ${new Date().getFullYear()}`);
console.log(`Script System Time: ${new Date().toISOString()}`);
console.log(`Returned Year: ${result.year}`);
console.log(`Number of Holidays: ${result.holidays.length}`);

// Check if any holiday is from a different year
const invalidHolidays = result.holidays.filter((h: any) => {
    const y = new Date(h.date).getFullYear();
    return y !== result.year;
});

if (invalidHolidays.length > 0) {
    console.error('❌ FAILED: Found holidays from other years:', invalidHolidays);
} else {
    console.log('✅ PASSED: All holidays are from the current year.');
}

// Print a few holidays to visually confirm
console.log('Sample Holidays:', result.holidays.slice(0, 3));
