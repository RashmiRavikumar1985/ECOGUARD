import { type DensityStats } from "../../types/overlays";
import { getIntensityColor } from "../../utils/intensityColor";

type DensityIndexCardProps = {
  stats: DensityStats;
  isExpanded: boolean;
  onToggleExpand: () => void;
};

export default function DensityIndexCard({
  stats,
  isExpanded,
  onToggleExpand,
}: DensityIndexCardProps) {
  const intensityColorClass = getIntensityColor(stats.avgIntensity);

  return (
    <div className="absolute bottom-10 left-8 z-[500]">
      <div
        className="w-[200px] rounded-xl bg-[#1a2632]/90 backdrop-blur-md
                   border border-[#324d67] shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 py-2 flex items-center justify-between border-b border-[#324d67]/50">
          <span className="text-xs font-semibold text-[#92adc9] tracking-wide">
            DENSITY INDEX
          </span>
          <span className="text-[10px] text-cyan-400">Live Data</span>
        </div>

        {/* Gradient Bar */}
        <div className="px-4 pt-3">
          <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500" />
          <div className="flex justify-between text-[10px] text-[#92adc9] mt-1">
            <span>Low</span>
            <span>Moderate</span>
            <span>High</span>
          </div>
        </div>

        {/* Stats */}
        <div className="px-4 py-3">
          <div className="flex justify-between mb-2">
            <div>
              <div className="text-[10px] text-[#92adc9]">Active Points</div>
              <div className="text-lg font-bold text-white">
                {stats.activePoints.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[#92adc9]">Avg Intensity</div>
              <div className={`text-lg font-bold ${intensityColorClass}`}>
                {stats.avgIntensity}%
              </div>
            </div>
          </div>
          {/* Zone counts (if available from Kafka) */}
          {(stats.criticalZones !== undefined || stats.warningZones !== undefined) && (
            <div className="grid grid-cols-4 gap-1 mt-2 pt-2 border-t border-[#324d67]/30">
              <div className="text-center">
                <div className="text-[10px] text-red-400 font-semibold">{stats.criticalZones ?? 0}</div>
                <div className="text-[8px] text-[#92adc9]">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-orange-400 font-semibold">{stats.warningZones ?? 0}</div>
                <div className="text-[8px] text-[#92adc9]">Warning</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-yellow-400 font-semibold">{stats.watchZones ?? 0}</div>
                <div className="text-[8px] text-[#92adc9]">Watch</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-green-400 font-semibold">{stats.safeZones ?? 0}</div>
                <div className="text-[8px] text-[#92adc9]">Safe</div>
              </div>
            </div>
          )}
        </div>

        {/* Expand Button */}
        <button
          onClick={onToggleExpand}
          className="w-full py-2 flex items-center justify-center
                     border-t border-[#324d67]/50 hover:bg-[#324d67]/30 transition-colors"
        >
          <svg
            className={`w-4 h-4 text-[#92adc9] transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>

        {/* Expandable Drawer */}
        {isExpanded && (
          <div className="px-4 py-3 border-t border-[#324d67]/50">
            <div className="text-xs text-[#92adc9] mb-2">Analytics</div>
            <div className="h-20 bg-[#324d67]/30 rounded flex items-center justify-center text-[10px] text-[#92adc9]">
              Chart placeholder
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
