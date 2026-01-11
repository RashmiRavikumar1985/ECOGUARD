# Implementation Plan: GeoViewer Overlays

## Overview

Implement three floating overlay components (TimeSeriesSlider, DensityIndexCard, LiveDataTicker) with supporting hooks and types, then integrate them into the GeoViewer page.

## Tasks

- [x] 1. Set up types and project structure
  - [x] 1.1 Create overlay types file with TimeRange, DensityStats, and TickerEntry types
    - Create `src/types/overlays.ts`
    - _Requirements: 1.1, 2.2, 3.4_

- [x] 2. Implement TimeSeriesSlider component
  - [x] 2.1 Create useTimeSeriesPlayer hook
    - Implement play/pause/toggle/seek functions
    - Auto-advance every 500ms when playing
    - Clamp time to valid range
    - _Requirements: 1.2, 1.5_
  - [x] 2.2 Create TimeSeriesSlider component
    - Glassmorphism container with play button and timeline
    - Draggable scrubber with time labels every 4 hours
    - _Requirements: 1.1, 1.3, 1.4, 1.6_
  - [ ]* 2.3 Write property test for time bounds invariant
    - **Property 1: Time bounds invariant**
    - **Validates: Requirements 1.1, 1.3**

- [x] 3. Implement DensityIndexCard component
  - [x] 3.1 Create useDensityStats hook
    - Manage stats state and expanded toggle
    - Mock data for activePoints and avgIntensity
    - _Requirements: 2.2, 2.3_
  - [x] 3.2 Create intensity color utility function
    - Return red for >= 70, yellow for >= 40, blue for < 40
    - _Requirements: 2.3_
  - [x] 3.3 Create DensityIndexCard component
    - Glassmorphism card with gradient bar legend
    - Stats display with color-coded intensity
    - Expandable drawer with chevron toggle
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  - [ ]* 3.4 Write property test for intensity color mapping
    - **Property 3: Intensity color mapping**
    - **Validates: Requirements 2.3**

- [x] 4. Implement LiveDataTicker component
  - [x] 4.1 Create useTickerLog hook
    - Manage entries array with addEntry function
    - Auto-generate mock entries for demo
    - _Requirements: 3.4, 3.5_
  - [x] 4.2 Create LiveDataTicker component
    - Fixed 24px height, semi-transparent black background
    - CSS animation for right-to-left scrolling
    - Timestamped log entry formatting
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_
  - [ ]* 4.3 Write property test for ticker entry ordering
    - **Property 4: Ticker entry ordering**
    - **Validates: Requirements 3.4, 3.5**

- [x] 5. Integrate components into GeoViewer
  - [x] 5.1 Update GeoViewer page layout
    - Add relative positioning to map container
    - Import and render all three overlay components
    - Wire up hooks to components
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 6. Checkpoint - Verify integration
  - Ensure all components render correctly
  - Verify z-index layering (ticker above others)
  - Test play/pause, expand/collapse, and scrolling ticker

## Notes

- Tasks marked with `*` are optional property-based tests
- Components use existing glassmorphism pattern from Card.tsx
- Mock data used initially; WebSocket integration is out of scope
