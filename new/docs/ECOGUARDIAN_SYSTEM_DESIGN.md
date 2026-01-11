# EcoGuardian.AI - Landslide Prediction System Design

## 1. Problem Statement

Landslides cause thousands of fatalities and economic losses yearly. Traditional monitoring relies on manual inspections and hardware sensors which are costly and geographically limited.

**EcoGuardian.AI Solution**: A software-driven predictive system using satellite data, machine learning, and spatial analytics - NO physical sensors required.

---

## 2. System Architecture (Digital Twin)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SATELLITE APIs (Virtual Sensors)                 │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────┤
│  NASA GPM   │  NASA SMAP  │ SRTM/ALOS   │ Sentinel-2  │ NASA LHASA  │
│  (Rainfall) │  (Soil)     │ (Elevation) │ (NDVI)      │ (Historical)│
│  30 min     │  2-3 days   │  Static     │  5 days     │  Training   │
└──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┘
       │             │             │             │             │
       └─────────────┴─────────────┼─────────────┴─────────────┘
                                   ▼
                    ┌──────────────────────────────┐
                    │   DATA INGESTION & PREPROCESSING   │
                    │  • Temporal alignment              │
                    │  • Raster reprojection             │
                    │  • Interpolation for missing data  │
                    │  • Standardization for ML          │
                    └──────────────┬───────────────┘
                                   ▼
                    ┌──────────────────────────────┐
                    │      FEATURE ENGINEERING           │
                    │  • ARI (Antecedent Rainfall Index) │
                    │  • Slope Computation (from DEM)    │
                    │  • Vegetation Factor (NDVI)        │
                    │  • Soil Saturation Estimation      │
                    └──────────────┬───────────────┘
                                   ▼
                    ┌──────────────────────────────┐
                    │      ML INFERENCE ENGINE           │
                    │  • Random Forest (baseline)        │
                    │  • LSTM (time-series prediction)   │
                    │  • Risk Classification             │
                    └──────────────┬───────────────┘
                                   ▼
                    ┌──────────────────────────────┐
                    │   RISK RASTER & HEATMAP GEN        │
                    │  • Google Earth Engine             │
                    │  • Mapbox GL JS rendering          │
                    └──────────────┬───────────────┘
                                   ▼
                    ┌──────────────────────────────┐
                    │         USER ALERTS                │
                    │  • Web Dashboard (Eco Guard)       │
                    │  • SMS Alerts (Twilio)             │
                    └──────────────────────────────┘
```

---

## 3. Data Sources (Virtual Sensors)

| Data Type | Source | Frequency | Purpose |
|-----------|--------|-----------|---------|
| Rainfall | NASA GPM IMERG | Every 30 mins | Trigger events for potential slides |
| Soil Moisture | NASA SMAP | Every 2-3 days | Pre-condition soil saturation |
| Elevation | SRTM 30m | Static | Compute slope and runout paths |
| Vegetation | Sentinel-2 NDVI | Every 5 days | Adjust risk for vegetation coverage |
| Historical Landslides | NASA LHASA | Historical | Train predictive ML models |

---

## 4. Feature Engineering

### A. Antecedent Rainfall Index (ARI)

The key insight: Landslides don't happen from one storm - they happen because soil was already saturated from rain days ago.

**Formula (Decay Function)**:
```
API_t = R_t + Σ(k^i × R_{t-i})
```

Where:
- `R_t` = Rainfall today
- `k` = Recession coefficient (0.85) - represents soil drainage over time
- If `API_t` exceeds regional threshold → trigger alarm

**Implementation**:
```python
def calculate_ari(rainfall_list, k=0.85):
    return sum((k**i) * rain for i, rain in enumerate(rainfall_list))
