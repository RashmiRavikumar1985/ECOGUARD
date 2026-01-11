import { CountrySelector } from "../geo/CountrySelector";
import { GlobalSearch } from "../common/GlobalSearch";
import { SearchableSelect } from "../common/SearchableSelect";
import { PlaceSelector } from "../geo/PlaceSelector";
import { LiveEnvironmentalPanel } from "../common/LiveEnvironmentalPanel";
import { type MapMode } from "../../services/mapService";
import { getRegionsForCountry, hasRegionsData } from "../../data/regionsData";
import { type Place } from "../../types/geo";
import { type Zone } from "../../types/overlays";

type SidebarProps = {
  mapMode: MapMode;
  onMapModeChange: (mode: MapMode) => void;
  onSearchLocation: (coordinates: [number, number], zoom: number) => void;
  countryId: string;
  onSelectCountry: (id: string) => void;
  regionId: string | null;
  onSelectRegion: (id: string | null) => void;
  placeId: string | null;
  onSelectPlace: (id: string) => void;
  places: Place[];
  selectedZone?: Zone | null; // For Live Environmental Panel
};

export default function Sidebar({
  mapMode,
  onMapModeChange,
  onSearchLocation,
  countryId,
  onSelectCountry,
  regionId,
  onSelectRegion,
  placeId,
  onSelectPlace,
  places,
  selectedZone,
}: SidebarProps) {
  const countryHasRegions = hasRegionsData(countryId);
  const regions = countryHasRegions ? getRegionsForCountry(countryId) : [];

  return (
    <aside className="w-80 h-full border-r border-[#324d67]/30 bg-[#0f172a] flex flex-col overflow-hidden z-1000">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#324d67]/30">
        <h1 className="text-2xl font-bold text-white mb-1">Eco Guard</h1>
        <p className="text-sm text-[#92adc9]">Environmental Monitoring System</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-5">
        {/* Global Search */}
        <div className="mb-6">
          <GlobalSearch onLocationFound={onSearchLocation} />
        </div>

        {/* Country Selector */}
        <div className="mb-5">
          <CountrySelector value={countryId} onChange={onSelectCountry} />
        </div>

        {/* Region Selector - only show if country has regions data */}
        {countryHasRegions && regions.length > 0 && (
          <div className="mb-5">
            <SearchableSelect
              label="State / Province"
              options={regions}
              value={regionId}
              onChange={(id) => onSelectRegion(id)}
              placeholder="Select a region..."
            />
          </div>
        )}

        {/* Place Selector - only show if region is selected and places exist */}
        {regionId && places.length > 0 && (
          <div className="mb-5">
            <PlaceSelector
              places={places}
              value={placeId}
              onChange={onSelectPlace}
            />
          </div>
        )}

        {/* Live Environmental Panel - shows data from selected zone */}
        <LiveEnvironmentalPanel zone={selectedZone ?? null} />
      </div>

      {/* Map Mode Section - Fixed at Bottom */}
      <div className="px-6 py-5 border-t border-[#324d67]/30">
        <h3 className="text-sm font-semibold text-[#92adc9] mb-3 uppercase tracking-wide">
          Map Mode
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => onMapModeChange("terrain")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg
              font-semibold text-sm transition-all
              ${mapMode === "terrain"
                ? "bg-[#3b82f6] text-white shadow-lg"
                : "bg-[#1a2632] text-[#92adc9] border border-[#324d67] hover:bg-[#324d67]/30"
              }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            Terrain
          </button>
          <button
            onClick={() => onMapModeChange("satellite")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg
              font-semibold text-sm transition-all
              ${mapMode === "satellite"
                ? "bg-[#3b82f6] text-white shadow-lg"
                : "bg-[#1a2632] text-[#92adc9] border border-[#324d67] hover:bg-[#324d67]/30"
              }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            Satellite
          </button>
        </div>
      </div>
    </aside>
  );
}
