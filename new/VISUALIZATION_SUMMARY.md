# 🌍 EcoGuardian.AI - Frontend Visualization Summary

## ✅ What Users SEE on Screen

### 1. 🌧️ **Rainfall Intensity**
- **Source**: Kafka topic `risk-zones-updates` → `rainfall48h`
- **Display**: Zone tooltip shows "112.4 mm" (48-hour total)
- **Location**: Hover over any risk zone on map
- **NO calculations** - pure display from Kafka

### 2. 🌡️ **Soil Saturation**
- **Source**: Kafka topic `risk-zones-updates` → `soilMoisture` + `soilMoistureStatus`
- **Display**: Zone tooltip shows "91% - Saturated"
- **Location**: Hover over any risk zone on map
- **NO calculations** - pure display from Kafka

### 3. 🟡🟠🔴 **Landslide Risk**
- **Source**: Kafka topic `risk-zones-updates` → `riskLevel` + `riskProbability`
- **Display**: 
  - Zone circles colored by risk level (green/yellow/orange/red)
  - Zone tooltip shows "CRITICAL - 91%"
- **Location**: Risk zones on map + tooltips
- **NO calculations** - pure display from Kafka

### 4. 🔥 **Glowing Heatmap Overlay**
- **Source**: Kafka topic `risk-zones-updates` → `riskProbability` (0-1)
- **Display**: GPU-accelerated heatmap layer with glow effect
- **Visual Effect**: 
  - Green glow (low risk)
  - Yellow glow (watch)
  - Orange glow (warning)
  - Red glow (critical)
- **Technology**: `leaflet.heat` plugin (GPU-accelerated)
- **NO calculations** - pure visualization mapping:
  ```
  riskProbability (0-1) → heatmap intensity (0-1) → color gradient
  ```

---

## 🔴 Where Data Comes FROM

### ✅ **Correct Flow** (Current Implementation)

```
NASA GPM / SMAP / Sentinel-2
  ↓
Backend Ingestion Service
  ↓
Data Cleaning + Alignment
  ↓
Kafka Topic: processed-features
  ↓
ML + ARI Engine (Backend)
  ↓
Kafka Topic: risk-zones-updates
  ↓
Frontend (Pure Consumer)
  ↓
Visualization (Heatmap + Zones + Tooltips)
```

### ❌ **What Frontend Does NOT Do**

1. ❌ Calculate rainfall sums
2. ❌ Calculate ARI (Antecedent Rainfall Index)
3. ❌ Calculate NDVI
4. ❌ Classify risk levels
5. ❌ Run ML models (Random Forest / LSTM)
6. ❌ Process satellite data
7. ❌ Calculate soil saturation thresholds

**All intelligence lives in backend/Kafka producers!**

---

## 📊 Kafka Topics → UI Mapping

| UI Element | Kafka Topic | Kafka Field | Display Format |
|------------|-------------|-------------|----------------|
| **Heatmap Glow** | `risk-zones-updates` | `riskProbability` | Color intensity (0.0-1.0) |
| **Rainfall Display** | `risk-zones-updates` | `rainfall48h` | "112.4 mm" |
| **Soil Gauge** | `risk-zones-updates` | `soilMoisture` | "91%" |
| **Soil Status** | `risk-zones-updates` | `soilMoistureStatus` | "Saturated" |
| **ARI Bar** | `risk-zones-updates` | `ari` | "158.3" |
| **Risk Level** | `risk-zones-updates` | `riskLevel` | "CRITICAL" |
| **Risk %** | `risk-zones-updates` | `riskProbability` | "91%" |
| **Zone Counts** | `aggregated-stats` | `criticalZones`, etc. | Density Index Card |
| **System Logs** | `system-logs` | `message` | Live Data Ticker |

---

## 🎨 Visual Design

### **Heatmap Glow Effect**
- **Radius**: 40px (larger glow area)
- **Blur**: 25px (smooth professional effect)
- **Min Opacity**: 0.15 (visible even for low-risk areas)
- **Color Gradient**:
  - 0.0 → Transparent (SAFE)
  - 0.2 → Green glow (SAFE)
  - 0.4 → Yellow glow (WATCH)
  - 0.6 → Orange glow (WARNING)
  - 0.8 → Red-orange glow (WARNING)
  - 1.0 → Intense red glow (CRITICAL)

### **Zone Circles**
- Colored by `riskLevel` from Kafka
- Clickable → Opens Analytics Drawer
- Hover → Shows detailed tooltip

### **Tooltip Content**
- Risk Level + Probability %
- Rainfall (48h total)
- Soil Moisture + Status
- ARI (if available)
- Last Update timestamp

---

## 🚀 Real-Time Updates

All visualizations update automatically when Kafka sends new data:
- ✅ Heatmap intensity changes as `riskProbability` updates
- ✅ Zone colors update as `riskLevel` changes
- ✅ Tooltip values refresh as data arrives
- ✅ Density stats update from `aggregated-stats` topic

---

## 📝 Example Kafka Message

```json
{
  "topic": "risk-zones-updates",
  "timestamp": "2024-01-15T10:30:00Z",
  "value": {
    "zoneId": "z-101",
    "center": [11.45, 76.89],
    "radius": 1200,
    
    // ✅ All pre-calculated by backend
    "rainfall48h": 112.4,        // 48-hour total
    "ari": 158.3,                // Antecedent Rainfall Index
    "soilMoisture": 91,          // Percentage
    "soilMoistureStatus": "Saturated",
    "riskLevel": "CRITICAL",     // From ML model
    "riskProbability": 0.91,     // From ML model (for heatmap)
    
    "lastUpdate": "2024-01-15T10:30:00Z"
  }
}
```

---

## ✅ Verification Checklist

- [x] Heatmap uses `riskProbability` from Kafka (NO calculations)
- [x] Rainfall displays `rainfall48h` from Kafka (NO sums)
- [x] ARI displays from Kafka (NO calculations)
- [x] Risk levels display from Kafka (NO classifications)
- [x] Soil moisture displays from Kafka (NO thresholds)
- [x] All data comes from Kafka topics
- [x] Frontend is pure consumer/visualizer
- [x] Professional glow effect implemented
- [x] GPU-accelerated rendering (leaflet.heat)

---

**The frontend is a pure visualization layer. All intelligence lives in backend/Kafka!** 🎯
