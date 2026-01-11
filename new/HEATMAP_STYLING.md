# 🔥 Professional Heatmap Styling Guide

## Visual Style Reference

The heatmap is styled to match professional disaster visualization systems:
- **Google Flood Hub** - Smooth gradient heatmaps
- **NASA Worldview** - Blue-to-red color schemes
- **ECMWF** - Professional meteorological visualizations

---

## Color Gradient Scheme

### **Risk Probability → Color Mapping**

| Risk Probability | Color | RGBA | Risk Level | Visual Effect |
|-----------------|-------|------|------------|---------------|
| 0.0 | Blue | `rgba(59, 130, 246, 0)` | SAFE | Transparent |
| 0.1 | Blue | `rgba(59, 130, 246, 0.2)` | SAFE | Subtle blue glow |
| 0.2 | Green | `rgba(34, 197, 94, 0.4)` | SAFE | Green glow |
| 0.3 | Green | `rgba(34, 197, 94, 0.5)` | SAFE | Stronger green |
| 0.4 | Yellow | `rgba(234, 179, 8, 0.6)` | WATCH | Yellow glow |
| 0.5 | Yellow | `rgba(234, 179, 8, 0.7)` | WATCH | Stronger yellow |
| 0.6 | Orange | `rgba(249, 115, 22, 0.75)` | WARNING | Orange glow |
| 0.7 | Orange | `rgba(249, 115, 22, 0.8)` | WARNING | Stronger orange |
| 0.8 | Red-Orange | `rgba(239, 68, 68, 0.85)` | WARNING | Red-orange glow |
| 0.9 | Red | `rgba(239, 68, 68, 0.9)` | CRITICAL | Intense red |
| 1.0 | Deep Red | `rgba(220, 38, 38, 1.0)` | CRITICAL | Maximum intensity |

---

## Technical Settings

### **Heatmap Parameters**

```typescript
{
  radius: 50,        // Larger radius for smoother coverage
  blur: 30,         // More blur for professional smooth gradient
  maxZoom: 18,       // Maximum zoom level
  minOpacity: 0.2,   // Minimum opacity for visibility
}
```

### **Visual Effects**

- **Smooth Blending**: Uses `mix-blend-mode: screen` for professional overlay effect
- **Gradient Transitions**: 11 color stops for ultra-smooth color transitions
- **GPU Acceleration**: Uses `leaflet.heat` plugin for hardware-accelerated rendering

---

## Comparison with Reference Systems

### **Google Flood Hub Style**
- ✅ Smooth gradient transitions
- ✅ Blue-to-red color scheme
- ✅ Large radius for coverage
- ✅ High blur for smoothness

### **NASA Worldview Style**
- ✅ Professional color mapping
- ✅ Multiple gradient stops
- ✅ Smooth opacity transitions
- ✅ Overlay blending

### **ECMWF Style**
- ✅ Blue (cool) → Red (hot) gradient
- ✅ Smooth color transitions
- ✅ Professional appearance

---

## Implementation Details

### **Data Flow**

```
Kafka → riskProbability (0-1)
  ↓
Direct Mapping (NO calculations)
  ↓
Heatmap Intensity (0-1)
  ↓
Color Gradient Lookup
  ↓
GPU Rendering (leaflet.heat)
  ↓
Visual Heatmap Overlay
```

### **No Calculations**

- ❌ No rainfall × slope
- ❌ No ARI calculations
- ❌ No NDVI math
- ❌ No risk classification

**Pure visualization: `riskProbability` → color intensity**

---

## Customization

### **Adjust Radius**
```typescript
radius={50}  // Larger = smoother coverage
radius={30}  // Smaller = more localized
```

### **Adjust Blur**
```typescript
blur={30}    // More blur = smoother gradient
blur={15}    // Less blur = sharper edges
```

### **Adjust Opacity**
```typescript
minOpacity={0.2}  // More visible low-risk areas
minOpacity={0.1}  // More subtle overall
```

---

## Result

The heatmap displays as a **smooth, glowing overlay** over the map:
- 🔵 **Blue areas** = Low risk (SAFE)
- 🟢 **Green areas** = Safe zones
- 🟡 **Yellow areas** = Watch zones
- 🟠 **Orange areas** = Warning zones
- 🔴 **Red areas** = Critical risk zones

**Matches professional disaster visualization systems!** 🎯
