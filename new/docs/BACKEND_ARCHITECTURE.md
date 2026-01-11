# EcoGuard Backend Architecture

## Overview

EcoGuard uses an **event-driven digital twin architecture** where Kafka is the source of truth for all real-time data. PostgreSQL is used for:
- **Cold storage** (static data, history)
- **Write-back persistence** (critical alerts, risk snapshots)

```
┌─────────────────────────────────────────────────────────────────┐
│                    POSTGRESQL (Read + Write)                     │
│                                                                  │
│  READ (startup):           WRITE (real-time):                   │
│  • Zone definitions        • Alert history ← Kafka Consumer     │
│  • Soil type, slope        • Risk snapshots ← Kafka Consumer    │
│  • NDVI baseline           • SMS delivery log                   │
│  • Historical landslides   • System health log                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
        ┌──────────────────────┴──────────────────────┐
        │ (reads at startup)                          │ (writes real-time)
        ▼                                             │
┌───────────────────────────────────────┐             │
│        KAFKA PRODUCER (Python)        │             │
│  • Reads static data from PostgreSQL  │             │
│  • Ingests NASA GPM rainfall          │             │
│  • Ingests SMAP soil moisture         │             │
│  • Runs ML inference (RF/LSTM)        │             │
│  • Calculates ARI                     │             │
│  • Publishes to Kafka topics          │             │
└───────────────────┬───────────────────┘             │
                    │                                 │
                    ▼                                 │
┌─────────────────────────────────────────────────────┤
│                  KAFKA CLUSTER                      │
│  Topics:                                            │
│  • risk-zones-updates (final processed data)       │
│  • processed-features (ARI, rainfall, soil)        │
│  • alerts (critical zone notifications)            │
└───────────────────┬─────────────────────────────────┘
                    │
        ┌───────────┴───────────┬───────────────────┐
        ▼                       ▼                   ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  WebSocket    │    │    Alert      │    │               │
│  Gateway      │    │   Persister   │    │               │
│               │    │               │    │               │
│ → Dashboard   │    │ → PostgreSQL       │
│               │    │   (write-back)│    │ → PostgreSQL  │
└───────────────┘    └───────┬───────┘    └───────┬───────┘
                             │                    │
                             └────────────────────┘
                                      │
                                      ▼
                             ┌───────────────┐
                             │  PostgreSQL   │
                             │  (write-back) │
                             │               │
                             │ alert_history │
                             │ risk_snapshots│
                             │               │
                             └───────────────┘
```

---

## PostgreSQL Role (Read + Write)

### READ (Cold Storage → Kafka Producer at Startup)

| Table | Purpose |
|-------|---------|
| `zones` | Geographic boundaries |
| `zone_soil` | Soil type (Clay, Loam, etc.) |
| `zone_slope` | Slope angle from DEM |
| `zone_vegetation` | NDVI baseline |
| `historical_landslides` | ML training data |

### WRITE (Kafka Consumers → PostgreSQL in Real-Time)

| Table | Source | Purpose |
|-------|--------|---------|
| `alert_history` | Alert Persister | Audit trail, disaster recovery |
| `risk_snapshots` | Snapshot Service | Historical replay, analysis |
| `sms_log` | SMS Service | Delivery tracking |
| `system_log` | All services | Health monitoring |

---

## Why Write-Back is Critical

| Scenario | Without Write-Back | With Write-Back |
|----------|-------------------|-----------------|
| System crash | Alerts lost forever | Alerts recoverable |
| Audit request | No historical proof | Full alert history |
| Disaster replay | Cannot analyze | Can replay any period |
| Legal compliance | No evidence trail | Complete audit trail |
| Post-mortem | No data | Full reconstruction |

---

## Kafka Consumers

### 1. WebSocket Gateway
- **Consumes**: `risk-zones-updates`, `alerts`
- **Pushes to**: React Dashboard
- **Writes to**: Nothing (stateless)

### 2. Alert Persister (Write-Back)
- **Consumes**: `alerts`
- **Writes to**: `alert_history` table
- **Filters**: CRITICAL and WARNING only
- **Purpose**: Disaster recovery, audit trail

