// DEMO FLAG: Set to true to allow WFH/leave overlap (no blocking), false to enforce blocking
const allowOverlapForDemo = false;
import { Request, Response } from 'express';
import { SalesforceService } from '../services/salesforceService';

const salesforceService = new SalesforceService();

interface WFHRequestBody {
  employeeName: string;
  date: string;
  reason?: string;
}

export const wfhController = {
  async applyWFH(req: Request<{}, {}, WFHRequestBody>, res: Response) {
    try {
      const { employeeName, date, reason } = req.body;

      // Validate required fields with type checking
      if (!employeeName || typeof employeeName !== 'string' || 
          !date || typeof date !== 'string') {
        return res.status(400).json({ 
          error: 'Missing or invalid required fields: employeeName (string), date (string)' 
        });
      }

      console.log('🏠 WFH application received:', { employeeName, date, reason });

      if (!allowOverlapForDemo) {
        // Check for overlapping leave requests using employee name
        const leaveRequests = await salesforceService.getLeaveRequestsByEmail(employeeName);
        const overlappingLeave = leaveRequests.find((r: any) => {
          if (r.Status__c === 'Rejected') return false;
          // Check if leave covers the WFH date
          const start = new Date(r.Start_Date__c);
          const end = new Date(r.End_Date__c);
          const wfh = new Date(date);
          return wfh >= start && wfh <= end;
        });
        if (overlappingLeave) {
          return res.status(409).json({
            error: `❌ You already have a leave request on ${date}. Please adjust your leave or WFH request.`,
            intent: 'overlap_error',
            details: {
              leaveType: overlappingLeave.Leave_Type__c,
              startDate: overlappingLeave.Start_Date__c,
              endDate: overlappingLeave.End_Date__c,
              reason: overlappingLeave.Reason__c,
              status: overlappingLeave.Status__c
            }
          });
        }
      }

      // Create WFH record in Salesforce (mock)
      const result = await salesforceService.createWfhRecord({
        employeeName,
        date,
        reason: reason || 'No reason provided'
      });

      if (result.success) {
        return res.json({
          success: true,
          message: '✅ Work From Home request submitted successfully!',
          details: {
            recordId: result.id,
            employeeName,
            date,
            reason: reason || 'No reason provided',
            status: 'Approved',
            submittedAt: new Date().toISOString(),
            nextSteps: 'Your WFH request has been automatically approved. Please ensure you have proper internet connectivity and VPN access.'
          }
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to create WFH record',
        details: result.error 
      });

    } catch (error: unknown) {
      console.error('WFH Controller Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return res.status(500).json({ 
        error: 'Failed to process WFH application',
        details: errorMessage
      });
    }
  },

  async getWFHStatus(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          error: 'Missing WFH record ID'
        });
      }
      
      const result = await salesforceService.getRecord(id);
      
      if (result?.success) {
        return res.json({
          success: true,
          record: result.record
        });
      }
      
      return res.status(404).json({
        error: 'WFH record not found'
      });
      
    } catch (error: unknown) {
      console.error('Get WFH Status Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return res.status(500).json({ 
        error: 'Failed to retrieve WFH status',
        details: errorMessage
      });
    }
  }
};