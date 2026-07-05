import Particles3D from "@/components/Particles3D";

export const BG_THEMES = {
  neon: {
    orbA: "rgba(37,99,235,0.35)",
    orbB: "rgba(147,51,234,0.35)",
    orbC: "rgba(6,182,212,0.25)",
    plane: "text-cyan-300/30",
    parachuteA: "text-purple-300/25",
    parachuteB: "text-cyan-300/20",
    crate: "text-amber-300/25",
    crosshairA: "text-red-400/25",
    crosshairB: "text-cyan-300/20",
    zoneBorder: "border-cyan-400/25",
  },
  blood: {
    orbA: "rgba(220,38,38,0.35)",
    orbB: "rgba(249,115,22,0.3)",
    orbC: "rgba(234,179,8,0.2)",
    plane: "text-red-300/30",
    parachuteA: "text-orange-300/25",
    parachuteB: "text-red-300/20",
    crate: "text-yellow-300/25",
    crosshairA: "text-red-400/30",
    crosshairB: "text-orange-300/20",
    zoneBorder: "border-red-400/25",
  },
  cyber: {
    orbA: "rgba(6,182,212,0.35)",
    orbB: "rgba(59,130,246,0.3)",
    orbC: "rgba(20,184,166,0.25)",
    plane: "text-teal-300/30",
    parachuteA: "text-blue-300/25",
    parachuteB: "text-teal-300/20",
    crate: "text-cyan-300/25",
    crosshairA: "text-blue-400/25",
    crosshairB: "text-teal-300/20",
    zoneBorder: "border-teal-400/25",
  },
  gold: {
    orbA: "rgba(147,51,234,0.3)",
    orbB: "rgba(217,119,6,0.3)",
    orbC: "rgba(250,204,21,0.25)",
    plane: "text-amber-300/30",
    parachuteA: "text-purple-300/25",
    parachuteB: "text-amber-300/20",
    crate: "text-yellow-300/25",
    crosshairA: "text-purple-400/25",
    crosshairB: "text-amber-300/20",
    zoneBorder: "border-amber-400/25",
  },
} as const;

export type BgThemeName = keyof typeof BG_THEMES;
export const BG_THEME_NAMES = Object.keys(BG_THEMES) as BgThemeName[];

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

function AirdropCrate({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 60 78" className={className} style={style} fill="none">
      <path d="M2 20 Q30 -6 58 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="2" y1="20" x2="18" y2="46" stroke="currentColor" strokeWidth="1" />
      <line x1="58" y1="20" x2="42" y2="46" stroke="currentColor" strokeWidth="1" />
      <rect x="14" y="46" width="32" height="28" rx="2" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.5" />
      <line x1="14" y1="46" x2="46" y2="74" stroke="currentColor" strokeWidth="1" />
      <line x1="46" y1="46" x2="14" y2="74" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function Crosshair({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} fill="none" stroke="currentColor">
      <circle cx="30" cy="30" r="18" strokeWidth="1.5" />
      <circle cx="30" cy="30" r="2.5" fill="currentColor" stroke="none" />
      <line x1="30" y1="2" x2="30" y2="14" strokeWidth="2" />
      <line x1="30" y1="46" x2="30" y2="58" strokeWidth="2" />
      <line x1="2" y1="30" x2="14" y2="30" strokeWidth="2" />
      <line x1="46" y1="30" x2="58" y2="30" strokeWidth="2" />
    </svg>
  );
}

export default function AnimatedBackground({ theme = "neon" }: { theme?: BgThemeName }) {
  const t = BG_THEMES[theme];

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-neutral-950">
      <div className="absolute inset-0 opacity-90">
        <div
          className="bg-orb-a absolute -left-32 -top-32 h-[32rem] w-[32rem] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${t.orbA} 0%, transparent 70%)` }}
        />
        <div
          className="bg-orb-b absolute -right-40 top-1/4 h-[36rem] w-[36rem] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${t.orbB} 0%, transparent 70%)` }}
        />
        <div
          className="bg-orb-c absolute bottom-0 left-1/3 h-[28rem] w-[28rem] rounded-full blur-3xl"
          style={{ background: `radial-gradient(circle, ${t.orbC} 0%, transparent 70%)` }}
        />
      </div>

      <div className="absolute inset-0 opacity-70">
        <Particles3D />
      </div>

      <div
        className={`bg-zone absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] rounded-full border-2 border-dashed ${t.zoneBorder}`}
        style={{ boxShadow: "0 0 60px 10px rgba(34,211,238,0.05) inset" }}
      />

      <div className="absolute inset-0" style={{ perspective: "1200px" }}>
        <PlaneSilhouette
          className={`bg-plane absolute left-0 top-0 h-6 w-20 ${t.plane}`}
          style={{ transformStyle: "preserve-3d" }}
        />
        <Parachute
          className={`bg-parachute absolute left-[15%] top-0 h-16 w-16 ${t.parachuteA}`}
          style={{ transformStyle: "preserve-3d", animationDelay: "-6s" }}
        />
        <AirdropCrate
          className={`bg-parachute absolute left-[45%] top-0 h-16 w-14 ${t.crate}`}
          style={{ transformStyle: "preserve-3d", animationDelay: "-11s" }}
        />
        <Parachute
          className={`bg-parachute absolute left-[70%] top-0 h-12 w-12 ${t.parachuteB}`}
          style={{ transformStyle: "preserve-3d", animationDelay: "-16s" }}
        />
        <Crosshair className={`bg-crosshair absolute left-[85%] top-[20%] h-10 w-10 ${t.crosshairA}`} />
        <Crosshair
          className={`bg-crosshair absolute left-[8%] top-[55%] h-8 w-8 ${t.crosshairB}`}
          style={{ animationDelay: "-9s" }}
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
