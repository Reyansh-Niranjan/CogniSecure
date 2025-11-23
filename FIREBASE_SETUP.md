# Firebase Database Setup Guide

## Overview
This guide will help you populate your Firebase Firestore database with sample data for the new sidebar features (Incidents, Analytics, Settings).

## Prerequisites
✅ Firebase project created (`cogni-b9d6b`)  
✅ Firestore enabled in Firebase Console  
✅ Environment variables configured in `.env`  
✅ Dependencies installed (`npm install` completed)

## Step 1: Deploy Updated Firestore Rules

The Firestore security rules have been updated to allow writes for the new collections. Deploy them to Firebase:

```powershell
firebase deploy --only firestore:rules
```

**Important:** The current rules allow open writes for development. Before going to production, you should restrict these rules to require authentication.

## Step 2: Run the Initialization Script

Execute the Firebase initialization script to populate your database:

```powershell
node scripts/initializeFirebase.js
```

### What This Script Does:
1. **Creates `incidents` collection** with 5 sample incidents
2. **Creates `analytics/summary` document** with trends and statistics
3. **Creates `stats/daily` document** with dashboard metrics
4. **Creates `officers/admin/settings/preferences`** with admin user settings

### Expected Output:
```
🔥 Firebase initialized successfully!
📦 Project ID: cogni-b9d6b

==================================================

📋 Initializing incidents collection...
✅ Added 5 incidents

📊 Initializing analytics collection...
✅ Analytics data initialized

📈 Initializing stats collection...
✅ Daily stats initialized

👮 Initializing officer settings...
✅ Admin officer settings initialized

==================================================

✨ Firebase database initialized successfully!

📝 Collections created:
   - incidents (5 sample incidents)
   - analytics/summary (trends and statistics)
   - stats/daily (dashboard stats)
   - officers/admin/settings/preferences (admin settings)

🎉 You can now use the Police Dashboard with real Firebase data!

💡 Tip: Refresh your browser to see the data from Firebase
```

## Step 3: Verify in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`cogni-b9d6b`)
3. Navigate to **Firestore Database**
4. You should see the following collections:
   - `incidents` (5 documents)
   - `analytics` (1 document: `summary`)
   - `stats` (1 document: `daily`)
   - `officers` → `admin` → `settings` (1 document: `preferences`)

## Step 4: Test the Dashboard

1. Make sure your dev server is running:
   ```powershell
   npm run dev
   ```

2. Open `http://localhost:5173/police` in your browser

3. Click "Login as Test Admin"

4. Test each sidebar button:
   - **Overview** - Should show stats from Firebase
   - **Incidents** - Should display 5 sample incidents with filtering/search
   - **Analytics** - Should show charts with trends and statistics
   - **Settings** - Should display admin profile and preferences

5. Look for the **"Using Mock Data"** indicator:
   - ❌ **Should NOT appear** if Firebase is connected
   - ✅ **Should appear** if Firebase connection fails (fallback to mock data)

## Troubleshooting

### Error: "Firebase connection unavailable"
**Solution:** Check your `.env` file credentials and ensure Firestore is enabled in Firebase Console.

### Error: "Permission denied"
**Solution:** Run `firebase deploy --only firestore:rules` to deploy the updated security rules.

### Error: "Collection not found"
**Solution:** Re-run the initialization script: `node scripts/initializeFirebase.js`

### Data not showing in dashboard
**Solution:** 
1. Check browser console for errors
2. Refresh the page (Ctrl+F5)
3. Verify data exists in Firebase Console

## Production Deployment

Before deploying to production, update `firestore.rules` to restrict write access:

```javascript
// Change this:
allow create, update: if true;

// To this:
allow create, update: if isOfficer();
```

Then deploy:
```powershell
firebase deploy --only firestore:rules
```

## Next Steps

- Add more sample incidents via Firebase Console
- Customize analytics data for your use case
- Set up Cloud Functions to automatically update stats
- Configure Firebase Authentication for real officer logins

---

**Need Help?** Check the Firebase Console logs or browser developer console for detailed error messages.
