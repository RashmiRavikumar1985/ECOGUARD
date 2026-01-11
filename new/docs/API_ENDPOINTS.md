# EcoGuard API Endpoints

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    REAL-TIME (Kafka → WebSocket)                 │
│  • Risk zone updates    • Alerts    • Live environmental data   │
│  Frontend connects via WebSocket - NO REST calls for live data  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    STATIC DATA (REST API)                        │
│  • Zone definitions    • Historical data    • User settings     │
│  Called once at startup or on-demand - NOT for real-time        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. WebSocket Endpoints (Real-Time)

### Primary WebSocket Connection
```
ws://api.ecoguard.io/stream
```

**Purpose**: Single WebSocket connection for ALL real-time data from Kafka

**Authentication**: Bearer token in connection header
```javascript
const ws = new WebSocket('ws://api.ecoguard.io/stream', {
  headers: { 'Authorization': 'Bearer <token>' }
});
```

### Message Types (Server → Client)

#### 1.1 Zone Risk Update
```json
{
  "type": "ZONE_UPDATE",
  "payload": {
    "zoneId": "wayanad-001",
    "coordinates": [11.68, 76.13],
    "rainfall48h": 112.4,
    "rainfallTrend": "increasing",
    "soilMoisture": 91,
    "soilMoistureStatus": "Saturated",
    "soilType": "Clay",
    "ari": 158.3,
    "slopeAngle": 32.5,
    "ndvi": 0.45,
    "riskProbability": 0.92,
    "riskLevel": "CRITICAL",
    "timestamp": "2026-01-11T10:30:00Z"
  }
}
```

#### 1.2 Batch Update (Initial Load)
```json
{
  "type": "BATCH_UPDATE",
  "payload": {
    "zones": [
      { "zoneId": "wayanad-001", ... },
      { "zoneId": "wayanad-002", ... }
    ],
    "stats": {
      "totalZones": 150,
      "criticalCount": 12,
      "warningCount": 28,
      "avgIntensity": 0.65
    }
  }
}
```

#### 1.3 Alert Notification
```json
{
  "type": "ALERT",
  "payload": {
    "alertId": "alert-12345",
    "zoneId": "wayanad-001",
    "zoneName": "Wayanad Sector 1",
    "riskLevel": "CRITICAL",
    "riskProbability": 0.92,
    "message": "Zone crossed critical threshold - Immediate evacuation recommended",
    "factors": {
      "rainfall48h": 112.4,
      "soilMoisture": 91,
      "ari": 158.3
    },
    "timestamp": "2026-01-11T10:30:00Z"
  }
}
```

#### 1.4 Stats Update
```json
{
  "type": "STATS_UPDATE",
  "payload": {
    "activePoints": 1248,
    "avgIntensity": 72,
    "criticalZones": 12,
    "warningZones": 28,
    "watchZones": 45,
    "safeZones": 65,
    "timestamp": "2026-01-11T10:30:00Z"
  }
}
```

#### 1.5 Ticker Log Entry
```json
{
  "type": "TICKER",
  "payload": {
    "id": "tick-12345",
    "message": "NASA GPM: Packet Received (4KB)",
    "timestamp": "2026-01-11T10:30:00Z"
  }
}
```

### Message Types (Client → Server)

#### Subscribe to Region
```json
{
  "type": "SUBSCRIBE",
  "payload": {
    "countryId": "in",
    "regionId": "Kerala",
    "coordinates": [11.68, 76.13],
    "radius": 50
  }
}
```

#### Unsubscribe
```json
{
  "type": "UNSUBSCRIBE",
  "payload": {
    "subscriptionId": "sub-12345"
  }
}
```

---

## 2. REST API Endpoints (Static Data)

Base URL: `https://api.ecoguard.io/v1`

### 2.1 Zone Definitions (Static)

**GET** `/zones`
```
GET /v1/zones?country=in&region=Kerala
```

Response:
```json
{
  "zones": [
    {
      "id": "wayanad-001",
      "name": "Wayanad Sector 1",
      "coordinates": [11.68, 76.13],
      "radius": 1000,
      "soilType": "Clay",
      "slopeAngle": 32.5,
      "ndviBaseline": 0.45
    }
  ],
  "total": 150
}
```

