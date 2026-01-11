// src/services/zoneService.ts
// ❌ REMOVED: All mock zone generation logic
// Zones are now received from Kafka via useKafkaZones hook
// This file is kept for potential utility functions only

import { type Zone } from "../types/overlays";

// ✅ Utility function: Filter zones by risk level (UI-only, no calculation)
export function filterZonesByRiskLevel(zones: Zone[], riskLevel: string): Zone[] {
  return zones.filter((zone) => zone.riskLevel === riskLevel);
}

// ✅ Utility function: Get zones in bounding box (UI-only, no calculation)
export function getZonesInBounds(
  zones: Zone[],
  bounds: { north: number; south: number; east: number; west: number }
): Zone[] {
  return zones.filter((zone) => {
    const [lat, lng] = zone.center;
    return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
  });
}
