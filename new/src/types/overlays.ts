// src/types/overlays.ts

export type TimeRange = {
  start: Date;
  end: Date;
};

export type DensityStats = {
  // ✅ All values received from Kafka (pre-calculated by backend)
  activePoints: number; // Total active zones - aggregated by backend
  avgIntensity: number; // 0-100 - average risk intensity from backend

  // ✅ Zone counts (pre-calculated by backend)
  criticalZones?: number; // Count of CRITICAL zones
  warningZones?: number; // Count of WARNING zones
  watchZones?: number; // Count of WATCH zones
  safeZones?: number; // Count of SAFE zones

  timestamp?: Date; // When stats were calculated by backend
};

export type TickerEntry = {
  id: string;
  timestamp: Date;
  message: string;
};

export type RiskLevel = "SAFE" | "WATCH" | "WARNING" | "CRITICAL";

export type Zone = {
  id: string;
  center: [number, number]; // [latitude, longitude]
  radius: number; // in meters

  // ✅ All values received from Kafka (pre-calculated by backend)
  // From topic: risk-zones-updates (final processed data)
  rainfall48h: number; // mm - 48-hour rainfall total (from processed-features topic)
  rainfallTrend?: "increasing" | "decreasing" | "stable"; // Optional trend indicator
  soilMoisture: number; // percentage 0-100 - from SMAP processing
  soilMoistureStatus: "Saturated" | "Wet" | "Normal" | "Dry"; // from backend threshold logic
  soilType?: "Clay" | "Loam" | "Sand" | "Silt" | "Rock"; // from geological data

  // ✅ Risk data from ML models (backend)
  riskLevel: RiskLevel; // from Random Forest/LSTM inference
  riskProbability: number; // 0-1 probability from ML model

  // ✅ Environmental factors (pre-processed by backend)
  ari: number; // Antecedent Rainfall Index - calculated by backend (from processed-features)
  slopeAngle?: number; // degrees - from DEM processing
  ndvi?: number; // Vegetation index - from Sentinel-2 processing

  lastUpdate: Date;
};