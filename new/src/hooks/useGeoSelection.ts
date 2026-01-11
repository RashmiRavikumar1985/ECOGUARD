import { useEffect, useMemo, useState } from "react";
import { geoData } from "../data/geoData";
import { fetchGeoSelection } from "../services/mapService";

export function useGeoSelection() {
  const [countryId, setCountryId] = useState("us");
  const [regionId, setRegionId] = useState<string | null>(null);
  const [placeId, setPlaceId] = useState<string | null>(null);
  
  // Auto-select first region when country changes (only if no region is selected)
  useEffect(() => {
    // First check if country has regions in old geoData
    const country = geoData.find((c) => c.id === countryId);
    if (country && country.regions.length > 0 && regionId === null && !placeId) {
      const timer = requestAnimationFrame(() => {
        setRegionId(country.regions[0].id);
      });
      return () => cancelAnimationFrame(timer);
    }
    // If no regions in old data, clear region/place (for countries like Israel)
    if (!country || country.regions.length === 0) {
      setRegionId(null);
      setPlaceId(null);
    }
  }, [countryId]);

  const country = useMemo(
    () => geoData.find((c) => c.id === countryId),
    [countryId]
  );

  const regions = country?.regions ?? [];

  const region = useMemo(
    () => regions.find((r) => r.id === regionId),
    [regions, regionId]
  );

  const places = region?.places ?? [];

  // 🔥 CALL BACKEND ON SELECTION CHANGE
  useEffect(() => {
    fetchGeoSelection({
      country: countryId,
      region: regionId,
      place: placeId,
    }).catch(console.error);
  }, [countryId, regionId, placeId]);

  function selectCountry(id: string) {
    setCountryId(id);
    setRegionId(null);
    setPlaceId(null);
  }

  function selectRegion(id: string) {
    setRegionId(id);
    setPlaceId(null);
  }

  function selectPlace(id: string) {
    setPlaceId(id);
  }

  function clearSelection() {
    setRegionId(null);
    setPlaceId(null);
  }

  return {
    countryId,
    regionId,
    placeId,
    regions,
    places,
    selectCountry,
    selectRegion,
    selectPlace,
    clearSelection,
  };
}
