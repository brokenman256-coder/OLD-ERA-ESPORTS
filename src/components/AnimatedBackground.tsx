import Particles3D from "@/components/Particles3D";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const WEAVE =
  "repeating-linear-gradient(118deg, transparent 0px, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 3px, transparent 3px, transparent 46px)";

export default function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-neutral-950">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 70% at 50% -10%, #17181a 0%, #0a0a0b 55%, #050505 100%)",
        }}
      />

      <div className="absolute inset-0 opacity-[0.35]" style={{ backgroundImage: WEAVE }} />

      <div className="bg-sweep absolute inset-[-20%] opacity-[0.09] mix-blend-screen" />

      <div className="absolute inset-0 opacity-70">
        <Particles3D />
      </div>

      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />

      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
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
        style={{ boxShadow: "inset 0 0 18vmax 2vmax rgba(0,0,0,0.65)" }}
      />
    </div>
  );
}
