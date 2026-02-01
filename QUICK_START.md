# Quick Start: Integrate HR Bot into Salesforce Home Page

## 🚀 3-Step Integration

### Step 1: Deploy Components to Salesforce

**Using Salesforce CLI:**
```bash
cd c:\Users\karis\hr-agent-bot\deploy-hr-agent-bot\salesforce-lwc
sfdx auth:web:login -a WinfomiOrg
sfdx force:source:deploy -p . -u WinfomiOrg
```

**OR Using VS Code:**
1. Install "Salesforce Extension Pack"
2. Right-click `salesforce-lwc` folder
3. Select "SFDX: Deploy Source to Org"

---

### Step 2: Configure Remote Site Settings

**CRITICAL - Do this before testing!**

1. Salesforce → Setup
2. Search: "Remote Site Settings"
3. Click "New Remote Site"
4. Enter:
   - Name: `HR_Agent_Bot`
   - URL: `https://deploy-hr-agent-bot-1.onrender.com`
   - Active: ✅
5. Save

---

### Step 3: Add to Home Page

1. **Edit Home Page**
   - From Home page, click ⚙️ (gear icon) → Edit Page
   - OR: Setup → Lightning App Builder → Edit Home Page

2. **Add Component**
   - Left sidebar → Custom Components
   - Find "HR Agent Bot"
   - Drag to page (recommended: right sidebar or bottom)

3. **Activate**
   - Click "Save"
   - Click "Activate"
   - Choose "Org Default" or assign to specific apps/profiles
   - Save

---

## ✅ Test It!

1. Go to your Home page
2. Look for 💬 icon (bottom-right)
3. Click to open chat
4. Try: "Show holiday list"

---

## 🎯 Alternative: Add to Utility Bar (Always Visible)

1. Setup → App Manager
2. Find your app → Edit
3. Utility Items → Add Utility Item
4. Select: Custom Lightning Component
5. Component: `c:hrAgentBot`
6. Label: "HR Assistant"
7. Icon: `chat`
8. Save

Now accessible from bottom bar on ANY page!

---

## 📁 Files Created

All files are in: `c:\Users\karis\hr-agent-bot\deploy-hr-agent-bot\salesforce-lwc\`

- `hrAgentBot/` - Main chatbot component
- `hrEditForm/` - Edit form component
- `README.md` - Full documentation

---

## 🔧 Troubleshooting

**Bot not appearing?**
- Check Remote Site Settings configured
- Verify component deployed successfully
- Clear browser cache

**CORS errors?**
- Verify Remote Site URL is exact: `https://deploy-hr-agent-bot-1.onrender.com`
- Ensure "Active" is checked

**Messages not sending?**
- Check bot is running: https://deploy-hr-agent-bot-1.onrender.com
- Check browser console (F12) for errors

---

## 📚 More Info

- Full guide: `HOMEPAGE_INTEGRATION_GUIDE.md`
- Component docs: `salesforce-lwc/README.md`
- Integration guide: `SALESFORCE_INTEGRATION.md`

**Bot URL:** https://deploy-hr-agent-bot-1.onrender.com
