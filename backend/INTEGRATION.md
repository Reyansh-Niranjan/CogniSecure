# Integration Guide for Frontend Teams

## Overview

This guide is for the teams working on:
- **Police Officer Dashboard** (Frontend)
- **Citizen Dashboard** (Frontend)  
- **RPI Zero W** (Hardware/Python)

The backend is ready and provides all the APIs you need via Convex.

---

## 🔗 Getting Your Convex URL

After the backend team runs:
```bash
cd backend
npx convex dev
```

You'll receive a URL like: `https://happy-animal-123.convex.cloud`

---

## 📦 Frontend Setup (Police & Citizen Dashboards)

### 1. Install Convex Client

```bash
npm install convex
```

### 2. Get Generated API Types

Copy the `backend/convex/_generated` folder to your project, or generate it yourself:

```bash
# In your frontend project
npx convex dev --once
```

### 3. Add Environment Variable

Create `.env.local`:
```
VITE_CONVEX_URL=https://happy-animal-123.convex.cloud
```

### 4. Setup Provider

In your `main.tsx`:
```typescript
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

root.render(
  <ConvexProvider client={convex}>
    <App />
  </ConvexProvider>
);
```

---

## 👮 Police Dashboard Integration

### Authentication Flow

```typescript
import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "./convex/_generated/api";

// 1. After passkey/face scan verification, create session
const createSession = useMutation(api.auth.createSession);
const session = await createSession({
  officer_id: "officer-db-id",
  ip_address: "192.168.1.1"
});

// Store token
localStorage.setItem("session_token", session.token);

// 2. Validate session on page load
const sessionToken = localStorage.getItem("session_token");
const sessionData = useQuery(api.auth.validateSession, 
  sessionToken ? { token: sessionToken } : "skip"
);

if (!sessionData?.valid) {
  // Redirect to login
}
```

### Get Active Alerts

```typescript
const alerts = useQuery(api.alerts.getActiveAlerts);

return (
  <div>
    {alerts?.map(alert => (
      <AlertCard
        key={alert._id}
        photo={alert.photo_url}
        video={alert.video_url}
        timestamp={alert.timestamp_recorded}
        location={alert.location}
        status={alert.status}
      />
    ))}
  </div>
);
```

### Acknowledge Alert

```typescript
const updateStatus = useMutation(api.alerts.updateAlertStatus);

const handleAcknowledge = async (alertId: string) => {
  await updateStatus({
    alert_id: alertId,
    status: "acknowledged",
    officer_id: currentOfficer._id,
    notes: "Investigating"
  });
};
```

### Query AI Agent

```typescript
import { useAction } from "convex/react";

const queryAI = useAction(api.aiAgent.queryAIAgent);
const [loading, setLoading] = useState(false);
const [response, setResponse] = useState("");

const handleQuery = async (query: string, alertIds: string[]) => {
  setLoading(true);
  const result = await queryAI({
    session_token: sessionToken,
    query: query,
    include_alert_ids: alertIds
  });
  
  if (result.success) {
    setResponse(result.answer);
  } else {
    alert(result.error); // Rate limited or blocked
  }
  setLoading(false);
};
```

### Register for Push Notifications

```typescript
// After getting FCM token from Firebase SDK
const registerToken = useMutation(api.auth.registerFCMToken);

firebase.messaging().getToken().then(async (fcmToken) => {
  await registerToken({
    officer_id: currentOfficer._id,
    fcm_token: fcmToken
  });
});
```

---

## 🏘️ Citizen Dashboard Integration

### Get Recent Updates (No Auth Required)

```typescript
const updates = useQuery(api.citizenUpdates.getRecentUpdates, { 
  limit: 20 
});

return (
  <div>
    {updates?.map(update => (
      <UpdateCard
        key={update._id}
        title={update.title}
        content={update.content}
        category={update.category}
        priority={update.priority}
        timestamp={update.created_at}
      />
    ))}
  </div>
);
```

### Filter by Category

```typescript
const crimeAlerts = useQuery(api.citizenUpdates.getUpdatesByCategory, {
  category: "crime_alert",
  limit: 10
});
```

### Get High Priority Updates

```typescript
const priorityUpdates = useQuery(api.citizenUpdates.getHighPriorityUpdates);

// Returns: { high: [...], critical: [...] }
```

---

## 🤖 RPI Zero W Integration

