// src/hooks/useKafkaStats.ts
// Pure consumer hook - receives aggregated stats from Kafka
// NO calculations, NO aggregations, NO processing

import { useState, useEffect } from "react";
import { type DensityStats } from "../types/overlays";
import { kafkaService, type KafkaMessage } from "../services/kafkaService";

type StatsMessage = KafkaMessage<DensityStats>;

export function useKafkaStats() {
  const [stats, setStats] = useState<DensityStats>({
    activePoints: 0,
    avgIntensity: 0,
    criticalZones: 0,
    warningZones: 0,
    watchZones: 0,
    safeZones: 0,
  });
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Subscribe to aggregated-stats topic
    const unsubscribe = kafkaService.subscribe<DensityStats>("aggregated-stats", (message: StatsMessage) => {
      // ✅ Just update state with received data - NO calculations
      const statsData = message.value;
      
      setStats({
        activePoints: statsData.activePoints,
        avgIntensity: statsData.avgIntensity,
        criticalZones: statsData.criticalZones ?? 0,
        warningZones: statsData.warningZones ?? 0,
        watchZones: statsData.watchZones ?? 0,
        safeZones: statsData.safeZones ?? 0,
      });
      
      setLastUpdate(statsData.timestamp ? new Date(statsData.timestamp) : new Date());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    stats,
    lastUpdate,
  };
}
