# 🧪 Mock Data Testing Guide

## Quick Test Setup

The heatmap can now be tested with mock data without requiring Kafka connection.

---

## How to Test

### **1. Enable Mock Data**

In `src/components/map/MapView.tsx`, mock data is enabled by default:

```typescript
const USE_MOCK_DATA = true; // Set to false when Kafka is ready
```

### **2. View the Heatmap**

1. **Select a Region/Place** in the sidebar (e.g., California → San Francisco)
2. **Zoom in** (zoom level >= 10)
3. **See the heatmap** appear with:
   - 🔵 Blue areas (low risk)
   - 🟢 Green areas (safe)
   - 🟡 Yellow areas (watch)
   - 🟠 Orange areas (warning)
   - 🔴 Red areas (critical)

### **3. Mock Data Features**

- ✅ **25 zones** generated around selected location
- ✅ **Varying risk probabilities** (0.0 - 1.0)
- ✅ **Live updates** every 3 seconds (simulates Kafka stream)
- ✅ **All fields populated**:
  - `riskProbability` (for heatmap)
  - `riskLevel` (for zone colors)
  - `rainfall48h` (for tooltip)
  - `soilMoisture` (for tooltip)
  - `ari` (for tooltip)

---

## Mock Data Structure

```typescript
{
  id: "mock-zone-0",
  center: [37.7749, -122.4194], // Random position around center
  radius: 800-1200,              // Random radius
  
  // Risk data (for heatmap)
  riskProbability: 0.0-1.0,      // Random probability
  riskLevel: "SAFE" | "WATCH" | "WARNING" | "CRITICAL",
  
  // Rainfall (for tooltip)
  rainfall48h: 0-150mm,          // Based on riskProbability
  
  // Soil (for tooltip)
  soilMoisture: 50-100%,          // Based on riskProbability
  soilMoistureStatus: "Dry" | "Normal" | "Wet" | "Saturated",
  
  // Environmental (for tooltip)
  ari: 0-200,                     // Based on riskProbability
  slopeAngle: 0-45°,              // Based on riskProbability
  ndvi: 0.3-0.8,                  // Inverse of riskProbability
  
  lastUpdate: new Date()
}
```

---

## Testing Different Scenarios

### **Test Low Risk Areas**
- Mock zones with `riskProbability < 0.3`
- Should show: Blue/Green heatmap colors

### **Test Medium Risk Areas**
- Mock zones with `riskProbability 0.3-0.8`
- Should show: Yellow/Orange heatmap colors

### **Test High Risk Areas**
- Mock zones with `riskProbability > 0.8`
- Should show: Red heatmap colors

### **Test Live Updates**
- Zones update every 3 seconds
- Watch heatmap colors change as risk probabilities vary

---

## Switch to Kafka

When Kafka is ready, simply change:

```typescript
const USE_MOCK_DATA = false; // Use real Kafka data
```

The component will automatically switch to `useKafkaZones`.

---

## Mock Data Locations

Mock zones are generated around:
- **Default**: San Francisco `[37.7749, -122.4194]`
- **Or**: Current map center when region/place is selected

To test different locations:
1. Select a region/place in sidebar
2. Mock zones will generate around that location's coordinates

---

## Expected Visual Result

You should see:
- ✅ Smooth gradient heatmap overlay
- ✅ Blue → Green → Yellow → Orange → Red colors
- ✅ Zone circles colored by risk level
- ✅ Tooltips showing rainfall, soil moisture, ARI
- ✅ Heatmap updates every 3 seconds

**Perfect for testing the visualization before connecting Kafka!** 🎯
