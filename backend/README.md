# CogniSecure Backend

Convex backend for the CogniSecure security surveillance system.

## Overview

This backend handles:
- **Alert Processing**: Receives alerts from Raspberry Pi devices via RD (relay device)
- **Authentication**: Police officer authentication with passkey/face scan support
- **Notifications**: Push notifications to police officers via Firebase Cloud Messaging
- **AI Agent**: OpenRouter-powered AI assistant with strict security restrictions
- **Citizen Updates**: Public announcements and safety information
- **Audit Logging**: Comprehensive logging of all system activities

## Project Structure

```
backend/
├── convex/
│   ├── schema.ts              # Database schema definitions
│   ├── alerts.ts              # Alert processing and queries
│   ├── auth.ts                # Authentication and session management
│   ├── notifications.ts       # FCM push notification system
│   ├── citizenUpdates.ts      # Public updates management
│   ├── aiAgent.ts             # AI agent with security restrictions
│   └── tsconfig.json          # TypeScript config for Convex
├── package.json
└── tsconfig.json
```

## Setup

### Prerequisites

- Node.js 18+ installed
- Convex account (signup at [convex.dev](https://convex.dev))
- Firebase project with Cloud Messaging enabled
- OpenRouter API key

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Initialize Convex:
```bash
npx convex dev
```

This will:
- Create a new Convex project (or link to existing)
- Generate API types in `convex/_generated/`
- Start the development server

3. Set environment variables in Convex dashboard:
   - `OPENROUTER_API_KEY`: Your OpenRouter API key
   - `FIREBASE_SERVICE_ACCOUNT`: Firebase service account JSON (base64 encoded)

## Database Schema

### Tables

- **alerts**: Incident alerts from RPI devices with photos/videos
- **police_officers**: Officer profiles and authentication data
- **sessions**: Active sessions for authenticated officers
- **citizen_updates**: Public announcements and safety information
- **ai_agent_logs**: Audit trail for AI agent queries
- **notification_logs**: Notification delivery tracking
- **rate_limits**: Rate limiting for AI agent queries

## API Reference

### Alerts

- `receiveAlert`: Receive alert from RD with photo/video URLs
- `getActiveAlerts`: Get all unresolved alerts
- `getAlertById`: Get specific alert details
- `updateAlertStatus`: Mark alert as acknowledged/resolved
- `getAlertHistory`: Query historical alerts with filters
- `getAlertStats`: Get alert statistics

### Authentication

- `registerOfficer`: Register new police officer
- `createSession`: Create authenticated session
- `validateSession`: Validate session token
- `invalidateSession`: Logout (invalidate session)
- `storePasskey`: Store passkey credentials
- `storeFaceScan`: Store face scan reference
- `registerFCMToken`: Register device for push notifications

### Notifications

- `notifyAllOfficers`: Send FCM push to all active officers
- `retryFailedNotification`: Retry failed notification delivery

### Citizen Updates

- `createUpdate`: Create new public update
- `getRecentUpdates`: Get latest updates (no auth required)
- `getUpdatesByCategory`: Filter updates by category
- `updateUpdate`: Edit existing update
- `deleteUpdate`: Remove update

### AI Agent

- `queryAIAgent`: Query AI with security restrictions
  - Requires valid session token
  - Rate limited to 50 queries/hour
  - AI can only access provided alert data
  - All queries logged for audit

## Security Features

### AI Agent Restrictions

1. **Authentication Required**: Must provide valid session token
2. **Rate Limiting**: Max 50 queries per hour per officer
3. **Data Isolation**: AI can ONLY access alerts explicitly provided in `include_alert_ids`
4. **Query Sanitization**: Removes script injection attempts
5. **Audit Logging**: All queries logged with timestamp, officer, and context
6. **No External Access**: AI cannot query external data or make assumptions

### Session Management

- 24-hour session expiration
- IP address and user agent tracking
- Manual invalidation support

## Integration with Frontend

The dashboards (police and citizen) will integrate with this backend via:

```typescript
import { ConvexProvider, useQuery, useMutation, useAction } from "convex/react";
import { api } from "./convex/_generated/api";

// Example: Query alerts
const alerts = useQuery(api.alerts.getActiveAlerts);

// Example: Update alert status
const updateStatus = useMutation(api.alerts.updateAlertStatus);

// Example: Query AI agent
const queryAI = useAction(api.aiAgent.queryAIAgent);
```

## Deployment

1. Deploy to production:
```bash
npx convex deploy
```

2. Update environment variables in Convex production dashboard

3. Get production URL and update frontend `.env`:
```
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

## Firebase Integration

### Required Setup

1. Create Firebase project
2. Enable Cloud Messaging
3. Download service account JSON
4. Base64 encode and set as environment variable
5. Frontend apps need to register FCM tokens via `registerFCMToken`

## OpenRouter Integration

The AI agent uses OpenRouter for LLM access. To connect:

1. Get API key from [openrouter.ai](https://openrouter.ai)
2. Set `OPENROUTER_API_KEY` in Convex environment
3. Uncomment actual API call in `aiAgent.ts` `callOpenRouter` function

## Monitoring

- Check Convex dashboard for function logs
- Monitor `ai_agent_logs` table for AI usage
- Check `notification_logs` for delivery status
- Use `getAlertStats` for system health metrics

## License

Private - CogniSecure Project
