import { Request, Response } from 'express';
import { SalesforceService } from '../services/salesforceService';
import path from 'path';
import fs from 'fs/promises';

const salesforceService = new SalesforceService();

import type { Holiday } from '../types';

interface LeaveRequestBody {
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

interface LeaveRecord {
  id: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  submittedAt: string;
  nextSteps: string;
}

export const leaveController = {
  async applyLeave(req: Request<{}, {}, LeaveRequestBody>, res: Response) {
    try {
      const { employeeName, leaveType, startDate, endDate, reason } = req.body;

      // Validate required fields with type checking
      if (!employeeName || !leaveType || !startDate || !endDate) {
        return res.status(400).json({ 
          error: 'Missing required fields: employeeName, leaveType, startDate, endDate' 
        });
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({
          error: 'Invalid date format. Please use YYYY-MM-DD format'
        });
      }

      // Load holidays from holidays.json
      const holidaysPath = path.join(__dirname, '../../data/holidays.json');
      let holidaysList: Holiday[] = [];
      
      try {
        const holidaysData = await fs.readFile(holidaysPath, 'utf-8');
        const holidaysJson = JSON.parse(holidaysData);
        holidaysList = Array.isArray(holidaysJson.holidays) ? holidaysJson.holidays : [];
      } catch (e) {
        console.error('Failed to load holidays.json:', e);
        // Continue without holidays if file can't be loaded
      }


      // Check if requested leave date(s) overlap with a holiday
      const leaveDates: string[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Validate date range
      if (start > end) {
        return res.status(400).json({
          error: 'End date cannot be before start date'
        });
      }

      // Generate array of leave dates
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        leaveDates.push(d.toISOString().slice(0, 10));
      }

      // Find all holidays that overlap with leave dates
      const conflictHolidays = holidaysList.filter(holiday => leaveDates.includes(holiday.date));
      let holidayWarning = '';
      if (conflictHolidays.length > 0) {
        holidayWarning = `⚠️ Note: Your leave request overlaps with the following company holiday(s):\n` +
          conflictHolidays.map(h => `• ${h.date} (${h.name})${h.optional ? ' (optional)' : ''}`).join('\n') +
          '\nYou may want to reconsider your leave dates or check if you need to apply for leave on a holiday.';
      }

      console.log('📝 Leave application received:', { employeeName, leaveType, startDate, endDate });


      // Instead of creating the record immediately, show confirmation with warning if needed
      // (You can adjust this logic to fit your actual confirmation flow)
      const confirmationMessage = `📋 **Please confirm your leave request:**\n\n` +
        `• **Type**: ${leaveType}\n` +
        `• **Date**: ${startDate}` + (startDate !== endDate ? ` to ${endDate}` : '') + `\n` +
        `• **Duration**: ${leaveDates.length} day${leaveDates.length > 1 ? 's' : ''}\n` +
        `• **Reason**: ${reason || 'No reason provided'}\n` +
        (holidayWarning ? `\n${holidayWarning}` : '') +
        `\n\nSelect an option below: [Confirm] [Edit] [Cancel].`;

      return res.json({
        success: true,
        confirmation: true,
        message: confirmationMessage,
        details: {
          employeeName,
          leaveType,
          startDate,
          endDate,
          reason,
          duration: leaveDates.length,
          holidayWarning: holidayWarning || undefined
        }
      });

    } catch (error: unknown) {
      console.error('Leave Controller Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return res.status(500).json({ 
        error: 'Failed to process leave application',
        details: errorMessage
      });
    }
  },

  async getLeaveStatus(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          error: 'Missing leave record ID'
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
        error: 'Leave record not found'
      });
      
    } catch (error: unknown) {
      console.error('Get Leave Status Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return res.status(500).json({ 
        error: 'Failed to retrieve leave status',
        details: errorMessage
      });
    }
  }
};