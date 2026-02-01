# Salesforce Integration Guide for HR Agent Bot

## Quick Start

Your HR Agent Bot is now ready to integrate with Salesforce Winfomi!

**Deployment URL**: https://deploy-hr-agent-bot-1.onrender.com

## What's Been Created

I've created a complete Lightning Web Component (LWC) package for Salesforce integration:

### 📦 Components Created

1. **hrAgentBot** - Main chatbot component
   - `hrAgentBot.js` - Controller with chat logic
   - `hrAgentBot.html` - UI template
   - `hrAgentBot.css` - Styling (Winfomi branded)
   - `hrAgentBot.js-meta.xml` - Salesforce metadata

2. **hrEditForm** - Edit form for requests
   - `hrEditForm.js` - Form controller
   - `hrEditForm.html` - Form template
   - `hrEditForm.css` - Form styling
   - `hrEditForm.js-meta.xml` - Salesforce metadata

3. **README.md** - Complete deployment documentation

## 🚀 Deployment Steps

### Step 1: Deploy to Salesforce

**Option A: Using Salesforce CLI (Recommended)**

```bash
# 1. Navigate to the LWC directory
cd c:\Users\karis\hr-agent-bot\deploy-hr-agent-bot\salesforce-lwc

# 2. Authenticate with Salesforce
sfdx auth:web:login -a WinfomiOrg

# 3. Deploy the components
sfdx force:source:deploy -p . -u WinfomiOrg
```

**Option B: Using VS Code**

1. Install "Salesforce Extension Pack" in VS Code
2. Open the `salesforce-lwc` folder
3. Right-click and select "SFDX: Deploy Source to Org"

**Option C: Manual Deployment**

1. Copy each file's content
2. In Salesforce Developer Console: File > New > Lightning Component
3. Create each component manually

### Step 2: Configure Remote Site Settings

To allow Salesforce to communicate with your bot:

1. Go to **Setup > Security > Remote Site Settings**
2. Click **New Remote Site**
3. Configure:
   - **Name**: `HR_Agent_Bot`
   - **URL**: `https://deploy-hr-agent-bot-1.onrender.com`
   - **Active**: ✅ Checked
4. Click **Save**

### Step 3: Add to Salesforce Page

1. **Open Lightning App Builder**
   - Setup > User Interface > Lightning App Builder
   - Or click "Edit Page" on any existing page

2. **Add the Component**
   - Find "HR Agent Bot" in custom components
   - Drag it to your page layout
   - The bot URL is pre-configured to: `https://deploy-hr-agent-bot-1.onrender.com`

3. **Save and Activate**
   - Click "Save"
   - Click "Activate"
   - Assign to desired apps/profiles

### Step 4: Test the Integration

1. Navigate to the page where you added the component
2. Click the 💬 icon in the bottom-right corner
3. Try these test commands:
   - "Show holiday list"
   - "I want to apply for leave"
   - "Show my requests"

## ✨ Features

- ✅ **Floating Chat Widget** - Non-intrusive launcher button
- ✅ **Real-time AI Chat** - Powered by your deployed bot
- ✅ **Leave Management** - Apply and track leave requests
- ✅ **WFH Requests** - Request work-from-home days
- ✅ **Holiday Calendar** - View company holidays
- ✅ **Quick Actions** - Shortcuts for common tasks
- ✅ **Edit Requests** - Modify pending requests
- ✅ **Text-to-Speech** - Optional voice responses
- ✅ **Mobile Responsive** - Works on all devices
- ✅ **Salesforce SSO** - Automatic user authentication

## 🎨 Customization

### Update Bot URL

If you redeploy to a different URL:

1. Edit the page in Lightning App Builder
2. Select the HR Agent Bot component
3. Update the "Bot Server URL" property

### Customize Branding

Edit `hrAgentBot.css` to match your brand:

```css
:host {
    --accent: #0066cc;        /* Primary color */
    --accent-light: #cfe2ff;  /* Light accent */
    --accent-700: #0052a3;    /* Dark accent */
    --brand: #1e293b;         /* Text color */
}
```

## 📁 File Structure

```
salesforce-lwc/
├── hrAgentBot/
│   ├── hrAgentBot.js           # Main controller
│   ├── hrAgentBot.html         # UI template
│   ├── hrAgentBot.css          # Styles
│   └── hrAgentBot.js-meta.xml  # Metadata
├── hrEditForm/
│   ├── hrEditForm.js           # Form controller
│   ├── hrEditForm.html         # Form template
│   ├── hrEditForm.css          # Form styles
│   └── hrEditForm.js-meta.xml  # Metadata
└── README.md                   # Documentation
```

## 🔧 Troubleshooting

### Bot Not Loading
- ✓ Check Remote Site Settings are configured
- ✓ Verify bot URL is accessible
- ✓ Check browser console for errors

### CORS Errors
- ✓ Ensure Remote Site Settings include your bot URL
- ✓ Verify server CORS allows Salesforce domains
- ✓ Check network tab in browser dev tools

### Messages Not Sending
- ✓ Verify bot server is running (check Render dashboard)
- ✓ Check Salesforce debug logs
- ✓ Test bot URL directly in browser

## 🔐 Security

- **HTTPS Only**: All communication is encrypted
- **CORS Protection**: Server validates origins
- **Session Management**: Unique session per user
- **Salesforce SSO**: User context from Salesforce
- **Data Privacy**: No data stored on client

## 📞 Support

For issues:
1. Check the troubleshooting section
2. Review Render logs for your bot
3. Check Salesforce debug logs
4. Verify Remote Site Settings

## 🎉 Next Steps

1. ✅ Deploy the LWC to Salesforce
2. ✅ Configure Remote Site Settings
3. ✅ Add to your desired pages
4. ✅ Test with real users
5. ✅ Monitor usage and feedback
6. ✅ Customize branding as needed

---

**Deployment URL**: https://deploy-hr-agent-bot-1.onrender.com

**Created**: January 30, 2026  
**Version**: 1.0.0
