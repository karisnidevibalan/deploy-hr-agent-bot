# 🎯 SIMPLEST WAY: Integrate HR Bot to Salesforce Home Page

## Just 3 Steps - No Scripts Needed!

---

## ✅ Step 1: Deploy Using Salesforce CLI

Open a **new terminal** and run these commands:

```bash
cd c:\Users\karis\hr-agent-bot\deploy-hr-agent-bot\salesforce-lwc

# Authenticate with Salesforce
sfdx auth:web:login -a WinfomiOrg

# Deploy the components
sfdx force:source:deploy -p . -u WinfomiOrg
```

**What happens:**
- Browser opens for Salesforce login
- Log in with your credentials
- Components deploy automatically
- Wait for "Deploy Succeeded" message

---

## ✅ Step 2: Configure Remote Site Settings

**⚠️ CRITICAL - Bot won't work without this!**

1. Log into **Salesforce**
2. Click **Setup** (gear icon, top-right)
3. In **Quick Find** box, type: `Remote Site Settings`
4. Click **New Remote Site**
5. Fill in exactly:
   ```
   Remote Site Name: HR_Agent_Bot
   Remote Site URL: https://deploy-hr-agent-bot-1.onrender.com
   Description: HR Agent Bot API
   Disable Protocol Security: (leave unchecked)
   Active: ✓ (CHECK THIS BOX!)
   ```
6. Click **Save**

---

## ✅ Step 3: Add to Home Page

### Option A: Quick Add to Home Page

1. Go to your **Salesforce Home** page
2. Click the **⚙️ gear icon** (top-right)
3. Select **Edit Page**
4. In the **left sidebar**, scroll to **Custom Components**
5. Find **"HR Agent Bot"**
6. **Drag it** onto your page
   - Recommended: Right sidebar or bottom of page
7. Click **Save** (top-right)
8. Click **Activate**
9. Select **Org Default** (makes it default for everyone)
10. Click **Save**

**Done!** The bot is now on your home page.

---

### Option B: Add to Utility Bar (Always Visible)

Make the bot accessible from **any page** via the bottom utility bar:

1. **Setup** → Quick Find: `App Manager`
2. Find your Lightning App (e.g., "Sales")
3. Click dropdown → **Edit**
4. Click **Utility Items** (left sidebar)
5. Click **Add Utility Item**
6. Select **Custom Lightning Component**
7. Fill in:
   ```
   Lightning Component: c:hrAgentBot
   Label: HR Assistant
   Icon Name: chat
   Panel Width: 420
   Panel Height: 650
   ```
8. Click **Save**

**Done!** Users can now access the bot from the utility bar at the bottom.

---

## 🧪 Test It!

1. Navigate to your **Home page**
2. Look for the **💬 icon** in the bottom-right corner
3. Click it to open the chat
4. Try: **"Show holiday list"**

---

## 🔧 Troubleshooting

### "sfdx: command not found"
Install Salesforce CLI:
```bash
npm install -g @salesforce/cli
```

### Bot icon not appearing?
- Clear browser cache (Ctrl+Shift+Delete)
- Refresh page (Ctrl+F5)
- Check component is on page in Edit mode

### Bot opens but shows errors?
- ✓ Did you complete Step 2 (Remote Site Settings)?
- ✓ Is "Active" checked in Remote Site Settings?
- ✓ Is URL exact: `https://deploy-hr-agent-bot-1.onrender.com`

### CORS errors in browser console?
- Remote Site Settings MUST be configured (Step 2)
- Wait 2-3 minutes after adding Remote Site Settings
- Refresh the page

---

## 📁 Files Location

All component files are in:
```
c:\Users\karis\hr-agent-bot\deploy-hr-agent-bot\salesforce-lwc\
```

---

## 🌐 Bot Information

**URL:** https://deploy-hr-agent-bot-1.onrender.com

**Test if running:** Open the URL above in your browser

---

## ✅ That's It!

Just these 3 steps and your HR Agent Bot will be live on your Salesforce home page!

**Need more help?** See `README_SALESFORCE.md` for complete documentation.
