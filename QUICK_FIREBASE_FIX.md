# Quick Firebase Setup Instructions

## Problem
The initialization script can't write to Realtime Database because the security rules are blocking it, and you don't have CLI permissions to deploy new rules.

## Solution: Update Rules in Firebase Console

### Step 1: Open Firebase Console
Go to: https://console.firebase.google.com/project/cogni-b9d6b/database/cogni-b9d6b-default-rtdb/rules

### Step 2: Replace Rules (Temporary for Testing)
Delete everything and paste this:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### Step 3: Publish
Click the **"Publish"** button

### Step 4: Run Initialization Script
In your terminal:
```powershell
node scripts/initializeFirebase.js
```

### Expected Output:
```
🔥 Firebase initialized successfully!
📦 Project ID: cogni-b9d6b
🔗 Database URL: https://cogni-b9d6b-default-rtdb.firebaseio.com

📋 Initializing incidents...
✅ Added 5 incidents

📊 Initializing analytics...
✅ Analytics data initialized

📈 Initializing stats...
✅ Daily stats initialized

👮 Initializing officer settings...
✅ Admin officer settings initialized

✨ Firebase database initialized successfully!
```

### Step 5: Verify
1. Refresh your Police Dashboard: http://localhost:5173/police
2. Login as admin
3. Click Incidents/Analytics/Settings
4. The "Using Mock Data" indicator should **disappear**

## Important
These rules allow anyone to read/write your database. After testing, we'll set up proper security rules that require authentication.