### Sending Alerts to Backend

Your RD (relay device) should POST alerts after motion detection and object gone.

**Endpoint:**
```
POST https://happy-animal-123.convex.cloud/api/alerts/receive
```

**But actually**, use Convex client for direct access:

```python
# Install: pip install convex
from convex import ConvexClient
import time

client = ConvexClient("https://happy-animal-123.convex.cloud")

def send_alert(photo_url, video_url, device_id):
    """
    photo_url: Firebase Storage URL for uploaded photo
    video_url: Firebase Storage URL for uploaded 5-sec video
    device_id: Your RPI identifier (e.g., "RPI_001")
    """
    
    timestamp_recorded = int(time.time() * 1000)  # When incident happened
    timestamp_sent = int(time.time() * 1000)       # Now
    
    result = client.mutation("alerts:receiveAlert", {
        "timestamp_recorded": timestamp_recorded,
        "timestamp_sent": timestamp_sent,
        "photo_url": photo_url,
        "video_url": video_url,
        "rpi_device_id": device_id,
        "location": "Main Entrance"  # Optional
    })
    
    print(f"Alert sent! ID: {result['alert_id']}, Delay: {result['delay_ms']}ms")
    return result['alert_id']
```

### Complete RPI Flow

```python
# 1. Motion detected
# 2. Wait for object to leave
# 3. Extract 5-second video clip ending at motion end
# 4. Extract photo from clip (best frame with person)

# 5. Upload to Firebase Storage
photo_url = upload_to_firebase_storage(photo_bytes, f"{device_id}/{timestamp}.jpg")
video_url = upload_to_firebase_storage(video_bytes, f"{device_id}/{timestamp}.mp4")

# 6. Send to backend
alert_id = send_alert(photo_url, video_url, device_id)

# 7. Backend automatically notifies all officers via FCM
```

---

## 📊 Useful Queries for Police Dashboard

### Alert Statistics

```typescript
const stats = useQuery(api.alerts.getAlertStats, {
  timeframe_hours: 24 // Last 24 hours
});

// Returns:
// {
//   total: 45,
//   active: 12,
//   acknowledged: 20,
//   resolved: 10,
//   false_alarms: 3,
//   average_delay_ms: 234
// }
```

### Alert History with Filters

```typescript
// By status
const resolved = useQuery(api.alerts.getAlertHistory, {
  status: "resolved",
  limit: 50
});

// By device
const deviceAlerts = useQuery(api.alerts.getAlertHistory, {
  rpi_device_id: "RPI_001",
  limit: 100
});
```

### Officer Profile

```typescript
const profile = useQuery(api.auth.getOfficerProfile, {
  officer_id: currentOfficer._id
});
```

---

## 🔐 Security Notes

### Police Dashboard

- Always validate session before sensitive operations
- Store session token securely (httpOnly cookie preferred)
- Implement auto-logout on expiration
- Use HTTPS in production

### AI Agent Usage

- Limit: 50 queries/hour per officer
- Must provide specific alert IDs
- AI cannot access anything outside provided context
- All queries are logged for audit

### Citizen Dashboard

- No authentication required
- Only published updates are visible
- Cannot access any police/alert data

---

## 🚀 Testing Locally

Both dashboards can run simultaneously with backend:

```bash
# Terminal 1: Backend
cd backend
npx convex dev

# Terminal 2: Police Dashboard
cd police-dashboard
npm run dev

# Terminal 3: Citizen Dashboard
cd citizen-dashboard
npm run dev
```

All will communicate via Convex deployment.

---

## 📞 Backend API Reference

Full documentation in [backend/README.md](file:///c:/Users/DELL/OneDrive/Desktop/cognisecure/backend/README.md)

**Key Endpoints:**
- Alerts: `api.alerts.*`
- Auth: `api.auth.*`
- Notifications: `api.notifications.*`
- Citizen Updates: `api.citizenUpdates.*`
- AI Agent: `api.aiAgent.queryAIAgent`

---

## ⚡ Real-time Updates

Convex provides real-time subscriptions automatically:

```typescript
// This will automatically update when new alerts arrive
const alerts = useQuery(api.alerts.getActiveAlerts);

// No polling needed!
```

---

## 🎉 You're Ready!

Contact the backend team for:
- Convex deployment URL
- Any schema questions
- API clarifications
- Testing support

Good luck with the dashboards! 🚀
