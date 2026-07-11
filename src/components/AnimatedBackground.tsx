import Particles3D from "@/components/Particles3D";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

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

      <div className="bg-sweep absolute inset-[-20%] opacity-[0.06]" />

      <div className="absolute inset-0 opacity-60">
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
        className="absolute inset-0"
        style={{ boxShadow: "inset 0 0 18vmax 2vmax rgba(0,0,0,0.65)" }}
      />
    </div>
  );
}
