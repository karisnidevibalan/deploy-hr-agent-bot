# Manual Deployment Steps for Salesforce Home Page Integration

## 🎯 Simple Manual Steps (No Scripts Needed)

Since the deployment scripts are having issues, here's the manual approach:

---

## Step 1: Deploy Using VS Code (Easiest Method)

### Prerequisites:
1. Install VS Code if you don't have it
2. Install "Salesforce Extension Pack" from VS Code Extensions

### Deploy:
1. Open VS Code
2. Open folder: `c:\Users\karis\hr-agent-bot\deploy-hr-agent-bot\salesforce-lwc`
3. Press `Ctrl+Shift+P` to open command palette
4. Type: "SFDX: Authorize an Org"
5. Select "Production" or "Sandbox"
6. Log in via browser
7. After login, press `Ctrl+Shift+P` again
8. Type: "SFDX: Deploy Source to Org"
9. Select the `salesforce-lwc` folder
10. Wait for deployment to complete

---

## Step 2: Configure Remote Site Settings

**CRITICAL - Must do this!**

1. Log into Salesforce
2. Click Setup (gear icon)
3. In Quick Find box, type: **Remote Site Settings**
4. Click **New Remote Site**
5. Fill in:
   ```
   Remote Site Name: HR_Agent_Bot
   Remote Site URL: https://deploy-hr-agent-bot-1.onrender.com
   Description: HR Agent Bot API
   Active: ✓ (checked)
   ```
6. Click **Save**

---

## Step 3: Add to Home Page

### Method A: Via Lightning App Builder

1. From Salesforce Home page, click the **⚙️ gear icon** (top-right)
2. Select **Edit Page**
3. In the left sidebar, scroll down to **Custom Components**
4. Find **"HR Agent Bot"**
5. **Drag and drop** it onto your page (recommended: right sidebar or bottom)
6. Click **Save**
7. Click **Activate**
8. Choose activation option:
   - **Org Default** - Makes it default for everyone
   - **App Default** - Assign to specific apps
   - **App, Record Type, and Profile** - Assign to specific profiles
9. Click **Save**

### Method B: Via Setup

1. Go to **Setup**
2. Quick Find: **Lightning App Builder**
3. Find your Home page or click **New**
4. Follow steps 3-9 from Method A above

---

## Alternative: Add to Utility Bar (Always Visible)

This makes the bot accessible from ANY page via the bottom utility bar.

1. **Setup** → Quick Find: **App Manager**
2. Find your Lightning App (e.g., "Sales", "Service Console")
3. Click dropdown → **Edit**
4. Click **Utility Items** in left sidebar
5. Click **Add Utility Item**
6. Select **Custom Lightning Component**
7. Configure:
   ```
   Lightning Component: c:hrAgentBot
   Label: HR Assistant
   Icon Name: chat
   Panel Width: 420
   Panel Height: 650
   Start automatically: No
   ```
8. Click **Save**

Now users can click the utility bar at the bottom to access the bot from anywhere!

---

## ✅ Test Your Integration

1. Navigate to your Home page
2. Look for the **💬 icon** in the bottom-right corner
3. Click it to open the chat
4. Try these test commands:
   - "Show holiday list"
   - "I want to apply for leave"
   - "Show my requests"
   - "I need to work from home tomorrow"

---

## 🔧 Troubleshooting

### Bot icon not appearing?
- Clear browser cache (Ctrl+Shift+Delete)
- Refresh the page (Ctrl+F5)
- Check that component is on the page in Edit mode
- Verify your profile has access to the page

### Bot opens but shows errors?
- ✓ Check Remote Site Settings are configured correctly
- ✓ Verify URL is exact: `https://deploy-hr-agent-bot-1.onrender.com`
- ✓ Ensure "Active" is checked
- ✓ Test bot URL in browser to confirm it's running

### CORS errors in console?
- ✓ Remote Site Settings must be configured (Step 2)
- ✓ URL must match exactly (including https://)
- ✓ Wait a few minutes after adding Remote Site Settings

### Messages not sending?
- ✓ Open browser console (F12) and check for errors
- ✓ Verify bot server is running: https://deploy-hr-agent-bot-1.onrender.com
- ✓ Check Salesforce debug logs (Setup → Debug Logs)

---

## 📁 Component Files Location

All files are in: `c:\Users\karis\hr-agent-bot\deploy-hr-agent-bot\salesforce-lwc\`

```
salesforce-lwc/
├── hrAgentBot/
│   ├── hrAgentBot.js
│   ├── hrAgentBot.html
│   ├── hrAgentBot.css
│   └── hrAgentBot.js-meta.xml
└── hrEditForm/
    ├── hrEditForm.js
    ├── hrEditForm.html
    ├── hrEditForm.css
    └── hrEditForm.js-meta.xml
```

---

## 🌐 Bot Information

**Deployment URL:** https://deploy-hr-agent-bot-1.onrender.com

**API Endpoint:** POST /api/chat

**Features:**
- ✅ Leave management
- ✅ WFH requests
- ✅ Holiday calendar
- ✅ Request tracking
- ✅ Text-to-speech
- ✅ Mobile responsive

---

## 📞 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review `SALESFORCE_INTEGRATION.md` for detailed docs
3. Verify all steps were completed in order
4. Check that Salesforce CLI is installed: `sfdx --version`

---

**Last Updated:** January 30, 2026  
**Bot Version:** 1.0.0