```python
# alert_persister.py
def persist_alert(alert):
    if alert['riskLevel'] in ['CRITICAL', 'WARNING']:
        db.execute("""
            INSERT INTO alert_history 
            (zone_id, risk_level, risk_probability, rainfall_48h, 
             soil_moisture, ari, alert_sent_at)
            VALUES (%s, %s, %s, %s, %s, %s, NOW())
        """, (alert['zoneId'], alert['riskLevel'], ...))
```

### 3. Risk Snapshot Service (Write-Back)
- **Consumes**: `risk-zones-updates`
- **Writes to**: `risk_snapshots` table
- **Frequency**: Every 15 minutes
- **Purpose**: Historical analysis, replay

### 4. SMS Service
- **Consumes**: `alerts`
- **Sends to**: Twilio API
- **Writes to**: `sms_log` table (delivery status)

---

## Kafka Topics

| Topic | Data | Frequency |
|-------|------|-----------|
| `raw-rainfall` | NASA GPM data | Every 30 min |
| `soil-moisture` | NASA SMAP data | Every 2-3 days |
| `processed-features` | ARI, aligned rainfall, soil | Real-time |
| `risk-zones-updates` | Final ML predictions | Real-time |
| `alerts` | Critical zone notifications | On threshold |

---

## Message Format (risk-zones-updates)

```json
{
  "zoneId": "zone-123",
  "coordinates": [11.68, 76.13],
  "rainfall48h": 112.4,
  "rainfallTrend": "increasing",
  "soilMoisture": 91,
  "soilMoistureStatus": "Saturated",
  "soilType": "Clay",
  "ari": 158.3,
  "slopeAngle": 32,
  "ndvi": 0.23,
  "riskProbability": 0.92,
  "riskLevel": "CRITICAL",
  "timestamp": "2026-01-11T10:30:00Z"
}
```

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Kafka Producer | Python + kafka-python |
| ML Inference | scikit-learn / TensorFlow |
| Kafka Cluster | Apache Kafka / Confluent |
| WebSocket Gateway | Node.js (ws) / Spring Boot |
| Alert Persister | Python + psycopg2 |
| Cold Storage | PostgreSQL + PostGIS |
| Frontend | React + TypeScript + Leaflet |

---

## Directory Structure

```
backend/
├── kafka-producer/
│   ├── main.py              # Main producer loop
│   ├── satellite_ingestion.py
│   ├── ari_calculator.py
│   ├── ml_inference.py
│   └── config.py
├── kafka-consumers/
│   ├── alert_persister.py   # Writes alerts to PostgreSQL
│   ├── snapshot_service.py  # Periodic risk snapshots
│   └── sms_service.py       # Twilio integration
├── websocket-gateway/
│   ├── server.js            # WebSocket server
│   └── kafka-consumer.js
├── database/
│   └── schema.sql           # PostgreSQL schema
└── docker-compose.yml
```

---

## ARI (Antecedent Rainfall Index)

ARI is the key algorithm for landslide prediction. It measures **how saturated the soil is** based on rainfall over the past several days.

### Why ARI Matters

Landslides don't happen because of one storm. They happen because:
1. Rain fell 3 days ago → soil absorbed it
2. Rain fell 2 days ago → soil got wetter
3. Rain fell yesterday → soil is now heavy
4. Rain today → **soil can't hold more → LANDSLIDE**

### The Formula

```
ARI = R₀ + (k¹ × R₁) + (k² × R₂) + (k³ × R₃) + ...
```

Where:
- **R₀** = Rainfall today (mm)
- **R₁** = Rainfall yesterday (mm)
- **k** = Decay factor (0.85) - represents soil drainage

### Example

| Day | Rainfall | Weight (k^i) | Contribution |
|-----|----------|--------------|--------------|
| Today | 50mm | 1.0 | 50.0 |
| Yesterday | 30mm | 0.85 | 25.5 |
| 2 days ago | 40mm | 0.72 | 28.8 |
| 3 days ago | 20mm | 0.61 | 12.2 |
| **Total ARI** | | | **116.5** |

### Risk Interpretation

| ARI Value | Risk Level |
|-----------|------------|
| < 50 | SAFE |
| 50-100 | WATCH |
| 100-150 | WARNING |
| > 150 | CRITICAL |

### Code

```python
def calculate_ari(rainfall_list, k=0.85):
    return sum((k**i) * rain for i, rain in enumerate(rainfall_list))
```

**ARI is calculated by the backend (Kafka producer), not the frontend.**
