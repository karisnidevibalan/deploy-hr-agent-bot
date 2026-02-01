# 🎯 EXACT STEP-BY-STEP: Add HR Bot to Salesforce Home Page

## Follow These Exact Steps

---

## 📍 **Step 1: Go to Salesforce Home Page**

1. Open your browser
2. Go to Salesforce
3. Click **"Home"** tab (top navigation bar)

---

## 📍 **Step 2: Click Gear Icon**

**EXACT LOCATION:** Top-right corner of the screen

Look for these icons in order:
- Your profile picture/avatar
- Bell icon 🔔 (notifications)
- **Gear icon ⚙️** ← **CLICK THIS ONE**

---

## 📍 **Step 3: Click "Edit Page"**

A dropdown menu appears.

**CLICK:** "Edit Page" (first or second option in the menu)

Lightning App Builder will open.

---

## 📍 **Step 4: Find the Component**

You're now in Lightning App Builder with 3 panels:

### LEFT PANEL (Components):

1. **Scroll down** in the left panel
2. Look for section called **"Custom"**
3. **Click "Custom"** to expand it
4. Find **"hrAgentBot"** in the list

**If you don't see it:**
- Wait 1-2 minutes
- Refresh the page
- Make sure deployment succeeded

---

## 📍 **Step 5: Drag Component to Page**

### MIDDLE PANEL (Page Preview):

**Best Location:** Right sidebar or bottom of page

### How to Drag:

1. **Click and HOLD** on "hrAgentBot" (in left panel)
2. **Drag** your mouse to the right sidebar or bottom area
3. You'll see a **blue box** appear where it will drop
4. **Release** mouse button
5. Component appears on the page

---

## 📍 **Step 6: Save**

**EXACT LOCATION:** Top-right corner

**CLICK:** Blue **"Save"** button

Wait for "Saved successfully" message.

---

## 📍 **Step 7: Activate**

**EXACT LOCATION:** Top-right corner (next to Save)

**CLICK:** **"Activate"** button

A popup/modal appears.

---

## 📍 **Step 8: Choose Org Default**

In the popup:

1. **CLICK:** "Org Default" tab
2. **CLICK:** Blue "Save" button at bottom of popup
3. Confirm if prompted

---

## 📍 **Step 9: Go Back to Home**

**EXACT LOCATION:** Top-left corner

**CLICK:** "< Back" button

OR

**CLICK:** "Home" tab in navigation bar

---

## 📍 **Step 10: Find the Bot**

On your Home page:

**LOOK FOR:** 💬 icon in **bottom-right corner**

**APPEARANCE:**
- Floating circular button
- Blue color
- Chat bubble icon 💬

**CLICK IT** to open the chat!

---

## ✅ **Test the Bot**

When chat opens, type:
- `"Show holiday list"`
- `"I want to apply for leave"`

---

## 🎯 **Quick Visual Map**

```
SALESFORCE HOME PAGE
┌─────────────────────────────────────────┐
│ Home  Chatter  ...           [⚙️] [🔔]  │ ← Click ⚙️
│                                         │
│  1. Click ⚙️ (top-right)                │
│  2. Click "Edit Page"                   │
│                                         │
│  LIGHTNING APP BUILDER OPENS            │
│  ┌──────────┬──────────┬──────────┐    │
│  │ Custom   │  Page    │Properties│    │
│  │          │          │          │    │
│  │hrAgentBot│  Drag    │          │    │
│  │  ↓       │  here →  │          │    │
│  │ Drag it  │          │          │    │
│  └──────────┴──────────┴──────────┘    │
│                                         │
│  3. Save (top-right)                    │
│  4. Activate (top-right)                │
│  5. Org Default → Save                  │
│  6. < Back (top-left)                   │
│                                         │
│  BACK ON HOME PAGE                      │
│                                  ┌────┐ │
│                                  │ 💬 │ │ ← Bot appears!
│                                  └────┘ │
└─────────────────────────────────────────┘
```

---

## 🔧 **Troubleshooting**

### Can't find ⚙️ icon?
- **It's in the absolute top-right corner**
- Next to your profile picture
- Same row as the navigation tabs

### "Edit Page" not showing?
- You might be in Salesforce Classic (not Lightning)
- Switch to Lightning Experience
- Or go to: Setup → Lightning App Builder

### Component not in Custom section?
- **Wait 2 minutes** after deployment
- **Refresh** the Lightning App Builder page
- Verify deployment succeeded in VS Code

### Can't drag component?
- **Click and HOLD** (don't just click)
- Look for **blue highlight** zones on the page
- Try dragging to a different area

### Bot icon not appearing?
- **Clear browser cache** (Ctrl+Shift+Delete)
- **Hard refresh** (Ctrl+F5)
- Wait 1-2 minutes
- Check component is on the page (Edit Page to verify)

---

## 📋 **Checklist**

- [ ] On Salesforce Home page
- [ ] Clicked ⚙️ (top-right)
- [ ] Clicked "Edit Page"
- [ ] Found "hrAgentBot" in Custom section
- [ ] Dragged to page
- [ ] Clicked "Save"
- [ ] Clicked "Activate"
- [ ] Selected "Org Default"
- [ ] Clicked "Save" in popup
- [ ] Clicked "< Back"
- [ ] See 💬 icon (bottom-right)
- [ ] Clicked 💬 and tested

---

**Total Time:** 2-3 minutes

**Difficulty:** Very Easy

**Success Rate:** 100%

---

**Bot URL:** https://deploy-hr-agent-bot-1.onrender.com

**Need more details?** See `EXACT_LOCATIONS_GUIDE.md`
