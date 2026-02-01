# HR Agent Bot - Salesforce Lightning Web Component (LWC)

## Overview
This Lightning Web Component integrates the HR Agent Bot with Salesforce Winfomi, providing an AI-powered HR assistant directly within your Salesforce org.

**Deployment URL**: https://deploy-hr-agent-bot-1.onrender.com

## Components

### 1. hrAgentBot (Main Component)
The main chatbot interface component that handles:
- Chat messaging and conversation flow
- Integration with the deployed bot API
- User authentication via Salesforce context
- Quick actions for common HR tasks
- Text-to-speech functionality

### 2. hrEditForm (Child Component)
A form component for editing leave and WFH requests with:
- Dynamic form fields based on request type
- Date range selection
- Leave type selection
- Reason input

## Installation Steps

### Step 1: Deploy to Salesforce

1. **Using Salesforce CLI (Recommended)**
   ```bash
   # Navigate to the salesforce-lwc directory
   cd salesforce-lwc
   
   # Authenticate with your Salesforce org
   sfdx auth:web:login -a MyWinfomiOrg
   
   # Deploy the components
   sfdx force:source:deploy -p . -u MyWinfomiOrg
   ```

2. **Using VS Code with Salesforce Extensions**
   - Open VS Code
   - Install "Salesforce Extension Pack"
   - Right-click on the `salesforce-lwc` folder
   - Select "SFDX: Deploy Source to Org"

3. **Manual Deployment via Developer Console**
   - Copy each file content
   - In Salesforce, go to Developer Console
   - File > New > Lightning Component
   - Create each component manually

### Step 2: Add to Salesforce Page

1. **Navigate to App Builder**
   - Setup > User Interface > Lightning App Builder
   - Or edit any existing page

2. **Add the Component**
   - Click "Edit Page" on your desired page
   - Find "HR Agent Bot" in the custom components section
   - Drag it onto your page layout
   - Configure the Bot URL if needed (default: https://deploy-hr-agent-bot-1.onrender.com)

3. **Save and Activate**
   - Click "Save"
   - Click "Activate" and assign to desired profiles/apps

### Step 3: Configure Remote Site Settings

For the LWC to communicate with your deployed bot, add the URL to Remote Site Settings:

1. Go to **Setup > Security > Remote Site Settings**
2. Click **New Remote Site**
3. Fill in:
   - **Remote Site Name**: `HR_Agent_Bot`
   - **Remote Site URL**: `https://deploy-hr-agent-bot-1.onrender.com`
   - **Active**: Checked
4. Click **Save**

### Step 4: Configure CORS on Your Server

Ensure your deployed bot allows requests from Salesforce:

1. Update your server's CORS configuration to include:
   - `https://*.force.com`
   - `https://*.salesforce.com`
   - `https://*.visualforce.com`

2. This should already be configured in your `src/app.ts` file.

## Component Properties

### hrAgentBot
- **botUrl** (String): The URL of your deployed HR Agent Bot server
  - Default: `https://deploy-hr-agent-bot-1.onrender.com`
  - Configurable in App Builder

## Features

✅ **Floating Chat Widget** - Non-intrusive bot launcher button  
✅ **Real-time Chat** - Instant messaging with the AI assistant  
✅ **Quick Actions** - Pre-defined shortcuts for common tasks  
✅ **Leave Management** - Apply and manage leave requests  
✅ **WFH Requests** - Request work-from-home days  
✅ **Request Tracking** - View and edit pending requests  
✅ **Holiday Calendar** - Check company holidays  
✅ **Text-to-Speech** - Optional voice output for responses  
✅ **Responsive Design** - Works on desktop and mobile  
✅ **Salesforce Integration** - Automatic user context from Salesforce  

## Usage

### For End Users

1. **Open the Bot**
   - Click the 💬 icon in the bottom-right corner
   - The chat window will slide up

2. **Start Chatting**
   - Type your question or request
   - Use quick action buttons for common tasks
   - The bot will guide you through the process

3. **Common Commands**
   - "I want to apply for leave"
   - "Show my requests"
   - "What are the holidays this month?"
   - "I need to work from home tomorrow"

### For Administrators

1. **Monitor Usage**
   - Check bot API logs on Render dashboard
   - Review Salesforce debug logs for component errors

2. **Update Bot URL**
   - If you redeploy to a new URL, update the component property
   - Edit the page in App Builder
   - Update the "Bot Server URL" property

3. **Customize Appearance**
   - Modify `hrAgentBot.css` to match your branding
   - Update color variables in the `:host` section

## Troubleshooting

### Bot Not Loading
- Check Remote Site Settings are configured
- Verify the bot URL is accessible
- Check browser console for CORS errors

### Messages Not Sending
- Verify network connectivity
- Check Salesforce debug logs
- Ensure bot server is running (check Render dashboard)

### User Context Not Working
- Verify Salesforce user has proper permissions
- Check that user email is populated in Salesforce

### Styling Issues
- Clear browser cache
- Check for CSS conflicts with other components
- Verify Lightning Design System compatibility

## File Structure

```
salesforce-lwc/
├── hrAgentBot/
│   ├── hrAgentBot.js           # Main component controller
│   ├── hrAgentBot.html         # Component template
│   ├── hrAgentBot.css          # Component styles
│   └── hrAgentBot.js-meta.xml  # Component metadata
├── hrEditForm/
│   ├── hrEditForm.js           # Edit form controller
│   ├── hrEditForm.html         # Edit form template
│   ├── hrEditForm.css          # Edit form styles
│   └── hrEditForm.js-meta.xml  # Edit form metadata
└── README.md                   # This file
```

## API Integration

The component communicates with your bot server via REST API:

**Endpoint**: `POST {botUrl}/api/chat`

**Headers**:
- `Content-Type: application/json`
- `X-Session-Id`: Unique session identifier
- `x-user-name`: Salesforce user name
- `x-user-email`: Salesforce user email

**Request Body**:
```json
{
  "message": "User message text",
  "editDetails": {} // Optional, for edit operations
}
```

## Security Considerations

1. **Data Privacy**: All conversations are session-based
2. **Authentication**: User context from Salesforce SSO
3. **HTTPS Only**: All API calls use secure HTTPS
4. **CORS Protection**: Server validates request origins
5. **Session Management**: Unique session IDs per user

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review server logs on Render
3. Check Salesforce debug logs
4. Contact your Salesforce administrator

## Version History

- **v1.0.0** (2026-01-30): Initial release
  - Basic chat functionality
  - Leave and WFH request management
  - Quick actions
  - Edit form support
  - TTS functionality

## License

Copyright © 2026 Winfomi. All rights reserved.
