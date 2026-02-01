# 🚀 Deploy HR Bot to Salesforce - NO CLI NEEDED!

Since Salesforce CLI is having issues, here's how to deploy manually using **copy-paste** method.

---

## ✅ Method 1: Using Salesforce Developer Console (Easiest!)

### Step 1: Open Developer Console

1. Log into **Salesforce**
2. Click your **profile icon** (top-right)
3. Select **Developer Console**

---

### Step 2: Create hrAgentBot Component

1. In Developer Console: **File** → **New** → **Lightning Component**
2. Name: `hrAgentBot`
3. Click **Submit**

Now copy-paste each file:

#### **hrAgentBot.js** (Controller)
1. In Developer Console, find `hrAgentBot.js` in the left panel
2. **Delete all existing content**
3. Open: `c:\Users\karis\hr-agent-bot\deploy-hr-agent-bot\salesforce-lwc\hrAgentBot\hrAgentBot.js`
4. **Copy ALL content** from that file
5. **Paste** into Developer Console
6. **Save** (Ctrl+S)

#### **hrAgentBot.html** (Template)
1. Find `hrAgentBot.html` in left panel
2. **Delete all existing content**
3. Open: `c:\Users\karis\hr-agent-bot\deploy-hr-agent-bot\salesforce-lwc\hrAgentBot\hrAgentBot.html`
4. **Copy ALL content**
5. **Paste** into Developer Console
6. **Save**

#### **hrAgentBot.css** (Styles)
1. Find `hrAgentBot.css` in left panel
2. **Delete all existing content**
3. Open: `c:\Users\karis\hr-agent-bot\deploy-hr-agent-bot\salesforce-lwc\hrAgentBot\hrAgentBot.css`
4. **Copy ALL content**
5. **Paste** into Developer Console
6. **Save**

#### **hrAgentBot.js-meta.xml** (Metadata)
1. Find `hrAgentBot.js-meta.xml` in left panel
2. **Delete all existing content**
3. Open: `c:\Users\karis\hr-agent-bot\deploy-hr-agent-bot\salesforce-lwc\hrAgentBot\hrAgentBot.js-meta.xml`
4. **Copy ALL content**
5. **Paste** into Developer Console
6. **Save**

---

### Step 3: Create hrEditForm Component

1. **File** → **New** → **Lightning Component**
2. Name: `hrEditForm`
3. Click **Submit**

Repeat the copy-paste process for these files:

#### **hrEditForm.js**
- Source: `salesforce-lwc\hrEditForm\hrEditForm.js`
- Copy → Paste → Save

#### **hrEditForm.html**
- Source: `salesforce-lwc\hrEditForm\hrEditForm.html`
- Copy → Paste → Save

#### **hrEditForm.css**
- Source: `salesforce-lwc\hrEditForm\hrEditForm.css`
- Copy → Paste → Save

#### **hrEditForm.js-meta.xml**
- Source: `salesforce-lwc\hrEditForm\hrEditForm.js-meta.xml`
- Copy → Paste → Save

---

## ✅ Step 4: Configure Remote Site Settings

**⚠️ CRITICAL - Bot won't work without this!**

1. Close Developer Console
2. Go to **Setup** (gear icon)
3. Quick Find: **Remote Site Settings**
4. Click **New Remote Site**
5. Enter:
   ```
   Remote Site Name: HR_Agent_Bot
   Remote Site URL: https://deploy-hr-agent-bot-1.onrender.com
   Active: ✓ (CHECK THIS!)
   ```
6. **Save**

---

## ✅ Step 5: Add to Home Page

1. Go to **Home** page
2. Click **⚙️ gear icon** → **Edit Page**
3. Left sidebar → **Custom Components**
4. Find **"hrAgentBot"** (should appear now!)
5. **Drag** it to your page
6. **Save** → **Activate** → **Org Default** → **Save**

---

## 🧪 Test It!

1. Refresh your Home page
2. Look for **💬 icon** (bottom-right)
3. Click to open
4. Try: **"Show holiday list"**

---

## 🔧 Troubleshooting

### Component not appearing in Custom Components?
- Wait 1-2 minutes after creating components
- Refresh Lightning App Builder
- Check all files were saved in Developer Console

### "Cannot find module" error?
- This is a Salesforce CLI issue, ignore it
- Use the manual method above instead

### Bot shows errors when opened?
- ✓ Did you configure Remote Site Settings? (Step 4)
- ✓ Is "Active" checked?
- ✓ Is URL exact: `https://deploy-hr-agent-bot-1.onrender.com`

### CORS errors?
- Remote Site Settings MUST be configured
- Wait 2-3 minutes after adding
- Refresh the page

---

## 📁 File Locations

All files to copy are in:
```
c:\Users\karis\hr-agent-bot\deploy-hr-agent-bot\salesforce-lwc\

hrAgentBot\
  ├── hrAgentBot.js
  ├── hrAgentBot.html
  ├── hrAgentBot.css
  └── hrAgentBot.js-meta.xml

hrEditForm\
  ├── hrEditForm.js
  ├── hrEditForm.html
  ├── hrEditForm.css
  └── hrEditForm.js-meta.xml
```

---

## ✅ Summary

1. ✅ Create `hrAgentBot` component in Developer Console
2. ✅ Copy-paste 4 files for hrAgentBot
3. ✅ Create `hrEditForm` component in Developer Console
4. ✅ Copy-paste 4 files for hrEditForm
5. ✅ Configure Remote Site Settings
6. ✅ Add to Home page via Lightning App Builder

**Total time: ~10 minutes**

---

## 🌐 Bot URL

https://deploy-hr-agent-bot-1.onrender.com

---

**This method works 100% without any CLI!** 🎉