### 2.2 Historical Landslides (For ML Training)

**GET** `/historical/landslides`
```
GET /v1/historical/landslides?country=in&region=Kerala&from=2020-01-01&to=2025-12-31
```

Response:
```json
{
  "events": [
    {
      "id": 1,
      "location": [11.65, 76.10],
      "date": "2024-07-30",
      "rainfallPrior": 180.5,
      "soilMoisturePrior": 95,
      "slopeAngle": 38,
      "fatalities": 12
    }
  ],
  "total": 45
}
```

### 2.3 Alert History

**GET** `/alerts/history`
```
GET /v1/alerts/history?zone=wayanad-001&from=2026-01-01&limit=100
```

Response:
```json
{
  "alerts": [
    {
      "id": "alert-12345",
      "zoneId": "wayanad-001",
      "riskLevel": "CRITICAL",
      "riskProbability": 0.92,
      "timestamp": "2026-01-11T10:30:00Z",
      "acknowledged": true
    }
  ],
  "total": 25
}
```

### 2.4 User Settings

**GET** `/user/settings`
```json
{
  "notifications": {
    "sms": true,
    "email": true,
    "push": true
  },
  "alertThreshold": "WARNING",
  "subscribedZones": ["wayanad-001", "wayanad-002"]
}
```

**PUT** `/user/settings`
```json
{
  "notifications": {
    "sms": true,
    "email": false
  },
  "alertThreshold": "CRITICAL"
}
```

---

## 3. External APIs (Data Sources)

### 3.1 NASA GPM (Rainfall)
```
https://gpm1.gesdisc.eosdis.nasa.gov/data/GPM_L3/
```
- Frequency: Every 30 minutes
- Auth: NASA Earthdata token
- Used by: Kafka Producer (backend only)

### 3.2 NASA SMAP (Soil Moisture)
```
https://n5eil01u.ecs.nsidc.org/SMAP/
```
- Frequency: Every 2-3 days
- Auth: NASA Earthdata token
- Used by: Kafka Producer (backend only)

### 3.3 Nominatim (Geocoding)
```
https://nominatim.openstreetmap.org/search
```
- Used by: Frontend (GlobalSearch component)
- No auth required
- Rate limit: 1 request/second

### 3.4 Map Tiles

**Terrain (CartoDB Dark)**:
```
https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
```

**Satellite (Esri)**:
```
https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
```

---

## 4. Kafka Topics (Internal)

| Topic | Producer | Consumer | Data |
|-------|----------|----------|------|
| `raw-rainfall` | Satellite Ingestion | ML Engine | NASA GPM data |
| `soil-moisture` | Satellite Ingestion | ML Engine | NASA SMAP data |
| `processed-features` | ML Engine | Risk Calculator | ARI, aligned data |
| `risk-zones-updates` | Risk Calculator | WebSocket Gateway | Final predictions |
| `alerts` | Risk Calculator | WebSocket Gateway, SMS Service | Critical alerts |

---

## 5. Authentication

### WebSocket
```javascript
// Connect with token
const ws = new WebSocket('ws://api.ecoguard.io/stream');
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'AUTH',
    payload: { token: 'Bearer <jwt_token>' }
  }));
};
```

### REST API
```
Authorization: Bearer <jwt_token>
```

---

## 6. Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 1001 | AUTH_FAILED | Invalid or expired token |
| 1002 | SUBSCRIPTION_FAILED | Could not subscribe to region |
| 2001 | ZONE_NOT_FOUND | Zone ID does not exist |
| 2002 | REGION_NOT_FOUND | Region not available |
| 3001 | RATE_LIMITED | Too many requests |
| 5001 | KAFKA_UNAVAILABLE | Kafka cluster unreachable |

---

## 7. Rate Limits

| Endpoint | Limit |
|----------|-------|
| WebSocket messages | 100/minute |
| REST API | 60/minute |
| Nominatim geocoding | 1/second |
