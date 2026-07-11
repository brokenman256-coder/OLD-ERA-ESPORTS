const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const GRID_LINES =
  "linear-gradient(rgba(201,168,105,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(159,216,232,0.35) 1px, transparent 1px)";

const STARS =
  "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 65% 15%, rgba(255,255,255,0.4), transparent), radial-gradient(1px 1px at 85% 45%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 35% 60%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 50% 8%, rgba(255,255,255,0.4), transparent), radial-gradient(1px 1px at 10% 70%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 95% 25%, rgba(255,255,255,0.4), transparent)";

const SUN_SCANLINES =
  "repeating-linear-gradient(to bottom, black 0, black 3px, transparent 3px, transparent 7px)";

export default function StaticGamingBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #050507 0%, #0a0a10 45%, #120c14 62%, #050505 100%)",
        }}
      />

      <div className="absolute inset-0 opacity-80" style={{ backgroundImage: STARS, backgroundSize: "100% 100%" }} />

      <div
        className="absolute left-1/2 top-[56%] h-[42vh] w-[140vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, rgba(201,168,105,0.24) 0%, rgba(159,216,232,0.15) 45%, transparent 72%)",
        }}
      />

      <div
        className="absolute left-1/2 top-[56%] h-[22vh] w-[22vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
        style={{
          background: "linear-gradient(to bottom, #f3d99b 0%, #c9a869 38%, #b3557a 62%, #6fb8d1 82%, #9fd8e8 100%)",
          boxShadow: "0 0 60px 8px rgba(201,168,105,0.28), 0 0 100px 30px rgba(159,216,232,0.12)",
        }}
      >
        <div
          className="absolute inset-x-0 bottom-0 h-[55%]"
          style={{ background: "#050507", WebkitMaskImage: SUN_SCANLINES, maskImage: SUN_SCANLINES }}
        />
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-[40vh] overflow-hidden"
        style={{ maskImage: "linear-gradient(to top, black 55%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 55%, transparent 100%)" }}
      >
        <div
          className="absolute inset-x-[-60%] bottom-0 h-[220%]"
          style={{
            backgroundImage: GRID_LINES,
            backgroundSize: "64px 64px",
            transform: "perspective(280px) rotateX(66deg)",
            transformOrigin: "bottom",
          }}
        />
      </div>

      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />

      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(201,168,105,0.5) 45%, rgba(159,216,232,0.5) 55%, transparent)",
          boxShadow: "0 0 10px 1px rgba(201,168,105,0.25)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{ boxShadow: "inset 0 0 16vmax 2vmax rgba(0,0,0,0.65)" }}
      />
    </div>
  );
}
