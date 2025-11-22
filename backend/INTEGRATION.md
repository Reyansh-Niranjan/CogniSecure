# Integration Guide for Frontend Teams - Firebase Edition

## Overview

The backend now uses **Firebase** instead of Convex. This guide is for teams working on:
- **Police Officer Dashboard** (Frontend)
- **Citizen Dashboard** (Frontend)  
- **RPI Zero W** (Hardware/Python)

---

## 🔥 Firebase Setup

### Firebase Project Details

After backend setup completes, you'll get:
- **Project ID**: `cognisecure-prod`
- **Web App Config**: Firebase Console → Project Settings → Your apps
- **Functions URL**: `https://REGION-PROJECT.cloudfunctions.net/`

---

## 📦 Frontend Setup (Police & Citizen Dashboards)

### 1. Install Firebase SDK

```bash
npm install firebase
```

### 2. Initialize Firebase

Create `src/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
export const messaging = getMessaging(app);

export default app;
```

### 3. Environment Variables

Create `.env.local`:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=cognisecure-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cognisecure-prod
VITE_FIREBASE_STORAGE_BUCKET=cognisecure-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## 👮 Police Dashboard Integration

### Authentication Flow

```javascript
import { signInWithEmailAndPassword } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from './firebase';

// Login with email/password
const handleLogin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get ID token (includes custom claims for role)
    const idTokenResult = await user.getIdTokenResult();
    const role = idTokenResult.claims.role;
    
    console.log('Logged in as:', role);
    
    // Update last login
    const updateLogin = httpsCallable(functions, 'updateLastLogin');
    await updateLogin();
    
    return { user, role };
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

// Get current user and role
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const idTokenResult = await user.getIdTokenResult();
    console.log('User role:', idTokenResult.claims.role);
  } else {
    console.log('Not logged in');
  }
});
```

### Get Active Alerts

```javascript
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

const getAlerts = httpsCallable(functions, 'getAlerts');

const fetchAlerts = async () => {
  try {
    const result = await getAlerts({
      status: 'active',
      limit: 50
    });
    
    const alerts = result.data.alerts;
    return alerts;
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
  }
};
```

### Update Alert Status

```javascript
const updateAlertStatus = httpsCallable(functions, 'updateAlertStatus');

const handleAcknowledge = async (alertId) => {
  try {
    const result = await updateAlertStatus({
      alert_id: alertId,
      status: 'acknowledged',
      notes: 'Investigating'
    });
    
    console.log(result.data.message);
  } catch (error) {
    console.error('Failed to update:', error);
  }
};
```

### Query AI Agent

```javascript
const queryAI = httpsCallable(functions, 'queryAI');

const handleAIQuery = async (query, alertIds) => {
  try {
    const result = await queryAI({
      query: query,
      alert_ids: alertIds  // Only these alerts will be accessible to AI
    });
    
    if (result.data.success) {
      console.log('AI Response:', result.data.answer);
      console.log('Model:', result.data.model);
      console.log('Tokens:', result.data.tokens);
    } else {
      alert(result.data.error); // Rate limited or blocked
    }
  } catch (error) {
    if (error.code === 'functions/resource-exhausted') {
      alert('Rate limit exceeded. Try again in an hour.');
    }
    console.error('AI query failed:', error);
  }
};
```

### Register for Push Notifications

```javascript
import { getToken } from 'firebase/messaging';
import { httpsCallable } from 'firebase/functions';
import { messaging, functions } from './firebase';

const registerFCM = async () => {
  try {
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return;
    }
    
    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: 'YOUR_VAPID_KEY'
    });
    
    // Register token with backend
    const registerToken = httpsCallable(functions, 'registerDeviceToken');
    await registerToken({ fcm_token: token });
    
    console.log('FCM token registered');
  } catch (error) {
    console.error('FCM registration failed:', error);
  }
};

// Handle incoming notifications
onMessage(messaging, (payload) => {
  console.log('Notification received:', payload);
  const { title, body } = payload.notification;
  const { alert_id, photo_url, video_url } = payload.data;
  
  // Show notification or update  UI
  new Notification(title, { body, icon: photo_url });
});
```

### Get Alert Statistics

```javascript
const getStats = httpsCallable(functions, 'getAlertStats');

const fetchStats = async () => {
  const result = await getStats({ timeframe_hours: 24 });
  const stats = result.data.stats;
  
  console.log('Total alerts:', stats.total);
  console.log('Active:', stats.active);
  console.log('Average delay:', stats.average_delay_ms, 'ms');
};
```

---

## 🏘️ Citizen Dashboard Integration

### Get Recent Updates (No Auth Required)

```javascript
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

const getUpdates = httpsCallable(functions, 'getUpdates');

const fetchUpdates = async () => {
  try {
    const result = await getUpdates({ limit: 20 });
    const updates = result.data.updates;
    
    return updates;
  } catch (error) {
    console.error('Failed to fetch updates:', error);
  }
};
```

### Filter by Category

```javascript
const fetchCrimeAlerts = async () => {
  const result = await getUpdates({
    category: 'crime_alert',
    limit: 10
  });
  
  return result.data.updates;
};
```

