# HR Agent Bot - Salesforce Home Page Integration Guide

## Overview
This guide shows you how to integrate the HR Agent Bot into your Salesforce Home page so it's available to all users immediately when they log in.

**Deployment URL**: https://deploy-hr-agent-bot-1.onrender.com

---

## 🏠 Integration Methods

### Method 1: Add to Home Page (Recommended)

This makes the bot available on the Salesforce Home page for all users.

#### Step 1: Deploy the LWC Components

First, ensure the components are deployed to Salesforce:

```bash
cd c:\Users\karis\hr-agent-bot\deploy-hr-agent-bot\salesforce-lwc
sfdx auth:web:login -a WinfomiOrg
sfdx force:source:deploy -p . -u WinfomiOrg
```

Or use VS Code with Salesforce Extension Pack:
1. Right-click `salesforce-lwc` folder
2. Select "SFDX: Deploy Source to Org"

#### Step 2: Configure Remote Site Settings

**Important**: This must be done before the component will work!

1. In Salesforce, go to **Setup**
2. In Quick Find, search for **Remote Site Settings**
3. Click **New Remote Site**
4. Fill in:
   - **Remote Site Name**: `HR_Agent_Bot`
   - **Remote Site URL**: `https://deploy-hr-agent-bot-1.onrender.com`
   - **Disable Protocol Security**: Unchecked
   - **Active**: ✅ Checked
5. Click **Save**

#### Step 3: Add to Home Page

1. **Navigate to Lightning App Builder**
   - Setup → Quick Find → "Lightning App Builder"
   - Or from any Home page, click the gear icon ⚙️ → Edit Page

2. **Edit the Home Page**
   - If creating new: Click "New" → Select "Home Page" → Choose template
   - If editing existing: Find your Home page and click "Edit"

3. **Add the HR Agent Bot Component**
   - In the left sidebar, scroll to **Custom Components**
   - Find **"HR Agent Bot"**
   - Drag it to your desired location on the page
   - Recommended: Place in the right sidebar or bottom of the page

4. **Configure Component Properties** (Optional)
   - Click on the component
   - In the right panel, you can configure:
     - **Bot Server URL**: Default is `https://deploy-hr-agent-bot-1.onrender.com`
     - Leave as default unless you've deployed to a different URL

5. **Save and Activate**
   - Click **Save**
   - Click **Activate**
   - Choose activation options:
     - **App Default**: Make it default for specific apps
     - **App, Record Type, and Profile**: Assign to specific profiles
     - **Org Default**: Make it the default home page for everyone
   - Click **Save** again

6. **Assign to Profiles/Apps**
   - Select which Lightning apps should use this page
   - Select which user profiles should see it
   - Click **Save**

---

### Method 2: Add to Utility Bar (Always Visible)

Make the bot accessible from anywhere in Salesforce via the utility bar.

#### Steps:

1. **Setup → App Manager**
2. Find your Lightning App (e.g., "Sales", "Service")
3. Click the dropdown → **Edit**
4. Click **Utility Items** (left sidebar)
5. Click **Add Utility Item**
6. Select **Custom Lightning Component**
7. Configure:
   - **Lightning Component**: Select `c:hrAgentBot`
   - **Label**: "HR Assistant"
   - **Icon**: `chat` or `question`
   - **Panel Width**: 420
   - **Panel Height**: 650
8. Click **Save**

Now users can access the bot from the utility bar at the bottom of any page!

---

### Method 3: Add to Record Pages

Add the bot to specific record pages (e.g., Contact, Account, Case).

#### Steps:

1. Navigate to any record page
2. Click the gear icon ⚙️ → **Edit Page**
3. In the left sidebar, find **HR Agent Bot** under Custom Components
4. Drag it to your desired location
5. **Save** and **Activate**
6. Choose which record types and profiles should see it
7. Click **Save**

---

## 🎨 Customization Options

### Change Bot Position

The bot appears as a floating widget in the bottom-right corner by default. This is controlled by CSS and works well on any page.

