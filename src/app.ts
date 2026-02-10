// src/app.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import path from 'path';

// __filename and __dirname are available in CommonJS modules (Node.js)

const app = express();
// Load .env first
dotenv.config();

// Support .env.local (overrides .env) - mimicking Vercel behavior locally
const envLocalPath = path.join(process.cwd(), '.env.local');
import fs from 'fs'; // Ensure fs is imported if not already, or use require
if (fs.existsSync(envLocalPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
  console.log('✅ Loaded environment variables from .env.local');
} else {
  console.log('ℹ️ No .env.local found, using default .env');
}

const PORT = process.env.PORT || 5000;

// CommonJS: __filename and __dirname are available by default

// Middleware - Enhanced CORS for Salesforce integration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow Salesforce domains for LWC integration
    const allowedDomains = [
      /\.force\.com$/,
      /\.salesforce\.com$/,
      /\.visualforce\.com$/,
      /\.lightning\.force\.com$/,
      /localhost/,
      /127\.0\.0\.1/
    ];

    const isAllowed = allowedDomains.some(domain => {
      if (domain instanceof RegExp) {
        return domain.test(origin);
      }
      return origin.includes(domain);
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      // Still allow the request but log it
      console.log(`⚠️ CORS request from non-whitelisted origin: ${origin}`);
      callback(null, true); // Allow all origins for now, can be restricted later
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id', 'x-user-name', 'x-user-email']
};

app.use(cors(corsOptions));
app.use(express.json());
// Use process.cwd() to correctly locate public folder in both Dev (src/) and Prod (dist/src/)
app.use(express.static(path.join(process.cwd(), 'public')));

// Import controllers and services
import chatController from './controllers/chatController';
import { SalesforceService } from './services/salesforceService';
const salesforceService = new SalesforceService();

import managerRoutes from './routes/managerRoutes';
import { setChatRoutes } from './routes/chat';
import { setLeaveRoutes } from './routes/leave';
import { setWfhRoutes } from './routes/wfh';

// Register all routes
setChatRoutes(app);
setLeaveRoutes(app);
setWfhRoutes(app);

// Multer configuration for policy uploads
import multer from 'multer';
import { uploadPolicyController } from './controllers/uploadController';
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload policy route
app.post('/api/upload-policy', upload.single('policyFile'), uploadPolicyController);

// Manager approval routes (email links)
app.get('/manager-dashboard', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'public', 'manager-dashboard.html'));
});
app.get('/approve', async (req: Request, res: Response) => {
  try {
    const { id, action, token } = req.query;

    // Validate required parameters
    if (!id || !action || !token) {
      return res.status(400).send(`
        <html>
          <head><title>Invalid Request</title></head>
          <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1>❌ Invalid Request</h1>
            <p>Missing required parameters: id, action, or token</p>
          </body>
        </html>
      `);
    }

    // Verify token matches record ID for security
    if (token !== id) {
      return res.status(403).send(`
        <html>
          <head><title>Invalid Token</title></head>
          <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1>🔒 Invalid Token</h1>
            <p>The approval link is invalid or has expired.</p>
          </body>
        </html>
      `);
    }

    // Import services
    const { pendingApprovalService } = await import('./services/pendingApprovalService');
    const { emailService } = await import('./services/emailService');

    // Check if this is a pending request (not yet in Salesforce)
    const pendingRequest = pendingApprovalService.get(id as string);

    if (pendingRequest) {
      // This is a pending request - handle email-first approval
      if (action === 'approve') {
        // CREATE Salesforce record
        const result = await salesforceService.createLeaveRecord({
          employeeName: pendingRequest.employeeName,
          employeeEmail: pendingRequest.employeeEmail,
          employeeId: pendingRequest.employeeId,
          leaveType: pendingRequest.leaveType,
          startDate: pendingRequest.startDate,
          endDate: pendingRequest.endDate,
          reason: pendingRequest.reason,
          durationDays: pendingRequest.durationDays,
          isException: pendingRequest.isException
        });

        if (!result.success) {
          throw new Error(result.message || 'Failed to create Salesforce record');
        }

        // Remove from pending
        pendingApprovalService.remove(id as string);

        // Send notification to employee
        if (pendingRequest.employeeEmail) {
          await emailService.sendDecisionEmail(
            pendingRequest.employeeEmail,
            pendingRequest.employeeName,
            true,
            pendingRequest.leaveType,
            pendingRequest.startDate,
            pendingRequest.endDate
          );
        }

        return res.send(`
          <html>
            <head>
              <title>Leave Approved</title>
              <style>
                body { font-family: Arial; padding: 40px; max-width: 600px; margin: 0 auto; }
                .success { background: #4CAF50; color: white; padding: 20px; border-radius: 8px; }
                .details { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; }
              </style>
            </head>
            <body>
              <div class="success">
                <h1>✅ Leave Request Approved!</h1>
              </div>
              <div class="details">
                <h3>The leave request has been successfully approved and created in Salesforce.</h3>
                <p><strong>Employee:</strong> ${pendingRequest.employeeName}</p>
                <p><strong>Leave Type:</strong> ${pendingRequest.leaveType}</p>
                <p><strong>Start Date:</strong> ${pendingRequest.startDate}</p>
                <p><strong>End Date:</strong> ${pendingRequest.endDate}</p>
                <p><strong>Duration:</strong> ${pendingRequest.durationDays} days</p>
                <p><strong>Salesforce Record ID:</strong> ${result.id}</p>
              </div>
              <p>The employee has been notified via email about this approval.</p>
            </body>
          </html>
        `);
      } else if (action === 'reject') {
        // Just remove from pending, don't create record
        pendingApprovalService.remove(id as string);

        // Send notification to employee
        if (pendingRequest.employeeEmail) {
          await emailService.sendDecisionEmail(
            pendingRequest.employeeEmail,
            pendingRequest.employeeName,
            false,
            pendingRequest.leaveType,
            pendingRequest.startDate,
            pendingRequest.endDate
          );
        }

        return res.send(`
          <html>
            <head>
              <title>Leave Rejected</title>
              <style>
                body { font-family: Arial; padding: 40px; max-width: 600px; margin: 0 auto; }
                .reject { background: #f44336; color: white; padding: 20px; border-radius: 8px; }
                .details { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; }
              </style>
            </head>
            <body>
              <div class="reject">
                <h1>❌ Leave Request Rejected</h1>
              </div>
              <div class="details">
                <h3>Leave Details:</h3>
                <p><strong>Employee:</strong> ${pendingRequest.employeeName}</p>
                <p><strong>Leave Type:</strong> ${pendingRequest.leaveType}</p>
                <p><strong>Start Date:</strong> ${pendingRequest.startDate}</p>
                <p><strong>End Date:</strong> ${pendingRequest.endDate}</p>
                <p><strong>Status:</strong> <span style="color: red;">Rejected</span></p>
              </div>
              <p>The employee has been notified via email about this rejection.</p>
              <p style="color: #666; font-size: 14px;">No Salesforce record was created.</p>
            </body>
          </html>
        `);
      }
    }

    // If not a pending request, handle as existing Salesforce record
    const record = await salesforceService.getRecord(id as string);

    if (!record.success) {
      return res.status(404).send(`
        <html>
          <head><title>Record Not Found</title></head>
          <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1>❌ Record Not Found</h1>
            <p>The leave request could not be found.</p>
          </body>
        </html>
      `);
    }

    const leaveRecord = record.record;

    // Determine Salesforce instance URL
    const instanceUrl = process.env.SALESFORCE_LOGIN_URL?.includes('test')
      ? 'https://winfomi--dev7.sandbox.my.salesforce.com'
      : 'https://winfomi.my.salesforce.com';
    const recordUrl = `${instanceUrl}/${id}`;

    if (action === 'approve') {
      // Update record status to Approved
      const updated = await salesforceService.updateRecordStatus(id as string, 'Approved');

      if (!updated.success) {
        throw new Error(updated.error || 'Failed to update record');
      }

      return res.send(`
        <html>
          <head>
            <title>Leave Approved</title>
            <style>
              body { font-family: Arial; padding: 40px; max-width: 600px; margin: 0 auto; }
              .success { background: #4CAF50; color: white; padding: 20px; border-radius: 8px; }
              .details { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; }
              .button { display: inline-block; background: #0070d2; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 4px; margin-top: 20px; }
              .button:hover { background: #005fb2; }
            </style>
          </head>
          <body>
            <div class="success">
              <h1>✅ Leave Request Approved!</h1>
            </div>
            <div class="details">
              <h3>The leave request has been successfully approved.</h3>
              <p><strong>Record ID:</strong> ${id}</p>
              <p><strong>Employee:</strong> ${leaveRecord.Employee_Name__c || 'N/A'}</p>
              <p><strong>Leave Type:</strong> ${leaveRecord.Leave_Type__c || 'N/A'}</p>
            </div>
            <p>The employee will be notified via email about this decision.</p>
            <p style="text-align: center;">
              <a href="${recordUrl}" class="button" target="_blank">View in Salesforce</a>
            </p>
          </body>
        </html>
      `);
    } else if (action === 'reject') {
      // Update record status to Rejected
      const updated = await salesforceService.updateRecordStatus(id as string, 'Rejected');

      if (!updated.success) {
        throw new Error(updated.error || 'Failed to update record');
      }

      return res.send(`
        <html>
          <head>
            <title>Leave Rejected</title>
            <style>
              body { font-family: Arial; padding: 40px; max-width: 600px; margin: 0 auto; }
              .reject { background: #f44336; color: white; padding: 20px; border-radius: 8px; }
              .details { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; }
              .button { display: inline-block; background: #0070d2; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 4px; margin-top: 20px; }
              .button:hover { background: #005fb2; }
            </style>
          </head>
          <body>
            <div class="reject">
              <h1>❌ Leave Request Rejected</h1>
            </div>
            <div class="details">
              <h3>Leave Details:</h3>
              <p><strong>Employee:</strong> ${leaveRecord.Employee_Name__c || 'N/A'}</p>
              <p><strong>Leave Type:</strong> ${leaveRecord.Leave_Type__c || 'N/A'}</p>
              <p><strong>Start Date:</strong> ${leaveRecord.Start_Date__c || 'N/A'}</p>
              <p><strong>End Date:</strong> ${leaveRecord.End_Date__c || 'N/A'}</p>
              <p><strong>Reason:</strong> ${leaveRecord.Reason__c || 'N/A'}</p>
              <p><strong>Status:</strong> <span style="color: red;">Rejected</span></p>
            </div>
            <p>The employee will be notified via email about this decision.</p>
            <p style="text-align: center;">
              <a href="${recordUrl}" class="button" target="_blank">View in Salesforce</a>
            </p>
          </body>
        </html>
      `);
    } else {
      return res.status(400).send(`
        <html>
          <head><title>Invalid Action</title></head>
          <body style="font-family: Arial; padding: 40px; text-align: center;">
            <h1>❌ Invalid Action</h1>
            <p>Action must be either 'approve' or 'reject'</p>
          </body>
        </html>
      `);
    }
  } catch (error: any) {
    console.error('❌ Approval Error:', error.message);
    return res.status(500).send(`
      <html>
        <head><title>Error</title></head>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h1>❌ Error Processing Request</h1>
          <p>An error occurred while processing your request. Please try again later.</p>
          <p style="color: gray; font-size: 12px;">${error.message || 'Unknown error'}</p>
        </body>
      </html>
    `);
  }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'HR Agent Bot is running',
    timestamp: new Date().toISOString(),
    demoMode: process.env.DEMO_MODE === 'true'
  });
});

