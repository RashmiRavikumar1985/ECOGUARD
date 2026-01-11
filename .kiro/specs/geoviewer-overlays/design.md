# Design Document

## Overview

This design implements three floating overlay components for the GeoViewer application:
1. **TimeSeriesSlider** - A 24-hour timeline control positioned at bottom center
2. **DensityIndexCard** - A glassmorphism statistics card at bottom left with expandable drawer
3. **LiveDataTicker** - A scrolling footer bar showing real-time system logs

All components will be positioned as absolute overlays on the map canvas, using the existing dark theme styling (`bg-[#1a2632]`, `border-[#324d67]`).

## Architecture

```
GeoViewer (page)
├── Sidebar (left, 300px)
└── MapContainer (flex-1, relative)
    ├── MapView (absolute, full)
    ├── TimeSeriesSlider (absolute, bottom-center, z-30)
    ├── DensityIndexCard (absolute, bottom-left, z-30)
    └── LiveDataTicker (absolute, bottom, z-40, full-width)
```

## Components and Interfaces

### TimeSeriesSlider Component

```typescript
// src/components/overlays/TimeSeriesSlider.tsx

type TimeSeriesSliderProps = {
  startTime: Date;        // 24 hours ago
  endTime: Date;          // now
  currentTime: Date;      // selected time
  isPlaying: boolean;
  onTimeChange: (time: Date) => void;
  onPlayPause: () => void;
};
```

**UI Structure:**
- Container: `w-[400px] h-[60px]` glassmorphism card
- Play/Pause button (left): 32x32px icon button
- Timeline track (center): horizontal bar with gradient
- Scrubber: draggable circle indicator
- Time labels: every 4 hours (6 labels total)

### DensityIndexCard Component

```typescript
// src/components/overlays/DensityIndexCard.tsx

type DensityStats = {
  activePoints: number;
  avgIntensity: number;  // 0-100
};

type DensityIndexCardProps = {
  stats: DensityStats;
  isExpanded: boolean;
  onToggleExpand: () => void;
};
```

**UI Structure:**
- Container: `w-[280px]` glassmorphism card
- Header: "DENSITY INDEX" + "Live Data" badge
- Gradient bar: blue → yellow → red (Low → Moderate → High)
- Stats row: Active Points (number) | Avg Intensity (% with color)
- Chevron button: toggles Analytics Drawer
- Drawer (when expanded): placeholder for future chart

### LiveDataTicker Component

```typescript
// src/components/overlays/LiveDataTicker.tsx

type TickerEntry = {
  id: string;
  timestamp: Date;
  message: string;
};

type LiveDataTickerProps = {
  entries: TickerEntry[];
};
```

**UI Structure:**
- Container: `h-[24px] w-full` semi-transparent black bar
- Content: CSS animation scrolling right-to-left
- Text: monospace font, small size, gray text

### Custom Hooks

```typescript
// src/hooks/useTimeSeriesPlayer.ts
// Manages play/pause state and auto-advance logic

type UseTimeSeriesPlayerReturn = {
  currentTime: Date;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (time: Date) => void;
};

// src/hooks/useDensityStats.ts
// Manages density statistics state (mock data for now)

type UseDensityStatsReturn = {
  stats: DensityStats;
  isExpanded: boolean;
  toggleExpanded: () => void;
};

// src/hooks/useTickerLog.ts
// Manages ticker entries with auto-add capability

type UseTickerLogReturn = {
  entries: TickerEntry[];
  addEntry: (message: string) => void;
};
```

## Data Models

```typescript
// src/types/overlays.ts

export type TimeRange = {
  start: Date;
  end: Date;
};

export type DensityStats = {
  activePoints: number;
  avgIntensity: number;
};

export type TickerEntry = {
  id: string;
  timestamp: Date;
  message: string;
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do.*

### Property 1: Time bounds invariant
*For any* currentTime value in the TimeSeriesSlider, it SHALL always be within the range [startTime, endTime] inclusive.
**Validates: Requirements 1.1, 1.3**

### Property 2: Play state consistency
*For any* TimeSeriesSlider in playing state, calling pause() then play() SHALL result in the same playing state as before pause.
**Validates: Requirements 1.2, 1.5**

### Property 3: Intensity color mapping
*For any* avgIntensity value, the color SHALL be red when >= 70, yellow when >= 40, and blue when < 40.
**Validates: Requirements 2.3**

### Property 4: Ticker entry ordering
*For any* sequence of addEntry calls, the entries array SHALL maintain chronological order (newest last).
**Validates: Requirements 3.4, 3.5**

### Property 5: Drawer toggle idempotence
*For any* DensityIndexCard, toggling expand twice SHALL return to the original expanded state.
**Validates: Requirements 2.5, 2.6**

## Error Handling

| Scenario | Handling |
|----------|----------|
| Invalid time range (start > end) | Clamp currentTime to valid range |
| Negative intensity value | Clamp to 0 |
| Intensity > 100 | Clamp to 100 |
| Empty ticker entries | Show placeholder text "Waiting for data..." |
| Window resize | Components reposition via CSS (no JS needed) |

## Testing Strategy

### Unit Tests
- TimeSeriesSlider: Test time clamping, play/pause toggle
- DensityIndexCard: Test intensity color mapping, expand/collapse
- LiveDataTicker: Test entry addition, formatting

### Property-Based Tests
- Use fast-check library for property-based testing
- Test time bounds invariant with random Date values
- Test intensity color mapping with random numbers 0-100
- Test ticker ordering with random entry sequences

### Integration Tests
- Verify components render without errors in GeoViewer page
- Verify z-index layering (ticker above slider above map)
