require('dotenv').config();
import { AiService } from './src/services/aiService';
import { PolicyService } from './src/services/policyService';

async function verify() {
    console.log('--- Verifying Holiday Logic Updates ---');
    const aiService = new AiService();

    // Mock Date for consistent testing: assume 'Today' is Jan 29, 2026
    // Note: The script runs with system time, so I will print system time for context.
    console.log(`System Time: ${new Date().toISOString()}`);

    const queries = [
        "how many holidays in this week",
        "holidays next month",
        "no of holidays in next month",
        "no of holidays in this year"
    ];

    for (const q of queries) {
        console.log(`\nTesting: "${q}"`);
        const result = await aiService.analyzeUserIntent(q);
        console.log(`Intent: ${result.intent}`);
        console.log(`Entities:`, result.entities);
        if (result.intent !== 'holiday_list') {
            console.error('❌ Failed to detect holiday_list intent');
        }
        if (q.includes('this week') && !result.entities.startDate) {
            console.error('❌ Failed to extract start/end date for week');
        }
        if (q.includes('next month') && (!result.entities.startDate || !result.entities.period)) {
            console.error('❌ Failed to extract start/end date for next month');
        }

    }
}

verify().catch(console.error);
