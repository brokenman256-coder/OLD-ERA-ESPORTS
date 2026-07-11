import Particles3D from "@/components/Particles3D";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const GRID_LINES =
  "linear-gradient(rgba(201,168,105,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(159,216,232,0.5) 1px, transparent 1px)";

const SUN_SCANLINES =
  "repeating-linear-gradient(to bottom, black 0, black 3px, transparent 3px, transparent 7px)";

export default function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #050507 0%, #0a0a10 45%, #120c14 62%, #050505 100%)",
        }}
      />

      <div className="absolute inset-0 opacity-70">
        <Particles3D />
      </div>

      <div
        className="absolute left-1/2 top-[56%] h-[46vh] w-[150vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, rgba(201,168,105,0.32) 0%, rgba(159,216,232,0.2) 45%, transparent 72%)",
        }}
      />

      <div
        className="bg-sun absolute left-1/2 top-[56%] h-[26vh] w-[26vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
        style={{
          background: "linear-gradient(to bottom, #f3d99b 0%, #c9a869 38%, #b3557a 62%, #6fb8d1 82%, #9fd8e8 100%)",
          boxShadow: "0 0 80px 10px rgba(201,168,105,0.35), 0 0 140px 40px rgba(159,216,232,0.15)",
        }}
      >
        <div
          className="absolute inset-x-0 bottom-0 h-[55%]"
          style={{
            background: "#050507",
            WebkitMaskImage: SUN_SCANLINES,
            maskImage: SUN_SCANLINES,
          }}
        />
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-[46vh] overflow-hidden"
        style={{ maskImage: "linear-gradient(to top, black 55%, transparent 100%)", WebkitMaskImage: "linear-gradient(to top, black 55%, transparent 100%)" }}
      >
        <div
          className="bg-grid-floor absolute inset-x-[-60%] bottom-0 h-[220%]"
          style={{
            backgroundImage: GRID_LINES,
            backgroundSize: "64px 64px",
            transform: "perspective(280px) rotateX(66deg)",
            transformOrigin: "bottom",
          }}
        />
      </div>

      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />

      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(201,168,105,0.7) 45%, rgba(159,216,232,0.7) 55%, transparent)",
          boxShadow: "0 0 12px 1px rgba(201,168,105,0.35)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{ boxShadow: "inset 0 0 18vmax 2vmax rgba(0,0,0,0.7)" }}
      />
    </div>
  );
}
