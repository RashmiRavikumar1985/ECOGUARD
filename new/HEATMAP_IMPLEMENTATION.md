# Risk Heatmap Implementation

## ✅ What Was Implemented

### **RiskHeatmap Component** (`src/components/map/RiskHeatmap.tsx`)
- Pure visualization component
- Converts `riskProbability` (0-1) from Kafka → heatmap intensity
- Uses `leaflet.heat` plugin for GPU-accelerated rendering
- NO calculations - only probability → intensity mapping

### **How It Works**

```
Kafka Message (risk-zones-updates)
  ↓
riskProbability: 0.91 (from ML model)
  ↓
Frontend Mapping
  ↓
Heatmap Intensity: 0.91
  ↓
GPU Rendering (leaflet.heat)
  ↓
Visual Heatmap (red = high risk)
```

### **Color Gradient Mapping**

| Risk Probability | Color | Risk Level |
|-----------------|-------|------------|
| 0.0 | transparent | SAFE |
| 0.3 | green | WATCH |
| 0.6 | yellow | WARNING |
| 0.8 | orange | WARNING |
| 1.0 | red | CRITICAL |

**This is pure visualization - NO calculations!**

---

## 📋 Kafka Message Format Required

### **Topic: `risk-zones-updates`**

```json
{
  "topic": "risk-zones-updates",
  "timestamp": "2024-01-15T10:30:00Z",
  "value": {
    "zoneId": "z-101",
    "center": [11.45, 76.89],
    "radius": 1200,
    
    // ✅ All pre-calculated by backend
    "rainfall48h": 112.4,        // 48-hour rainfall total (from processed-features)
    "ari": 158.3,                // Antecedent Rainfall Index (from processed-features)
    "soilMoisture": 91,          // Percentage (from SMAP)
    "soilMoistureStatus": "Saturated", // From threshold logic
    "riskLevel": "CRITICAL",     // From ML model
    "riskProbability": 0.91,     // From ML model (0-1)
    
    "lastUpdate": "2024-01-15T10:30:00Z"
  }
}
```

---

## 🎨 Frontend Display Mapping

| UI Widget | Kafka Field | Display Format |
|-----------|-------------|----------------|
| **Heatmap** | `riskProbability` | Color intensity (0.0-1.0) |
| **Zone Tooltip - Rainfall** | `rainfall48h` | "112.4 mm" |
| **Zone Tooltip - ARI** | `ari` | "158.3" |
| **Zone Tooltip - Soil** | `soilMoisture` | "91%" |
| **Zone Tooltip - Risk** | `riskLevel` | "CRITICAL" |
| **Zone Tooltip - Probability** | `riskProbability` | "91%" |

---

## ✅ What Frontend Does

1. ✅ Receives `riskProbability` from Kafka
2. ✅ Maps probability → heatmap intensity (direct 1:1 mapping)
3. ✅ Renders heatmap using GPU-accelerated `leaflet.heat`
4. ✅ Displays values in tooltips (NO calculations)

---

## ❌ What Frontend Does NOT Do

1. ❌ Calculate rainfall sums
2. ❌ Calculate ARI
3. ❌ Classify risk levels
4. ❌ Run ML models
5. ❌ Process satellite data

**All intelligence lives in backend/Kafka!**

---

## 🔧 Configuration

### **Heatmap Settings** (in `RiskHeatmap.tsx`)

```typescript
{
  radius: 30,        // Heat point radius (pixels)
  blur: 20,          // Blur radius (pixels)
  maxZoom: 18,       // Max zoom level
  minOpacity: 0.1,   // Minimum opacity
  gradient: {        // Probability → Color mapping
    0.0: "transparent",
    0.3: "green",
    0.6: "yellow",
    0.8: "orange",
    1.0: "red"
  }
}
```

### **Toggle Heatmap**

Heatmap can be toggled via `showHeatmap` prop in `MapView`:
```typescript
<MapView showHeatmap={true} ... />
```

---

## 🚀 Usage

The heatmap automatically:
- ✅ Appears when zones are available from Kafka
- ✅ Updates in real-time as new zone data arrives
- ✅ Only shows when zoomed in (zoom >= 10)
- ✅ Uses GPU acceleration for smooth rendering

---

## 📝 Notes

- Heatmap uses `leaflet.heat` plugin (already in `package.json`)
- Renders below zone circles (zones are clickable, heatmap is background)
- Updates automatically when Kafka sends new zone data
- No performance impact - GPU-accelerated rendering