### Update Bot URL

If you redeploy to a new URL:

1. Edit the page in Lightning App Builder
2. Click on the HR Agent Bot component
3. Update the "Bot Server URL" property
4. Save and activate

### Customize Colors

Edit `salesforce-lwc/hrAgentBot/hrAgentBot.css`:

```css
:host {
    --accent: #0066cc;        /* Primary color - Winfomi blue */
    --accent-light: #cfe2ff;  /* Light accent */
    --accent-700: #0052a3;    /* Dark accent */
    --brand: #1e293b;         /* Text color */
}
```

After editing, redeploy the component.

---

## 🧪 Testing

After integration, test the bot:

1. Navigate to your Home page
2. Look for the 💬 icon in the bottom-right corner
3. Click to open the chat
4. Try these commands:
   - "Show holiday list"
   - "I want to apply for leave"
   - "Show my requests"
   - "I need to work from home tomorrow"

---

## 📱 Mobile Experience

The bot is fully responsive and works on:
- Salesforce Mobile App
- Mobile browsers
- Tablets
- Desktop

The floating widget automatically adjusts for smaller screens.

---

## 🔧 Troubleshooting

### Bot Not Appearing
- ✓ Verify component is deployed successfully
- ✓ Check that you're on the correct page/app
- ✓ Verify your profile has access to the page
- ✓ Clear browser cache and refresh

### Bot Not Loading
- ✓ Check Remote Site Settings are configured
- ✓ Verify bot URL: https://deploy-hr-agent-bot-1.onrender.com
- ✓ Check browser console for errors (F12)
- ✓ Ensure bot server is running (visit URL in browser)

### CORS Errors
- ✓ Verify Remote Site Settings include the exact URL
- ✓ Check that URL is HTTPS (not HTTP)
- ✓ Ensure "Active" is checked in Remote Site Settings

### Messages Not Sending
- ✓ Check network tab in browser dev tools
- ✓ Verify Salesforce user has email populated
- ✓ Check Salesforce debug logs
- ✓ Test bot URL directly: https://deploy-hr-agent-bot-1.onrender.com

---

## 🔐 Security & Permissions

### Required Permissions
Users need:
- Access to the Lightning page where the component is placed
- Read access to their Contact record (for user info)
- Standard Salesforce user permissions

### Data Privacy
- All conversations are session-based (not stored)
- User context from Salesforce SSO
- HTTPS encryption for all API calls
- No data stored on client side

---

## 📊 Monitoring Usage

### Check Bot Activity
1. Monitor server logs on Render dashboard
2. Check Salesforce debug logs for API calls
3. Review user feedback

### Analytics
Consider adding:
- Custom events for tracking usage
- Salesforce reports on leave/WFH requests
- User satisfaction surveys

---

## ✅ Recommended Setup

For best user experience:

1. **Home Page**: Add to default home page for all users
2. **Utility Bar**: Add to main Lightning apps (Sales, Service)
3. **Record Pages**: Add to Employee/Contact record pages

This gives users multiple ways to access the bot!

---

## 🎯 Quick Start Checklist

- [ ] Deploy LWC components to Salesforce
- [ ] Configure Remote Site Settings
- [ ] Add bot to Home page via Lightning App Builder
- [ ] Activate and assign to profiles
- [ ] Test with sample queries
- [ ] (Optional) Add to Utility Bar
- [ ] (Optional) Add to Record Pages
- [ ] Train users on bot features

---

## 📞 Support

**Documentation:**
- Full integration guide: `SALESFORCE_INTEGRATION.md`
- Component details: `salesforce-lwc/README.md`

**Bot Server:** https://deploy-hr-agent-bot-1.onrender.com

**Common Issues:**
- Remote Site Settings not configured → See Step 2 above
- Component not visible → Check page activation and profile assignment
- CORS errors → Verify Remote Site Settings URL matches exactly

---

**Created:** January 30, 2026  
**Version:** 1.0.0  
**Deployment:** https://deploy-hr-agent-bot-1.onrender.com
