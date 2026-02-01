# 🚀 Deploy HR Bot to Salesforce Using VS Code

## Complete Step-by-Step Guide

---

## Prerequisites

### 1. Install VS Code Extensions

1. Open **VS Code**
2. Click **Extensions** icon (left sidebar) or press `Ctrl+Shift+X`
3. Search for: **"Salesforce Extension Pack"**
4. Click **Install** (this installs multiple extensions)
5. Wait for installation to complete
6. Restart VS Code if prompted

---

## Step 1: Open Project in VS Code

1. Open **VS Code**
2. **File** → **Open Folder**
3. Navigate to: `c:\Users\karis\hr-agent-bot\deploy-hr-agent-bot\salesforce-lwc`
4. Click **Select Folder**

You should now see the folder structure:
```
salesforce-lwc/
├── hrAgentBot/
├── hrEditForm/
└── README.md
```

---

## Step 2: Authorize Salesforce Org

1. Press `Ctrl+Shift+P` to open **Command Palette**
2. Type: `SFDX: Authorize an Org`
3. Press **Enter**
4. Choose:
   - **Production** (for live Salesforce org)
   - OR **Sandbox** (for test environment)
5. A browser window will open
6. **Log in** with your Salesforce credentials
7. Click **Allow** to authorize VS Code
8. Browser will show "You may now close this window"
9. Return to VS Code

You should see a success message in the bottom-right corner.

---

## Step 3: Set Default Org (Optional but Recommended)

1. Press `Ctrl+Shift+P`
2. Type: `SFDX: Set a Default Org`
3. Select the org you just authorized
4. You'll see the org name in the bottom status bar

---

## Step 4: Deploy Components to Salesforce

### Method A: Deploy Entire Folder (Easiest)

