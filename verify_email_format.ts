import { emailService } from './src/services/emailService';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function verifyEmailFormat() {
    console.log('🧪 Verifying email format...');

    const data = {
        to: 'manager@example.com',
        employeeName: 'Current User',
        leaveType: 'Sick Leave',
        startDate: '3/20/2026',
        endDate: '3/20/2026',
        reason: 'fever',
        durationDays: 1,
        approveUrl: 'http://localhost:5001/approve?id=TEST-ID&action=approve&token=TEST-ID',
        rejectUrl: 'http://localhost:5001/approve?id=TEST-ID&action=reject&token=TEST-ID',
        salesforceId: 'LR-0174'
    };

    // Need to access the private method or just use sendApprovalEmail in demo mode
    // Since we want to SEE the HTML, let's mock the transporter and capture the html

    // We can manually reconstruct what sendApprovalEmail does to get the HTML
    const instanceUrl = process.env.SALESFORCE_LOGIN_URL?.includes('test')
        ? 'https://winfomi--dev7.sandbox.my.salesforce.com'
        : 'https://winfomi.my.salesforce.com';
    const sfRecordUrl = data.salesforceId ? `${instanceUrl}/${data.salesforceId}` : null;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Leave Request Pending Approval</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="font-size: 24px; font-weight: 600; color: #1a1a1a; margin-top: 0; margin-bottom: 24px;">Leave Request Pending Approval</h1>
    
    <p style="font-size: 16px; margin-bottom: 24px;">Hello,</p>
    <p style="font-size: 16px; margin-bottom: 32px;">You have a new leave request pending your approval.</p>
    
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
      <tr>
        <td style="padding: 12px 0; width: 120px; font-weight: 600; font-size: 16px; vertical-align: top;">Employee:</td>
        <td style="padding: 12px 0; font-size: 16px;">${data.employeeName}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; font-weight: 600; font-size: 16px; vertical-align: top;">Leave Type:</td>
        <td style="padding: 12px 0; font-size: 16px;">${data.leaveType}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; font-weight: 600; font-size: 16px; vertical-align: top;">From:</td>
        <td style="padding: 12px 0; font-size: 16px;">${data.startDate}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; font-weight: 600; font-size: 16px; vertical-align: top;">To:</td>
        <td style="padding: 12px 0; font-size: 16px;">${data.endDate}</td>
      </tr>
      <tr>
        <td style="padding: 12px 0; font-weight: 600; font-size: 16px; vertical-align: top;">Reason:</td>
        <td style="padding: 12px 0; font-size: 16px;">${data.reason}</td>
      </tr>
    </table>
    
    <div style="margin-bottom: 32px; display: flex; gap: 16px;">
      <a href="${data.approveUrl}" style="display: inline-block; background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; text-align: center;">
        ✅ APPROVE
      </a>
      <a href="${data.rejectUrl}" style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; text-align: center; margin-left: 12px;">
        ❌ REJECT
      </a>
    </div>
    
    <p style="font-style: italic; color: #666; font-size: 16px; margin-bottom: 24px;">Click the button above to approve or reject this leave request instantly.</p>
    
    ${sfRecordUrl ?\`
    <p style="font-size: 16px; margin-bottom: 32px;">
      Or view in Salesforce: <a href="\${sfRecordUrl}" style="color: #007bff; text-decoration: underline;">\${data.salesforceId}</a>
    </p>
    \` : ''}
    
    <p style="font-size: 16px; margin-bottom: 8px;">Thank you,</p>
    <p style="font-size: 16px; font-weight: 600; margin-bottom: 0;">HR Team</p>
  </div>
</body>
</html>
    \`;

    const outputPath = path.join(process.cwd(), 'verify_email.html');
    fs.writeFileSync(outputPath, htmlContent);
    console.log(\`✅ Verification HTML generated at: \${outputPath}\`);
}

verifyEmailFormat().catch(console.error);
