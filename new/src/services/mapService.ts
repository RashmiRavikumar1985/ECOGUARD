// src/services/mapService.ts
import { geoData } from "../data/geoData";
import { getCountryCoordinates, getCountryZoom } from "../data/countries";

export type MapMode = "terrain" | "satellite";

export type MapConfig = {
  center: [number, number];
  zoom: number;
  tileUrl: string;
  attribution: string;
  maxZoom: number; // Maximum zoom level for this map type
};

export function getWorldMapConfig(mode: MapMode): MapConfig {
  const terrain: MapConfig = {
    center: [20, 0],
    zoom: 2,
    // CARTO Dark - clean English labels, professional dark map
    tileUrl: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "© CARTO © OpenStreetMap",
    maxZoom: 19,
  };

  const satellite: MapConfig = {
    center: [20, 0],
    zoom: 2,
    // Using Esri World Imagery for satellite view
    tileUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
    maxZoom: 17,
  };

  return mode === "satellite" ? satellite : terrain;
}

export async function fetchGeoSelection(selection: {
  country: string;
  region: string | null;
  place: string | null;
}): Promise<void> {
  // TODO: Implement backend API call
  console.log("Geo selection changed:", selection);
}

// Location coordinates mapping
const locationCoordinates: Record<string, [number, number]> = {
  // Countries
  "country-us": [39.8283, -98.5795], // Center of USA
  "country-ca": [56.1304, -106.3468], // Center of Canada
  "country-uk": [54.7024, -3.2766], // Center of UK
  "country-de": [51.1657, 10.4515], // Center of Germany
  "country-in": [20.59, 78.96], // Center of India
  
  // US Regions
  "region-ca": [36.7783, -119.4179], // California
  "region-ny": [43.2994, -74.2179], // New York
  "region-tx": [31.9686, -99.9018], // Texas
  "region-wa": [47.7511, -120.7401], // Washington
  
  // India Regions
  "region-ka": [15.32, 75.71], // Karnataka
  "region-kl": [10.85, 76.27], // Kerala
  "region-mh": [19.75, 75.71], // Maharashtra
  "region-dl": [28.70, 77.10], // Delhi
  "region-tn": [11.13, 79.74], // Tamil Nadu
  
  // US Places - California
  sf: [37.7749, -122.4194], // San Francisco
  la: [34.0522, -118.2437], // Los Angeles
  sd: [32.7157, -117.1611], // San Diego
  sac: [38.5816, -121.4944], // Sacramento
  
  // US Places - New York
  nyc: [40.7128, -74.0060], // New York City
  buf: [42.8864, -78.8784], // Buffalo
  alb: [42.6526, -73.7562], // Albany
  
  // US Places - Texas
  aus: [30.2672, -97.7431], // Austin
  hou: [29.7604, -95.3698], // Houston
  dal: [32.7767, -96.7970], // Dallas
  
  // US Places - Washington
  sea: [47.6062, -122.3321], // Seattle
  spk: [47.6588, -117.4260], // Spokane
  tac: [47.2529, -122.4443], // Tacoma
  
  // Canada Regions
  "region-on": [50.0000, -85.0000], // Ontario
  "region-bc": [53.7267, -127.6476], // British Columbia
  
  // UK Regions
  "region-eng": [52.3555, -1.1743], // England
  
  // Germany Regions
  "region-by": [48.7904, 11.4979], // Bavaria
  "region-be": [52.5200, 13.4050], // Berlin
  
  // Canada Places
  tor: [43.6532, -79.3832], // Toronto
  ott: [45.4215, -75.6972], // Ottawa
  van: [49.2827, -123.1207], // Vancouver
  vic: [48.4284, -123.3656], // Victoria
  
  // UK Places
  lon: [51.5074, -0.1278], // London
  man: [53.4808, -2.2426], // Manchester
  
  // Germany Places
  mun: [48.1351, 11.5820], // Munich
  nur: [49.4521, 11.0767], // Nuremberg
  ber: [52.5200, 13.4050], // Berlin
  pot: [52.4009, 13.0591], // Potsdam
  
  // India Places - Karnataka
  blr: [12.9716, 77.5946], // Bangalore
  mys: [12.2958, 76.6394], // Mysore
  
  // India Places - Kerala
  way: [11.68, 76.13], // Wayanad
  koc: [9.9312, 76.2673], // Kochi
  tvm: [8.5241, 76.9366], // Thiruvananthapuram
  
  // India Places - Maharashtra
  mum: [19.0760, 72.8777], // Mumbai
  pun: [18.5204, 73.8567], // Pune
  
  // India Places - Delhi
  ndl: [28.6139, 77.2090], // New Delhi
  odl: [28.6505, 77.2303], // Old Delhi
  
  // India Places - Tamil Nadu
  chn: [13.0827, 80.2707], // Chennai
  cbe: [11.0026, 76.7155], // Coimbatore
};

