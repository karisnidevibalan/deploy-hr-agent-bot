import { LightningElement, api, track } from 'lwc';

export default class HrEditForm extends LightningElement {
    @api isWfh = false;
    @api isEdit = false;
    @api formData = {};

    @track leaveType = '';
    @track startDate = '';
    @track endDate = '';
    @track reason = '';
    @track manualDuration = null;
    @track showConfirmation = false;

    connectedCallback() {
        // Initialize form with existing data
        this.leaveType = this.formData.leaveType || 'ANNUAL';
        this.startDate = this.formData.startDate || this.formData.date || '';
        this.endDate = this.formData.endDate || this.formData.startDate || this.formData.date || '';
        this.reason = this.formData.reason || '';
        this.manualDuration = this.formData.durationDays || null;
        this.showConfirmation = false;
    }

    get duration() {
        if (!this.startDate) return this.manualDuration || 0;
        const start = new Date(this.startDate);
        const end = new Date(this.endDate || this.startDate);
        if (end < start) return 0;

        // If user has manually set duration, use that
        if (this.manualDuration !== null) {
            return this.manualDuration;
        }

        // Otherwise auto-calculate
        let count = 0;
        let cur = new Date(start);
        while (cur <= end) {
            let day = cur.getDay();
            if (day !== 0 && day !== 6) count++;
            cur.setDate(cur.getDate() + 1);
        }
        return count;
    }

    handleDurationChange(event) {
        this.manualDuration = parseFloat(event.target.value);
    }

    get requestTypeLabel() {
        return this.isWfh ? 'WFH' : this.leaveType;
    }

    get leaveTypeOptions() {
        // ...
        return [
            { label: 'Annual', value: 'ANNUAL' },
            { label: 'Sick', value: 'SICK' },
            { label: 'Casual', value: 'CASUAL' },
            { label: 'Maternity', value: 'MATERNITY' },
            { label: 'Paternity', value: 'PATERNITY' }
        ];
    }

    get formTitle() {
        const prefix = this.isEdit ? 'Update' : 'Apply';
        return `${prefix} ${this.isWfh ? 'WFH' : 'Leave'} Request`;
    }

    handleLeaveTypeChange(event) {
        this.leaveType = event.target.value;
    }

    handleStartDateChange(event) {
        this.startDate = event.target.value;
        this.manualDuration = null; // Reset manual override when dates change
    }

    handleEndDateChange(event) {
        this.endDate = event.target.value;
        this.manualDuration = null; // Reset manual override when dates change
    }

    handleReasonChange(event) {
        this.reason = event.target.value;
    }

    handleSave() {
        if (!this.startDate) return;

        // Validate dates
        const start = new Date(this.startDate);
        const end = new Date(this.endDate || this.startDate);
        if (end < start) {
            // Show error
            return;
        }

        this.showConfirmation = true;
    }

    handleBackToEdit() {
        this.showConfirmation = false;
    }

    handleConfirm() {
        const details = {
            startDate: this.startDate,
            endDate: this.endDate,
            reason: this.reason,
            durationDays: parseFloat(this.duration)
        };

        if (!this.isWfh) {
            details.leaveType = this.leaveType;
        } else {
            details.date = this.startDate; // For backward compatibility
        }

        // Dispatch custom event with form data
        this.dispatchEvent(new CustomEvent('save', {
            detail: details
        }));
        this.showConfirmation = false;
    }

    handleCancel() {
        this.dispatchEvent(new CustomEvent('cancel'));
    }
}
