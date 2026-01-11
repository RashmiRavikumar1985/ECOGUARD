// src/hooks/useKafkaZones.ts
// Pure consumer hook - receives zone updates from Kafka
// NO calculations, NO classifications, NO processing

import { useState, useEffect, useCallback } from "react";
import { type Zone } from "../types/overlays";
import { kafkaService, type KafkaMessage } from "../services/kafkaService";

type ZoneUpdateMessage = KafkaMessage<Zone>;

export function useKafkaZones(enabled: boolean = true) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!enabled) {
      setZones([]);
      return;
    }

    // Subscribe to risk-zones-updates topic
    const unsubscribe = kafkaService.subscribe<Zone>("risk-zones-updates", (message: ZoneUpdateMessage) => {
      // ✅ Just update state with received data - NO calculations
      const zoneData = message.value;
      
      setZones((prevZones) => {
        // Check if zone already exists
        const existingIndex = prevZones.findIndex((z) => z.id === zoneData.id);
        
        if (existingIndex >= 0) {
          // Update existing zone
          const updated = [...prevZones];
          updated[existingIndex] = {
            ...zoneData,
            lastUpdate: new Date(zoneData.lastUpdate), // Ensure Date object
          };
          return updated;
        } else {
          // Add new zone
          return [
            ...prevZones,
            {
              ...zoneData,
              lastUpdate: new Date(zoneData.lastUpdate), // Ensure Date object
            },
          ];
        }
      });
      
      setLastUpdate(new Date());
    });

    return () => {
      unsubscribe();
    };
  }, [enabled]);

  // Filter zones by viewport (optional optimization)
  const getZonesInBounds = useCallback(
    (bounds: { north: number; south: number; east: number; west: number }) => {
      return zones.filter((zone) => {
        const [lat, lng] = zone.center;
        return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
      });
    },
    [zones]
  );

  return {
    zones,
    lastUpdate,
    getZonesInBounds,
    zoneCount: zones.length,
  };
}
