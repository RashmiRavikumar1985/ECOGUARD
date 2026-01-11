import { type Zone } from "../../types/overlays";

type LiveEnvironmentalPanelProps = {
    zone: Zone | null;
};

export function LiveEnvironmentalPanel({ zone }: LiveEnvironmentalPanelProps) {
    if (!zone) {
        return (
            <div className="mt-4 p-4 bg-[#1a2632] rounded-lg border border-[#324d67]/30">
                <h3 className="text-sm font-semibold text-[#92adc9] mb-3 uppercase tracking-wide">
                    🌍 Live Environmental Data
                </h3>
                <div className="text-sm text-[#92adc9]/60 text-center py-4">
                    Select a region to view environmental data
                </div>
            </div>
        );
    }

    // Get risk color based on level
    const getRiskColor = (level: string) => {
        switch (level) {
            case "CRITICAL": return "text-red-500";
            case "WARNING": return "text-orange-500";
            case "WATCH": return "text-yellow-500";
            case "SAFE": return "text-green-500";
            default: return "text-gray-400";
        }
    };

    // Get soil moisture status color
    const getSoilStatusColor = (status: string) => {
        switch (status) {
            case "Saturated": return "text-red-400";
            case "Wet": return "text-orange-400";
            case "Normal": return "text-green-400";
            case "Dry": return "text-yellow-400";
            default: return "text-gray-400";
        }
    };

    return (
        <div className="mt-4 p-4 bg-[#1a2632] rounded-lg border border-[#324d67]/30">
            <h3 className="text-sm font-semibold text-[#92adc9] mb-3 uppercase tracking-wide flex items-center gap-2">
                🌍 Live Environmental Data
                <span className="ml-auto text-[10px] text-cyan-400 animate-pulse">● LIVE</span>
            </h3>

            <div className="space-y-3 text-sm">
                {/* Rainfall */}
                <div className="flex justify-between items-center">
                    <span className="text-[#92adc9]">🌧 Rainfall (48h)</span>
                    <span className="text-white font-medium">
                        {zone.rainfall48h.toFixed(1)} mm
                        {zone.rainfallTrend && (
                            <span className="ml-1 text-xs">
                                {zone.rainfallTrend === "increasing" && "↑"}
                                {zone.rainfallTrend === "decreasing" && "↓"}
                                {zone.rainfallTrend === "stable" && "→"}
                            </span>
                        )}
                    </span>
                </div>

                {/* Soil Moisture */}
                <div className="flex justify-between items-center">
                    <span className="text-[#92adc9]">💧 Soil Moisture</span>
                    <span className="text-white font-medium">
                        {zone.soilMoisture.toFixed(0)}%{" "}
                        <span className={`text-xs ${getSoilStatusColor(zone.soilMoistureStatus)}`}>
                            ({zone.soilMoistureStatus})
                        </span>
                    </span>
                </div>

                {/* NDVI */}
                {zone.ndvi !== undefined && (
                    <div className="flex justify-between items-center">
                        <span className="text-[#92adc9]">🌱 Vegetation (NDVI)</span>
                        <span className="text-white font-medium">
                            {zone.ndvi.toFixed(2)}{" "}
                            <span className="text-xs text-[#92adc9]">
                                ({zone.ndvi < 0.3 ? "Sparse" : zone.ndvi < 0.6 ? "Moderate" : "Dense"})
                            </span>
                        </span>
                    </div>
                )}

                {/* Soil Type */}
                {zone.soilType && (
                    <div className="flex justify-between items-center">
                        <span className="text-[#92adc9]">🪨 Soil Type</span>
                        <span className="text-white font-medium">{zone.soilType}</span>
                    </div>
                )}

                {/* Slope */}
                {zone.slopeAngle !== undefined && (
                    <div className="flex justify-between items-center">
                        <span className="text-[#92adc9]">⛰ Slope</span>
                        <span className="text-white font-medium">{zone.slopeAngle.toFixed(1)}°</span>
                    </div>
                )}

                {/* ARI */}
                <div className="flex justify-between items-center">
                    <span className="text-[#92adc9]">📊 ARI</span>
                    <span className="text-white font-medium">{zone.ari.toFixed(0)}</span>
                </div>

                {/* Divider */}
                <div className="border-t border-[#324d67]/50 my-2"></div>

                {/* Risk Level */}
                <div className="flex justify-between items-center">
                    <span className="text-[#92adc9]">🚨 Risk Level</span>
                    <span className={`font-bold ${getRiskColor(zone.riskLevel)}`}>
                        {zone.riskLevel} ({(zone.riskProbability * 100).toFixed(0)}%)
                    </span>
                </div>
            </div>

            {/* Last Update */}
            <div className="mt-3 pt-2 border-t border-[#324d67]/30 text-[10px] text-[#92adc9]/60">
                Last updated: {zone.lastUpdate.toLocaleTimeString()}
            </div>
        </div>
    );
}
