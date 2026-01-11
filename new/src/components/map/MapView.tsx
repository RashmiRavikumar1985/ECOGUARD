import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Circle, useMap, ZoomControl } from "react-leaflet";
import { useEffect } from "react";
import { type MapMode, getWorldMapConfig, getLocationCoordinates, getRegionBounds } from "../../services/mapService";
import { getRegionCoordinates } from "../../data/regionsData";
import { useKafkaZones } from "../../hooks/useKafkaZones";
import { useMockZones } from "../../hooks/useMockZones"; // For testing
import { RiskHeatmap } from "./RiskHeatmap";
import ZoneTooltip from "./ZoneTooltip";
import L from "leaflet";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

type MapViewProps = {
  mode: MapMode;
  countryId?: string;
  regionId?: string | null;
  placeId?: string | null;
  searchCoordinates?: [number, number] | null;
  searchZoom?: number | null;
  showHeatmap?: boolean; // Toggle heatmap visibility
  onZoneClick?: (zoneId: string) => void;
  onMapMove?: (center: [number, number], zoom: number) => void;
};

// Component to handle map resize, zoom limits, and view updates
function MapController({
  maxZoom,
  countryId,
  regionId,
  placeId,
  searchCoordinates,
  searchZoom,
  onMapMove
}: {
  maxZoom: number;
  countryId?: string;
  regionId?: string | null;
  placeId?: string | null;
  searchCoordinates?: [number, number] | null;
  searchZoom?: number | null;
  onMapMove?: (center: [number, number], zoom: number) => void;
}) {
  const map = useMap();

  // Invalidate size after map loads
  useEffect(() => {
    const timer1 = setTimeout(() => map.invalidateSize(), 100);
    const timer2 = setTimeout(() => map.invalidateSize(), 300);
    const timer3 = setTimeout(() => map.invalidateSize(), 500);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  // Enforce maxZoom limit
  useEffect(() => {
    const handleZoom = () => {
      if (map.getZoom() > maxZoom) {
        map.setZoom(maxZoom);
      }
    };
    map.on('zoomend', handleZoom);
    return () => { map.off('zoomend', handleZoom); };
  }, [map, maxZoom]);

  // Handle search coordinates (global search)
  useEffect(() => {
    if (searchCoordinates && searchZoom !== null && searchZoom !== undefined) {
      const clampedZoom = Math.min(searchZoom, maxZoom);
      map.flyTo(searchCoordinates, clampedZoom, { duration: 1.0 });
      setTimeout(() => map.invalidateSize(), 600);
    }
  }, [map, searchCoordinates, searchZoom, maxZoom]);

  // Handle location selection (Place > Region > Country)
  useEffect(() => {
    // Skip if search is active
    if (searchCoordinates && searchZoom !== null && searchZoom !== undefined) {
      return;
    }

    // Priority 1: Place selection
    if (placeId && countryId) {
      const placeCoords = getLocationCoordinates(countryId, regionId ?? null, placeId);
      if (placeCoords) {
        const targetZoom = Math.min(14, maxZoom);
        map.flyTo(placeCoords, targetZoom, { duration: 0.5 });
        setTimeout(() => map.invalidateSize(), 600);
        return;
      }
    }

    // Priority 2: Region selection (using regionsData)
    if (regionId && !placeId && countryId) {
      // First try regionsData (from regions.json)
      const regionCoords = getRegionCoordinates(countryId, regionId);
      if (regionCoords) {
        map.flyTo(regionCoords, Math.min(6, maxZoom), { duration: 0.8 });
        setTimeout(() => map.invalidateSize(), 600);
        return;
      }

      // Fallback to old bounds method
      const bounds = getRegionBounds(regionId);
      if (bounds) {
        map.flyToBounds(bounds, { duration: 0.8, padding: [50, 50] });
        setTimeout(() => map.invalidateSize(), 600);
        return;
      }
    }

    // Priority 3: Country selection
    if (countryId && !regionId && !placeId) {
      const countryCoords = getLocationCoordinates(countryId, null, null);
      if (countryCoords) {
        const zoom = countryId === "us" ? 2 : 4;
        map.flyTo(countryCoords, Math.min(zoom, maxZoom), { duration: 0.5 });
        setTimeout(() => map.invalidateSize(), 600);
      }
    }
  }, [map, countryId, regionId, placeId, maxZoom, searchCoordinates, searchZoom]);

  // Track map movement
  useEffect(() => {
    const handleMoveEnd = () => {
      if (onMapMove) {
        const center = map.getCenter();
        onMapMove([center.lat, center.lng], map.getZoom());
      }
    };
    map.on('moveend', handleMoveEnd);
    return () => { map.off('moveend', handleMoveEnd); };
  }, [map, onMapMove]);

  return null;
}

export default function MapView({
  mode,
  countryId = "us",
  regionId = null,
  placeId = null,
  searchCoordinates = null,
  searchZoom = null,
  showHeatmap = true,
  onZoneClick,
  onMapMove
}: MapViewProps) {
  const config = getWorldMapConfig(mode);
  const coordinates = getLocationCoordinates(countryId, regionId, placeId) || config.center;

  // Determine zoom level
  let zoom = config.zoom;
  if (placeId) {
    zoom = 14;
  } else if (regionId) {
    zoom = 7;
  } else if (countryId && countryId !== "us") {
    zoom = 4;
  }
  const clampedZoom = Math.min(zoom, config.maxZoom);

  // Get zones from Kafka (enable when region/place selected OR searching)
  // Removed zoom restriction - show heatmap at any zoom level
  const zonesEnabled = Boolean(placeId || regionId || searchCoordinates);

  // Feature flag from environment (set VITE_USE_MOCK_DATA=false to use Kafka)
  const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

  // Get coordinates for zone generation
  const zoneCenter = searchCoordinates || coordinates;

  // Call BOTH hooks unconditionally (React rules of hooks)
  // Only one will return actual data based on the flag
  const mockZonesResult = useMockZones(USE_MOCK_DATA && zonesEnabled, zoneCenter);
  const kafkaZonesResult = useKafkaZones(!USE_MOCK_DATA && zonesEnabled);

  // Use the appropriate result based on the flag
  const { zones } = USE_MOCK_DATA ? mockZonesResult : kafkaZonesResult;

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={coordinates}
        zoom={Math.max(clampedZoom, 3)}
        minZoom={3}
        maxZoom={config.maxZoom}
        style={{ height: "100%", width: "100%", zIndex: 0, backgroundColor: "#1a1a2e" }}
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={true}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          url={config.tileUrl}
          attribution={config.attribution}
          maxZoom={config.maxZoom}
          noWrap={true}
          subdomains={mode === "terrain" ? ["a", "b", "c"] : undefined}
        />

        {/* Risk Heatmap - Pure visualization of riskProbability from Kafka */}
        {/* 🔥 Ultra-smooth professional heatmap - like UHI visualizations */}
        {/* Smooth continuous gradient: Blue → Cyan → Yellow → Orange → Red */}
        {showHeatmap && zonesEnabled && zones.length > 0 && (
          <RiskHeatmap
            zones={zones.map((zone) => ({
              id: zone.id,
              center: zone.center,
              riskProbability: zone.riskProbability, // From Kafka - already calculated by ML
            }))}
            enabled={showHeatmap}
            radius={25} // Smaller radius for better detail
            blur={15} // Less blur for clearer visualization
            maxZoom={18}
            minOpacity={0.4} // Slightly transparent
          />
        )}

        {/* Risk Zones from Kafka - ALWAYS hide circles when heatmap is shown */}
        {/* Heatmap provides smooth gradient - circles would create discrete shapes */}
        {false && zones.map((zone) => {
          // Color based on risk level (from Kafka - already calculated)
          const getZoneColor = (riskLevel: string) => {
            switch (riskLevel) {
              case "CRITICAL":
                return "#ef4444"; // red
              case "WARNING":
                return "#f97316"; // orange
              case "WATCH":
                return "#eab308"; // yellow
              case "SAFE":
                return "#22c55e"; // green
              default:
                return "#6b7280"; // gray
            }
          };

          return (
            <Circle
              key={zone.id}
              center={zone.center}
              radius={zone.radius}
              pathOptions={{
                color: getZoneColor(zone.riskLevel),
                fillColor: getZoneColor(zone.riskLevel),
                fillOpacity: zone.riskLevel === "CRITICAL" ? 0.4 : 0.3,
                weight: zone.riskLevel === "CRITICAL" ? 3 : 2,
              }}
              eventHandlers={{
                mouseover: (e) => {
                  const layer = e.target;
                  layer.setStyle({
                    fillOpacity: 0.6,
                    weight: 4,
                  });
                },
                mouseout: (e) => {
                  const layer = e.target;
                  layer.setStyle({
                    fillOpacity: zone.riskLevel === "CRITICAL" ? 0.4 : 0.3,
                    weight: zone.riskLevel === "CRITICAL" ? 3 : 2,
                  });
                },
                click: () => {
                  if (onZoneClick) {
                    onZoneClick(zone.id);
                  }
                },
              }}
            >
              <ZoneTooltip zone={zone} />
            </Circle>
          );
        })}

        <MapController
          maxZoom={config.maxZoom}
          countryId={countryId}
          regionId={regionId}
          placeId={placeId}
          searchCoordinates={searchCoordinates}
          searchZoom={searchZoom}
          onMapMove={onMapMove}
        />
        <ZoomControl position="bottomright" />
      </MapContainer>
    </div>
  );
}
