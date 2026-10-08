"use client";

import { useEffect, useRef, useState } from "react";

export default function StatCounter({ value, durationMs = 1200 }: { value: number; durationMs?: number }) {
  // Start already showing the real number (matches SSR output) instead of 0,
  // so it never flashes/reads as "0" before the count-up animation kicks in.
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    const from = prevValue.current;
    if (from === value) return;
    prevValue.current = value;
    const start = performance.now();
    let frame: number;

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + eased * (value - from)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  return <span>{display}</span>;
}
