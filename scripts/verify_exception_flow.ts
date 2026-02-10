import axios from 'axios';

const PORT = 5001;
const BASE_URL = `http://localhost:${PORT}/api/chat`;
const TEST_EMAIL = 'verify@test.com';

async function testExceptionFlow() {
    const sessionId = 'test-session-' + Date.now();
    console.log('🚀 Starting Exception Flow Verification (with email)...');

    try {
        // 1. Initial Request
        console.log('\n--- Step 1: Initial request (Casual leave 30 days) ---');
        const res1 = await axios.post(BASE_URL, {
            message: 'I want to take casual leave from 2026-06-01 to 2026-06-30 for family vacation',
            employeeEmail: TEST_EMAIL
        }, {
            headers: { 'X-Session-Id': sessionId }
        });

        const details = res1.data.details;
        console.log('Bot Response 1:', res1.data.reply);

        // 2. Simulate Form Submission
        console.log('\n--- Step 2: Submitting form (should trigger balance check) ---');
        const res2 = await axios.post(BASE_URL, {
            message: 'edit',
            editDetails: details,
            pendingRequest: { type: 'leave', details: details },
            employeeEmail: TEST_EMAIL
        }, {
            headers: { 'X-Session-Id': sessionId }
        });

        console.log('Bot Response 2:', res2.data.reply);

        if (res2.data.reply.includes('Insufficient Balance')) {
            console.log('✅ Correct: Insufficient balance detected.');
        } else {
            console.log('❌ Failed: Prompt not as expected.');
            return;
        }

        // 3. Confirm
        console.log('\n--- Step 3: Confirming Exception Request ("yes") ---');
        const res3 = await axios.post(BASE_URL, {
            message: 'yes',
            employeeEmail: TEST_EMAIL
        }, {
            headers: { 'X-Session-Id': sessionId }
        });

        console.log('Bot Response 3:', res3.data.reply);

        if (res3.data.reply.includes('Exception leave request sent successfully')) {
            console.log('✅ Correct: Exception record created.');
        } else {
            console.log('❌ Failed: Exception confirmation failed.');
            return;
        }

        // 4. WFH limit
        console.log('\n--- Step 4: Verifying WFH Exception (3rd day in same week) ---');
        const wfhSession = 'wfh-test-' + Date.now();

        const applyWfh = async (date: string) => {
            const r1 = await axios.post(BASE_URL, { message: `WFH on ${date} for focus`, employeeEmail: TEST_EMAIL }, { headers: { 'X-Session-Id': wfhSession } });
            const r2 = await axios.post(BASE_URL, {
                message: 'edit',
                editDetails: r1.data.details,
                pendingRequest: { type: 'wfh', details: r1.data.details },
                employeeEmail: TEST_EMAIL
            }, {
                headers: { 'X-Session-Id': wfhSession }
            });
            if (r2.data.intent === 'confirm_wfh') {
                await axios.post(BASE_URL, { message: 'yes', employeeEmail: TEST_EMAIL }, { headers: { 'X-Session-Id': wfhSession } });
            }
            return r2;
        };

        console.log('Applying for 1st WFH day...');
        await applyWfh('2026-05-04');

        console.log('Applying for 2nd WFH day...');
        await applyWfh('2026-05-05');

        console.log('Applying for 3rd WFH day (should trigger limit)...');
        const resLimit = await applyWfh('2026-05-06');

        console.log('Bot Response (Limit):', resLimit.data.reply);
        if (resLimit.data.reply.includes('Insufficient WFH Allowance') || resLimit.data.reply.includes('special exception')) {
            console.log('✅ Correct: WFH limit detected.');
        } else {
            console.log('❌ Failed: WFH limit not enforced.');
            return;
        }

        // 5. Confirm WFH exception
        console.log('\n--- Step 5: Confirming WFH Exception Request ("yes") ---');
        const resWfhException = await axios.post(BASE_URL, {
            message: 'yes',
            employeeEmail: TEST_EMAIL
        }, {
            headers: { 'X-Session-Id': wfhSession }
        });

        console.log('Bot Response (WFH Exception):', resWfhException.data.reply);
        if (resWfhException.data.reply.includes('Exception WFH request sent successfully')) {
            console.log('✅ Correct: WFH exception record created.');
        } else {
            console.log('❌ Failed: WFH exception confirmation failed.');
        }

        console.log('\n🎉 Verification Complete!');
    } catch (error: any) {
        console.error('❌ Error during verification:', error.message);
    }
}

testExceptionFlow();
