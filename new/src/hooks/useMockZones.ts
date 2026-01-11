// src/hooks/useMockZones.ts
// NASA/Google-style grid-based mock data for testing heatmap visualization
// Uses grid-based density distribution like professional systems

import { useState, useEffect } from "react";
import { type Zone } from "../types/overlays";

/**
 * Generate mock zones using NASA/Google grid-based technique
 * Creates dense grid of points for smooth seamless coverage
 */
function generateMockZones(center: [number, number], count: number = 500): Zone[] {
  const zones: Zone[] = [];
  const radius = 0.1; // ~10km radius around center (larger area for smoother coverage)

  // NASA/Google technique: Grid-based density distribution
  // Create a dense grid of points for smooth seamless coverage
  const gridSize = Math.ceil(Math.sqrt(count));
  const step = (radius * 2) / gridSize;

  // Generate grid-based points (like NASA uses)
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      // Grid position with slight randomization for natural look
      const lat = center[0] - radius + (i * step) + (Math.random() * step * 0.3);
      const lng = center[1] - radius + (j * step) + (Math.random() * step * 0.3);

      // Distance from center for intensity falloff (NASA technique)
      const distFromCenter = Math.sqrt(
        Math.pow(lat - center[0], 2) + Math.pow(lng - center[1], 2)
      );
      const normalizedDist = Math.min(distFromCenter / radius, 1);

      // Create risk hotspots (like real disaster systems)
      // Higher risk in center, lower at edges - realistic pattern
      const baseRisk = 1 - normalizedDist * 0.7; // 0.3 to 1.0
      const riskVariation = (Math.random() - 0.5) * 0.3; // ±0.15 variation
      const riskProbability = Math.max(0, Math.min(1, baseRisk + riskVariation));

      // Determine risk level based on probability
      let riskLevel: "SAFE" | "WATCH" | "WARNING" | "CRITICAL";
      if (riskProbability < 0.3) {
        riskLevel = "SAFE";
      } else if (riskProbability < 0.6) {
        riskLevel = "WATCH";
      } else if (riskProbability < 0.8) {
        riskLevel = "WARNING";
      } else {
        riskLevel = "CRITICAL";
      }

      // Mock data matching Kafka format
      zones.push({
        id: `mock-zone-${i}-${j}`,
        center: [lat, lng],
        radius: 600 + Math.random() * 300, // 600-900m radius (smaller for density)

        // Rainfall (48h total)
        rainfall48h: riskProbability * 150, // 0-150mm
        rainfallTrend: riskProbability > 0.6 ? "increasing" : riskProbability < 0.3 ? "decreasing" : "stable",

        // Soil moisture
        soilMoisture: 50 + riskProbability * 50, // 50-100%
        soilMoistureStatus: riskProbability > 0.8 ? "Saturated" : riskProbability > 0.6 ? "Wet" : riskProbability > 0.4 ? "Normal" : "Dry",
        soilType: ["Clay", "Loam", "Sand", "Silt", "Rock"][Math.floor(Math.random() * 5)] as "Clay" | "Loam" | "Sand" | "Silt" | "Rock",

        // Risk data
        riskLevel,
        riskProbability,

        // Environmental factors
        ari: riskProbability * 200, // 0-200 ARI
        slopeAngle: riskProbability * 45, // 0-45 degrees
        ndvi: 0.3 + (1 - riskProbability) * 0.5, // 0.3-0.8 (higher risk = lower vegetation)

        lastUpdate: new Date(),
      });
    }
  }

  return zones;
}

export function useMockZones(enabled: boolean = true, center: [number, number] = [37.7749, -122.4194]) {
  const [zones, setZones] = useState<Zone[]>([]);

  useEffect(() => {
    if (!enabled) {
      setZones([]);
      return;
    }

    // Generate initial zones using NASA-style grid distribution
    const initialZones = generateMockZones(center, 500); // 500 points for ultra-smooth seamless coverage (no radial patterns)
    setZones(initialZones);

    // Update zones periodically to simulate live data
    const interval = setInterval(() => {
      setZones((prevZones) =>
        prevZones.map((zone) => {
          // Slight random variation in risk probability (±0.05)
          const variation = (Math.random() - 0.5) * 0.1;
          const newRiskProbability = Math.max(0, Math.min(1, zone.riskProbability + variation));

          // Update risk level if threshold crossed
          let newRiskLevel = zone.riskLevel;
          if (newRiskProbability < 0.3) {
            newRiskLevel = "SAFE";
          } else if (newRiskProbability < 0.6) {
            newRiskLevel = "WATCH";
          } else if (newRiskProbability < 0.8) {
            newRiskLevel = "WARNING";
          } else {
            newRiskLevel = "CRITICAL";
          }

          return {
            ...zone,
            riskProbability: newRiskProbability,
            riskLevel: newRiskLevel,
            rainfall48h: newRiskProbability * 150,
            soilMoisture: 50 + newRiskProbability * 50,
            soilMoistureStatus:
              newRiskProbability > 0.8
                ? "Saturated"
                : newRiskProbability > 0.6
                  ? "Wet"
                  : newRiskProbability > 0.4
                    ? "Normal"
                    : "Dry",
            ari: newRiskProbability * 200,
            lastUpdate: new Date(),
          };
        })
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [enabled, center[0], center[1]]);

  return {
    zones,
    lastUpdate: new Date(),
    getZonesInBounds: (bounds: { north: number; south: number; east: number; west: number }) => {
      return zones.filter((zone) => {
        const [lat, lng] = zone.center;
        return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
      });
    },
    zoneCount: zones.length,
  };
}
