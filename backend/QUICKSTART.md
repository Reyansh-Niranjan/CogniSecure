# Quick Start Guide

## 🚀 Start Using the Backend in 3 Steps

### 1️⃣ Initialize Convex (One-Time Setup)

```bash
cd backend
npx convex dev
```

This will:
- Create/link Convex project (login required)
- Deploy schema and functions
- Generate API types
- Give you deployment URL

**Save the URL!** You'll need it for frontend integration.

### 2️⃣ Set Environment Variables

In Convex Dashboard (Settings > Environment Variables):

```
OPENROUTER_API_KEY=sk-or-v1-xxxxx
```

(Firebase optional for now - notifications will use placeholder)

### 3️⃣ Share with Teams

Send these to other team members:

- **Convex URL**: `https://your-deployment.convex.cloud`
- **Integration Guide**: `backend/INTEGRATION.md`
- **API Docs**: `backend/README.md`

---

## 📂 What Was Built

```
backend/
├── convex/
│   ├── schema.ts           ✅ 7 database tables
│   ├── alerts.ts           ✅ Alert processing
│   ├── auth.ts             ✅ Officer authentication
│   ├── notifications.ts    ✅ FCM push notifications
│   ├── citizenUpdates.ts   ✅ Public announcements
│   ├── aiAgent.ts          ✅ AI with security restrictions
│   └── http.ts             ✅ Webhook endpoints
├── README.md               ✅ Full documentation
├── INTEGRATION.md          ✅ Frontend integration guide
└── package.json            ✅ Dependencies (installed)
```

---

## 🎯 System Flow

```
┌─────────────┐
│  RPI Zero   │ Motion detected → Object gone
└──────┬──────┘
       │ Captures 5sec video + photo
       │ Uploads to Firebase Storage
       │
       ▼
┌─────────────┐
│     RD      │ Calls: receiveAlert()
│  (Backend)  │ Stores: alert data + timestamps
└──────┬──────┘
       │ Triggers: notifyAllOfficers()
       │
       ├──────────────────┬───────────────────┐
       ▼                  ▼                   ▼
  ┌─────────┐      ┌─────────┐         ┌─────────┐
  │Officer 1│      │Officer 2│   ...   │Officer N│
  │  Phone  │      │  Phone  │         │  Phone  │
  └─────────┘      └─────────┘         └─────────┘
    FCM Push        FCM Push            FCM Push
```

---

## 🔐 AI Agent Security

✅ **Restrictions Implemented:**

1. **Authentication**: Session token required
2. **Rate Limit**: 50 queries/hour per officer
3. **Data Isolation**: Can only see alerts in `include_alert_ids`
4. **No External Access**: Cannot query external data
5. **Audit Log**: Every query logged

**Usage:**
```typescript
const response = await queryAI({
  session_token: "...",
  query: "What pattern do you see?",
  include_alert_ids: ["alert1", "alert2", "alert3"]
});
```

AI gets ONLY those 3 alerts. Nothing else. Ever.

---

## 🏃 Start Development

```bash
# Terminal 1: Backend
cd backend
npm install
npx convex dev

# Terminal 2: Police Dashboard
cd police-dashboard
npm install
npm run dev

# Terminal 3: Citizen Dashboard
cd citizen-dashboard
npm install
npm run dev
```

All components work together via Convex real-time sync!

---

## 📖 Next: Read Full Docs

- **Backend README**: [backend/README.md](file:///c:/Users/DELL/OneDrive/Desktop/cognisecure/backend/README.md)
- **Integration Guide**: [backend/INTEGRATION.md](file:///c:/Users/DELL/OneDrive/Desktop/cognisecure/backend/INTEGRATION.md)
- **Walkthrough**: (in artifacts)

---

## ✨ Features Summary

| Feature | Status | File |
|---------|--------|------|
| Alert Processing | ✅ Complete | alerts.ts |
| Authentication | ✅ Complete | auth.ts |
| FCM Notifications | ✅ Framework Ready | notifications.ts |
| Citizen Updates | ✅ Complete | citizenUpdates.ts |
| AI Agent | ✅ Complete | aiAgent.ts |
| Security Controls | ✅ Complete | All files |
| Audit Logging | ✅ Complete | Schema |
| Documentation | ✅ Complete | README.md, INTEGRATION.md |

**All backend work is complete!** 🎉

Frontend teams can now integrate using the guides provided.
