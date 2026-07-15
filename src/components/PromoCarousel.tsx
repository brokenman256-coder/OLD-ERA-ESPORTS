"use client";

import { useEffect, useState } from "react";

interface Promo {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
}

export default function PromoCarousel() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetch("/api/promos")
      .then((res) => res.json())
      .then((data) => setPromos(data.promos ?? []))
      .catch(() => setPromos([]));
  }, []);

  useEffect(() => {
    if (promos.length < 2) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % promos.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [promos.length]);

  if (promos.length === 0) return null;

  const current = promos[index];

  const content = (
    // eslint-disable-next-line @next/next/no-img-element -- admin-uploaded promo banner
    <img src={current.imageUrl} alt={current.title} className="h-full w-full object-cover" />
  );

  return (
    <div className="relative mx-auto mt-6 max-w-2xl overflow-hidden rounded-xl border border-white/10">
      <div className="relative h-40 w-full sm:h-52">
        {current.linkUrl ? (
          <a href={current.linkUrl} target="_blank" rel="noreferrer">
            {content}
          </a>
        ) : (
          content
        )}
        <div className="absolute bottom-0 left-0 flex w-full items-center justify-between bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
          <p className="text-sm font-semibold text-white">{current.title}</p>
          <span className="rounded-full bg-yellow-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Live
          </span>
        </div>
      </div>
      {promos.length > 1 && (
        <div className="absolute right-3 top-3 flex gap-1">
          {promos.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setIndex(i)}
              aria-label={`Show promo ${i + 1}`}
              className={`h-1.5 w-4 rounded-full transition ${i === index ? "bg-white" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
