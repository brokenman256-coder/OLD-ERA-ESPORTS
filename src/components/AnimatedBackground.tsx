const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0a0c10]">
      <div
        className="aurora-spin absolute left-1/2 top-[-30%] h-[90vmax] w-[90vmax] rounded-full opacity-60"
        style={{
          background:
            "conic-gradient(from 0deg, #ff6b1a, #ff8c42, #ffb020, #ffd60a, #ff6b1a)",
          filter: "blur(120px)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, transparent 0%, #0a0c10 65%)",
        }}
      />

      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,107,26,0.8) 35%, rgba(255,214,10,0.8) 65%, transparent)",
          boxShadow: "0 0 16px 1px rgba(255,176,32,0.4)",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />

      <div
        className="absolute inset-0"
        style={{ boxShadow: "inset 0 0 22vmax 4vmax rgba(0,0,0,0.8)" }}
      />
    </div>
  );
}