// Serve the chat interface
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// Manager dashboard routes
app.use('/api/manager', managerRoutes);

// Test endpoint for pending approvals (development only)
app.post('/api/test/pending-approval', async (req: Request, res: Response) => {
  try {
    const { pendingApprovalService } = await import('./services/pendingApprovalService');
    const { emailService } = await import('./services/emailService');

    const {
      employeeName,
      employeeEmail,
      leaveType,
      startDate,
      endDate,
      reason,
      durationDays,
      managerEmail
    } = req.body;

    // Store pending request
    const requestId = pendingApprovalService.store({
      employeeName,
      employeeEmail,
      employeeId: null,
      leaveType,
      startDate,
      endDate,
      reason,
      durationDays,
      isException: true
    });

    // Generate approval URLs
    const appUrl = process.env.APP_URL || 'http://localhost:5001';
    const approveUrl = `${appUrl}/approve?id=${requestId}&action=approve&token=${requestId}`;
    const rejectUrl = `${appUrl}/approve?id=${requestId}&action=reject&token=${requestId}`;

    // Send approval email
    await emailService.sendApprovalEmail({
      to: managerEmail,
      employeeName,
      leaveType,
      startDate,
      endDate,
      reason,
      durationDays,
      approveUrl,
      rejectUrl
    });

    res.json({
      success: true,
      message: 'Pending approval created and email sent',
      requestId,
      approveUrl,
      rejectUrl
    });
  } catch (error: any) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path
  });
});

// Error handler middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('❌ Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

export { app };
export default app;

// Start server if this is the main module
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`🤖 HR Agent Bot running on http://localhost:${PORT}`);
    console.log(`📋 Demo Mode: ${process.env.DEMO_MODE === 'true' ? 'ENABLED' : 'DISABLED'}`);
    console.log(`🏢 Company: ${process.env.COMPANY_NAME || 'Winfomi'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}
