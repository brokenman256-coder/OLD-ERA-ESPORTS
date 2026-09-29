"use client";

import { useEffect, useState } from "react";

const MIN = 200;
const MAX = 1000;

function randomInRange() {
  return Math.floor(MIN + Math.random() * (MAX - MIN));
}

export default function PlayersOnlineCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- seeds a client-only random display value, not derived from props/state
    setCount(randomInRange());
    const interval = setInterval(() => {
      setCount((prev) => {
        const base = prev ?? randomInRange();
        const jitter = Math.floor(Math.random() * 41) - 20; // +/- 20
        return Math.min(MAX, Math.max(MIN, base + jitter));
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return <span suppressHydrationWarning>{count ?? "—"}</span>;
}
