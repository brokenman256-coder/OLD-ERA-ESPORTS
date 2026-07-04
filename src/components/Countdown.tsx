"use client";

import { useEffect, useState } from "react";

function timeParts(target: number) {
  const diff = Math.max(0, target - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { diff, days, hours, minutes, seconds };
}

export default function Countdown({ startDate }: { startDate: string | Date }) {
  const target = new Date(startDate).getTime();
  const [parts, setParts] = useState(() => timeParts(target));

  useEffect(() => {
    const interval = setInterval(() => setParts(timeParts(target)), 1000);
    return () => clearInterval(interval);
  }, [target]);

  if (parts.diff <= 0) {
    return <p className="text-sm font-semibold text-green-600 dark:text-green-400">Starting now / already started</p>;
  }

  const unit = (value: number, label: string) => (
    <div className="flex flex-col items-center">
      <span className="text-xl font-bold tabular-nums">{String(value).padStart(2, "0")}</span>
      <span className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
      <span className="text-sm font-medium text-neutral-500">Starts in</span>
      <div className="flex gap-3">
        {unit(parts.days, "days")}
        {unit(parts.hours, "hrs")}
        {unit(parts.minutes, "min")}
        {unit(parts.seconds, "sec")}
      </div>
    </div>
  );
}
