import { useState, useEffect, useCallback, useRef } from "react";

type UseTimeSeriesPlayerProps = {
  startTime: Date;
  endTime: Date;
  stepMs?: number; // How much to advance per tick (default: 10 minutes)
  intervalMs?: number; // How often to tick when playing (default: 500ms)
};

type UseTimeSeriesPlayerReturn = {
  currentTime: Date;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seek: (time: Date) => void;
};

function clampTime(time: Date, start: Date, end: Date): Date {
  const t = time.getTime();
  const s = start.getTime();
  const e = end.getTime();
  if (t < s) return new Date(s);
  if (t > e) return new Date(e);
  return time;
}

export default function useTimeSeriesPlayer({
  startTime,
  endTime,
  stepMs = 10 * 60 * 1000, // 10 minutes
  intervalMs = 500,
}: UseTimeSeriesPlayerProps): UseTimeSeriesPlayerReturn {
  const [currentTime, setCurrentTime] = useState<Date>(() =>
    clampTime(new Date(), startTime, endTime)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const toggle = useCallback(() => setIsPlaying((p) => !p), []);

  const seek = useCallback(
    (time: Date) => {
      setCurrentTime(clampTime(time, startTime, endTime));
    },
    [startTime, endTime]
  );

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setCurrentTime((prev) => {
          const next = new Date(prev.getTime() + stepMs);
          if (next.getTime() >= endTime.getTime()) {
            setIsPlaying(false);
            return endTime;
          }
          return next;
        });
      }, intervalMs);
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, stepMs, intervalMs, endTime]);

  return { currentTime, isPlaying, play, pause, toggle, seek };
}
