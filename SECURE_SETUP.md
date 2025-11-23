# 🛡️ Secure Database Initialization

To populate your database **without changing security rules**, we need to use a **Service Account Key**. This gives the script "Admin" access to write data securely.

## Step 1: Generate Private Key

1. Click this link to open Firebase Console:
   👉 [**Firebase Service Accounts Settings**](https://console.firebase.google.com/project/cogni-b9d6b/settings/serviceaccounts/adminsdk)

2. Click the **"Generate new private key"** button at the bottom.

3. Click **"Generate key"** in the popup.

4. A file will download (e.g., `cogni-b9d6b-firebase-adminsdk-xxxxx.json`).

## Step 2: Rename and Move File

1. Rename the downloaded file to: `service-account.json`

2. Move it to your project root folder:
   `C:\Users\DELL\OneDrive\Desktop\cognisecure\service-account.json`

   > ⚠️ **IMPORTANT:** Do NOT commit this file to Git! It contains secret keys. (It's already in your .gitignore)

## Step 3: Run the Script

Once the file is in place, run this command in your terminal:

```powershell
cd functions; node initDb.js
```

## Result

- ✅ Database will be populated with sample data
- ✅ Security rules remain untouched (secure)
- ✅ "Using Mock Data" indicator will disappear from dashboard
