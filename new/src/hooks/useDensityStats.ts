import { useState, useEffect } from "react";
import { type DensityStats } from "../types/overlays";

type UseDensityStatsReturn = {
  stats: DensityStats;
  isExpanded: boolean;
  toggleExpanded: () => void;
};

export default function useDensityStats(): UseDensityStatsReturn {
  const [stats, setStats] = useState<DensityStats>({
    activePoints: 1248,
    avgIntensity: 84,
  });
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        activePoints: prev.activePoints + Math.floor(Math.random() * 10 - 5),
        avgIntensity: Math.max(0, Math.min(100, prev.avgIntensity + Math.floor(Math.random() * 6 - 3))),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  return { stats, isExpanded, toggleExpanded };
}
