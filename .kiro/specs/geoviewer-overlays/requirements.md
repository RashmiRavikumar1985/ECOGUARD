# Requirements Document

## Introduction

This feature adds three floating overlay components to the GeoViewer application: a Time-Series Slider for historical data navigation, a Density Index & Analytics Card displaying live statistics with glassmorphism styling, and a Live Data Ticker footer showing real-time system activity logs.

## Glossary

- **Time_Series_Slider**: A horizontal timeline control at the bottom center of the map that allows users to scrub through the last 24 hours of data
- **Density_Index_Card**: A glassmorphism-styled floating card at the bottom left displaying live statistics (Active Points, Avg Intensity) with a gradient legend
- **Analytics_Drawer**: An expandable panel within the Density Index Card showing detailed charts
- **Live_Data_Ticker**: A scrolling text bar at the bottom of the screen (24px height) showing real-time data ingestion logs
- **Glassmorphism**: A UI design style featuring frosted glass effect with blur, transparency, and subtle borders

## Requirements

### Requirement 1: Time-Series Slider

**User Story:** As a user, I want to navigate through historical data using a timeline slider, so that I can view rainfall accumulation patterns over the last 24 hours.

#### Acceptance Criteria

1. THE Time_Series_Slider SHALL display a horizontal timeline bar representing the last 24 hours
2. THE Time_Series_Slider SHALL include a Play/Pause button to auto-advance through time
3. WHEN a user drags the scrubber, THE Time_Series_Slider SHALL emit the selected timestamp
4. THE Time_Series_Slider SHALL display time labels at regular intervals (e.g., every 4 hours)
5. WHEN Play is active, THE Time_Series_Slider SHALL auto-advance the scrubber position every 500ms
6. THE Time_Series_Slider SHALL be positioned at the bottom center of the map canvas with z-index above the map

### Requirement 2: Density Index & Analytics Card

**User Story:** As a user, I want to see live statistics about the current map view, so that I can quickly understand the risk density and intensity levels.

#### Acceptance Criteria

1. THE Density_Index_Card SHALL display using glassmorphism styling (blur, transparency, subtle border)
2. THE Density_Index_Card SHALL show "Active Points" as a live counter
3. THE Density_Index_Card SHALL show "Avg Intensity" as a percentage with color-coded text (red for high, blue for low)
4. THE Density_Index_Card SHALL include a gradient bar legend showing Low → Moderate → High color scale
5. THE Density_Index_Card SHALL include a chevron button to expand/collapse the Analytics_Drawer
6. WHEN the chevron is clicked, THE Analytics_Drawer SHALL slide up to reveal additional content
7. THE Density_Index_Card SHALL be positioned at the bottom left of the map canvas with z-index above the map

### Requirement 3: Live Data Ticker

**User Story:** As a user, I want to see a scrolling ticker of system activity, so that I can verify the system is connected and receiving live data.

#### Acceptance Criteria

1. THE Live_Data_Ticker SHALL be a fixed-height bar (24px) at the very bottom of the screen
2. THE Live_Data_Ticker SHALL have a semi-transparent black background
3. THE Live_Data_Ticker SHALL display scrolling text from right to left
4. THE Live_Data_Ticker SHALL show timestamped log entries (e.g., "[10:42:01] NASA GPM: Packet Received")
5. WHEN new log entries are added, THE Live_Data_Ticker SHALL append them to the scroll queue
6. THE Live_Data_Ticker SHALL continuously scroll at a readable pace (approximately 50px/second)

### Requirement 4: Component Integration

**User Story:** As a developer, I want these components to integrate cleanly with the existing GeoViewer layout, so that the UI remains cohesive.

#### Acceptance Criteria

1. THE overlay components SHALL not interfere with the existing Sidebar or Map interactions
2. THE overlay components SHALL use consistent styling with the existing dark theme (bg-gray-800, bg-gray-900)
3. THE overlay components SHALL be responsive and maintain proper positioning on window resize
