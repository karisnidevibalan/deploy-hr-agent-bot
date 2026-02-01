# 🎯 HR Agent Bot Integration for Winfomi Salesforce

## Complete Integration Guide

**Bot URL:** https://deploy-hr-agent-bot-1.onrender.com

---

## 📋 **Overview**

This guide will help you integrate the HR Agent Bot into your **Winfomi Salesforce** organization's home page.

**Total Time:** 15-20 minutes  
**Difficulty:** Easy  
**Prerequisites:** Winfomi Salesforce admin access

---

## 🚀 **Complete Integration Process**

### **Part 1: Deploy Components to Winfomi Salesforce**

#### **Using VS Code (Recommended)**

1. **Install Salesforce Extension Pack**
   - Open VS Code
   - Extensions (Ctrl+Shift+X)
   - Search: "Salesforce Extension Pack"
   - Install

2. **Open Project**
   - File → Open Folder
   - Navigate to: `c:\Users\karis\hr-agent-bot\deploy-hr-agent-bot\salesforce-lwc`
   - Select Folder

3. **Authorize Winfomi Org**
   - Press `Ctrl+Shift+P`
   - Type: `SFDX: Authorize an Org`
   - Choose: **Production** (for live Winfomi org)
   - Browser opens → **Log in with your Winfomi credentials**
   - Click "Allow"

4. **Deploy to Winfomi**
   - Right-click `salesforce-lwc` folder
   - Select: `SFDX: Deploy Source to Org`
   - Wait for "Deploy Succeeded"

**Detailed steps:** See `VSCODE_DEPLOYMENT.md`

---

### **Part 2: Configure Winfomi Salesforce**

#### **Step 1: Remote Site Settings** ⚠️ **CRITICAL**

1. Log into **Winfomi Salesforce**
2. Click **Setup** (gear icon)
3. Quick Find: `Remote Site Settings`
4. Click **New Remote Site**
5. Enter:
   ```
   Remote Site Name: HR_Agent_Bot
   Remote Site URL: https://deploy-hr-agent-bot-1.onrender.com
   Description: HR Agent Bot for Winfomi
   Active: ✓ (MUST be checked!)
   ```
6. **Save**

**Why this is critical:** Without this, the bot cannot communicate with the server and will show CORS errors.

---

### **Part 3: Add to Winfomi Home Page**

#### **Exact Steps:**

1. **Go to Winfomi Home Page**
   - Click "Home" tab in navigation

2. **Enter Edit Mode**
   - Click **⚙️** (gear icon, top-right corner)
   - Click **"Edit Page"**

3. **Find the Component**
   - Lightning App Builder opens
   - Left panel → Scroll to **"Custom"** section
   - Find **"hrAgentBot"** or **"HR Agent Bot"**

4. **Add to Page**
   - **Drag** "hrAgentBot" to your page
   - **Best location:** Right sidebar or bottom of page

5. **Save & Activate**
   - Click **"Save"** (top-right)
   - Click **"Activate"** (top-right)
   - Select **"Org Default"** (makes it available to all Winfomi users)
   - Click **"Save"** in popup

6. **Return to Home**
   - Click **"< Back"** (top-left)

**Detailed steps:** See `EXACT_STEPS.md`

---

### **Part 4: Test in Winfomi**

1. **Refresh your Winfomi Home page**
2. **Look for 💬 icon** (bottom-right corner)
3. **Click the icon** to open chat
4. **Test with:**
   - "Show holiday list"
   - "I want to apply for leave"
   - "Show my requests"
   - "What are the holidays this month?"

---

## ✨ **Features for Winfomi Users**

Once integrated, Winfomi employees can:

- ✅ **Apply for Leave** - All leave types (Annual, Sick, Casual, Maternity, Paternity)
- ✅ **Request WFH** - Work from home requests
- ✅ **View Holidays** - Company holiday calendar
- ✅ **Track Requests** - View pending/approved requests
- ✅ **Edit Requests** - Modify pending requests
- ✅ **Voice Output** - Optional text-to-speech
- ✅ **Mobile Access** - Works on Salesforce mobile app

---

## 🎯 **Integration Options for Winfomi**

### **Option 1: Home Page (Recommended)**
- Bot appears on Winfomi home page
- Floating 💬 icon in bottom-right
- **Best for:** All employees

### **Option 2: Utility Bar**
- Bot accessible from any Salesforce page
- Appears in bottom utility bar
- **Best for:** Frequent users

### **Option 3: Specific Pages**
- Add to Employee/Contact record pages
- **Best for:** HR team

**See guides for detailed instructions on each option.**

---

## 🔐 **Security & Permissions**

