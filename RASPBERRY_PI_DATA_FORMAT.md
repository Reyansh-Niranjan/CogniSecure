# Raspberry Pi Data Format for CogniSecure

This document defines the JSON data format that the Raspberry Pi should send to the Firebase Firestore database to report new incidents.

## Target Collection
**Collection Name:** `incidents`

## JSON Schema

The Raspberry Pi should generate a JSON object with the following fields for each detected incident.

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `type` | String | The category of the incident. | `"Suspicious Activity"`, `"Traffic Violation"`, `"Theft"`, `"Vandalism"` |
| `priority` | String | Urgency level. | `"high"`, `"medium"`, `"low"` |
| `status` | String | Initial status of the incident. | `"active"` |
| `location` | String | Physical location of the detection. | `"Camera 04 - North Gate"`, `"Downtown Plaza"` |
| `timestamp` | Timestamp | Server timestamp is preferred, or ISO 8601 string. | `new Date().toISOString()` |
| `description` | String | Brief description of what was detected. | `"Person detected loitering for > 5 mins"` |

### Optional / Media Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `mediaUrl` | String | URL to the uploaded video clip. | `"https://storage.googleapis.com/.../video.mp4"` |
| `mediaType` | String | Type of media. | `"video"` or `"image"` |
| `snapshotUrl` | String | URL to a thumbnail or snapshot image. | `"https://storage.googleapis.com/.../thumb.jpg"` |
| `confidence` | Number | AI confidence score (0-100). | `94.5` |
| `metadata` | Object | Additional technical details. | `{ "camera_id": "cam_04", "model_version": "v2.1" }` |

---

## Sample JSON Payload

```json
{
  "type": "Suspicious Activity",
  "priority": "high",
  "status": "active",
  "location": "Main Entrance - Camera 01",
  "timestamp": "2025-11-23T10:30:00.000Z",
  "description": "Unidentified individual attempting to force entry.",
  "mediaUrl": "https://storage.googleapis.com/cogni-bucket/videos/inc_123.mp4",
  "mediaType": "video",
  "snapshotUrl": "https://storage.googleapis.com/cogni-bucket/snapshots/inc_123.jpg",
  "confidence": 98.2,
  "metadata": {
    "camera_id": "CAM-01",
    "ai_model": "yolo-v8-custom"
  }
}
```

## Integration Logic (Node.js Example)

If you are running a Node.js script on the Raspberry Pi:

```javascript
const admin = require('firebase-admin');
// Initialize with service account...
const db = admin.firestore();

async function reportIncident(incidentData) {
  try {
    // Add a new document with an auto-generated ID
    const res = await db.collection('incidents').add({
      ...incidentData,
      timestamp: admin.firestore.FieldValue.serverTimestamp() // Use server time
    });
    console.log('Incident reported with ID:', res.id);
  } catch (error) {
    console.error('Error reporting incident:', error);
  }
}
```
