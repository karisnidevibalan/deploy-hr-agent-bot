# 📍 Exact Location Guide: Adding HR Bot to Salesforce Home Page

## Step-by-Step with Exact Locations

---

## Step 1: Navigate to Home Page

1. **Log into Salesforce**
2. Click on **"Home"** tab in the navigation bar
   - Location: Top navigation bar
   - It's usually the first tab after the App Launcher (waffle icon ⚙)
   - If you don't see it, click the **App Launcher** (9 dots icon) → Search "Home" → Click it

---

## Step 2: Access Edit Page

### Find the Gear Icon ⚙️

**Location:** Top-right corner of the page

You'll see several icons in the top-right:
- Your profile picture/avatar
- A bell icon (notifications)
- A **gear/settings icon ⚙️** ← This one!

**Click the gear icon ⚙️**

A dropdown menu appears with options:
- Edit Page ← **Click this!**
- Personalize Your Nav Bar
- Switch to Salesforce Classic
- etc.

**Click "Edit Page"**

---

## Step 3: Lightning App Builder Opens

You're now in the **Lightning App Builder** interface.

### Interface Layout:

```
┌─────────────────────────────────────────────────────────┐
│  [< Back]  [Save]  [Activate]          Lightning App... │
├──────────────┬──────────────────────┬───────────────────┤
│              │                      │                   │
│  Components  │   Page Preview       │  Properties       │
│  (Left)      │   (Middle)           │  (Right)          │
│              │                      │                   │
│  Standard    │   Your actual        │  Component        │
│  Components  │   home page          │  settings         │
│              │   layout             │                   │
│  Custom ←    │                      │                   │
│  Components  │   [Drag here]        │                   │
│              │                      │                   │
│              │                      │                   │
└──────────────┴──────────────────────┴───────────────────┘
```

---

## Step 4: Find Your Component

### In the LEFT SIDEBAR (Components Panel):

1. **Scroll down** in the left panel
2. You'll see sections:
   - **Standard** (collapsed by default)
   - **Custom** ← **Look for this section!**

3. **Click "Custom"** to expand it (if collapsed)

4. Look for **"hrAgentBot"** or **"HR Agent Bot"**
   - It should appear in the list
   - Icon: Usually shows a generic component icon

**If you don't see it:**
- Wait 1-2 minutes (components need time to register)
- Click the **refresh icon** in the Components panel
- Or close and reopen Lightning App Builder

---

## Step 5: Drag Component to Page

### Where to Place It:

**Recommended Locations:**

#### Option A: Right Sidebar (Best for floating widget)
```
┌────────────────────────────┬──────────┐
│                            │          │
│   Main Content             │  Right   │
│   Area                     │  Sidebar │
│                            │          │
│                            │  ← Drag  │
│                            │    here  │
│                            │          │
└────────────────────────────┴──────────┘
```

#### Option B: Bottom of Page
```
┌──────────────────────────────────────┐
│                                      │
│   Main Content Area                  │
│                                      │
├──────────────────────────────────────┤
│   ← Drag here (bottom region)        │
└──────────────────────────────────────┘
```

### How to Drag:

1. **Click and hold** on "hrAgentBot" in the left panel
2. **Drag** it to your chosen location
3. You'll see a **blue highlight** showing where it will drop
4. **Release** the mouse button
5. The component appears on the page

---

## Step 6: Configure Component (Optional)

After dropping the component:

1. **Click on the component** in the page preview
2. The **right panel** shows properties:
   ```
   Properties
   ├── Bot Server URL
   │   └── https://deploy-hr-agent-bot-1.onrender.com
   └── (other settings)
   ```
3. You can leave the default URL or change it
4. Usually, **no changes needed**

---

## Step 7: Save Your Changes

**Top-right corner of Lightning App Builder:**

1. Click **"Save"** button
   - Location: Top-right, blue button
   - Wait for "Saved successfully" message

---

## Step 8: Activate the Page

