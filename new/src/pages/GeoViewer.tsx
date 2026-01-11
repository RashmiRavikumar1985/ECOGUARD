import { useState, useMemo, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import MapView from "../components/map/MapView";
import TimeSeriesSlider from "../components/overlays/TimeSeriesSlider";
import DensityIndexCard from "../components/overlays/DensityIndexCard";
import LiveDataTicker from "../components/overlays/LiveDataTicker";
import { IconButton } from "../components/common/IconButton";
import useMapMode from "../hooks/useMapMode";
import useTimeSeriesPlayer from "../hooks/useTimeSeriesPlayer";
import { useKafkaConnection } from "../hooks/useKafkaConnection";
import { useKafkaStats } from "../hooks/useKafkaStats";
import { useKafkaTicker } from "../hooks/useKafkaTicker";
import { useMockZones } from "../hooks/useMockZones";
import { useKafkaZones } from "../hooks/useKafkaZones";
import { geoData } from "../data/geoData";
import { getLocationCoordinates } from "../services/mapService";

export default function GeoViewer() {
  const { mode, setMapMode } = useMapMode();
  const [countryId, setCountryId] = useState("us");
  const [regionId, setRegionId] = useState<string | null>(null);
  const [placeId, setPlaceId] = useState<string | null>(null);

  // Selected zone for environmental panel
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  // Search state
  const [searchCoordinates, setSearchCoordinates] = useState<[number, number] | null>(null);
  const [searchZoom, setSearchZoom] = useState<number | null>(null);

  // Heatmap visibility toggle
  const [showHeatmap, setShowHeatmap] = useState(true);

  // Get coordinates for current selection OR search
  const coordinates = useMemo(() => {
    // If search is active, use search coordinates
    if (searchCoordinates) {
      return searchCoordinates;
    }
    return getLocationCoordinates(countryId, regionId, placeId) || [37.7749, -122.4194] as [number, number];
  }, [countryId, regionId, placeId, searchCoordinates]);

  // Get zones from hooks (for Live Environmental Panel)
  // Enable zones when: region/place selected OR search is active
  const zonesEnabled = Boolean(placeId || regionId || searchCoordinates);
  const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
  const mockZonesResult = useMockZones(USE_MOCK_DATA && zonesEnabled, coordinates);
  const kafkaZonesResult = useKafkaZones(!USE_MOCK_DATA && zonesEnabled);
  const { zones } = USE_MOCK_DATA ? mockZonesResult : kafkaZonesResult;

  // Get selected zone for environmental panel
  const selectedZone = useMemo(() => {
    if (selectedZoneId) {
      return zones.find(z => z.id === selectedZoneId) ?? null;
    }
    // Auto-select first zone if available
    return zones.length > 0 ? zones[0] : null;
  }, [zones, selectedZoneId]);

  // Get places for selected region
  // regionsData.ts uses full names (e.g., "California") as IDs
  // geoData.ts uses short IDs (e.g., "ca") - we need to match by name
  const places = useMemo(() => {
    if (!countryId || !regionId) {
      return [];
    }
    const country = geoData.find(c => c.id === countryId);
    if (!country) {
      return [];
    }
    // regionId from regionsData is the full name (e.g., "California")
    // We need to find the region in geoData by matching the name
    const region = country.regions.find(r => 
      r.name.toLowerCase() === regionId.toLowerCase() ||
      r.id === regionId.toLowerCase()
    );
    return region?.places ?? [];
  }, [countryId, regionId]);

  // Handle country change - reset region and place
  const handleCountryChange = (id: string) => {
    setCountryId(id);
    setRegionId(null);
    setPlaceId(null);
    setSearchCoordinates(null);
    setSearchZoom(null);
  };

  // Handle region change - reset place
  const handleRegionChange = (id: string | null) => {
    setRegionId(id);
    setPlaceId(null);
    setSearchCoordinates(null);
    setSearchZoom(null);
  };

  // Handle place change
  const handlePlaceChange = (id: string) => {
    setPlaceId(id);
    setSearchCoordinates(null);
    setSearchZoom(null);
  };

  // Handle global search
  const handleSearchLocation = (coordinates: [number, number], zoom: number) => {
    setSearchCoordinates(coordinates);
    setSearchZoom(zoom);
  };

  // Handle map movement
  const handleMapMove = (center: [number, number], zoom: number) => {
    console.log("Map moved to:", center, "zoom:", zoom);
  };

  // Handle zone click - select zone for environmental panel
  const handleZoneClick = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  // Kafka connection
  const { status: kafkaStatus, isConnected } = useKafkaConnection(true);

  // Time series: last 24 hours
  const now = new Date();
  const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const { currentTime, isPlaying, toggle, seek } = useTimeSeriesPlayer({
    startTime,
    endTime: now,
  });

  // Density stats from Kafka
  const { stats, lastUpdate: statsLastUpdate } = useKafkaStats();
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  // Ticker log from Kafka
  const { entries, addEntry } = useKafkaTicker(20);

  // Add connection status to ticker (useEffect for side effects, not useMemo)
  useEffect(() => {
    if (isConnected) {
      addEntry("Kafka: Connection Established");
    } else if (kafkaStatus === "disconnected") {
      addEntry("Kafka: Connection Lost");
    }
  }, [isConnected, kafkaStatus, addEntry]);

  return (
    <div className="flex w-full h-screen bg-[#0a0f14] overflow-hidden">
      <Sidebar
        mapMode={mode}
        onMapModeChange={setMapMode}
        onSearchLocation={handleSearchLocation}
        countryId={countryId}
        onSelectCountry={handleCountryChange}
        regionId={regionId}
        onSelectRegion={handleRegionChange}
        placeId={placeId}
        onSelectPlace={handlePlaceChange}
        places={places}
        selectedZone={selectedZone}
      />
      <div className="flex-1 relative h-screen w-full z-0 bg-[#0a0f14]">
        <MapView
          mode={mode}
          countryId={countryId}
          regionId={regionId}
          placeId={placeId}
          searchCoordinates={searchCoordinates}
          searchZoom={searchZoom}
          showHeatmap={showHeatmap}
          onZoneClick={handleZoneClick}
          onMapMove={handleMapMove}
        />

        {/* Top right controls */}
        <div className="absolute top-0 right-0 flex gap-2 z-30 p-4 bg-transparent">
          <IconButton title="Settings">
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </IconButton>
          <IconButton title="Profile">
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </IconButton>
        </div>

        {/* Overlay Components */}
        <TimeSeriesSlider
          startTime={startTime}
          endTime={now}
          currentTime={currentTime}
          isPlaying={isPlaying}
          onTimeChange={seek}
          onPlayPause={toggle}
        />

        <DensityIndexCard
          stats={stats}
          isExpanded={isExpanded}
          onToggleExpand={toggleExpanded}
        />

        <LiveDataTicker entries={entries} />
      </div>
    </div>
  );
}
