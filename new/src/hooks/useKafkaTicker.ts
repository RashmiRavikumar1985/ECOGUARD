// src/hooks/useKafkaTicker.ts
// Pure consumer hook - receives log messages from Kafka
// NO message generation, NO mock data

import { useState, useEffect, useCallback } from "react";
import { type TickerEntry } from "../types/overlays";
import { kafkaService, type KafkaMessage } from "../services/kafkaService";

type LogMessage = KafkaMessage<{
  message: string;
  level?: "info" | "warning" | "error" | "critical";
  source?: string;
}>;

export function useKafkaTicker(maxEntries: number = 20) {
  const [entries, setEntries] = useState<TickerEntry[]>([]);

  useEffect(() => {
    // Subscribe to system-logs topic
    const unsubscribe = kafkaService.subscribe<{ message: string; level?: string; source?: string }>(
      "system-logs",
      (message: LogMessage) => {
        // ✅ Just add entry from Kafka - NO mock generation
        const entry: TickerEntry = {
          id: crypto.randomUUID(),
          timestamp: new Date(message.timestamp),
          message: message.value.message,
        };

        setEntries((prev) => {
          const updated = [entry, ...prev];
          // Keep only last N entries
          return updated.slice(0, maxEntries);
        });
      }
    );

    // Also subscribe to data-ingestion topic for data packet logs
    const unsubscribeData = kafkaService.subscribe<{ message: string; source?: string }>(
      "data-ingestion",
      (message: KafkaMessage<{ message: string; source?: string }>) => {
        const entry: TickerEntry = {
          id: crypto.randomUUID(),
          timestamp: new Date(message.timestamp),
          message: message.value.message || `Data received from ${message.value.source || "unknown"}`,
        };

        setEntries((prev) => {
          const updated = [entry, ...prev];
          return updated.slice(0, maxEntries);
        });
      }
    );

    return () => {
      unsubscribe();
      unsubscribeData();
    };
  }, [maxEntries]);

  // Manual add entry (for UI-triggered events, not Kafka)
  const addEntry = useCallback((message: string) => {
    const entry: TickerEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      message,
    };

    setEntries((prev) => {
      const updated = [entry, ...prev];
      return updated.slice(0, maxEntries);
    });
  }, [maxEntries]);

  return {
    entries,
    addEntry, // Keep for UI events (e.g., "Connection established")
  };
}
