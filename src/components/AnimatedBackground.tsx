import Particles3D from "@/components/Particles3D";
import HudOverlay from "@/components/HudOverlay";
import GeometricShapes from "@/components/GeometricShapes";
import EnergyWaves from "@/components/EnergyWaves";
import MouseTracker from "@/components/MouseTracker";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const GRID_LINES =
  "linear-gradient(rgba(34,211,238,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.35) 1px, transparent 1px)";

export default function AnimatedBackground() {
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
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 0%, rgba(59,60,150,0.28) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 85% 100%, rgba(126,34,206,0.22) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 10% 90%, rgba(8,145,178,0.2) 0%, transparent 60%)",
        }}
      />

      <MouseTracker className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at var(--mx-pct) var(--my-pct), rgba(34,211,238,0.12), transparent 35%)",
          }}
        />
        <div
          className="absolute inset-[-8%]"
          style={{ transform: "translate3d(calc(var(--mx) * -10px), calc(var(--my) * -10px), 0)" }}
        >
          <GeometricShapes animated />
        </div>
        <div
          className="absolute inset-[-4%] opacity-70"
          style={{ transform: "translate3d(calc(var(--mx) * -18px), calc(var(--my) * -18px), 0)" }}
        >
          <Particles3D />
        </div>
      </MouseTracker>

      <EnergyWaves animated />

      <div className="bg-holo absolute inset-[-25%] opacity-[0.07] mix-blend-screen">
        <div
          className="h-full w-full"
          style={{
            background:
              "linear-gradient(100deg, transparent 40%, rgba(34,211,238,0.6) 48%, rgba(168,85,247,0.7) 51%, rgba(99,102,241,0.5) 54%, transparent 62%)",
          }}
        />
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-[42vh] overflow-hidden"
        style={{
          maskImage: "linear-gradient(to top, black 55%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, black 55%, transparent 100%)",
        }}
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
        className="absolute inset-x-0 bottom-[38vh] h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.6) 45%, rgba(168,85,247,0.6) 55%, transparent)",
          boxShadow: "0 0 20px 2px rgba(34,211,238,0.3)",
        }}
      />

      <HudOverlay animated />

      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />

      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.7) 45%, rgba(168,85,247,0.7) 55%, transparent)",
          boxShadow: "0 0 12px 1px rgba(34,211,238,0.35)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{ boxShadow: "inset 0 0 20vmax 3vmax rgba(0,0,0,0.75)" }}
      />
    </div>
  );
}
