
export interface SessionContext {
  sessionId: string;
  userEmail?: string;
  userName?: string;
  employeeId?: string;
  employeeName?: string;
  awaitingLeaveDetails?: {
    partialDate?: string;
    clarifiedDate?: string;
    hasConflict?: boolean;
    [key: string]: any;
  };
  awaitingWfhDetails?: {
    date?: string;
    reason?: string;
    step?: string;
    [key: string]: any;
  };
  awaitingRequestTypeClarification?: boolean;
  pendingConfirmation?: {
    type: 'leave' | 'wfh';
    details: any;
  };
  lastRequest?: {
    type: 'leave' | 'wfh';
    recordId?: string;
    leaveType?: string;
    startDate?: string;
    endDate?: string;
    date?: string;
    reason?: string;
  };
  leaveConflict?: {
    existingLeave: any;
    requestedLeave: any;
  };
  conversationHistory?: Array<{
    timestamp: Date;
    message: string;
    intent: string;
  }>;
}

class ContextManager {
  private contexts: Map<string, SessionContext> = new Map();
  private readonly MAX_HISTORY = 10;
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  getContext(sessionId: string): SessionContext {
    if (!this.contexts.has(sessionId)) {
      this.contexts.set(sessionId, {
        sessionId,
        conversationHistory: []
      });
    }
    return this.contexts.get(sessionId)!;
  }

  updateContext(sessionId: string, updates: Partial<SessionContext>): void {
    const context = this.getContext(sessionId);
    Object.assign(context, updates);
    this.contexts.set(sessionId, context);
  }

  setUserEmail(sessionId: string, email: string): void {
    const normalized = email.trim();
    this.updateContext(sessionId, { userEmail: normalized });
  }

  setEmployeeProfile(sessionId: string, profile: { id: string; name: string; email: string }): void {
    this.updateContext(sessionId, {
      userEmail: profile.email,
      userName: profile.name,
      employeeName: profile.name,
      employeeId: profile.id
    });
  }

  clearEmployeeProfile(sessionId: string): void {
    const context = this.getContext(sessionId);
    delete context.employeeId;
    delete context.employeeName;
    delete context.userName;
    delete context.userEmail;
    this.contexts.set(sessionId, context);
  }

  getEmployeeId(sessionId: string): string | undefined {
    const context = this.getContext(sessionId);
    return context.employeeId;
  }

  getEmployeeName(sessionId: string): string | undefined {
    const context = this.getContext(sessionId);
    return context.employeeName || context.userName;
  }

  saveLastRequest(sessionId: string, request: SessionContext['lastRequest']): void {
    this.updateContext(sessionId, { lastRequest: request });
  }

  getLastRequest(sessionId: string): SessionContext['lastRequest'] | undefined {
    const context = this.getContext(sessionId);
    return context.lastRequest;
  }

  clearLastRequest(sessionId: string): void {
    this.updateContext(sessionId, { lastRequest: undefined });
  }

  saveLeaveConflict(sessionId: string, conflict: SessionContext['leaveConflict']): void {
    this.updateContext(sessionId, { leaveConflict: conflict });
  }

  getLeaveConflict(sessionId: string): SessionContext['leaveConflict'] | undefined {
    const context = this.getContext(sessionId);
    return context.leaveConflict;
  }

  clearLeaveConflict(sessionId: string): void {
    this.updateContext(sessionId, { leaveConflict: undefined });
  }

  setAwaitingLeaveDetails(sessionId: string, details: SessionContext['awaitingLeaveDetails']): void {
    this.updateContext(sessionId, { awaitingLeaveDetails: details });
  }

  getAwaitingLeaveDetails(sessionId: string): SessionContext['awaitingLeaveDetails'] | undefined {
    const context = this.getContext(sessionId);
    return context.awaitingLeaveDetails;
  }

  clearAwaitingLeaveDetails(sessionId: string): void {
    this.updateContext(sessionId, { awaitingLeaveDetails: undefined });
  }

  setAwaitingWfhDetails(sessionId: string, details: SessionContext['awaitingWfhDetails']): void {
    this.updateContext(sessionId, { awaitingWfhDetails: details });
  }

  getAwaitingWfhDetails(sessionId: string): SessionContext['awaitingWfhDetails'] | undefined {
    const context = this.getContext(sessionId);
    return context.awaitingWfhDetails;
  }

  clearAwaitingWfhDetails(sessionId: string): void {
    this.updateContext(sessionId, { awaitingWfhDetails: undefined });
  }

  isInFollowUp(sessionId: string): boolean {
    const context = this.getContext(sessionId);
    return !!context.awaitingLeaveDetails || !!context.awaitingWfhDetails || !!context.leaveConflict;
  }

  getEmployeeEmail(sessionId: string): string | undefined {
    const context = this.getContext(sessionId);
    return context.userEmail;
  }

  clearContext(sessionId: string): void {
    this.contexts.delete(sessionId);
  }

  cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [sessionId, context] of this.contexts.entries()) {
      if (!context.conversationHistory || context.conversationHistory.length === 0) {
        continue;
      }
      const lastActivity = context.conversationHistory[context.conversationHistory.length - 1].timestamp;
      const timeSinceLastActivity = now - lastActivity.getTime();
      if (timeSinceLastActivity > this.SESSION_TIMEOUT) {
        this.contexts.delete(sessionId);
        console.log(`🧹 Cleaned up expired session: ${sessionId}`);
      }
    }
  }

  setPendingConfirmation(sessionId: string, type: 'leave' | 'wfh', details: any): void {
    const context = this.getContext(sessionId);
    context.pendingConfirmation = { type, details };
    this.contexts.set(sessionId, context);
  }

  getPendingConfirmation(sessionId: string): { type: 'leave' | 'wfh'; details: any } | undefined {
    const context = this.getContext(sessionId);
    return context.pendingConfirmation;
  }

  isAwaitingConfirmation(sessionId: string): boolean {
    const context = this.getContext(sessionId);
    return !!context.pendingConfirmation;
  }

  clearPendingConfirmation(sessionId: string): void {
    const context = this.getContext(sessionId);
    delete context.pendingConfirmation;
    this.contexts.set(sessionId, context);
  }

  getSessionStats(sessionId: string): any {
    const context = this.getContext(sessionId);
    return {
      sessionId,
      historyCount: context.conversationHistory?.length || 0,
      isInFollowUp: this.isInFollowUp(sessionId),
      hasLastRequest: !!context.lastRequest,
      hasConflict: !!context.leaveConflict,
      awaitingConfirmation: !!context.pendingConfirmation
    };
  }
}

export default new ContextManager();
