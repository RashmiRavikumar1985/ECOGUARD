import { Tooltip } from "react-leaflet";
import { useState, useEffect } from "react";
import { type Zone } from "../../types/overlays";

type ZoneTooltipProps = {
  zone: Zone;
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);

  if (diffSeconds < 5) {
    return "Just now";
  } else if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  } else if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes}m ago`;
  } else {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours}h ago`;
  }
}

export default function ZoneTooltip({ zone }: ZoneTooltipProps) {
  const [timeAgo, setTimeAgo] = useState(formatTimeAgo(zone.lastUpdate));

  // Update time ago every second for real-time display
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(zone.lastUpdate));
    }, 1000);

    return () => clearInterval(interval);
  }, [zone.lastUpdate]);

  // ✅ Pure display logic - NO calculations
  const rainfallTrendIcon = zone.rainfallTrend === "increasing" ? "⬆" : 
                           zone.rainfallTrend === "decreasing" ? "⬇" : "";

  const soilMoistureBadgeColor = zone.soilMoistureStatus === "Saturated" ? "bg-red-500" :
                                 zone.soilMoistureStatus === "Wet" ? "bg-orange-500" :
                                 zone.soilMoistureStatus === "Normal" ? "bg-green-500" :
                                 "bg-yellow-500";

  return (
    <Tooltip
      className="zone-tooltip"
      permanent={false}
      direction="top"
      offset={[0, -10]}
    >
      <div className="min-w-[240px] p-3 bg-[#1a2632] border border-[#324d67] rounded-lg shadow-xl">
        {/* Risk Level */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#324d67]/50">
          <span className="text-xs text-[#92adc9]">Risk Level</span>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${
              zone.riskLevel === "CRITICAL" ? "text-red-500" :
              zone.riskLevel === "WARNING" ? "text-orange-500" :
              zone.riskLevel === "WATCH" ? "text-yellow-500" :
              "text-green-500"
            }`}>
              {zone.riskLevel}
            </span>
            <span className="text-xs text-[#92adc9]">
              {(zone.riskProbability * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Rainfall (48h total from Kafka) */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#92adc9]">Rainfall (48h)</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-white">
              {zone.rainfall48h.toFixed(1)} mm
            </span>
            {zone.rainfallTrend && rainfallTrendIcon && (
              <span className="text-xs text-cyan-400">{rainfallTrendIcon}</span>
            )}
          </div>
        </div>

        {/* Soil Moisture */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#92adc9]">Soil Moisture</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">
              {zone.soilMoisture}%
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded ${soilMoistureBadgeColor} text-white font-semibold`}>
              {zone.soilMoistureStatus}
            </span>
          </div>
        </div>

        {/* ARI (from Kafka - already calculated) */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#92adc9]">ARI</span>
          <span className="text-sm font-semibold text-white">
            {zone.ari.toFixed(1)}
          </span>
        </div>

        {/* Last Update */}
        <div className="flex items-center justify-between pt-2 border-t border-[#324d67]/50">
          <span className="text-xs text-[#92adc9]">Last Update</span>
          <span className="text-xs text-cyan-400 font-mono">
            {timeAgo}
          </span>
        </div>
      </div>
    </Tooltip>
  );
}