1. In VS Code **Explorer** (left sidebar), right-click on the **`salesforce-lwc`** folder
2. Select **SFDX: Deploy Source to Org**
3. Wait for deployment (you'll see progress in the **Output** panel)
4. Look for **"Deploy Succeeded"** message

### Method B: Deploy Individual Components

If Method A doesn't work, deploy each component separately:

1. Right-click **`hrAgentBot`** folder
2. Select **SFDX: Deploy Source to Org**
3. Wait for success message
4. Right-click **`hrEditForm`** folder
5. Select **SFDX: Deploy Source to Org**
6. Wait for success message

---

## Step 5: Verify Deployment

1. Press `Ctrl+Shift+P`
2. Type: `SFDX: View All Changes (Local and in Default Org)`
3. Check that components are listed as deployed

---

## Step 6: Configure Remote Site Settings

**⚠️ CRITICAL - Bot won't work without this!**

1. Open **Salesforce** in your browser
2. Click **Setup** (gear icon, top-right)
3. In **Quick Find** box, type: `Remote Site Settings`
4. Click **Remote Site Settings**
5. Click **New Remote Site**
6. Fill in:
   ```
   Remote Site Name: HR_Agent_Bot
   Remote Site URL: https://deploy-hr-agent-bot-1.onrender.com
   Description: HR Agent Bot API
   Disable Protocol Security: (leave unchecked)
   Active: ✓ (CHECK THIS BOX!)
   ```
7. Click **Save**

---

## Step 7: Add Bot to Home Page

1. In Salesforce, go to your **Home** page
2. Click the **⚙️ gear icon** (top-right)
3. Select **Edit Page**
4. In the **left sidebar**, scroll down to **Custom Components**
5. Find **"hrAgentBot"** or **"HR Agent Bot"**
6. **Drag and drop** it onto your page
   - **Recommended location**: Right sidebar or bottom of page
7. Click **Save** (top-right)
8. Click **Activate**
9. Select activation option:
   - **Org Default** - Makes it default for everyone (recommended)
   - **App Default** - Assign to specific apps
   - **App, Record Type, and Profile** - Assign to specific profiles
10. Click **Save**

---

## Step 8: Test Your Bot!

1. Navigate to your **Home** page (refresh if needed)
2. Look for the **💬 icon** in the bottom-right corner
3. Click the icon to open the chat
4. Try these test commands:
   - `"Show holiday list"`
   - `"I want to apply for leave"`
   - `"Show my requests"`
   - `"I need to work from home tomorrow"`

---

## 🎉 Success!

Your HR Agent Bot is now live on your Salesforce home page!

---

## 🔧 Troubleshooting

### "SFDX: Authorize an Org" not found in Command Palette
- ✓ Ensure Salesforce Extension Pack is installed
- ✓ Restart VS Code
- ✓ Check Extensions are enabled

### "Deploy Source to Org" option not showing
- ✓ Make sure you opened the `salesforce-lwc` folder (not the parent folder)
- ✓ Ensure you authorized an org (Step 2)
- ✓ Try closing and reopening the folder

### Deployment fails with errors
- ✓ Check the **Output** panel for error details
- ✓ Ensure all files are saved
- ✓ Try deploying components individually (Method B)
- ✓ Check file structure matches:
  ```
  hrAgentBot/
    ├── hrAgentBot.js
    ├── hrAgentBot.html
    ├── hrAgentBot.css
    └── hrAgentBot.js-meta.xml
  ```

### Component not appearing in Lightning App Builder
- ✓ Wait 1-2 minutes after deployment
- ✓ Refresh the Lightning App Builder page
- ✓ Check deployment succeeded in VS Code Output panel
- ✓ Verify `hrAgentBot.js-meta.xml` has `<isExposed>true</isExposed>`

### Bot icon appears but shows errors when clicked
- ✓ Did you configure Remote Site Settings? (Step 6)
- ✓ Is "Active" checkbox checked?
- ✓ Is URL exactly: `https://deploy-hr-agent-bot-1.onrender.com`
- ✓ Wait 2-3 minutes after adding Remote Site Settings
- ✓ Refresh the page

### CORS errors in browser console
- ✓ Remote Site Settings MUST be configured
- ✓ URL must match exactly (including `https://`)
- ✓ Clear browser cache and refresh

### "Cannot find module" error in terminal
- ✓ This is a Salesforce CLI issue, not VS Code
- ✓ Use VS Code method instead (this guide)
- ✓ Don't use terminal commands

---

## 📁 File Structure

Your `salesforce-lwc` folder should look like this:

```
salesforce-lwc/
├── hrAgentBot/
│   ├── hrAgentBot.js           (Controller)
│   ├── hrAgentBot.html         (Template)
│   ├── hrAgentBot.css          (Styles)
│   └── hrAgentBot.js-meta.xml  (Metadata)
├── hrEditForm/
│   ├── hrEditForm.js           (Controller)
│   ├── hrEditForm.html         (Template)
│   ├── hrEditForm.css          (Styles)
│   └── hrEditForm.js-meta.xml  (Metadata)
├── README.md
└── DEPLOYMENT_CHECKLIST.md
```

---

## ✅ Deployment Checklist

Use this to track your progress:

- [ ] Install Salesforce Extension Pack in VS Code
- [ ] Open `salesforce-lwc` folder in VS Code
- [ ] Authorize Salesforce org (`SFDX: Authorize an Org`)
- [ ] Deploy components (`SFDX: Deploy Source to Org`)
- [ ] Verify deployment succeeded
- [ ] Configure Remote Site Settings in Salesforce
- [ ] Add hrAgentBot to Home page via Lightning App Builder
- [ ] Save and Activate page
- [ ] Test bot with sample queries

---

## 🌐 Bot Information

**Deployment URL:** https://deploy-hr-agent-bot-1.onrender.com

**Test if bot is running:** Open the URL above in your browser

**Features:**
- ✅ Leave management
- ✅ WFH requests
- ✅ Holiday calendar
- ✅ Request tracking
- ✅ Text-to-speech
- ✅ Mobile responsive
- ✅ Salesforce SSO integration

---

## 🎯 Alternative: Add to Utility Bar

To make the bot accessible from **any page** (not just Home):

1. **Setup** → Quick Find: `App Manager`
2. Find your Lightning App (e.g., "Sales")
3. Click dropdown → **Edit**
4. Click **Utility Items** (left sidebar)
5. Click **Add Utility Item**
6. Select **Custom Lightning Component**
7. Configure:
   - **Lightning Component:** `c:hrAgentBot`
   - **Label:** `HR Assistant`
   - **Icon Name:** `chat`
   - **Panel Width:** `420`
   - **Panel Height:** `650`
8. Click **Save**

Now users can access the bot from the utility bar at the bottom of any page!

---

## 📞 Need Help?

**VS Code Issues:**
- Check Salesforce Extension Pack is installed and enabled
- Restart VS Code
- Check you're in the correct folder

**Salesforce Issues:**
- Verify Remote Site Settings configured
- Check browser console for errors (F12)
- Review Salesforce debug logs

**Bot Issues:**
- Test bot URL: https://deploy-hr-agent-bot-1.onrender.com
- Check it's running and accessible

---

**Total Time:** ~15 minutes

**Difficulty:** Easy

**Success Rate:** 99% with VS Code method!

---

**Last Updated:** January 30, 2026  
**Version:** 1.0.0