export function getLocationCoordinates(
  countryId: string,
  regionId: string | null,
  placeId: string | null
): [number, number] | null {
  // Priority: place > region > country
  if (placeId && locationCoordinates[placeId]) {
    return locationCoordinates[placeId];
  }
  if (regionId && locationCoordinates[`region-${regionId}`]) {
    return locationCoordinates[`region-${regionId}`];
  }
  // Try new country data first, then fallback to old
  const countryCoords = getCountryCoordinates(countryId);
  if (countryCoords) {
    return countryCoords;
  }
  if (locationCoordinates[`country-${countryId}`]) {
    return locationCoordinates[`country-${countryId}`];
  }
  // Fallback to default coordinates
  return [20, 0]; // Default world center
}

// Region bounds (approximate bounding boxes for regions)
const regionBounds: Record<string, [[number, number], [number, number]]> = {
  // US Regions - [southwest, northeast]
  "region-ca": [[32.5, -124.5], [42.0, -114.0]], // California
  "region-ny": [[40.5, -79.8], [45.0, -71.8]], // New York
  "region-tx": [[25.8, -106.6], [36.5, -93.5]], // Texas
  "region-wa": [[45.5, -124.8], [49.0, -116.9]], // Washington
  "region-on": [[41.7, -95.2], [56.9, -74.3]], // Ontario
  "region-bc": [[48.2, -139.1], [60.0, -114.0]], // British Columbia
  "region-eng": [[49.9, -6.2], [55.8, 1.8]], // England
  "region-by": [[47.3, 8.9], [50.6, 13.8]], // Bavaria
  "region-be": [[52.3, 13.1], [52.7, 13.7]], // Berlin
  
  // India Regions
  "region-ka": [[11.5, 74.0], [18.5, 78.5]], // Karnataka
  "region-kl": [[8.0, 73.5], [12.5, 77.5]], // Kerala
  "region-mh": [[16.0, 72.5], [22.0, 80.5]], // Maharashtra
  "region-dl": [[28.0, 76.5], [29.0, 77.5]], // Delhi
  "region-tn": [[8.0, 78.0], [13.5, 80.5]], // Tamil Nadu
};

export function getRegionBounds(regionId: string): [[number, number], [number, number]] | null {
  return regionBounds[`region-${regionId}`] || null;
}

// Global search - search by name or coordinates
export function searchLocation(query: string): {
  coordinates: [number, number];
  zoom: number;
  name?: string;
} | null {
  const lowerQuery = query.toLowerCase().trim();
  
  // Check if it's coordinates (lat, lng format)
  const coordMatch = lowerQuery.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { coordinates: [lat, lng], zoom: 12 };
    }
  }
  
  // Search in geoData
  for (const country of geoData) {
    // Check country
    if (country.name.toLowerCase().includes(lowerQuery)) {
      const coords = locationCoordinates[`country-${country.id}`];
      if (coords) return { coordinates: coords, zoom: 4, name: country.name };
    }
    
    // Check regions
    for (const region of country.regions) {
      if (region.name.toLowerCase().includes(lowerQuery)) {
        const coords = locationCoordinates[`region-${region.id}`];
        if (coords) return { coordinates: coords, zoom: 7, name: `${region.name}, ${country.name}` };
      }
      
      // Check places
      for (const place of region.places) {
        if (place.name.toLowerCase().includes(lowerQuery)) {
          const coords = locationCoordinates[place.id];
          if (coords) return { coordinates: coords, zoom: 14, name: `${place.name}, ${region.name}` };
        }
      }
    }
  }
  
  // Special locations (like Wayanad)
  const specialLocations: Record<string, [number, number]> = {
    wayanad: [11.68, 76.13],
  };
  
  if (specialLocations[lowerQuery]) {
    return { coordinates: specialLocations[lowerQuery], zoom: 12, name: query };
  }
  
  return null;
}
