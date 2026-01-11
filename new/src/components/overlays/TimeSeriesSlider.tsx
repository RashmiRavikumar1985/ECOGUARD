import { useCallback, useRef } from "react";

type TimeSeriesSliderProps = {
  startTime: Date;
  endTime: Date;
  currentTime: Date;
  isPlaying: boolean;
  onTimeChange: (time: Date) => void;
  onPlayPause: () => void;
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getTimeLabels(start: Date, end: Date, count: number): Date[] {
  const labels: Date[] = [];
  const range = end.getTime() - start.getTime();
  for (let i = 0; i <= count; i++) {
    labels.push(new Date(start.getTime() + (range * i) / count));
  }
  return labels;
}

export default function TimeSeriesSlider({
  startTime,
  endTime,
  currentTime,
  isPlaying,
  onTimeChange,
  onPlayPause,
}: TimeSeriesSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const range = endTime.getTime() - startTime.getTime();
  const progress = ((currentTime.getTime() - startTime.getTime()) / range) * 100;
  const timeLabels = getTimeLabels(startTime, endTime, 5); // 6 labels (0-5)

  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(1, x / rect.width));
      const newTime = new Date(startTime.getTime() + range * percent);
      onTimeChange(newTime);
    },
    [startTime, range, onTimeChange]
  );

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl
                   bg-[#1a2632]/90 backdrop-blur-md border border-[#324d67]
                   shadow-lg w-[420px]"
      >
        {/* Play/Pause Button */}
        <button
          onClick={onPlayPause}
          className="w-8 h-8 flex items-center justify-center rounded-full
                     bg-[#3b82f6] hover:bg-[#2563eb] transition-colors"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Timeline */}
        <div className="flex-1 flex flex-col gap-1">
          {/* Track */}
          <div
            ref={trackRef}
            onClick={handleTrackClick}
            className="relative h-2 bg-[#324d67] rounded-full cursor-pointer"
          >
            {/* Progress */}
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
              style={{ width: `${progress}%` }}
            />
            {/* Scrubber */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md border-2 border-blue-500"
              style={{ left: `calc(${progress}% - 8px)` }}
            />
          </div>

          {/* Time Labels */}
          <div className="flex justify-between text-[10px] text-[#92adc9]">
            {timeLabels.map((t, i) => (
              <span key={i}>{formatTime(t)}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
