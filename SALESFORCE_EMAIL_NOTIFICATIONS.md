# Salesforce Email Notifications for Extra Leaves and WFH

## Current Behavior

Currently, email notifications are triggered only when a **new Leave/WFH record is created** in Salesforce. This means:
- ✅ Normal leave requests → Email sent
- ❌ Extra leave requests (exceptions) → No email
- ❌ WFH requests → No email (if using separate object)

## Solution: Add Custom Field to Trigger Emails

### Option 1: Use a Custom Checkbox Field (Recommended)

Add a custom field to your Leave/WFH object that indicates when an email should be sent.

#### Step 1: Create Custom Field in Salesforce

1. Go to **Setup** → **Object Manager** → **Leave Request** (or your custom object)
2. Click **Fields & Relationships** → **New**
3. Create a checkbox field:
   - **Field Label**: `Send Email Notification`
   - **Field Name**: `Send_Email_Notification__c`
   - **Default Value**: Checked
4. Save and add to page layouts

#### Step 2: Update Your Code to Set This Field

Update `salesforceService.ts` to set this field for extra leaves and WFH:

```typescript
async createLeaveRecord(leaveRequest: any): Promise<any> {
  const payload = {
    Employee_Name__c: leaveRequest.employeeName,
    Leave_Type__c: leaveRequest.leaveType,
    Start_Date__c: leaveRequest.startDate,
    End_Date__c: leaveRequest.endDate,
    Reason__c: leaveRequest.reason,
    Duration_Days__c: leaveRequest.durationDays,
    Status__c: 'Pending',
    Send_Email_Notification__c: true, // Always trigger email
    Is_Exception__c: leaveRequest.isException || false // Mark if it's an extra leave
  };

  const result = await this.conn.sobject('Leave_Request__c').create(payload);
  return result;
}
```

#### Step 3: Create Salesforce Process Builder or Flow

1. Go to **Setup** → **Process Builder** → **New Process**
2. Configure:
   - **Object**: Leave Request
   - **Start the process**: When a record is created or edited
3. Add Criteria:
   - **Criteria Name**: Send Email Notification
   - **Criteria**: `[Leave_Request__c].Send_Email_Notification__c` equals `True`
4. Add Action:
   - **Action Type**: Email Alerts
   - **Email Alert**: Create new email alert (see below)
5. After sending email, add another action to uncheck the field:
   - **Action Type**: Update Records
   - **Field**: `Send_Email_Notification__c`
   - **Value**: `False`

### Option 2: Use Record Type to Differentiate

Create different record types for Normal Leave, Extra Leave, and WFH:

1. **Setup** → **Object Manager** → **Leave Request** → **Record Types**
2. Create record types:
   - Normal Leave
   - Extra Leave (Exception)
   - WFH Request
3. In Process Builder, create different email alerts for each record type

### Option 3: Use a Custom Field to Track Request Type

Add a picklist field `Request_Type__c` with values:
- Normal Leave
- Extra Leave
- WFH

Then create separate email alerts for each type in Process Builder.

## Creating Email Alerts in Salesforce

### Step 1: Create Email Template

1. **Setup** → **Email Templates** → **New Template**
2. Choose **Text** or **HTML with Letterhead**
3. Create templates for:
   - Normal Leave Request
   - Extra Leave Request
   - WFH Request

**Example Template for Extra Leave:**
```
Subject: Extra Leave Request - {!Leave_Request__c.Employee_Name__c}

Dear Manager,

An extra leave request has been submitted:

Employee: {!Leave_Request__c.Employee_Name__c}
Leave Type: {!Leave_Request__c.Leave_Type__c}
Start Date: {!Leave_Request__c.Start_Date__c}
End Date: {!Leave_Request__c.End_Date__c}
Duration: {!Leave_Request__c.Duration_Days__c} days
Reason: {!Leave_Request__c.Reason__c}

Please review and approve.

Thanks,
HR System
```

### Step 2: Create Email Alert

1. **Setup** → **Email Alerts** → **New Email Alert**
2. Configure:
   - **Description**: Extra Leave Notification
   - **Unique Name**: Extra_Leave_Notification
   - **Object**: Leave Request
   - **Email Template**: Select your template
   - **Recipient Type**: 
     - User (select manager)
     - Or create a field for manager email
3. Save

### Step 3: Add to Process Builder

In your Process Builder:
1. Add criteria for extra leaves: `[Leave_Request__c].Is_Exception__c` equals `True`
2. Add action: Email Alert → Select "Extra Leave Notification"

## Recommended Implementation

**Update `chatController.ts`** to mark extra leaves:

```typescript
async function processLeaveRequest(sessionId: string, details: any, ssoContext?: any): Promise<any> {
  // ... existing code ...
  
  const payload = {
    employeeName: details.employeeName,
    leaveType: details.leaveType,
    startDate: details.startDate,
    endDate: details.endDate,
    reason: details.reason,
    durationDays: details.durationDays,
    isException: details.isException || false, // Mark if it's an exception
    requestType: details.isException ? 'Extra Leave' : 'Normal Leave' // For email routing
  };
  
  return await salesforceService.createLeaveRecord(payload);
}
```

## Summary

To trigger emails for extra leaves and WFH:

1. ✅ Add custom field `Send_Email_Notification__c` or `Request_Type__c`
2. ✅ Update your code to set this field appropriately
3. ✅ Create email templates for each request type
4. ✅ Create email alerts in Salesforce
5. ✅ Set up Process Builder or Flow to send emails based on field values

This approach ensures emails are sent for all types of requests, not just on initial record creation.
