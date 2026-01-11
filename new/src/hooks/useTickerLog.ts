import { useState, useEffect, useCallback } from "react";
import { type TickerEntry } from "../types/overlays";

type UseTickerLogReturn = {
  entries: TickerEntry[];
  addEntry: (message: string) => void;
};

const mockMessages = [
  "NASA GPM: Packet Received (4KB)",
  "Zone 4: Risk Updated",
  "System: Latency 12ms",
  "Sensor Grid: 98% Online",
  "Zone 12: Threshold Alert",
  "Data Sync: Complete",
];

export default function useTickerLog(): UseTickerLogReturn {
  const [entries, setEntries] = useState<TickerEntry[]>([]);

  const addEntry = useCallback((message: string) => {
    const entry: TickerEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      message,
    };
    setEntries((prev) => [...prev, entry].slice(-20)); // Keep last 20
  }, []);

  // Auto-generate mock entries
  useEffect(() => {
    // Initial entries
    addEntry("System: Connection Established");
    addEntry("Data Stream: Active");

    const interval = setInterval(() => {
      const msg = mockMessages[Math.floor(Math.random() * mockMessages.length)];
      addEntry(msg);
    }, 3000);

    return () => clearInterval(interval);
  }, [addEntry]);

  return { entries, addEntry };
}
