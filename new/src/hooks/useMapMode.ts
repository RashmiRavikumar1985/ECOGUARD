import { useState } from "react";
import { type MapMode } from "../services/mapService";

export default function useMapMode() {
  const [mode, setMode] = useState<MapMode>("terrain");

  function toggleMode() {
    setMode(prev => (prev === "terrain" ? "satellite" : "terrain"));
  }

  function setMapMode(newMode: MapMode) {
    setMode(newMode);
  }

  return { mode, toggleMode, setMapMode };
}
