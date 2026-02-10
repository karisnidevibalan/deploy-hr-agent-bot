// Helper to apply leave defaults
function applyLeaveDefaults(details: {
  startDate: string | null,
  endDate: string | null,
  leaveType: string | null,
  reason: string | null,
  employeeName: string | null,
  durationDays?: number | null,
  isHalfDay?: boolean,
  errors?: string[]
}, holidays: string[] = []): typeof details {
  if (details.startDate) {
    if (details.isHalfDay) {
      details.endDate = details.startDate;
      details.durationDays = 0.5;
    } else if (details.durationDays && details.durationDays > 0) {
      if (!details.endDate || details.endDate === details.startDate) {
        details.endDate = dateParser.projectEndDate(details.startDate, details.durationDays);
      }
    } else if (details.endDate) {
      details.durationDays = calculateWorkingDays(details.startDate, details.endDate, false, holidays);
    } else {
      details.endDate = details.startDate;
      details.durationDays = 1;
    }
  }
  if (!details.employeeName) details.employeeName = DEFAULT_EMPLOYEE_NAME;
  return details;
}

// Helper to list requests
async function listRequests(
  sessionId: string,
  res: Response,
  type: 'leave' | 'wfh' | 'both',
  context: { finalEmail?: string; finalName?: string }
): Promise<void> {
  try {
    const employeeName = context.finalName || contextManager.getEmployeeName(sessionId) || DEFAULT_EMPLOYEE_NAME;
    const employeeEmail = context.finalEmail || contextManager.getEmployeeEmail(sessionId) || '';

    let leaveRequests = [];
    let wfhRequests = [];

    if (salesforceService.isDemoMode()) {
      leaveRequests = salesforceService.getAllRecords().filter(r => r.Leave_Type__c && (r.Employee_Email__c === employeeEmail || r.Employee_Name__c === employeeName));
      wfhRequests = salesforceService.getAllRecords().filter(r => r.Date__c && (r.email__c === employeeEmail || r.Employee_Name__c === employeeName));
    } else {
      // In live mode, we fetch by email if available, otherwise name
      leaveRequests = employeeEmail ? await salesforceService.getLeaveRequestsByEmail(employeeEmail) : [];
      wfhRequests = employeeEmail ? await salesforceService.getWfhRequestsByEmail(employeeEmail) : [];
    }

    let response = `📋 **Your Requests**\n\n`;
    if (type === 'leave') wfhRequests = [];
    if (type === 'wfh') leaveRequests = [];

    if (leaveRequests.length === 0 && wfhRequests.length === 0) {
      response = `You haven't made any ${type === 'both' ? 'leave or WFH' : type} requests yet.\n\n` +
        `Would you like to:\n` +
        `• Apply for leave\n` +
        `• Apply for WFH\n` +
        `• Check your leave balance`;
      res.json({ reply: response, intent: 'no_requests_found', timestamp: new Date().toISOString() });
      return;
    }

    if (leaveRequests.length > 0) {
      response += `**Leave Requests (${leaveRequests.length})**\n`;
      for (const leave of leaveRequests) {
        const statusEmoji =
          leave.Status__c === 'Approved' ? '✅' :
            leave.Status__c === 'Rejected' ? '❌' :
              leave.Status__c === 'Pending' ? '⏳' :
                leave.Status__c === 'Cancelled' ? '🚫' : '❓';
        response += `${statusEmoji} **${leave.Leave_Type__c}** - ${leave.Start_Date__c} to ${leave.End_Date__c}\n`;
        response += `   Status: ${leave.Status__c} | Reason: ${leave.Reason__c || 'Not specified'}\n`;
        response += `   ID: ${leave.Id}\n\n`;
      }
    }

    if (wfhRequests.length > 0) {
      response += `**WFH Requests (${wfhRequests.length})**\n`;
      for (const wfh of wfhRequests) {
        const statusEmoji =
          wfh.Status__c === 'Approved' ? '✅' :
            wfh.Status__c === 'Rejected' ? '❌' :
              wfh.Status__c === 'Pending' ? '⏳' :
                wfh.Status__c === 'Cancelled' ? '🚫' : '❓';
        response += `${statusEmoji} **${wfh.Date__c}**\n`;
        response += `   Status: ${wfh.Status__c}\n`;
        response += `   Reason: ${wfh.Reason__c || 'Personal'}\n`;
        response += `   ID: ${wfh.Id}\n\n`;
      }
    }

    response += `\n**Legend:**\n✅ Approved | ❌ Rejected | ⏳ Pending | 🚫 Cancelled\n`;
    response += `\nWould you like to view details, edit, or cancel any request?`;

    res.json({
      reply: response,
      intent: 'requests_listed',
      requestCount: leaveRequests.length + wfhRequests.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.json({
      reply: 'Unable to fetch your requests. Please try again or contact HR.',
      intent: 'error',
      timestamp: new Date().toISOString()
    });
  }
}

import * as fs from 'fs';
import * as path from 'path';
import contextManager from '../utils/contextManager';
import dateParser from '../services/dateParser';
import entityExtractor from '../utils/entityExtractor';
import { SalesforceService } from '../services/salesforceService';
import { AiService } from '../services/aiService';
import { Request, Response } from 'express';
import { PolicyService } from '../services/policyService';

const salesforceService = new SalesforceService();
const aiService = new AiService();
const DEFAULT_EMPLOYEE_NAME = 'Current User';

// Helper to extract leave type using entityExtractor
function extractLeaveType(message: string): string | null {
  // Use extractLeaveDetails and get leaveType
  const details = entityExtractor.extractLeaveDetails(message);
  return details.leaveType || null;
}

// Helper to extract reason using entityExtractor
function extractReason(message: string): string | null {
  // Use extractLeaveDetails and get reason
  const details = entityExtractor.extractLeaveDetails(message);
  return details.reason || null;
}

// Helper to clean up reply text
function cleanReply(reply: string): string {
  // Remove excessive whitespace, leading/trailing newlines
  return reply.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

// Helper to get sessionId from request
function getSessionId(req: any): string {
  // Try to get from header, cookie, or fallback to a hash of IP+UA
  if (req.sessionId) return req.sessionId;
  if (req.headers && req.headers["x-session-id"]) return req.headers["x-session-id"];
  if (req.cookies && req.cookies.sessionId) return req.cookies.sessionId;
  // fallback: hash IP+UA
  const ip = req.ip || (req.connection && req.connection.remoteAddress) || '';
  const ua = req.headers ? req.headers['user-agent'] || '' : '';
  return Buffer.from(ip + ua).toString('base64');
}

function calculateWorkingDays(startDate: string | null, endDate: string | null, isHalfDay = false, holidays: string[] = []): number | null {
  if (!startDate) {
    return null;
  }

  const effectiveEnd = endDate || startDate;
  const total = dateParser.calculateInclusiveDays(startDate, effectiveEnd, isHalfDay, true, holidays);
  // Always return at least 1 for valid single-day leave (unless half-day)
  if (isHalfDay) return 0.5;
  return total >= 1 ? total : 1;
}

// Helper to get week boundaries (Monday to Sunday) for WFH limit check
function getWeekBounds(dateStr: string): { monday: string; sunday: string } {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 is Sun, 1 is Mon...
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(new Date(date).setDate(diff));
  const sunday = new Date(new Date(date).setDate(diff + 6));
  return {
    monday: monday.toISOString().slice(0, 10),
    sunday: sunday.toISOString().slice(0, 10)
  };
}

// Helper function to extract WFH details using enhanced extractor
function extractWfhDetails(message: string): { date: string | null, reason: string | null, employeeName: string | null } {
  return entityExtractor.extractWfhDetails(message);
}

// Helper function to process WFH request
async function processWfhRequest(
  sessionId: string,
  details: { date: string | null, reason: string | null, employeeName: string | null, isException?: boolean },
  ssoContext?: { finalEmail?: string; finalName?: string }
): Promise<any> {
  if (!details.date || !details.reason) {
    throw new Error('Missing required fields');
  }

  const employeeName = ssoContext?.finalName || contextManager.getEmployeeName(sessionId) || details.employeeName || DEFAULT_EMPLOYEE_NAME;
  const employeeEmail = ssoContext?.finalEmail || contextManager.getEmployeeEmail(sessionId) || null;
  const employeeId = contextManager.getEmployeeId(sessionId) || null;

  // Check for overlapping leave or WFH on the same date
  const overlapCheck = await salesforceService.checkLeaveOverlap(
    employeeName,
    details.date,
    details.date
  );
  if (overlapCheck.hasOverlap && overlapCheck.overlappingLeaves.length > 0) {
    const leave = overlapCheck.overlappingLeaves[0];
    return {
      success: false,
      hasOverlap: true,
      message: `⚠️ You already have pending ${leave.leaveType} leave from ${leave.startDate} to ${leave.endDate}.\n\nPlease adjust your new request or update the existing leave first.`,
      overlappingLeaves: overlapCheck.overlappingLeaves
    };
  }

  // Block past dates
  if (dateParser.isPastDate(details.date!)) {
    return {
      success: false,
      message: `❌ Cannot apply WFH for a past date (${details.date}). Please select today or a future date.`
    };
  }

  // WFH Weekly Limit Check (Max 2 days per week)
  if (!details.isException) {
    try {
      const wfhRequests = employeeEmail ? await salesforceService.getWfhRequestsByEmail(employeeEmail) : [];
      const { monday, sunday } = getWeekBounds(details.date!);
      const currentWeekWfh = wfhRequests.filter(r => r.date >= monday && r.date <= sunday && r.status !== 'Rejected');

      if (currentWeekWfh.length >= 2) {
        return {
          success: false,
          isInsufficientBalance: true,
          message: `⚠️ **Insufficient WFH Allowance**\n\nYou don't have enough WFH allowance to proceed further.\n\nWould you like me to send this as a special exception request for your manager to review? If approved, it will be stored in Salesforce.`
        };
      }
    } catch (error) {
      console.error('WFH limit check failed:', error);
    }
  }

  const result = await salesforceService.createWfhRecord({
    employeeName,
    employeeEmail,
    employeeId,
    date: details.date,
    reason: details.reason,
    isException: !!details.isException
  });

  if (result.success && details.isException) {
    return {
      success: true,
      id: result.id,
      message: '✅ Exception WFH request sent to your manager for approval (via Salesforce). You will be notified once they review it.',
      pendingApproval: true
    };
  }

  return result;
}

// Helper function to extract leave details using DateParser service
interface LeaveDetails {
  startDate: string | null;
  endDate: string | null;
  leaveType: string | null;
  reason: string | null;
  employeeName: string | null;
  durationDays?: number | null;
  isHalfDay?: boolean;
  errors?: string[];
}

function extractLeaveDetails(message: string, holidays: string[] = []): LeaveDetails {
  const parsedDates = dateParser.parseDates(message);
  const durationInfo = dateParser.parseDuration(message);
  const leaveType = extractLeaveType(message);
  let reason = extractReason(message);
  if (reason) {
    reason = reason.replace(/\b(a |an )?half([- ]?a)?[- ]?day(s)?\b/gi, '').replace(/\s+/g, ' ').trim();
    if (reason.length === 0) reason = null;
  }
  let startDate = parsedDates.startDate;
  let endDate = parsedDates.endDate ?? parsedDates.startDate;
  if (startDate && durationInfo.durationDays && (!endDate || durationInfo.hasExplicitDuration)) {
    endDate = durationInfo.isHalfDay ? startDate : dateParser.projectEndDate(startDate, durationInfo.durationDays);
  }
  if (startDate && !endDate) {
    endDate = startDate;
  }
  const errors: string[] = [...parsedDates.errors];
  if (startDate && endDate) {
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();
    if (!Number.isNaN(startTime) && !Number.isNaN(endTime) && endTime < startTime) {
      errors.push('End date cannot be earlier than start date.');
    }
  }
  let finalIsHalfDay = durationInfo.isHalfDay;
  let finalDurationDays = durationInfo.durationDays;
  if (finalIsHalfDay) {
    finalDurationDays = 0.5;
  } else {
    finalDurationDays = calculateWorkingDays(startDate ?? null, endDate ?? null, false, holidays) ?? durationInfo.durationDays ?? null;
    if (finalDurationDays === 0.5) finalIsHalfDay = true;
  }
  if (/\b(a |an )?half([- ]?a)?[- ]?day(s)?\b/i.test(message)) {
    finalIsHalfDay = true;
    finalDurationDays = 0.5;
  }
  return {
    startDate: startDate ?? null,
    endDate: endDate ?? startDate ?? null,
    leaveType,
    reason,
    employeeName: DEFAULT_EMPLOYEE_NAME,
    durationDays: finalDurationDays,
    isHalfDay: finalIsHalfDay,
    errors: errors.length ? Array.from(new Set(errors)) : undefined
  };
}

// Helper function to process leave request
async function processLeaveRequest(
  sessionId: string,
  details: {
    startDate: string | null,
    endDate: string | null,
    leaveType: string | null,
    reason: string | null,
    employeeName: string | null,
    durationDays?: number | null,
    isHalfDay?: boolean,
    errors?: string[],
    isException?: boolean
  },
  ssoContext?: { finalEmail?: string; finalName?: string }
): Promise<any> {
  // Block leave creation if any date is a holiday
  const holidaysData = await PolicyService.getPolicy('holidays.json');
  const holidaysList = (holidaysData.holidays || []) as any[];
  const leaveDates = [];
  const start = new Date(details.startDate!);
  const end = new Date(details.endDate || details.startDate!);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    leaveDates.push(d.toISOString().slice(0, 10));
  }
  const holidayDates = holidaysList.map(h => h.date);
  const conflictHoliday = leaveDates.find(date => holidayDates.includes(date));
  if (conflictHoliday) {
    const holidayObj = holidaysList.find(h => h.date === conflictHoliday);
    return {
      success: false,
      isHoliday: true,
      holidayDate: conflictHoliday,
      holidayName: holidayObj?.name || 'Holiday',
      message: `Cannot apply leave on ${conflictHoliday} (${holidayObj?.name || 'Holiday'}). It is a company holiday.`
    };
  }

  const employeeName = ssoContext?.finalName || contextManager.getEmployeeName(sessionId) || details.employeeName || DEFAULT_EMPLOYEE_NAME;
  const employeeEmail = ssoContext?.finalEmail || contextManager.getEmployeeEmail(sessionId) || null;
  const employeeId = contextManager.getEmployeeId(sessionId) || null;
  const endDate = details.endDate || details.startDate;

  // Block past dates
  if (dateParser.isPastDate(details.startDate!)) {
    return {
      success: false,
      message: `❌ Cannot apply leave for a past date (${details.startDate}). Please select today or a future date.`
    };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
  const requestDate = new Date(details.startDate!);
  requestDate.setHours(0, 0, 0, 0);

  if (requestDate < today) {
    // Past date - return error for backdated application
    return {
      success: false,
      isPastDate: true,
      requestedDate: details.startDate,
      message: 'Leave date is in the past'
    };
  }

  // Check for existing leave overlap
  const overlapCheck = await salesforceService.checkLeaveOverlap(
    employeeName,
    details.startDate!,
    endDate!
  );

  if (overlapCheck.hasOverlap) {
    const leave = overlapCheck.overlappingLeaves[0];
    // Return overlap information instead of creating
    return {
      success: false,
      hasOverlap: true,
      message: `⚠️ You already have ${leave.leaveType} leave from ${leave.startDate} to ${leave.endDate}.\n\nPlease adjust your new request or update the existing leave first.`,
      overlappingLeaves: overlapCheck.overlappingLeaves
    };
  }

  const requestedDays = calculateWorkingDays(details.startDate, endDate, Boolean(details.isHalfDay)) || 0;

  if (!details.isException) {
    try {
      const balance = await salesforceService.checkLeaveBalance(employeeEmail || '', details.leaveType!, requestedDays);
      if (balance && !balance.isAvailable) {
        const formatDays = (value: number) => (Number.isInteger(value) ? `${value}` : value.toFixed(1));
        return {
          success: false,
          isInsufficientBalance: true,
          message: `⚠️ **Insufficient Balance**\n\nYou don't have enough leave to proceed further.\n\n• Requested: ${formatDays(requestedDays)} day${requestedDays === 1 ? '' : 's'}\n• Available: ${formatDays(balance.remaining)} day${balance.remaining === 1 ? '' : 's'}\n\nWould you like me to send this as a special exception request for your manager to review? If approved, it will be stored in Salesforce.`
        };
      }
    } catch (error) {
      console.error('Balance check failed during processing:', error);
    }
  }

  // Check for email before creating any Salesforce record
  if (!employeeEmail) {
    return {
      success: false,
      isEmailMissing: true,
      message: '⚠️ **Email Required**\n\nI couldn\'t find your email address. I need it to resolve your manager and Employee ID in Salesforce.\n\nPlease type: **"My email is [your-email]"** and then try again.'
    };
  }

  const payload = {
    employeeName,
    employeeEmail,
    employeeId,
    startDate: details.startDate,
    endDate,
    reason: details.reason || 'Personal',
    leaveType: details.leaveType,
    durationDays: requestedDays,
    isHalfDay: Boolean(details.isHalfDay),
    isException: !!details.isException
  };

  // If this is an exception request, create record in Salesforce (Pending)
  // Salesforce Flow/Process Builder will handle the email notification based on Is_Exception__c flag
  if (details.isException) {
    const result = await salesforceService.createLeaveRecord(payload);

    if (result.success) {
      return {
        success: true,
        id: result.id,
        message: '✅ Exception leave request sent to your manager for approval (via Salesforce). You will be notified once they review it.',
        pendingApproval: true
      };
    } else {
      return {
        success: false,
        message: '❌ Failed to create exception request in Salesforce. Please try again or contact HR.',
        error: result.message
      };
    }
  }

  // Normal leave request - create SF record directly
  return await salesforceService.createLeaveRecord(payload);
}

function getRequestedLeaveDays(details: { startDate?: string | null; endDate?: string | null; durationDays?: number | null; isHalfDay?: boolean | null }, holidays: string[] = []): number | null {
  if (typeof details.durationDays === 'number' && details.durationDays > 0) {
    return details.durationDays;
  }

  if (details.startDate) {
    const totalDays = dateParser.calculateInclusiveDays(details.startDate, details.endDate ?? details.startDate, Boolean(details.isHalfDay), true, holidays);
    return totalDays > 0 ? totalDays : null;
  }

  return null;
}

async function enforceLeaveBalance(
  sessionId: string,
  details: { startDate?: string | null; endDate?: string | null; leaveType?: string | null; durationDays?: number | null },
  res: Response,
  email: string | null = null,
  holidays: string[] = []
): Promise<boolean> {
  const requestedDays = getRequestedLeaveDays(details, holidays);
  if (!requestedDays || requestedDays <= 0 || !details.leaveType) {
    return false;
  }

  try {
    const userEmail = email || contextManager.getEmployeeEmail(sessionId) || '';
    const balance = await salesforceService.checkLeaveBalance(userEmail, details.leaveType, requestedDays);

    if (balance && balance.isAvailable === false) {
      const formatDays = (value: number) => (Number.isInteger(value) ? `${value}` : value.toFixed(1));
      const response = `⚠️ **Insufficient Balance**

You don't have enough leave to proceed further.

• Requested: ${formatDays(requestedDays)} day${requestedDays === 1 ? '' : 's'}
• Available: ${formatDays(balance.remaining)} day${balance.remaining === 1 ? '' : 's'}

Would you like me to send this as a special exception request for your manager to review? If approved, it will be stored in Salesforce.`;

      contextManager.updateContext(sessionId, { awaitingExceptionApproval: true });
      contextManager.setPendingConfirmation(sessionId, 'leave', details);
      res.json({
        reply: response,
        intent: 'leave_balance_insufficient',
        showButtons: true,
        timestamp: new Date().toISOString()
      });
      return true;
    }
  } catch (error) {
    console.error('Leave balance check failed:', error);
  }

  return false;
}

async function handleLeaveEditRequest(
  sessionId: string,
  pending: { details: any } | null,
  editDetails: any,
  message: string,
  res: Response,
  ssoContext?: { finalEmail?: string; finalName?: string },
  holidays: string[] = []
): Promise<boolean> {
  contextManager.updateContext(sessionId, { awaitingExceptionApproval: false });
  const detailsFromForm = editDetails && typeof editDetails === 'object' ? editDetails : null;
  let newDetails: any = null;

  if (detailsFromForm) {
    const updatedStart = detailsFromForm.startDate || (pending ? pending.details.startDate : null);
    const updatedEnd = detailsFromForm.endDate || updatedStart || (pending ? pending.details.endDate : null);
    newDetails = {
      ...(pending ? pending.details : {}),
      leaveType: detailsFromForm.leaveType || (pending ? pending.details.leaveType : null),
      startDate: updatedStart,
      endDate: updatedEnd,
      reason: detailsFromForm.reason ?? (pending ? pending.details.reason : 'Personal'),
      employeeName: (pending ? pending.details.employeeName : (ssoContext?.finalName || contextManager.getEmployeeName(sessionId) || DEFAULT_EMPLOYEE_NAME))
    };
  } else if (pending) {
    newDetails = extractLeaveDetails(message);
    if (newDetails) {
      newDetails = {
        ...pending.details,
        ...newDetails
      };
    }
  }

  if (newDetails) {
    newDetails = applyLeaveDefaults(newDetails, holidays);
  }

  if (newDetails?.errors?.length) {
    const primaryError = newDetails.errors[0];
    const errorMessage = primaryError.includes('End date cannot be earlier than start date')
      ? '❌ End date cannot be earlier than start date. Please adjust your dates.'
      : `❌ ${primaryError}`;

    res.json({
      reply: `${errorMessage}

Please provide corrected dates to continue editing your leave request.`,
      intent: 'validation_error',
      timestamp: new Date().toISOString()
    });
    return true;
  }

  if (newDetails && newDetails.startDate && newDetails.leaveType) {
    const userEmail = ssoContext?.finalEmail || contextManager.getEmployeeEmail(sessionId);
    if (await enforceLeaveBalance(sessionId, newDetails, res, userEmail, holidays)) return true;

    // Block confirmation if the requested date is a holiday (move BEFORE confirmation)
    newDetails.reason = newDetails.reason || 'Personal';
    const holidaysData = await PolicyService.getPolicy('holidays.json');
    const holidaysList = (holidaysData.holidays || []) as any[];
    const leaveDates = [];
    const start = new Date(newDetails.startDate);
    const end = new Date(newDetails.endDate || newDetails.startDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      leaveDates.push(d.toISOString().slice(0, 10));
    }
    const holidayDates = holidaysList.map(h => h.date);
    const conflictHoliday = leaveDates.find(date => holidayDates.includes(date));
    if (conflictHoliday) {
      const holidayObj = holidaysList.find(h => h.date === conflictHoliday);
      res.json({
        reply: `❌ Cannot apply leave on ${conflictHoliday} (${holidayObj?.name || 'Holiday'}). It is a company holiday.`,
        intent: 'leave_on_holiday',
        timestamp: new Date().toISOString()
      });
      return true;
    }
    if (dateParser.isPastDate(newDetails.startDate)) {
      res.json({
        reply: `❌ Cannot apply leave for a past date (${newDetails.startDate}). Please select today or a future date.`,
        intent: 'past_date_error',
        timestamp: new Date().toISOString()
      });
      return true;
    }
    const { errors, ...pendingDetails } = newDetails;
    pendingDetails.employeeName = contextManager.getEmployeeName(sessionId) || pendingDetails.employeeName || DEFAULT_EMPLOYEE_NAME;
    contextManager.setPendingConfirmation(sessionId, 'leave', pendingDetails);

    const reply = `📋 **Please confirm your UPDATED leave request:**

• **Type**: ${pendingDetails.leaveType}
• **Date**: ${pendingDetails.startDate}${pendingDetails.endDate && pendingDetails.endDate !== pendingDetails.startDate ? ' to ' + pendingDetails.endDate : ''}
• **Reason**: ${pendingDetails.reason}

Tap a button below when you're ready.`;

    res.json({
      reply,
      intent: 'confirm_leave',
      showButtons: true,
      pendingRequest: { type: 'leave', details: pendingDetails },
      timestamp: new Date().toISOString()
    });
    return true;
  }

  const fallbackReply = `✏️ Got it! Let's update your leave request.

**Current Details:**
Type: ${pending?.details.leaveType || 'Not specify'}
Date: ${pending?.details.startDate || ''}${pending?.details.endDate && pending?.details.endDate !== pending?.details.startDate ? ' to ' + pending?.details.endDate : ''}

Reason: ${pending?.details.reason || 'Personal'}
Status: Pending Approval
Your manager has been notified and will review your request shortly.`;

  const fallbackReplyLeave = `✏️ Got it! Let's update your leave request.

**Current Details:**
• Date: ${pending?.details.startDate || 'N/A'}
• Type: ${pending?.details.leaveType || 'N/A'}
• Reason: ${pending?.details.reason || 'Personal'}

Please provide the complete NEW information. For example:
"Casual leave on 20.12.2025 for family event"`;

  res.json({
    reply: fallbackReplyLeave,
    intent: 'edit_request',
    timestamp: new Date().toISOString()
  });
  return true;
}

async function handleWfhEditRequest(
  sessionId: string,
  pending: { details: any } | null,
  editDetails: any,
  message: string,
  res: Response,
  ssoContext?: { finalEmail?: string; finalName?: string }
): Promise<boolean> {
  contextManager.updateContext(sessionId, { awaitingExceptionApproval: false });
  const detailsFromForm = editDetails && typeof editDetails === 'object' ? editDetails : null;
  let newDetails: any = null;

  if (detailsFromForm) {
    newDetails = {
      ...(pending ? pending.details : {}),
      date: detailsFromForm.date || detailsFromForm.startDate || (pending ? (pending.details.date || pending.details.startDate) : null),
      startDate: detailsFromForm.startDate || (pending ? (pending.details.startDate || pending.details.date) : null),
      endDate: detailsFromForm.endDate || detailsFromForm.startDate || (pending ? (pending.details.endDate || pending.details.startDate || pending.details.date) : null),
      reason: detailsFromForm.reason ?? (pending ? pending.details.reason : 'Personal'),
      employeeName: (pending ? pending.details.employeeName : 'You')
    };
  } else if (pending) {
    newDetails = extractWfhDetails(message);
    if (newDetails) {
      newDetails = {
        ...pending.details,
        ...newDetails
      };
    }
  }

  if (newDetails && newDetails.date) {
    if (dateParser.isPastDate(newDetails.date)) {
      res.json({
        reply: `❌ Cannot apply WFH for a past date (${newDetails.date}). Please select today or a future date.`,
        intent: 'past_date_error',
        timestamp: new Date().toISOString()
      });
      return true;
    }

    // WFH Weekly Limit Check
    const userEmail = ssoContext?.finalEmail || contextManager.getEmployeeEmail(sessionId);
    try {
      const wfhRequests = userEmail ? await salesforceService.getWfhRequestsByEmail(userEmail) : [];
      const { monday, sunday } = getWeekBounds(newDetails.date);
      const currentWeekWfh = wfhRequests.filter(r => r.date >= monday && r.date <= sunday && r.status !== 'Rejected');

      if (currentWeekWfh.length >= 2) {
        contextManager.updateContext(sessionId, { awaitingExceptionApproval: true });
        contextManager.setPendingConfirmation(sessionId, 'wfh', newDetails);
        res.json({
          reply: `⚠️ **Insufficient WFH Allowance**

You don't have enough WFH allowance to proceed further.

Would you like me to send this as a special exception request for your manager to review? If approved, it will be stored in Salesforce.`,
          intent: 'wfh_balance_insufficient',
          showButtons: true,
          timestamp: new Date().toISOString()
        });
        return true;
      }
    } catch (e) {
      console.error('WFH edit limit check failed:', e);
    }

    newDetails.reason = newDetails.reason || 'Personal';
    newDetails.employeeName = contextManager.getEmployeeName(sessionId) || newDetails.employeeName || DEFAULT_EMPLOYEE_NAME;
    contextManager.setPendingConfirmation(sessionId, 'wfh', newDetails);

    const dateDisplay = newDetails.startDate && newDetails.endDate && newDetails.startDate !== newDetails.endDate
      ? `${newDetails.startDate} to ${newDetails.endDate}`
      : (newDetails.date || newDetails.startDate);

    const reply = `📋 **Please confirm your UPDATED WFH request:**

• **Date**: ${dateDisplay}
• **Reason**: ${newDetails.reason}

Tap a button below when you're ready.`;

    res.json({
      reply,
      intent: 'confirm_wfh',
      showButtons: true,
      pendingRequest: { type: 'wfh', details: newDetails },
      timestamp: new Date().toISOString()
    });
    return true;
  }

  const fallbackReplyWfh = `✏️ Got it! Let's update your WFH request.

**Current Details:**
• Date: ${pending?.details.date || 'N/A'}
• Reason: ${pending?.details.reason || 'Personal'}

Please provide the complete NEW information. For example:
"WFH on 20.12.2025 for doctor appointment"`;

  res.json({
    reply: fallbackReplyWfh,
    intent: 'edit_request',
    timestamp: new Date().toISOString()
  });
  return true;
}

const chatController = async (req: Request, res: Response) => {
  const sessionId = getSessionId(req);
  const body = (req.body && typeof req.body === 'object') ? req.body as any : {};
  const message = body.message;

  // 1. Extract SSO Context Immediately (Name, Email)
  const ssoEmail = (req.headers['x-user-email'] as string) || (req.headers['authorization']?.includes('@') ? req.headers['authorization'] : null);
  const ssoName = (req.headers['x-user-name'] as string);

  const { editDetails, employeeEmail: bodyEmail, employeeName: bodyName, confirmationAction, intentOverride, pendingRequest: pendingFromClient } = body;

  const finalEmail = ssoEmail || bodyEmail || contextManager.getEmployeeEmail(sessionId);
  const finalName = ssoName || bodyName || contextManager.getEmployeeName(sessionId) || DEFAULT_EMPLOYEE_NAME;

  // Update Persistent Context
  if (finalEmail) contextManager.setUserEmail(sessionId, finalEmail);
  if (finalName && finalName !== DEFAULT_EMPLOYEE_NAME) contextManager.updateContext(sessionId, { employeeName: finalName });

  console.log(`👤 Active Context [${sessionId}]: Name: ${finalName}, Email: ${finalEmail || 'None'}`);
  if (req.headers['x-user-email']) console.log(`📡 SSO Header: ${req.headers['x-user-email']}`);

  // 2. Short-circuit: If awaiting request type clarification
  if (contextManager.getContext(sessionId).awaitingRequestTypeClarification) {
    const lastUserMessage = message.toLowerCase();
    let type: 'leave' | 'wfh' | 'both' = 'both';
    if (lastUserMessage.includes('leave')) type = 'leave';
    else if (
      lastUserMessage.includes('wfh') ||
      lastUserMessage.includes('work from home') ||
      lastUserMessage.includes('work-from-home') ||
      lastUserMessage.includes('remote')
    ) type = 'wfh';

    contextManager.updateContext(sessionId, { awaitingRequestTypeClarification: false });
    await listRequests(sessionId, res, type, { finalEmail, finalName });
    return;
  }

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  try {
    // Fetch holidays once per request for day calculation consistency
    const holidaysData = await PolicyService.getPolicy('holidays.json');
    const holidaysList = (holidaysData.holidays || []) as any[];
    const holidayDates = holidaysList.map(h => h.date);

    // SSO Context already extracted above

    // PRIORITY 1: Handle UI Actions (Forms, Buttons)
    if (editDetails || (confirmationAction && confirmationAction.toLowerCase() === 'edit')) {
      const pending = pendingFromClient || contextManager.getPendingConfirmation(sessionId);

      // even if no pending, if editDetails exist, we handle as a direct form submission
      if (editDetails) {
        // Detect type from editDetails if possible
        const isWfh = !!editDetails.date || (pending && pending.type === 'wfh');
        if (isWfh) {
          const handled = await handleWfhEditRequest(sessionId, pending, editDetails, message, res, { finalEmail, finalName });
          if (handled) return;
        } else {
          const handled = await handleLeaveEditRequest(sessionId, pending, editDetails, message, res, { finalEmail, finalName }, holidayDates);
          if (handled) return;
        }
      } else if (pending) {
        if (pending.type === 'leave') {
          // Pass full context for Salesforce create
          const handled = await handleLeaveEditRequest(sessionId, pending, editDetails, message, res, { finalEmail, finalName }, holidayDates);
          if (handled) return;
        } else if (pending.type === 'wfh') {
          const handled = await handleWfhEditRequest(sessionId, pending, editDetails, message, res, { finalEmail, finalName });
          if (handled) return;
        }
      }
    }

    if (!message || typeof message !== 'string') {
      res.status(400);
      res.json({ error: 'Message is required' });
      return;
    }

    console.log('💬 Chat request:', message);

    const normalizedConfirmationAction = typeof confirmationAction === 'string' ? confirmationAction.toLowerCase() : null;
    const normalizedIntentOverride = typeof intentOverride === 'string' ? intentOverride.toLowerCase() : null;
    const shouldSkipHistory = normalizedConfirmationAction === 'yes' || normalizedConfirmationAction === 'no';

    const lowerMessage = message.toLowerCase();
    let response = '';

    // Patch all res.json({ reply: ... }) in this controller to clean up whitespace
    const originalResJson = res.json.bind(res);
    res.json = function (body: any) {
      if (body && typeof body.reply === 'string') {
        body.reply = cleanReply(body.reply);
      }
      return originalResJson(body);
    };

    // Email verification logic removed. Assume employee context is already set by People Portal integration.
    // If not set, prompt for required fields or show error as appropriate.

    // Check if user is responding to confirmation

    const context = contextManager.getContext(sessionId);
    const pendingConfirmation = contextManager.getPendingConfirmation(sessionId);
    const confirmation = normalizedConfirmationAction || entityExtractor.extractConfirmation(message);

    if (pendingConfirmation) {
      if (confirmation === 'yes') {
        const isExceptionRequest = !!context.awaitingExceptionApproval;
        if (isExceptionRequest) {
          contextManager.updateContext(sessionId, { awaitingExceptionApproval: false });
          pendingConfirmation.details.isException = true;
        }

        contextManager.clearPendingConfirmation(sessionId);
        if (pendingConfirmation.type === 'leave') {
          const result = await processLeaveRequest(sessionId, pendingConfirmation.details, { finalEmail, finalName });
          if (result.success) {
            const successMsg = pendingConfirmation.details.isException
              ? `✅ Exception leave request sent successfully!\n\nType: ${pendingConfirmation.details.leaveType}\nDate: ${pendingConfirmation.details.startDate} to ${pendingConfirmation.details.endDate}\nStatus: Exception Pending\n\nYour special request has been sent to the manager for review.`
              : `✅ Leave request created successfully!\n\nType: ${pendingConfirmation.details.leaveType}\nDate: ${pendingConfirmation.details.startDate} to ${pendingConfirmation.details.endDate}\nStatus: Pending Approval\n\nYour request has been sent to the manager.`;

            return res.json({
              reply: successMsg,
              intent: 'leave_created',
              timestamp: new Date().toISOString()
            });
          } else {
            console.error('❌ Leave creation failed:', result.message);
            return res.json({
              reply: result.isInsufficientBalance ? result.message : `❌ Sorry, I couldn't create that request: ${result.message || 'Unknown error'}`,
              intent: 'error',
              timestamp: new Date().toISOString()
            });
          }
        } else if (pendingConfirmation.type === 'wfh') {
          const result = await processWfhRequest(sessionId, pendingConfirmation.details, { finalEmail, finalName });
          if (result.success) {
            const successMsg = pendingConfirmation.details.isException
              ? `✅ Exception WFH request sent successfully!\n\nDate: ${pendingConfirmation.details.date}\nStatus: Exception Pending\n\nYour special request has been sent to the manager for review.`
              : `✅ WFH request created successfully!\n\nDate: ${pendingConfirmation.details.date}\nStatus: Pending Approval\n\nYour request has been sent to the manager.`;

            return res.json({
              reply: successMsg,
              intent: 'wfh_created',
              timestamp: new Date().toISOString()
            });
          } else {
            console.error('❌ WFH creation failed:', result.message);
            return res.json({
              reply: result.isInsufficientBalance ? result.message : `❌ Sorry, I couldn't create that request: ${result.message || 'Unknown error'}`,
              intent: 'error',
              timestamp: new Date().toISOString()
            });
          }
        }
      } else if (confirmation === 'no') {
        contextManager.updateContext(sessionId, { awaitingExceptionApproval: false });
        contextManager.clearPendingConfirmation(sessionId);
        return res.json({
          reply: "ℹ️ Request cancelled. How else can I help you?",
          intent: 'confirmation_no',
          timestamp: new Date().toISOString()
        });
      }
    }

    const analysis = await aiService.analyzeUserIntent(message, {
      employeeName: finalName,
      employeeEmail: finalEmail,
      sessionId,
      currentDate
    });

    let currentIntent = normalizedIntentOverride || analysis.intent;

    // Sequential Flow Logic (Leave & WFH)
    const leaveState = (contextManager.getAwaitingLeaveDetails(sessionId) || {}) as any;
    const wfhState = (contextManager.getAwaitingWfhDetails(sessionId) || {}) as any;
    const inLeaveFlow = !!leaveState.step;
    const inWfhFlow = !!wfhState.step;

    // Intent Locking & Flexible Switching
    const hrIntents = ['apply_leave', 'apply_wfh', 'leave_balance', 'holiday_list', 'view_requests', 'reimbursement_info', 'leave_policy', 'wfh_policy'];

    if (inLeaveFlow) {
      if (lowerMessage.includes('cancel') || lowerMessage.includes('stop') || lowerMessage.includes('reset')) {
        contextManager.clearAwaitingLeaveDetails(sessionId);
        return res.json({
          reply: "Okay, I've cancelled that leave request. What else can I help you with?",
          intent: 'cancel_flow',
        });
      }

      // If user detected a different HR intent, clear the current flow
      if (currentIntent !== 'apply_leave' && hrIntents.includes(currentIntent)) {
        console.log(`🔄 Switching from Leave flow to ${currentIntent}`);
        contextManager.clearAwaitingLeaveDetails(sessionId);
      } else if (!['view_requests', 'greeting', 'holiday_list'].includes(currentIntent)) {
        currentIntent = 'apply_leave';
      }
    } else if (inWfhFlow) {
      if (lowerMessage.includes('cancel') || lowerMessage.includes('stop') || lowerMessage.includes('reset')) {
        contextManager.clearAwaitingWfhDetails(sessionId);
        return res.json({
          reply: "Okay, I've cancelled that WFH request.",
          intent: 'cancel_flow',
        });
      }

      // STRICTLY TARGETED GUARD: If we are waiting for a WFH reason, don't context switch unless explicitly requested
      // This specifically prevents "fever" (sick leave indicator) from switching flows when asking for WFH reason
      const isSwitchingToLeave = currentIntent === 'apply_leave' && !lowerMessage.includes('apply') && !lowerMessage.includes('leave');

      if (wfhState.step === 'reason' && isSwitchingToLeave) {
        console.log('🛡️ Guarding WFH flow: Treating potential leave intent as WFH reason');
        currentIntent = 'apply_wfh';
      } else {
        // If user detected a different HR intent, clear the current flow
        if (currentIntent !== 'apply_wfh' && hrIntents.includes(currentIntent)) {
          console.log(`🔄 Switching from WFH flow to ${currentIntent}`);
          contextManager.clearAwaitingWfhDetails(sessionId);
        } else if (!['view_requests', 'greeting', 'holiday_list'].includes(currentIntent)) {
          currentIntent = 'apply_wfh';
        }
      }
    }

    // Switch block for intent handling
    switch (currentIntent) {
      case 'apply_leave': {
        const entities = analysis.entities || {};
        const extracted = extractLeaveDetails(message, holidayDates);

        const details = {
          startDate: entities.startDate || entities.date || extracted.startDate,
          endDate: entities.endDate || extracted.endDate || entities.startDate || entities.date || extracted.startDate,
          leaveType: entities.leaveType || extracted.leaveType,
          reason: entities.reason || extracted.reason,
          employeeName: DEFAULT_EMPLOYEE_NAME
        };

        const finalDetails = applyLeaveDefaults(details, holidayDates);

        return res.json({
          reply: "Please review and complete your leave request details below:",
          intent: 'apply_leave',
          showForm: true,
          isEdit: false,
          details: finalDetails,
          timestamp: new Date().toISOString()
        });
      }

      case 'apply_wfh': {
        const entities = analysis.entities || {};
        const extracted = extractWfhDetails(message);

        const details = {
          date: entities.date || entities.startDate || extracted.date,
          startDate: entities.startDate || entities.date || extracted.date,
          endDate: entities.endDate || entities.startDate || entities.date || extracted.date,
          reason: entities.reason || extracted.reason,
          employeeName: DEFAULT_EMPLOYEE_NAME,
          step: 'confirm'
        };

        return res.json({
          reply: "Please review and complete your WFH request details below:",
          intent: 'apply_wfh',
          showForm: true,
          isEdit: false,
          details: details,
          timestamp: new Date().toISOString()
        });
      }

      case 'leave_balance': {
        const requestedType = analysis.entities?.leaveType || extractLeaveType(message);

        // Ensure gender is known
        const context = contextManager.getContext(sessionId);
        if (!context.gender) {
          const gender = await salesforceService.getUserGender(finalEmail);
          contextManager.updateContext(sessionId, { gender });
        }
        const userGender = contextManager.getContext(sessionId).gender;

        if (requestedType && requestedType !== 'UNKNOWN') {
          // Check eligibility for direct balance request
          if (requestedType === 'MATERNITY' && userGender === 'Male') {
            return res.json({ reply: "Maternity leave is only available for female employees.", intent: 'eligibility_error' });
          }
          if (requestedType === 'PATERNITY' && userGender === 'Female') {
            return res.json({ reply: "Paternity leave is only available for male employees.", intent: 'eligibility_error' });
          }

          const balance = await salesforceService.getLeaveBalance(finalEmail, requestedType);
          return res.json({
            reply: `📅 **Your ${balance.leaveType} Leave Balance:**\n\n` +
              `• **Total Entitlement**: ${balance.total} days\n` +
              `• **Used/Pending**: ${balance.used} days\n` +
              `• **Remaining**: **${balance.remaining} days**\n\n` +
              `Would you like to apply for ${balance.leaveType.toLowerCase()} leave now?`,
            intent: 'leave_balance_info',
            timestamp: new Date().toISOString()
          });
        } else {
          const balances = await salesforceService.getAllLeaveBalances(finalEmail);
          let filteredBalances = balances;
          let showGenderNote = false;

          if (userGender === 'Male') {
            filteredBalances = balances.filter(b => b.leaveType !== 'MATERNITY');
          } else if (userGender === 'Female') {
            filteredBalances = balances.filter(b => b.leaveType !== 'PATERNITY');
          } else {
            // Unknown gender: hide both for a clean summary, or if user asked for "all"
            filteredBalances = balances.filter(b => b.leaveType !== 'MATERNITY' && b.leaveType !== 'PATERNITY');
            showGenderNote = true;
          }

          let reply = `📋 **Your Leave Balance Summary (${new Date().getFullYear()}):**\n\n`;
          filteredBalances.forEach(b => {
            reply += `• **${b.leaveType}**: ${b.remaining} days left (out of ${b.total})\n`;
          });

          if (showGenderNote) {
            reply += `\n*Note: Maternity/Paternity balances are hidden as your gender profile is incomplete.*`;
          }

          reply += `\n\nHow can I help you further?`;
          return res.json({
            reply,
            intent: 'leave_balance_summary',
            timestamp: new Date().toISOString()
          });
        }
      }

      case 'view_requests': {
        const lowerMsg = message.toLowerCase();
        let type: 'leave' | 'wfh' | 'both' = 'both';
        if (lowerMsg.includes('leave')) type = 'leave';
        else if (lowerMsg.includes('wfh')) type = 'wfh';

        if (type === 'both' && !lowerMsg.includes('all')) {
          contextManager.updateContext(sessionId, { awaitingRequestTypeClarification: true });
          return res.json({
            reply: 'Which requests would you like to see? (Leave, WFH, or All)',
            intent: 'ask_request_type',
            timestamp: new Date().toISOString()
          });
        }

        await listRequests(sessionId, res, type, { finalEmail, finalName });
        return;
      }

      case 'holiday_list': {
        try {
          const holidaysData = await PolicyService.getAllHolidays();
          let holidays = holidaysData.holidays || [];
          const queryYear = analysis.entities?.year;
          const queryMonth = analysis.entities?.month;
          const startDate = analysis.entities?.startDate;
          const endDate = analysis.entities?.endDate;

          const lowerMsg = message.toLowerCase();
          const isCountQuery = lowerMsg.includes('how many') || lowerMsg.includes('count') || lowerMsg.includes('number of') || lowerMsg.includes('total') || lowerMsg.includes('no of');
          const currentYear = new Date().getFullYear();

          if (startDate && endDate) {
            const start = new Date(startDate).getTime();
            const end = new Date(endDate).getTime();
            holidays = holidays.filter((h: any) => {
              const hDate = new Date(h.date).getTime();
              return hDate >= start && hDate <= end;
            });
          } else if (queryMonth) {
            holidays = holidays.filter((h: any) => {
              const hDate = new Date(h.date);
              const hMonth = hDate.getMonth() + 1;
              const hYear = hDate.getFullYear();
              return !isNaN(hDate.getTime()) && hMonth === queryMonth && (!queryYear || hYear === queryYear);
            });
          } else if (queryYear) {
            holidays = holidays.filter((h: any) => h.date.startsWith(queryYear.toString()));
          } else {
            // Default to current year if no period specified to be efficient
            holidays = holidays.filter((h: any) => h.date.startsWith(currentYear.toString()));
          }

          if (holidays.length === 0) {
            let period = queryYear || currentYear;
            if (startDate && endDate) period = `${startDate} to ${endDate}`;
            else if (queryMonth) {
              const monthName = new Date(2000, queryMonth - 1).toLocaleString('default', { month: 'long' });
              period = `${monthName} ${queryYear || currentYear}`;
            }

            return res.json({ reply: `I couldn't find any holidays for ${period}.`, intent: 'holiday_list', timestamp: new Date().toISOString() });
          }

          if (isCountQuery) {
            let periodText = "";
            if (startDate && endDate) {
              if (lowerMsg.includes('week')) periodText = " in this week";
              else periodText = ` from ${startDate} to ${endDate}`;
            } else if (queryMonth) {
              const monthName = new Date(2000, queryMonth - 1).toLocaleString('default', { month: 'long' });
              periodText = ` in ${monthName}${queryYear ? ' ' + queryYear : ' ' + currentYear}`;
            } else {
              periodText = ` in ${queryYear || currentYear}`;
            }

            return res.json({
              reply: `There are **${holidays.length}** company holidays${periodText}.`,
              intent: 'holiday_count',
              timestamp: new Date().toISOString()
            });
          }

          let reply = `🗓️ **Company Holiday Calendar:**\n\n`;
          let currentYearLabel = '';

          holidays.forEach((h: any) => {
            const hYear = new Date(h.date).getFullYear();
            if (hYear.toString() !== currentYearLabel) {
              currentYearLabel = hYear.toString();
              reply += `\n📅 **${currentYearLabel}**\n`;
            }
            reply += `• **${h.name}**: ${h.date}\n`;
          });

          return res.json({ reply, intent: 'holiday_list', timestamp: new Date().toISOString() });
        } catch (e) {
          return res.json({ reply: "I'm sorry, I couldn't load the holiday list.", intent: 'error' });
        }
      }

      case 'is_holiday': {
        try {
          const holidaysData = await PolicyService.getAllHolidays();
          const holidays = holidaysData.holidays || [];
          const targetDate = analysis.entities?.date || new Date().toISOString().split('T')[0];

          const holidayMatch = holidays.find((h: any) => h.date === targetDate);
          if (holidayMatch) {
            return res.json({
              reply: `**Yes ✅**, ${targetDate} is a holiday (**${holidayMatch.name}**).`,
              intent: 'is_holiday_yes',
              timestamp: new Date().toISOString()
            });
          } else {
            const dateObj = new Date(targetDate);
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
            let reply = `**No ❌**, ${targetDate} is not a company holiday.`;
            if (isWeekend) {
              reply += ` However, it is a **${dateObj.toLocaleDateString('en-US', { weekday: 'long' })}**, which is a weekend.`;
            }
            return res.json({
              reply,
              intent: 'is_holiday_no',
              timestamp: new Date().toISOString()
            });
          }
        } catch (e) {
          return res.json({ reply: "I'm sorry, I couldn't check the holiday status.", intent: 'error' });
        }
      }

      case 'greeting': {
        return res.json({
          reply: `Hello ${finalName}! 👋 I'm your HR Assistant. I can help you with:\n\n` +
            `• Applying for **Leave** or **WFH**\n` +
            `• Checking your **Leave Balance**\n` +
            `• Viewing your **Existing Requests**\n` +
            `• Information on **Company Policies**\n\n` +
            `How can I help you today?`,
          intent: 'greeting',
          timestamp: new Date().toISOString()
        });
      }

      case 'status_check': {
        const email = contextManager.getEmployeeEmail(sessionId);
        const name = contextManager.getEmployeeName(sessionId);
        return res.json({
          reply: `📋 **Bot System Status**\n\n` +
            `• **Name**: ${name || 'Unknown'}\n` +
            `• **Email**: ${email || 'Not Linked'}\n` +
            `• **Session ID**: \`${sessionId}\`\n\n` +
            (email ? `✅ You are identified and ready for Salesforce requests.` : `⚠️ Your email is missing. Please type "My email is..." to link your profile.`),
          intent: 'status_check',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Default: use AI for response
    const aiResponse = await aiService.processMessage(message, {
      employeeName: contextManager.getEmployeeName(sessionId),
      sessionId
    });

    return res.json({
      reply: aiResponse,
      intent: currentIntent,
      timestamp: new Date().toISOString(),
      currentDate
    });

  } catch (error) {
    console.error('Chat Controller Error:', error);
    res.status(500).json({
      error: 'I apologize, I encountered an error processing your request. Please try again.'
    });
  }
}

export default chatController;

