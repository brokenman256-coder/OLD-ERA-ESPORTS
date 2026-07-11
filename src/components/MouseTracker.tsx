"use client";

import { useEffect, useRef } from "react";

export default function MouseTracker({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    function onMove(e: MouseEvent) {
      const el = ref.current;
      if (!el) return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      el.style.setProperty("--mx", nx.toFixed(3));
      el.style.setProperty("--my", ny.toFixed(3));
      el.style.setProperty("--mx-pct", `${(e.clientX / window.innerWidth) * 100}%`);
      el.style.setProperty("--my-pct", `${(e.clientY / window.innerHeight) * 100}%`);
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={
        {
          "--mx": 0,
          "--my": 0,
          "--mx-pct": "50%",
          "--my-pct": "50%",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
