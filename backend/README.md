# CogniSecure Backend - Firebase

Firebase backend for the CogniSecure security surveillance system.

## Overview

This backend uses the complete Firebase ecosystem:

- **Firestore**: NoSQL database for all collections
- **Cloud Functions**: Serverless backend logic
- **Firebase Authentication**: Officer authentication with custom claims/roles
- **Firebase Storage**: Photo and video storage from RPI devices
- **Cloud Messaging (FCM)**: Push notifications to officer devices
- **OpenRouter AI**: AI agent integration via Cloud Functions

## Project Structure

```
backend/
├── functions/
│   ├── src/
│   │   ├── index.ts           # Main exports
│   │   ├── alerts.ts          # Alert processing
│   │   ├── notifications.ts   # FCM push notifications
│   │   ├── aiAgent.ts         # AI with security restrictions
│   │   ├── citizenUpdates.ts  # Public updates
│   │   └── auth.ts            # Officer authentication
│   ├── package.json
│   └── tsconfig.json
├── firebase.json               # Firebase configuration
├── .firebaserc                 # Project mapping
├── firestore.rules             # Database security rules
├── firestore.indexes.json      # Composite indexes
├── storage.rules               # Storage security rules
└── package.json
```

## Setup

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: "cognisecure-prod"
3. Enable services:
   - **Firestore**: Database
   - **Authentication**: Enable Email/Password
   - **Storage**: Default bucket
   - **Cloud Messaging**: Enable
   - **Functions**: Enable Blaze plan (pay-as-you-go)

### 4. Initialize Project

```bash
cd backend
firebase use --add
# Select: cognisecure-prod
# Alias: default
```

### 5. Install Dependencies

```bash
# Root dependencies
npm install

# Functions dependencies
cd functions
npm install
cd ..
```

### 6. Set Environment Variables

```bash
firebase functions:config:set openrouter.api_key="YOUR_OPENROUTER_API_KEY"
```

### 7. Deploy

```bash
# Deploy everything
firebase deploy

# Or deploy specific parts
firebase deploy --only firestore:rules
firebase deploy --only storage
firebase deploy --only functions
```

## Firestore Collections

### `alerts`
Incident alerts from RPI devices.

**Fields:**
- `timestamp_recorded`: When incident happened
- `timestamp_sent`: When RD sent alert
- `timestamp_received`: When backend received
- `delay_ms`: Calculated latency
- `photo_url`: Firebase Storage URL
- `video_url`: Firebase Storage URL
- `rpi_device_id`: Device identifier
- `location`: Optional location
- `status`: "active" | "acknowledged" | "resolved" | "false_alarm"
- `acknowledged_by`, `resolved_by`: Officer UIDs
- `notes`: Optional notes

### `officers`
Police officer profiles.

**Fields:**
- `officer_id`: Badge number
- `name`, `email`, `phone_number`
- `role`: "officer" | "admin" | "supervisor"
- `is_active`: Boolean
- `fcm_tokens`: Array of device tokens
- `created_at`, `last_login`

### `citizenUpdates`
Public announcements.

**Fields:**
- `title`, `content`
- `category`: "safety_tip" | "crime_alert" | "announcement" | "statistics"
- `priority`: "low" | "medium" | "high" | "critical"
- `is_published`: Boolean
- `view_count`: Number
- `created_at`, `updated_at`

### `aiAgentLogs`
AI query audit trail.

**Fields:**
- `officer_id`: Who queried
- `query`, `response`
- `context_used`: Alert IDs provided
- `model_used`, `tokens_used`
- `timestamp`, `response_time_ms`
- `was_blocked`, `block_reason`

### `notificationLogs`
FCM delivery tracking.

**Fields:**
- `alert_id`, `officer_id`
- `notification_type`: "fcm_push"
- `sent_at`, `delivery_status`
- `fcm_message_id`, `fcm_token_used`
- `error_message`, `retry_count`

### `rateLimits`
AI rate limiting (50/hour per officer).

**Fields:**
- `officer_id`
- `hour_timestamp`: Hour bucket
- `query_count`: Queries made

