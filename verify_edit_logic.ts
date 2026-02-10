
require('dotenv').config();
import chatController from './src/controllers/chatController';
import { Request, Response } from 'express';

// Mock Response
const mockResponse = () => {
    const res: any = {};
    res.status = (code: number) => { res.statusCode = code; return res; };
    res.json = (data: any) => { res.body = data; return res; };
    return res;
};

async function verify() {
    console.log('--- Verifying Edit Flow (Form Submission) ---');

    const sessionId = 'test-session-' + Date.now();

    // Case: Direct form submission for a new leave request (editDetails provided, but no pending request in context)
    const req: any = {
        sessionId,
        body: {
            message: 'edit',
            editDetails: {
                startDate: '2026-06-15',
                endDate: '2026-06-17',
                leaveType: 'CASUAL',
                reason: 'Test submission'
            }
        },
        headers: {
            'x-user-name': 'Test User',
            'x-user-email': 'test@example.com'
        },
        ip: '127.0.0.1'
    };

    const res = mockResponse();

    await chatController(req as Request, res as Response);

    console.log('Response Intent:', res.body.intent);
    console.log('Response Reply:', res.body.reply.substring(0, 50) + '...');

    if (res.body.intent === 'confirm_leave') {
        console.log('✅ Edit Flow (New Request) Verified! Properly asked for confirmation.');
    } else {
        console.error('❌ Edit Flow (New Request) Failed! Expected confirm_leave, got:', res.body.intent);
        if (res.body.reply.includes("It seems like you're looking to edit something")) {
            console.error('   -> Still showing the AI "not sure what to edit" message.');
        }
    }
}

verify().catch(console.error);
