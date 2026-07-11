import HudOverlay from "@/components/HudOverlay";
import GeometricShapes from "@/components/GeometricShapes";
import EnergyWaves from "@/components/EnergyWaves";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const GRID_LINES =
  "linear-gradient(rgba(34,211,238,0.32) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.28) 1px, transparent 1px)";

const STARS =
  "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 65% 15%, rgba(255,255,255,0.4), transparent), radial-gradient(1px 1px at 85% 45%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 35% 60%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 50% 8%, rgba(255,255,255,0.4), transparent), radial-gradient(1px 1px at 10% 70%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 95% 25%, rgba(255,255,255,0.4), transparent)";

export default function StaticGamingBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-black">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #030308 0%, #070a1c 35%, #0e0a24 60%, #05040d 100%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 0%, rgba(59,60,150,0.24) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 85% 100%, rgba(126,34,206,0.18) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 10% 90%, rgba(8,145,178,0.16) 0%, transparent 60%)",
        }}
      />

      <div className="absolute inset-0 opacity-70" style={{ backgroundImage: STARS, backgroundSize: "100% 100%" }} />

      <GeometricShapes />
      <EnergyWaves />

      <div
        className="absolute inset-x-0 bottom-0 h-[38vh] overflow-hidden"
        style={{
          maskImage: "linear-gradient(to top, black 55%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, black 55%, transparent 100%)",
        }}
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
        className="absolute inset-x-0 bottom-[34vh] h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.45) 45%, rgba(168,85,247,0.45) 55%, transparent)",
          boxShadow: "0 0 16px 1px rgba(34,211,238,0.2)",
        }}
      />

      <HudOverlay />

      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />

      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.5) 45%, rgba(168,85,247,0.5) 55%, transparent)",
          boxShadow: "0 0 10px 1px rgba(34,211,238,0.25)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{ boxShadow: "inset 0 0 18vmax 3vmax rgba(0,0,0,0.7)" }}
      />
    </div>
  );
}
