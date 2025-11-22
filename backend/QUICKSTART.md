# Quick Start - Firebase Backend

## 🚀 Get Started in 4 Steps

### 1️⃣ Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Project name: `cognisecure-prod`
4. Enable Google Analytics (optional)
5. Create project

### 2️⃣ Enable Firebase Services

In Firebase Console:

**Authentication:**
- Go to Authentication → Get Started
- Enable Email/Password sign-in

**Firestore:**
- Go to Firestore Database → Create Database
- Start in **production mode**
- Choose region (e.g., us-central1)

**Storage:**
- Go to Storage → Get Started
- Use default settings

**Cloud Messaging:**
- Automatically enabled

**Functions:**
- Upgrade to **Blaze plan** (pay-as-you-go)
- Go to Functions → Get Started

### 3️⃣ Deploy Backend

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Go to backend directory
cd backend

# Link project
firebase use --add
# Select: cognisecure-prod
# Alias: default

# Set environment variables
firebase functions:config:set openrouter.api_key="YOUR_API_KEY"

# Deploy everything
firebase deploy
```

### 4️⃣ Get Configuration for Frontend

1. Go to Project Settings (⚙️)
2. Scroll to "Your apps"
3. Click "Add app" → Web (</>) 
4. Register app: "CogniSecure Web"
5. Copy the config object
6. Share with frontend teams

---

## 📁 What Was Built

```
backend/
├── functions/src/
│   ├── alerts.ts           ✅ Alert processing (HTTP + callable)
│   ├── notifications.ts    ✅ FCM push (Firestore trigger)
│   ├── aiAgent.ts          ✅ AI with security (50/hr limit)
│   ├── citizenUpdates.ts   ✅ Public updates
│   └── auth.ts             ✅ Officer auth & roles
├── firestore.rules         ✅ Database security
├── firestore.indexes.json  ✅ Query indexes
├── storage.rules           ✅ Storage security
└── firebase.json           ✅ Project config
```

---

## 🎯 System Flow

```
┌─────────────┐
│  RPI Zero   │ Motion → Object gone → 5sec video
└──────┬──────┘
       │ Upload to Firebase Storage
       │
       ▼
┌─────────────┐
│     RD      │ POST to receiveAlert HTTP function
└──────┬──────┘
       │ Stores in Firestore
       │
       ▼
┌─────────────┐
│  Firestore  │ Trigger: sendAlertNotifications
│   Trigger   │
└──────┬──────┘
       │
       ├──────────────────┬───────────────────┐
       ▼                  ▼                   ▼
  ┌─────────┐      ┌─────────┐         ┌─────────┐
  │Officer 1│      │Officer 2│   ...   │Officer N│
  └─────────┘      └─────────┘         └─────────┘
    FCM Push        FCM Push            FCM Push
```

---

## 🔐 AI Agent Security

✅ **Restrictions:**

1. ✅ Must be authenticated officer
2. ✅ 50 queries/hour rate limit
3. ✅ Can ONLY see alerts in `alert_ids` array
4. ✅ Query sanitization (XSS protection)
5. ✅ All queries logged for audit
6. ✅ No external data access

---

## 🧪 Local Testing

```bash
# Start emulators
firebase emulators:start
```

Access:
- **Emulator UI**: http://localhost:4000
- **Firestore**: http://localhost:8080
- **Functions**: http://localhost:5001
- **Auth**: http://localhost:9099
- **Storage**: http://localhost:9199

---

## 📖 Documentation

- **Setup & API**: [README.md](file:///c:/Users/DELL/OneDrive/Desktop/cognisecure/backend/README.md)
- **Frontend Integration**: [INTEGRATION.md](file:///c:/Users/DELL/OneDrive/Desktop/cognisecure/backend/INTEGRATION.md)
- **Walkthrough**: (see artifacts)

---

## ✨ Backend Functions

| Function | Type | Purpose |
|----------|------|---------|
| `receiveAlert` | HTTP | RPI alert submission |
| `sendAlertNotifications` | Trigger | Auto-send FCM on new alert |
| `getAlerts` | Callable | Query alerts |
| `updateAlertStatus` | Callable | Update status |
| `queryAI` | Callable | AI agent (secured) |
| `getUpdates` | Callable | Citizen dashboard (public) |
| `registerOfficer` | Callable | Create officer (admin) |
| ...and more | | See README.md |

---

## 🔥 First Register Admin Officer

After deployment, register the first admin:

```javascript
const registerOfficer = httpsCallable(functions, 'registerOfficer');

await registerOfficer({
  officer_id: "ADMIN_001",
  name: "Chief Admin",
  email: "admin@police.gov",
  password: "SecurePassword123!",
  phone_number: "+1234567890",
  role: "admin"
});
```

Then login with those credentials!

---

## 🎉 All Set!

Backend is **100% Firebase** with:
- ✅ Firestore database
- ✅ Cloud Functions (9 functions)
- ✅ Firebase Auth
- ✅ Storage rules
- ✅ FCM integration
- ✅ AI agent with OpenRouter
- ✅ Complete security

Ready to integrate with dashboards! 🚀