```

### B. Terrain Slope Computation

Using DEM (SRTM):
```python
import richdem as rd
dem = rd.LoadGDAL("srtm.tif")
slope = rd.TerrainAttribute(dem, attrib="slope_degrees")
high_risk_slopes = slope > 25  # Degrees
```

### C. Vegetation Index (NDVI)

NDVI reduces landslide risk in forested areas:
```python
risk_modifier = 1 - NDVI  # Forested = lower risk
```

### D. Soil Saturation Estimation

Combines ARI with SMAP soil moisture to quantify water load in soil layers.

---

## 5. ML Model

### Input Features:
1. ARI (Antecedent Rainfall Index)
2. 48hr Rainfall
3. Soil Moisture (SMAP)
4. Slope Angle (from DEM)
5. NDVI (vegetation)
6. Elevation

### Model Options:
- **Random Forest**: Baseline, interpretable, robust with sparse data
- **LSTM**: Captures temporal ARI trends for time-series predictions

### Training:
```python
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=12,
    class_weight='balanced'
)
model.fit(X_train, y_train)
```

### Risk Classification:

| Probability | Status | Color |
|-------------|--------|-------|
| < 0.3 | SAFE | Green |
| 0.3 - 0.6 | WATCH | Yellow |
| 0.6 - 0.8 | WARNING | Orange |
| > 0.8 | CRITICAL | Red |

---

## 6. Heatmap Visualization

### Layers:
1. **Susceptibility (Static)**: High slopes + weak soil
2. **Hazard (Dynamic)**: ARI + SMAP data
3. **Heatmap Rendering**: GEE raster → Mapbox/Leaflet frontend

### Color Scheme:
- 🟢 Green = Safe
- 🟡 Yellow = Soil saturation rising
- 🔴 Red = Immediate hazard

### Mapbox Implementation:
```javascript
map.addLayer({
  id: 'risk-heat',
  type: 'heatmap',
  source: 'risk-tiles',
  paint: {
    'heatmap-intensity': 1.5,
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'green',
      0.5, 'yellow',
      1, 'red'
    ]
  }
});
```

---

## 7. Frontend Implementation Plan (Eco Guard)

### Phase 1: Data Services
```
new/src/services/
├── satelliteDataService.ts   # Fetch NASA GPM, SMAP data
├── ariCalculator.ts          # Calculate Antecedent Rainfall Index
├── riskCalculator.ts         # Combine features → risk score
└── websocketService.ts       # Real-time updates
```

### Phase 2: Heatmap Components
```
new/src/components/map/
├── RiskHeatmapLayer.tsx      # Leaflet heatmap overlay
├── RiskTooltip.tsx           # Zone details on hover
└── LayerControls.tsx         # Toggle layers
```

### Phase 3: Data Types
```typescript
// new/src/types/risk.ts
export type RiskLevel = 'safe' | 'watch' | 'warning' | 'critical';

export type ZoneRisk = {
  zone_id: string;
  coordinates: [number, number];
  risk_score: number;        // 0-1
  risk_level: RiskLevel;
  factors: {
    ari: number;             // Antecedent Rainfall Index
    rainfall_48h: number;    // mm
    soil_moisture: number;   // %
    slope: number;           // degrees
    ndvi: number;            // 0-1
    elevation: number;       // meters
  };
  timestamp: string;
};
```

### Phase 4: Mock Data for Development
```typescript
// Generate mock risk data for testing
function generateMockRiskData(center: [number, number], count: number): ZoneRisk[] {
  return Array.from({ length: count }, (_, i) => ({
    zone_id: `zone_${i}`,
    coordinates: [
      center[0] + (Math.random() - 0.5) * 2,
      center[1] + (Math.random() - 0.5) * 2
    ],
    risk_score: Math.random(),
    risk_level: getRiskLevel(Math.random()),
    factors: {
      ari: Math.random() * 100,
      rainfall_48h: Math.random() * 200,
      soil_moisture: Math.random() * 100,
      slope: Math.random() * 45,
      ndvi: Math.random(),
      elevation: Math.random() * 2000
    },
    timestamp: new Date().toISOString()
  }));
}
```

---

## 8. Advanced Features

### A. Shadow-Model Verification
Compares current rainfall to 10-year historical maximum to detect rare extreme events.

### B. Explainable AI (XAI)
SHAP or rule-based explanations:
> "Risk 92% — 48hr Rainfall exceeds 10-year historical threshold"

### C. Low-Bandwidth SMS Alerts
```python
from twilio.rest import Client
msg = f"⚠ LANDSLIDE ALERT\nRisk: CRITICAL\nLocation: 11.45N, 76.89E"
client.messages.create(body=msg, from_='+1XXXX', to='+91XXXXXXXXXX')
```

---

## 9. Implementation Roadmap

### Week 1: Foundation
- [ ] Set up mock data service
- [ ] Create risk types and interfaces
- [ ] Implement ARI calculator (frontend mock)

### Week 2: Heatmap
- [ ] Add Leaflet heatmap layer
- [ ] Implement risk color mapping
- [ ] Add zone tooltips on hover

### Week 3: Real Data Integration
- [ ] Connect to NASA GPM API
- [ ] Connect to NASA SMAP API
- [ ] Implement data preprocessing

### Week 4: ML Integration
- [ ] Set up Python backend for ML inference
- [ ] Connect frontend to prediction API
- [ ] Add real-time WebSocket updates

---

## 10. Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + TypeScript + Leaflet |
| Map Tiles | CartoDB Dark / Mapbox |
| Heatmap | leaflet.heat / custom canvas |
| Data APIs | NASA Earthdata (GPM, SMAP) |
| ML Backend | Python + scikit-learn / TensorFlow |
| Real-time | WebSocket / Kafka |
| Alerts | Twilio SMS |

---

## Next Steps

1. **Start with mock data** - Generate fake risk zones to test heatmap
2. **Implement heatmap layer** - Use leaflet.heat or custom canvas
3. **Add layer controls** - Toggle between risk layers
4. **Connect real APIs** - NASA GPM for rainfall data
