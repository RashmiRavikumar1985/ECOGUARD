// Import and type the regions data
import regionsJson from "./regions.json";

export type RegionCoords = {
  lat: number;
  lon: number;
};

export type RegionsData = Record<string, Record<string, RegionCoords>>;

export const regionsData: RegionsData = regionsJson;

// Map country names to country IDs
const countryNameToId: Record<string, string> = {
  "Australia": "au",
  "Brazil": "br",
  "Canada": "ca",
  "United States of America": "us",
  "China": "cn",
  "India": "in",
  "Indonesia": "id",
  "Russia": "ru",
  "South Africa": "za",
};

const countryIdToName: Record<string, string> = {
  "au": "Australia",
  "br": "Brazil",
  "ca": "Canada",
  "us": "United States of America",
  "cn": "China",
  "in": "India",
  "id": "Indonesia",
  "ru": "Russia",
  "za": "South Africa",
};

// Get regions for a country by ID
export function getRegionsForCountry(countryId: string): { id: string; name: string }[] {
  const countryName = countryIdToName[countryId];
  if (!countryName || !regionsData[countryName]) {
    return [];
  }
  
  return Object.keys(regionsData[countryName]).map(regionName => ({
    id: regionName, // Use original name as ID for proper lookup
    name: regionName,
  }));
}

// Get coordinates for a region
export function getRegionCoordinates(countryId: string, regionName: string): [number, number] | null {
  const countryName = countryIdToName[countryId];
  if (!countryName || !regionsData[countryName]) {
    return null;
  }
  
  // Find region by name (case-insensitive)
  const regions = regionsData[countryName];
  const regionKey = Object.keys(regions).find(
    key => key.toLowerCase() === regionName.toLowerCase() ||
           key.toLowerCase().replace(/\s+/g, "-") === regionName.toLowerCase()
  );
  
  if (regionKey && regions[regionKey]) {
    return [regions[regionKey].lat, regions[regionKey].lon];
  }
  
  return null;
}

// Check if a country has regions data
export function hasRegionsData(countryId: string): boolean {
  const countryName = countryIdToName[countryId];
  return !!(countryName && regionsData[countryName]);
}

// Get all countries that have regions data
export function getCountriesWithRegions(): string[] {
  return Object.values(countryNameToId);
}
