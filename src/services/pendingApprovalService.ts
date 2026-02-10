import crypto from 'crypto';

interface PendingRequest {
    id: string;
    employeeName: string;
    employeeEmail: string | null;
    employeeId: string | null;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
    durationDays: number;
    isException: boolean;
    timestamp: Date;
    expiresAt: Date;
}

class PendingApprovalService {
    private pending = new Map<string, PendingRequest>();
    private readonly EXPIRY_HOURS = 168; // 7 days

    /**
     * Store a pending approval request
     */
    store(data: Omit<PendingRequest, 'id' | 'timestamp' | 'expiresAt'>): string {
        const id = crypto.randomUUID();
        const timestamp = new Date();
        const expiresAt = new Date(timestamp.getTime() + this.EXPIRY_HOURS * 60 * 60 * 1000);

        this.pending.set(id, {
            ...data,
            id,
            timestamp,
            expiresAt
        });

        console.log(`✅ Stored pending approval: ${id}`);
        return id;
    }

    /**
     * Get a pending request by ID
     */
    get(id: string): PendingRequest | null {
        const request = this.pending.get(id);

        if (!request) {
            return null;
        }

        // Check if expired
        if (new Date() > request.expiresAt) {
            console.log(`⏰ Pending request ${id} has expired`);
            this.pending.delete(id);
            return null;
        }

        return request;
    }

    /**
     * Remove a pending request
     */
    remove(id: string): boolean {
        const existed = this.pending.has(id);
        this.pending.delete(id);

        if (existed) {
            console.log(`🗑️ Removed pending approval: ${id}`);
        }

        return existed;
    }

    /**
     * Get all pending requests (for debugging/admin)
     */
    getAll(): PendingRequest[] {
        return Array.from(this.pending.values());
    }

    /**
     * Clean up expired requests
     */
    cleanupExpired(): number {
        const now = new Date();
        let count = 0;

        for (const [id, request] of this.pending.entries()) {
            if (now > request.expiresAt) {
                this.pending.delete(id);
                count++;
            }
        }

        if (count > 0) {
            console.log(`🧹 Cleaned up ${count} expired pending requests`);
        }

        return count;
    }

    /**
     * Get count of pending requests
     */
    count(): number {
        return this.pending.size;
    }
}

// Singleton instance
export const pendingApprovalService = new PendingApprovalService();

// Auto-cleanup every hour
setInterval(() => {
    pendingApprovalService.cleanupExpired();
}, 60 * 60 * 1000);

export default pendingApprovalService;
