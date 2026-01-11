import { type TickerEntry } from "../../types/overlays";

type LiveDataTickerProps = {
  entries: TickerEntry[];
};

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function LiveDataTicker({ entries }: LiveDataTickerProps) {
  const tickerText = entries.length > 0
    ? entries.map((e) => `[${formatTimestamp(e.timestamp)}] ${e.message}`).join("   •   ")
    : "Waiting for data...";

  return (
    <div className="absolute bottom-0 left-0 right-0 h-8 z-[1000] overflow-hidden bg-black/70">
      <div className="h-full flex items-center animate-ticker whitespace-nowrap">
        <span className="text-xs font-mono text-[#92adc9] px-4">
          {tickerText}
        </span>
        <span className="text-xs font-mono text-[#92adc9] px-4">
          {tickerText}
        </span>
      </div>
    </div>
  );
}
