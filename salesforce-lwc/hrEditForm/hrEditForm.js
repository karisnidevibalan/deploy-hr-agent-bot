import { LightningElement, api, track } from 'lwc';

export default class HrEditForm extends LightningElement {
    @api isWfh = false;
    @api formData = {};

    @track leaveType = '';
    @track startDate = '';
    @track endDate = '';
    @track reason = '';

    connectedCallback() {
        // Initialize form with existing data
        this.leaveType = this.formData.leaveType || 'ANNUAL';
        this.startDate = this.formData.startDate || this.formData.date || '';
        this.endDate = this.formData.endDate || this.formData.startDate || this.formData.date || '';
        this.reason = this.formData.reason || '';
    }

    get leaveTypeOptions() {
        return [
            { label: 'Annual', value: 'ANNUAL' },
            { label: 'Sick', value: 'SICK' },
            { label: 'Casual', value: 'CASUAL' },
            { label: 'Maternity', value: 'MATERNITY' },
            { label: 'Paternity', value: 'PATERNITY' }
        ];
    }

    get formTitle() {
        return this.isWfh ? 'Update WFH Request' : 'Update Leave Request';
    }

    handleLeaveTypeChange(event) {
        this.leaveType = event.target.value;
    }

    handleStartDateChange(event) {
        this.startDate = event.target.value;
    }

    handleEndDateChange(event) {
        this.endDate = event.target.value;
    }

    handleReasonChange(event) {
        this.reason = event.target.value;
    }

    handleSave() {
        const details = {
            startDate: this.startDate,
            endDate: this.endDate,
            reason: this.reason
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
    }

    handleCancel() {
        this.dispatchEvent(new CustomEvent('cancel'));
    }
}