## API Functions

### HTTP Endpoints

**`receiveAlert`** - POST endpoint for RD
```
https://REGION-PROJECT.cloudfunctions.net/receiveAlert

Body:
{
  "timestamp_recorded": 1700000000000,
  "timestamp_sent": 1700000000100,
  "photo_url": "https://...",
  "video_url":  "https://...",
  "rpi_device_id": "RPI_001",
  "location": "Main Entrance"
}
```

### Callable Functions

All callable functions use Firebase SDK from frontend:

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const getAlerts = httpsCallable(functions, 'getAlerts');

const result = await getAlerts({ status: 'active', limit: 50 });
```

**Available Functions:**
- `getAlerts`: Query alerts
- `updateAlertStatus`: Update alert
- `getAlertStats`: Statistics
- `registerDeviceToken`: Register FCM token
- `removeDeviceToken`: Remove FCM token
- `queryAI`: AI agent (rate limited, data isolated)
- `getAILogs`: Fetch AI logs
- `getUpdates`: Get citizen updates (no auth)
- `createUpdate`: Create update (admin only)
- `updateUpdate`, `deleteUpdate`: Manage updates
- `registerOfficer`: Register new officer (admin only)
- `setOfficerRole`: Change officer role (admin only)
- `getOfficerProfile`: Get profile
- `updateLastLogin`: Update login time
- `deactivateOfficer`: Deactivate officer (admin only)

## Security

### Firestore Rules

- **Officers** can read all alerts, update status only
- **Officers** can read own profile only
- **Admins** can manage everything
- **Public** can read published citizen updates
- **AI logs** readable by owner or admin only
- **System collections** (rateLimits, notificationLogs) managed by Cloud Functions only

### AI Agent Restrictions

✅ **Implemented:**
- Must be authenticated officer
- Rate limited to 50 queries/hour per officer
- Can ONLY access alerts provided in `alert_ids` parameter
- Query sanitization (XSS prevention)
- All queries logged for audit

## Local Development

### Firebase Emulators

```bash
firebase emulators:start
```

This starts:
- Firestore: http://localhost:8080
- Functions: http://localhost:5001
- Auth: http://localhost:9099
- Storage: http://localhost:9199
- Emulator UI: http://localhost:4000

### Testing Functions

```bash
cd functions
npm run serve
```

### Logs

```bash
firebase functions:log
```

## Deployment

### First Deployment

```bash
firebase deploy
```

### Incremental Deployments

```bash
# Only Firestore rules
firebase deploy --only firestore:rules,firestore:indexes

# Only Functions
firebase deploy --only functions

# Only Storage rules
firebase deploy --only storage

# Specific function
firebase deploy --only functions:receiveAlert
```

## Environment Variables

Access in Cloud Functions:

```typescript
import * as functions from 'firebase-functions';

const apiKey = functions.config().openrouter.api_key;
```

Set variables:

```bash
firebase functions:config:set service.key="value"
firebase deploy --only functions
```

## Monitoring

- **Firebase Console**: https://console.firebase.google.com/
- **Functions Logs**: Firebase Console → Functions → Logs
- **Firestore Data**: Firebase Console → Firestore Database
- **Auth Users**: Firebase Console → Authentication

## Cost Optimization

- **Free Tier**: 2 million function invocations/month
- **Firestore**: 50K reads, 20K writes, 20K deletes per day
- **Storage**: 5GB, 1GB downloads per day
- **Monitor usage** in Firebase Console

## Security Best Practices

1. **Never expose API keys** in frontend code (use Firebase SDK)
2. **Use custom claims** for role-based access
3. **Test security rules** rigorously
4. **Monitor logs** for suspicious activity
5. **Rotate service account keys** regularly

## Integration with Frontend

See [INTEGRATION.md](./INTEGRATION.md) for detailed frontend integration guide.

## Support

- **Firebase Docs**: https://firebase.google.com/docs
- **OpenRouter Docs**: https://openrouter.ai/docs
- **Firebase Support**: https://firebase.google.com/support
