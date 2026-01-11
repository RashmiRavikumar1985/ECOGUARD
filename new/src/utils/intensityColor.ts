// Returns color class based on intensity value (0-100)
// Red >= 70, Yellow >= 40, Blue < 40
export function getIntensityColor(intensity: number): string {
  const clamped = Math.max(0, Math.min(100, intensity));
  if (clamped >= 70) return "text-red-500";
  if (clamped >= 40) return "text-yellow-500";
  return "text-blue-500";
}

export function getIntensityLabel(intensity: number): string {
  const clamped = Math.max(0, Math.min(100, intensity));
  if (clamped >= 70) return "High";
  if (clamped >= 40) return "Moderate";
  return "Low";
}