### **Data Privacy**
- All conversations are session-based
- No chat history stored
- User context from Winfomi Salesforce SSO
- HTTPS encryption for all API calls

### **User Permissions**
- Users need access to the Lightning page
- Standard Salesforce user permissions
- No special permissions required

### **Admin Controls**
- Control via page activation settings
- Assign to specific profiles/apps
- Can restrict to certain user groups

---

## 🔧 **Winfomi-Specific Configuration**

### **Customize for Winfomi Branding**

Edit `salesforce-lwc/hrAgentBot/hrAgentBot.css`:

```css
:host {
    --accent: #0066cc;        /* Winfomi blue */
    --accent-light: #cfe2ff;
    --brand: #1e293b;
}
```

### **Update Bot URL** (if needed)

If you redeploy to a different URL:
1. Edit page in Lightning App Builder
2. Click hrAgentBot component
3. Update "Bot Server URL" property

---

## 📊 **Monitoring & Analytics**

### **Check Bot Usage**
- Monitor server logs on Render dashboard
- Review Salesforce debug logs
- Track leave/WFH requests in Salesforce

### **User Feedback**
- Gather feedback from Winfomi employees
- Monitor common queries
- Adjust policies as needed

---

## 🆘 **Troubleshooting for Winfomi**

### **Bot not appearing?**
- Clear browser cache
- Verify deployment succeeded
- Check page activation settings
- Ensure your profile has access

### **CORS errors?**
- ✓ Remote Site Settings MUST be configured
- ✓ URL must be exact: `https://deploy-hr-agent-bot-1.onrender.com`
- ✓ "Active" must be checked
- ✓ Wait 2-3 minutes after adding

### **Messages not sending?**
- ✓ Test bot URL: https://deploy-hr-agent-bot-1.onrender.com
- ✓ Check browser console (F12)
- ✓ Verify Remote Site Settings
- ✓ Check Salesforce debug logs

### **Component not in Custom section?**
- ✓ Wait 2 minutes after deployment
- ✓ Refresh Lightning App Builder
- ✓ Verify deployment succeeded in VS Code

---

## 📁 **All Documentation**

**Quick Start:**
- `EXACT_STEPS.md` - Exact click locations for adding to home page
- `VSCODE_DEPLOYMENT.md` - VS Code deployment guide

**Detailed Guides:**
- `EXACT_LOCATIONS_GUIDE.md` - Visual guide with troubleshooting
- `DEPLOY_WITHOUT_CLI.md` - Developer Console method
- `README_SALESFORCE.md` - Complete overview

**Reference:**
- `DEPLOYMENT_CHECKLIST.md` - Track your progress
- `START_HERE.md` - Quick 3-step guide

**Location:** `c:\Users\karis\hr-agent-bot\deploy-hr-agent-bot\`

---

## ✅ **Integration Checklist for Winfomi**

- [ ] Install Salesforce Extension Pack in VS Code
- [ ] Open `salesforce-lwc` folder in VS Code
- [ ] Authorize Winfomi Salesforce org
- [ ] Deploy components to Winfomi
- [ ] Configure Remote Site Settings in Winfomi Salesforce
- [ ] Add hrAgentBot to Winfomi Home page
- [ ] Save and Activate for all Winfomi users
- [ ] Test bot with sample queries
- [ ] Train Winfomi employees on usage
- [ ] Monitor usage and gather feedback

---

## 🌐 **Winfomi HR Agent Bot Information**

**Deployment URL:** https://deploy-hr-agent-bot-1.onrender.com

**API Endpoint:** POST /api/chat

**Supported Salesforce Domains:**
- `*.force.com`
- `*.salesforce.com`
- `*.visualforce.com`
- `*.lightning.force.com`

**Version:** 1.0.0  
**Created:** January 30, 2026  
**Organization:** Winfomi

---

## 📞 **Support**

**For Deployment Issues:**
- Check `VSCODE_DEPLOYMENT.md`
- Check `EXACT_LOCATIONS_GUIDE.md`
- Verify all steps completed

**For Bot Issues:**
- Test bot URL in browser
- Check Remote Site Settings
- Review browser console

**For Winfomi-Specific Questions:**
- Contact Winfomi Salesforce admin
- Review Salesforce debug logs

---

## 🎉 **Success!**

Once completed, all Winfomi employees will have access to the HR Agent Bot directly from their Salesforce home page!

**Next Steps:**
1. Follow `VSCODE_DEPLOYMENT.md` to deploy
2. Follow `EXACT_STEPS.md` to add to home page
3. Test and train users
4. Monitor and optimize

---

**Your HR Agent Bot is ready for Winfomi Salesforce!** 🚀
