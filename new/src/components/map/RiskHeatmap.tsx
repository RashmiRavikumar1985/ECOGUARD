// src/components/map/RiskHeatmap.tsx
// Pure visualization component - converts riskProbability to heatmap intensity
// NO calculations - all data comes from Kafka

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

// Import leaflet.heat plugin
// @ts-ignore - leaflet.heat doesn't have TypeScript definitions
import "leaflet.heat";

type HeatmapPoint = [number, number, number]; // [lat, lng, intensity 0-1]

type RiskHeatmapProps = {
  zones: Array<{
    id: string;
    center: [number, number];
    riskProbability: number; // 0-1 from Kafka
  }>;
  enabled: boolean;
  radius?: number; // Heatmap point radius in pixels
  blur?: number; // Heatmap blur in pixels
  maxZoom?: number; // Max zoom for heatmap
  minOpacity?: number; // Minimum opacity
};

export function RiskHeatmap({
  zones,
  enabled,
  radius = 200, // NASA/Google style: MASSIVE radius to eliminate visible circles
  blur = 150, // NASA/Google style: EXTREME blur to create smooth continuous gradient (no radial patterns)
  maxZoom = 18,
  minOpacity = 0.6, // Higher opacity for better visibility
}: RiskHeatmapProps) {
  const map = useMap();
  const heatLayerRef = useRef<L.HeatLayer | null>(null);

  useEffect(() => {
    if (!enabled || zones.length === 0) {
      // Remove heatmap if disabled or no zones
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      return;
    }

    // ✅ Convert Kafka zones to heatmap points
    // riskProbability (0-1) → intensity (0-1)
    // NO calculations - just direct mapping
    const heatPoints: HeatmapPoint[] = zones.map((zone) => {
      const [lat, lng] = zone.center;
      // Direct mapping: riskProbability → intensity
      // 0.0 = transparent, 1.0 = maximum intensity
      const intensity = zone.riskProbability;
      return [lat, lng, intensity];
    });

    // Create or update heatmap layer
    // ✅ Pure visualization - riskProbability → intensity mapping
    if (heatLayerRef.current) {
      // Update existing layer with new points
      heatLayerRef.current.setLatLngs(heatPoints);
    } else {
      // Create new heatmap layer using leaflet.heat plugin
      // 🔥 Professional heatmap like Google Flood Hub / NASA Worldview / ECMWF
      // Smooth gradient from blue (safe) → green → yellow → orange → red (critical)
      // @ts-ignore - leaflet.heat extends L.Layer but types aren't perfect
      const heatLayer = (L as any).heatLayer(heatPoints, {
        radius,
        blur,
        maxZoom,
        minOpacity,
        // Ultra-smooth gradient with many stops for professional UHI-style appearance
        // Blue → Cyan → Yellow → Orange → Red (matching ECMWF/UHI visualizations)
        gradient: {
          0.0: "rgba(30, 58, 138, 0)",        // Dark Blue - SAFE (transparent)
          0.1: "rgba(59, 130, 246, 0.3)",      // Blue - SAFE
          0.15: "rgba(96, 165, 250, 0.4)",    // Light Blue - SAFE
          0.2: "rgba(34, 197, 94, 0.5)",       // Green - SAFE
          0.25: "rgba(74, 222, 128, 0.55)",   // Light Green - SAFE
          0.3: "rgba(163, 230, 53, 0.6)",     // Lime - WATCH
          0.35: "rgba(234, 179, 8, 0.65)",    // Yellow - WATCH
          0.4: "rgba(251, 191, 36, 0.7)",     // Amber - WATCH
          0.45: "rgba(249, 115, 22, 0.75)",   // Orange - WARNING
          0.5: "rgba(251, 146, 60, 0.78)",    // Light Orange - WARNING
          0.55: "rgba(239, 68, 68, 0.8)",     // Red-Orange - WARNING
          0.6: "rgba(248, 113, 113, 0.82)",   // Light Red - WARNING
          0.65: "rgba(239, 68, 68, 0.85)",    // Red - CRITICAL
          0.7: "rgba(220, 38, 38, 0.88)",     // Deep Red - CRITICAL
          0.75: "rgba(185, 28, 28, 0.9)",     // Darker Red - CRITICAL
          0.8: "rgba(153, 27, 27, 0.92)",     // Very Dark Red - CRITICAL
          0.85: "rgba(127, 29, 29, 0.94)",    // Darkest Red - CRITICAL
          0.9: "rgba(127, 29, 29, 0.96)",     // Maximum intensity
          0.95: "rgba(69, 10, 10, 0.98)",     // Near maximum
          1.0: "rgba(69, 10, 10, 1.0)",       // Maximum intensity - Deepest Red
        },
      });

      heatLayer.addTo(map);
      heatLayerRef.current = heatLayer;
    }

    // Cleanup
    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [map, zones, enabled, radius, blur, maxZoom, minOpacity]);

  return null; // This component doesn't render anything visible
}
