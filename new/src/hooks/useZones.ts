import { useState, useEffect, useMemo } from "react";
import { type Zone } from "../types/overlays";
import { generateZones } from "../services/zoneService";

type UseZonesProps = {
  center: [number, number];
  enabled: boolean;
};

export function useZones({ center, enabled }: UseZonesProps) {
  const [zones, setZones] = useState<Zone[]>([]);

  // Generate initial zones
  useEffect(() => {
    if (enabled) {
      setZones(generateZones(center, 5));
    } else {
      setZones([]);
    }
  }, [center, enabled]);

  // Update zones periodically (every 2 seconds) to simulate live data
  useEffect(() => {
    if (!enabled || zones.length === 0) return;

    const interval = setInterval(() => {
      setZones((prevZones) =>
        prevZones.map((zone) => {
          // Randomly update rainfall (slight variation)
          const rainfallChange = (Math.random() - 0.5) * 2; // -1 to +1 mm/hr
          const newRainfall = Math.max(0, zone.rainfall + rainfallChange);

          // Randomly change trend
          const newTrend =
            Math.random() > 0.7
              ? Math.random() > 0.5
                ? "increasing"
                : "decreasing"
              : zone.rainfallTrend;

          return {
            ...zone,
            rainfall: newRainfall,
            rainfallTrend: newTrend,
            lastUpdate: new Date(), // Update timestamp
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [enabled, zones.length]);

  return zones;
}
