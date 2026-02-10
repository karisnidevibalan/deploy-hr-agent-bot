# Salesforce Setup Guide: Manager Approval Flow

This guide provides the exact steps to implement the manager approval notification flow for **Extra Leave** and **WFH** requests in Salesforce, ensuring they integrate correctly with your existing approval processes.

---

## Phase 1: Create Classic HTML Email Templates

1.  **Navigate to Templates**: Go to **Setup** → search for **Classic Email Templates**.
2.  **New Template**: Click **New Template**.
3.  **Choose Type**: Select **Custom (without using Classic Letterhead)** and click **Next**.
4.  **Template Details**:
    - **Email Template Name**: `Extra_Leave_Approval_Notification`
    - **Template Unique Name**: `Extra_Leave_Approval_Notification`
    - **Subject**: `Leave Request Pending Your Approval`
5.  **Paste HTML**:
    - In the **HTML Body** section, paste the code from [Leave_Approval_Notificationhtml.html](file:///c:/Users/karis/hr-agent-bot/deploy-hr-agent-bot/salesforce/Leave_Approval_Notificationhtml.html).
6.  **Save** and **Edit Text Version** (Copy from HTML) → **Save**.
7.  **Repeat for WFH**: Create a template named `WFH_Approval_Notification` using [WFH_Approval_Notificationhtml.html](file:///c:/Users/karis/hr-agent-bot/deploy-hr-agent-bot/salesforce/WFH_Approval_Notificationhtml.html).

---

## Phase 2: Create Email Alerts

1.  **Navigate to Email Alerts**: Go to **Setup** → search for **Email Alerts**.
2.  **New Email Alert (Leave)**:
    - **Description**: `Extra Leave Approval Alert`
    - **Object**: `Leave Request`
    - **Email Template**: Select the template from Phase 1.
    - **Recipient Type**: Select **Related User** → **Manager**.
3.  **New Email Alert (WFH)**: Repeat for the `WFH__c` object.

---

## Phase 3: Update Existing Leave Flow (leave_request_flow4)

Modify your existing flow to follow this logic:

1.  **Decision Node ("Check if Extra Leave")**:
    - **Path A: Is Extra Leave**:
        - Add **Email Alert** action (the new HTML template).
        -   **Add "Reset Flag" Step**:
        -   After the email action, click **(+)** and add an **Update Records** element.
        -   **Label**: `Reset Email Flag`
        -   **How to Find Records**: Select **Use the leave request record that triggered the flow**.
        -   **Set Field Values for the Leave Request Record**:
            -   **Field**: `Send_Email_Notification__c`
            -   **Value**: Select **$GlobalConstant.False** (or type `False`).
        -   **IMPORTANT**: Do NOT reset `Is_Exception__c`. If you reset that, you lose the record of it being an extra leave!
        -   Then link to the **Submit for Approval** node.
    - **Path B: Default Outcome (Normal)**:
        - Link directly to the **Submit for Approval** node.

2.  **Submit for Approval Node**:
    - Ensure this node is the final destination for **both** paths. It starts the formal Salesforce approval process.

---

## Phase 4: Create WFH Flow (WFH__c Object)

Follow the same logic for WFH:

1.  **New Record-Triggered Flow**: For the `WFH__c` object.
2.  **Logic**:
    - Is it an Exception?
    - YES: Email Alert (WFH) → Reset Flag → **Submit for Approval**.
    - NO: **Submit for Approval**.

---

## Phase 5: Preventing Duplicate Emails

To ensure the manager receives only the styled HTML email and not the default plain-text notification:

1.  Go to **Setup** → **Approval Processes**.
2.  Open your **Approval Process** (e.g., Leave Request Approval).
3.  Check **Initial Submission Actions**: **Delete** any "Email Alert" there (the Flow already sent the custom one).
4.  Check **Approval Assignment Email Template**: Set this to **blank** (if allowed) or to your new **HTML template**.

---

## Phase 6: Verification

1.  **Normal Leave**: Create a normal request. It should appear in "Approval History" with no extra email.
2.  **Extra Leave**: Create an extra request. Manager should get the **Styled HTML Email** and then see it in "Approval History".

---

## Phase 7: Troubleshooting (If the Flow doesn't trigger)

If the record is created but the email is not sent or the status doesn't change:

### 1. Check Flow Activation
Ensure your Flow is **Activated**. In the Flow Builder, look at the top right button. If it says **Activate**, the flow is currently off. Click it.

### 2. Field Level Security (CRITICAL)
If the record exists but the **Is Exception** checkbox is **unchecked** (even though the Reason starts with `[EXCEPTION]`):
1. Go to **Setup** → **Object Manager** → **Leave Request**.
2. Go to **Fields & Relationships** → Click on **Is Exception**.
3. Click the **Set Field-Level Security** button.
4. Ensure the Profile used by your Bot (usually "System Administrator" or a custom API profile) has **Visible** and **Edit** access checked.
5. **Repeat for `Send Email Notification`**.

### 3. Approval Process Activation
The "Submit for Approval" action in the Flow will **fail** if you do not have an **Active Approval Process** for that object.
1. Go to **Setup** → search for **Approval Processes**.
2. Select the `Leave Request` object.
3. Ensure there is a process with **Status = Active**.

### 4. Verify Start Conditions
Check the **Start** element of your Flow. If you have "Conditions: 2", click **Edit** and ensure they use **AND** logic:
- `Status` | Equals | `Pending`
- `Send_Email_Notification__c` | Equals | `True`
*(If you want to test, try removing the second condition temporarily to see if the flow triggers for every new record).*

### 5. Email Deliverability (Crucial)
1. Go to **Setup** → search for **Deliverability**.
2. Set **Access level** to **All email**.
3. If it is set to "No access" or "System email only", Salesforce will block your flow's emails.

### 6. Debug Mode vs. Real Run
In your debug log, it says: **"Because the flow ran in rollback mode, any changes... were rolled back."**
Salesforce often suppresses Email Alerts during Rollback Debugging. 
**To test for real**: 
1. **Activate** the flow.
2. Ask the bot to create a leave for real.
3. Check the **Email Logs** in Salesforce to see if the email left the system.
