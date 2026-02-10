import nodemailer from 'nodemailer';

interface ApprovalEmailData {
  to: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  durationDays: number;
  approveUrl: string;
  rejectUrl: string;
}

import dns from 'dns';

// Force IPv4 for DNS resolution to avoid IPv6 connectivity issues (ENETUNREACH)
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

// Helper to resolve IPv4 address
const resolveIPv4 = async (host: string): Promise<string> => {
  return new Promise((resolve) => {
    dns.resolve4(host, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        console.warn(`⚠️ Failed to resolve IPv4 for ${host}, using original host.`);
        resolve(host);
      } else {
        console.log(`✅ Resolved ${host} to IPv4: ${addresses[0]}`);
        resolve(addresses[0]);
      }
    });
  });
};

class EmailService {
  private transporter: any;
  private isReady: Promise<void>;

  constructor() {
    this.isReady = this.initTransporter();
  }

  private async initTransporter() {
    // Only configure email transporter if SMTP credentials are provided
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const host = process.env.SMTP_HOST || 'smtp.gmail.com';
      // Try to resolve IPv4 address to avoid IPv6 issues
      const resolvedHost = await resolveIPv4(host);

      // Configuration for Port 587 (main attempt)
      const config587 = {
        host: resolvedHost,
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        family: 4 // Force IPv4
      };

      // Configuration for Port 465 (fallback)
      const config465 = {
        host: resolvedHost,
        port: 465,
        secure: true, // SSL required for 465
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        family: 4 // Force IPv4
      };

      try {
        console.log('Testing SMTP connection on Port 587...');
        const transporter587 = nodemailer.createTransport(config587 as any);
        await transporter587.verify();
        console.log('✅ SMTP connection successful on Port 587');
        this.transporter = transporter587;
      } catch (error: any) {
        console.warn(`⚠️ SMTP connection failed on Port 587: ${error.message}`);
        console.log('🔄 Retrying with Port 465 (SSL)...');

        try {
          const transporter465 = nodemailer.createTransport(config465 as any);
          await transporter465.verify();
          console.log('✅ SMTP connection successful on Port 465');
          this.transporter = transporter465;
        } catch (error465: any) {
          console.error(`❌ SMTP connection failed on Port 465 as well: ${error465.message}`);
          // Fallback to 587 config even if it failed, so we can see error during send
          this.transporter = nodemailer.createTransport(config587 as any);
        }
      }
    } else {
      // Demo mode - no transporter needed
      this.transporter = null;
    }
  }

  private async getTransporter() {
    await this.isReady;
    return this.transporter;
  }

  /**
   * Send approval email to manager
   */
  async sendApprovalEmail(data: ApprovalEmailData): Promise<boolean> {
    const {
      to,
      employeeName,
      leaveType,
      startDate,
      endDate,
      reason,
      durationDays,
      approveUrl,
      rejectUrl
    } = data;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Leave Request Pending Approval</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px 40px; text-align: center;">
              <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 600; color: #1a1a1a;">Leave Request Pending Approval</h1>
              <p style="margin: 0; font-size: 14px; color: #666;">You have a new leave request pending your approval.</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <p style="margin: 0 0 20px 0; font-size: 15px; color: #333;">Hello,</p>
              
              <!-- Details Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; border: 1px solid #e5e5e5; border-radius: 6px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="font-weight: 600; color: #333; font-size: 14px; width: 35%;">Employee:</td>
                        <td style="color: #666; font-size: 14px;">${employeeName}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #333; font-size: 14px;">Leave Type:</td>
                        <td style="color: #666; font-size: 14px;">${leaveType}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #333; font-size: 14px;">From:</td>
                        <td style="color: #666; font-size: 14px;">${startDate}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #333; font-size: 14px;">To:</td>
                        <td style="color: #666; font-size: 14px;">${endDate}</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600; color: #333; font-size: 14px;">Reason:</td>
                        <td style="color: #666; font-size: 14px;">${reason}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Warning Banner -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 16px; margin-bottom: 30px; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 13px;">
                  <strong>⚠️ Exception Request:</strong> This request exceeds the employee's normal leave balance.
                </p>
              </div>
              
              <!-- Action Buttons -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td width="48%" align="center">
                    <a href="${approveUrl}" style="display: inline-block; width: 100%; background-color: #28a745; color: white; padding: 14px 0; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; text-align: center; box-sizing: border-box;">
                      ✅ APPROVE
                    </a>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" align="center">
                    <a href="${rejectUrl}" style="display: inline-block; width: 100%; background-color: #dc3545; color: white; padding: 14px 0; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; text-align: center; box-sizing: border-box;">
                      ❌ REJECT
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0 0; font-size: 12px; color: #999; text-align: center;">
                This approval link will expire in 7 days.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 40px; border-top: 1px solid #e5e5e5; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999;">
                ${process.env.COMPANY_NAME || 'Winfomi'} HR System
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const textContent = `
EXTRA LEAVE REQUEST (Requires Approval)

Employee: ${employeeName}
Leave Type: ${leaveType}
Start Date: ${startDate}
End Date: ${endDate}
Duration: ${durationDays} working days
Reason: ${reason}

⚠️ NOTE: This request exceeds the employee's normal leave balance.

To approve: ${approveUrl}
To reject: ${rejectUrl}

This link will expire in 7 days.
    `;

    try {
      // Check if SMTP is configured
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('📧 Email Service (Demo Mode - SMTP not configured)');
        console.log('To:', to);
        console.log('Subject: ⚠️ Extra Leave Request - ' + employeeName);
        console.log('Approve URL:', approveUrl);
        console.log('Reject URL:', rejectUrl);
        console.log('✅ Email would be sent in production');
        return true;
      }

      const transporter = await this.getTransporter();
      if (!transporter) {
        // Should have been caught by the check above, but for safety
        return true;
      }

      const info = await transporter.sendMail({
        from: `"${process.env.COMPANY_NAME || 'Winfomi'} HR" <${process.env.SMTP_USER}>`,
        to,
        subject: `⚠️ Extra Leave Request - ${employeeName}`,
        text: textContent,
        html: htmlContent
      });

      console.log('✅ Approval email sent:', info.messageId);
      return true;
    } catch (error: any) {
      console.error('❌ Failed to send approval email:', error.message);
      if (error.code) console.error('Error Code:', error.code);
      if (error.command) console.error('Command:', error.command);

      // In demo mode (no SMTP configured), still return success and log the URLs
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('📧 Demo Mode - Approval URLs:');
        console.log('Approve:', approveUrl);
        console.log('Reject:', rejectUrl);
        return true;
      }

      return false;
    }
  }

  /**
   * Send notification to employee about approval decision
   */
  async sendDecisionEmail(
    to: string,
    employeeName: string,
    approved: boolean,
    leaveType: string,
    startDate: string,
    endDate: string
  ): Promise<boolean> {
    const subject = approved
      ? `✅ Leave Request Approved`
      : `❌ Leave Request Rejected`;

    const htmlContent = approved ? `
<!DOCTYPE html>
<html>
<body style="font-family: Arial; padding: 20px; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; border-radius: 4px;">
    <h2 style="color: #155724; margin: 0 0 10px 0;">✅ Leave Request Approved</h2>
    <p style="color: #155724; margin: 0;">Your extra leave request has been approved by your manager.</p>
  </div>
  <div style="margin-top: 20px; padding: 20px; background-color: #f9f9f9; border-radius: 4px;">
    <p><strong>Leave Type:</strong> ${leaveType}</p>
    <p><strong>Start Date:</strong> ${startDate}</p>
    <p><strong>End Date:</strong> ${endDate}</p>
  </div>
  <p style="color: #666; font-size: 14px; margin-top: 20px;">
    The leave request has been recorded in the system. Enjoy your time off!
  </p>
</body>
</html>
    ` : `
<!DOCTYPE html>
<html>
<body style="font-family: Arial; padding: 20px; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 20px; border-radius: 4px;">
    <h2 style="color: #721c24; margin: 0 0 10px 0;">❌ Leave Request Rejected</h2>
    <p style="color: #721c24; margin: 0;">Your extra leave request has been rejected by your manager.</p>
  </div>
  <div style="margin-top: 20px; padding: 20px; background-color: #f9f9f9; border-radius: 4px;">
    <p><strong>Leave Type:</strong> ${leaveType}</p>
    <p><strong>Start Date:</strong> ${startDate}</p>
    <p><strong>End Date:</strong> ${endDate}</p>
  </div>
  <p style="color: #666; font-size: 14px; margin-top: 20px;">
    Please contact your manager if you have any questions.
  </p>
</body>
</html>
    `;

    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log(`📧 Decision email (Demo): ${approved ? 'APPROVED' : 'REJECTED'} - ${to}`);
        return true;
      }

      const transporter = await this.getTransporter();
      if (!transporter) return true;

      await transporter.sendMail({
        from: `"${process.env.COMPANY_NAME || 'Winfomi'} HR" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html: htmlContent
      });

      console.log(`✅ Decision email sent to ${to}`);
      return true;
    } catch (error: any) {
      console.error('❌ Failed to send decision email:', error.message);
      return false;
    }
  }
}

// Singleton instance
export const emailService = new EmailService();
export default emailService;
