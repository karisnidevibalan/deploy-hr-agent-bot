// src/utils/intentDetector.ts

export interface IntentResult {
  intent: string;
  confidence: number;
  entities: {
    dates?: string[];
    leaveType?: string;
    reason?: string;
    dateRange?: { start: string; end: string };
  };
}

export class IntentDetector {
  private leaveTypes = ['annual', 'sick', 'casual', 'maternity', 'paternity'];

  detectIntent(message: string): IntentResult {
    const lowerMessage = message.toLowerCase();

    // Check for holiday list requests
    if (this.isHolidayListRequest(lowerMessage)) {
      return {
        intent: 'holiday_list',
        confidence: 0.95,
        entities: {}
      };
    }

    // Check for WFH requests
    if (this.isWfhRequest(lowerMessage)) {
      return {
        intent: 'apply_wfh',
        confidence: 0.9,
        entities: this.extractWfhEntities(message)
      };
    }

    // Check for leave requests
    if (this.isLeaveRequest(lowerMessage)) {
      return {
        intent: 'apply_leave',
        confidence: 0.9,
        entities: this.extractLeaveEntities(message)
      };
    }

    // Default to general query
    return {
      intent: 'general_query',
      confidence: 0.5,
      entities: {}
    };
  }

  private isHolidayListRequest(message: string): boolean {
    const holidayKeywords = ['holiday', 'holidays', 'holiday list', 'holidays list', 'holiday calendar', 'holidays calendar'];
    return holidayKeywords.some(keyword => message.includes(keyword));
  }

  private isWfhRequest(message: string): boolean {
    const wfhKeywords = ['wfh', 'work from home', 'working from home'];
    return wfhKeywords.some(keyword => message.includes(keyword));
  }

  private isLeaveRequest(message: string): boolean {
    const leaveKeywords = ['leave', 'day off', 'time off', 'vacation'];
    return leaveKeywords.some(keyword => message.includes(keyword));
  }

  private extractWfhEntities(message: string): any {
    // Extract month/year/week from message
    const entities: any = {
      dates: [new Date().toISOString().split('T')[0]],
      reason: 'Working from home'
    };
    const lower = message.toLowerCase();
    const monthMatch = lower.match(/(january|february|march|april|may|june|july|august|september|october|november|december)/);
    if (monthMatch) entities.month = monthMatch[1];
    const yearMatch = lower.match(/(20\d{2})/);
    if (yearMatch) entities.year = yearMatch[1];
    const weekMatch = lower.match(/week\s*(\d{1,2})/);
    if (weekMatch) entities.week = weekMatch[1];
    if (lower.includes('this month')) entities.month = new Date().toLocaleString('default', { month: 'long' });
    if (lower.includes('last month')) {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      entities.month = d.toLocaleString('default', { month: 'long' });
      entities.year = d.getFullYear().toString();
    }
    return entities;
  }

  private extractLeaveEntities(message: string): any {
    // Extract month/year/week from message
    const entities: any = {
      leaveType: this.leaveTypes.find(type => message.includes(type)) || 'annual',
      dates: [new Date().toISOString().split('T')[0]],
      reason: 'Personal'
    };
    const lower = message.toLowerCase();
    const monthMatch = lower.match(/(january|february|march|april|may|june|july|august|september|october|november|december)/);
    if (monthMatch) entities.month = monthMatch[1];
    const yearMatch = lower.match(/(20\d{2})/);
    if (yearMatch) entities.year = yearMatch[1];
    const weekMatch = lower.match(/week\s*(\d{1,2})/);
    if (weekMatch) entities.week = weekMatch[1];
    if (lower.includes('this month')) entities.month = new Date().toLocaleString('default', { month: 'long' });
    if (lower.includes('last month')) {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      entities.month = d.toLocaleString('default', { month: 'long' });
      entities.year = d.getFullYear().toString();
    }
    return entities;
  }
}

// Export a singleton instance
export default new IntentDetector();