**Still in Lightning App Builder, top-right:**

1. Click **"Activate"** button
   - Location: Next to "Save" button
   - A modal/popup appears

### Activation Options Modal:

You'll see options:
- **Org Default** ← Recommended for everyone
- **App Default** ← For specific apps only
- **App, Record Type, and Profile** ← For specific users

**Choose "Org Default":**
1. Click **"Org Default"** tab
2. Click **"Save"** button in the modal
3. Confirm if prompted

---

## Step 9: Return to Home Page

1. Click **"< Back"** button (top-left of Lightning App Builder)
2. Or click **"Home"** tab in the navigation

---

## Step 10: Verify Bot Appears

### On Your Home Page:

**Look for the 💬 icon:**
- **Location:** Bottom-right corner of the page
- **Appearance:** Floating circular button
- **Color:** Blue (Winfomi color)
- **Icon:** 💬 (chat bubble)

**Click the 💬 icon:**
- Chat window slides up from bottom-right
- Shows "HR Assistant" header
- Ready to chat!

---

## 🎯 Visual Reference

### Home Page After Deployment:

```
┌─────────────────────────────────────────────────────┐
│  [App Launcher] Home  Chatter  ...        [⚙️] [🔔] │
├─────────────────────────────────────────────────────┤
│                                                     │
│   Your Home Page Content                           │
│   (Dashboard, Lists, etc.)                         │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                              ┌────┐ │
│                                              │ 💬 │ │
│                                              └────┘ │
│                                         ↑ Bot Icon  │
└─────────────────────────────────────────────────────┘
```

### When Bot is Open:

```
┌─────────────────────────────────────────────────────┐
│  [App Launcher] Home  Chatter  ...        [⚙️] [🔔] │
├─────────────────────────────────────────────────────┤
│                                                     │
│   Your Home Page Content              ┌──────────┐ │
│                                       │ HR Asst  │ │
│                                       │    ✕     │ │
│                                       ├──────────┤ │
│                                       │ Hello!   │ │
│                                       │ How can  │ │
│                                       │ I help?  │ │
│                                       │          │ │
│                                       ├──────────┤ │
│                                       │ [Input]  │ │
│                                       └──────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 🔍 Exact Click Path Summary

1. **Salesforce Home Page** → Click **⚙️** (top-right)
2. Dropdown menu → Click **"Edit Page"**
3. Lightning App Builder opens
4. **Left panel** → Scroll to **"Custom"** section
5. Find **"hrAgentBot"** → **Drag** to page
6. **Top-right** → Click **"Save"**
7. **Top-right** → Click **"Activate"**
8. Modal → Select **"Org Default"** → Click **"Save"**
9. **Top-left** → Click **"< Back"**
10. Home page → Look for **💬** (bottom-right)

---

## 🔧 Troubleshooting Exact Locations

### Can't find gear icon ⚙️?
- **Location:** Absolute top-right corner
- Next to your profile picture
- If missing, you might not have edit permissions

### "Edit Page" not in dropdown?
- You need Lightning Experience (not Classic)
- You need page edit permissions
- Try: Setup → Lightning App Builder → Find Home page

### Component not in "Custom" section?
- Wait 2 minutes after deployment
- Refresh the page (F5)
- Check deployment succeeded in VS Code

### Can't drag component?
- Make sure you're clicking and holding
- Look for blue highlight zones
- Try a different region (sidebar vs bottom)

---

## 📞 Alternative Path (if gear icon method doesn't work)

1. Click **Setup** (gear icon → Setup)
2. Quick Find: Type **"Lightning App Builder"**
3. Click **"Lightning App Builder"**
4. Find **"Home Page Default"** or your home page
5. Click **"Edit"**
6. Follow steps 4-10 above

---

**Total Time:** 2-3 minutes once you know the exact locations!

**Difficulty:** Easy

**Success Rate:** 100% if you follow exact locations!

---

**Bot URL:** https://deploy-hr-agent-bot-1.onrender.com