### Increment View Count

```javascript
const incrementView = httpsCallable(functions, 'incrementViewCount');

const handleView = async (updateId) => {
  await incrementView({ update_id: updateId });
};
```

---

## 🤖 RPI Zero W Integration

### Sending Alerts to Firebase

```python
import requests
import time

# Your Cloud Function URL
ALERT_ENDPOINT = "https://REGION-PROJECT.cloudfunctions.net/receiveAlert"

def send_alert(photo_url, video_url, device_id):
    """
    photo_url: Firebase Storage URL for uploaded photo
    video_url: Firebase Storage URL for uploaded 5-sec video
    device_id: Your RPI identifier (e.g., "RPI_001")
    """
    
    timestamp_recorded = int(time.time() * 1000)  # When incident happened
    timestamp_sent = int(time.time() * 1000)       # Now
    
    data = {
        "timestamp_recorded": timestamp_recorded,
        "timestamp_sent": timestamp_sent,
        "photo_url": photo_url,
        "video_url": video_url,
        "rpi_device_id": device_id,
        "location": "Main Entrance"  # Optional
    }
    
    response = requests.post(ALERT_ENDPOINT, json=data)
    result = response.json()
    
    if result['success']:
        print(f"Alert sent! ID: {result['alert_id']}, Delay: {result['delay_ms']}ms")
        return result['alert_id']
    else:
        print(f"Failed: {result.get('error')}")
        return None
```

### Upload to Firebase Storage

```python
from firebase_admin import credentials, storage, initialize_app

# Initialize Firebase Admin SDK
cred = credentials.Certificate('path/to/serviceAccountKey.json')
initialize_app(cred, {
    'storageBucket': 'cognisecure-prod.appspot.com'
})

def upload_to_storage(file_bytes, file_name, device_id):
    """Upload file to Firebase Storage"""
    bucket = storage.bucket()
    blob = bucket.blob(f'alerts/{device_id}/{file_name}')
    blob.upload_from_string(file_bytes)
    
    # Make publicly accessible (or use signed URLs)
    blob.make_public()
    
    return blob.public_url

# Complete flow
photo_url = upload_to_storage(photo_bytes, f"{timestamp}.jpg", "RPI_001")
video_url = upload_to_storage(video_bytes, f"{timestamp}.mp4", "RPI_001")
alert_id = send_alert(photo_url, video_url, "RPI_001")
```

---

## 🔐 Security Notes

### Police Dashboard

- Firebase Auth handles sessions automatically
- Custom claims (role) are set by backend
- ID token refreshed automatically
- Use Firebase Auth's `onAuthStateChanged` for state management

### AI Agent Usage

- Limit: 50 queries/hour per officer
- Must provide specific alert IDs
- AI cannot access anything outside provided context
- All queries logged for audit
- Rate limit errors: `functions/resource-exhausted`

### Citizen Dashboard

- No authentication required for reading updates
- Cannot access any police/alert data
- Firestore rules enforce public access only

---

## 🚀 Testing Locally

### Firebase Emulators

The backend can run locally with emulators:

```bash
cd backend
firebase emulators:start
```

Update your `.env.local` to point to emulators:

```
VITE_FIREBASE_AUTH_DOMAIN=localhost
VITE_FIREBASE_FUNCTIONS_HOST=http://localhost:5001
```

Then connect to emulators in your app:

```javascript
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectFunctionsEmulator } from 'firebase/functions';
import { connectStorageEmulator } from 'firebase/storage';

if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  connectStorageEmulator(storage, 'localhost', 9199);
}
```

---

## 📞 Backend API Reference

Full documentation in [backend/README.md](file:///c:/Users/DELL/OneDrive/Desktop/cognisecure/backend/README.md)

**Available Functions:**
- `receiveAlert` (HTTP) - RPI alert submission
- `getAlerts` - Query alerts
- `updateAlertStatus` - Update alert
- `getAlertStats` - Statistics
- `registerDeviceToken` - Register FCM
- `removeDeviceToken` - Remove FCM
- `queryAI` - AI agent (secured)
- `getAILogs` - Fetch AI logs
- `getUpdates` - Citizen updates
- `createUpdate` - Create update (admin)
- `updateUpdate`, `deleteUpdate` - Manage updates
- `registerOfficer` - Register officer (admin)
- `setOfficerRole` - Set role (admin)
- `getOfficerProfile` - Get profile
- `updateLastLogin` - Update login
- `deactivateOfficer` - Deactivate (admin)

---

## ⚡ Real-time Updates

Use Firestore real-time listeners:

```javascript
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

// Listen to active alerts
const q = query(
  collection(db, 'alerts'),
  where('status', '==', 'active')
);

const unsubscribe = onSnapshot(q, (snapshot) => {
  const alerts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  console.log('Active alerts updated:', alerts);
  // Update UI
});

// Cleanup when component unmounts
// unsubscribe();
```

---

## 🎉 You're Ready!

Contact the backend team for:
- Firebase project credentials
- Function deployment URLs
- Service account keys (for RPI)
- Testing support

Good luck with the dashboards! 🚀
