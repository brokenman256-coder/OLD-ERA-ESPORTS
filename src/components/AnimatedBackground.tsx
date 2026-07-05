import Particles3D from "@/components/Particles3D";

function Parachute({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 60 70" className={className} style={style} fill="none">
      <path d="M2 22 Q30 -4 58 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M2 22 Q16 10 30 22 Q44 10 58 22" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.18" />
      <line x1="2" y1="22" x2="26" y2="46" stroke="currentColor" strokeWidth="1" />
      <line x1="58" y1="22" x2="34" y2="46" stroke="currentColor" strokeWidth="1" />
      <line x1="30" y1="22" x2="30" y2="46" stroke="currentColor" strokeWidth="1" />
      <rect x="25" y="46" width="10" height="12" rx="2" fill="currentColor" fillOpacity="0.5" />
    </svg>
  );
}

function PlaneSilhouette({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 80 24" className={className} style={style} fill="currentColor">
      <path d="M0 12 L28 9 L46 1 L52 1 L44 10 L72 9 L80 12 L72 15 L44 14 L52 23 L46 23 L28 15 Z" />
    </svg>
  );
}

export default function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-neutral-950">
      <div className="absolute inset-0 opacity-90">
        <div
          className="bg-orb-a absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(37,99,235,0.35) 0%, transparent 70%)" }}
        />
        <div
          className="bg-orb-b absolute -right-40 top-1/4 h-[36rem] w-[36rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(147,51,234,0.35) 0%, transparent 70%)" }}
        />
        <div
          className="bg-orb-c absolute bottom-0 left-1/3 h-[28rem] w-[28rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)" }}
        />
      </div>

      <div className="absolute inset-0 opacity-70">
        <Particles3D />
      </div>

      <div className="absolute inset-0" style={{ perspective: "1200px" }}>
        <PlaneSilhouette
          className="bg-plane absolute left-0 top-0 h-6 w-20 text-cyan-300/30"
          style={{ transformStyle: "preserve-3d" }}
        />
        <Parachute
          className="bg-parachute absolute left-[15%] top-0 h-16 w-16 text-purple-300/25"
          style={{ transformStyle: "preserve-3d", animationDelay: "-6s" }}
        />
        <Parachute
          className="bg-parachute absolute left-[70%] top-0 h-12 w-12 text-cyan-300/20"
          style={{ transformStyle: "preserve-3d", animationDelay: "-16s" }}
        />
      </div>

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}
