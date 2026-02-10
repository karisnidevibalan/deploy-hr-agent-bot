import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import NAME_FIELD from '@salesforce/schema/User.Name';
import EMAIL_FIELD from '@salesforce/schema/User.Email';

export default class HrAgentBot extends LightningElement {
    @api botUrl = 'https://deploy-hr-agent-bot-1.onrender.com';
    userData;
    error;

    @wire(getRecord, { recordId: USER_ID, fields: [NAME_FIELD, EMAIL_FIELD] })
    wiredUser({ error, data }) {
        if (data) {
            this.userData = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.userData = undefined;
        }
    }

    get iframeUrl() {
        if (!this.userData) return this.botUrl;

        const name = this.userData.fields.Name.value;
        const email = this.userData.fields.Email.value;

        // Use URL object for clean parameter appending
        try {
            const url = new URL(this.botUrl);
            url.searchParams.set('name', name);
            url.searchParams.set('email', email);
            return url.toString();
        } catch (e) {
            // Fallback if URL is invalid
            const separator = this.botUrl.includes('?') ? '&' : '?';
            return `${this.botUrl}${separator}name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`;
        }
    }

    get isLoaded() {
        return !!this.userData;
    }
}
