import { useState } from "react";
import { searchLocation } from "../../services/mapService";

type GlobalSearchProps = {
  onLocationFound: (coordinates: [number, number], zoom: number) => void;
};

// Nominatim geocoding API (free, no API key needed)
async function geocodeLocation(query: string): Promise<{
  coordinates: [number, number];
  zoom: number;
  name: string;
} | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: {
          "User-Agent": "GeoViewer/1.0",
        },
      }
    );
    const data = await response.json();
    if (data && data.length > 0) {
      const result = data[0];
      return {
        coordinates: [parseFloat(result.lat), parseFloat(result.lon)],
        zoom: 12,
        name: result.display_name,
      };
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }
  return null;
}

export function GlobalSearch({ onLocationFound }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!query.trim()) return;

    // First try local search
    const localResult = searchLocation(query);
    if (localResult) {
      console.log("Local search found:", localResult);
      onLocationFound(localResult.coordinates, localResult.zoom);
      setQuery("");
      return;
    }

    // Fallback to geocoding API
    setIsSearching(true);
    const geoResult = await geocodeLocation(query);
    setIsSearching(false);

    if (geoResult) {
      console.log("Geocoding found:", geoResult);
      onLocationFound(geoResult.coordinates, geoResult.zoom);
      setQuery("");
    } else {
      setError("Location not found. Try a different search term.");
    }
  };

  return (
    <form onSubmit={handleSearch} className="mb-0">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setError(null);
          }}
          placeholder="Search location (e.g., Wayanad)"
          className="w-full px-4 py-2.5 bg-[#1a2632] border border-[#324d67] rounded-lg
                     text-white placeholder-[#92adc9] focus:outline-none focus:border-[#3b82f6]
                     text-sm"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5
                     bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#324d67] rounded-md text-white text-sm
                     transition-colors"
        >
          {isSearching ? "..." : "Search"}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
    </form>
  );
}
