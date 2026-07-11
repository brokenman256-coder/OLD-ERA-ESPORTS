function Bracket({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" className={className} fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M2 16V2H16" strokeLinecap="round" />
    </svg>
  );
}

function Reticle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor">
      <circle cx="60" cy="60" r="42" strokeWidth="1.5" />
      <circle cx="60" cy="60" r="28" strokeWidth="1" strokeDasharray="3 5" />
      <circle cx="60" cy="60" r="3" fill="currentColor" stroke="none" />
      <line x1="60" y1="2" x2="60" y2="22" strokeWidth="2" />
      <line x1="60" y1="98" x2="60" y2="118" strokeWidth="2" />
      <line x1="2" y1="60" x2="22" y2="60" strokeWidth="2" />
      <line x1="98" y1="60" x2="118" y2="60" strokeWidth="2" />
      <path d="M60 2 L54 12 L66 12 Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WeaponSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 64" className={className} fill="currentColor">
      <rect x="0" y="27" width="76" height="7" rx="1.5" />
      <rect x="66" y="18" width="76" height="20" rx="2" />
      <path d="M140 22 L184 12 L187 19 L150 31 L140 36 Z" />
      <path d="M92 38 L108 38 L103 62 L95 62 Z" />
      <path d="M118 38 L131 38 L126 57 L120 57 Z" />
      <rect x="76" y="10" width="5" height="10" />
      <rect x="104" y="10" width="5" height="10" />
      <circle cx="60" cy="30.5" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function HudOverlay({ animated = false }: { animated?: boolean }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-4 sm:inset-8">
        <Bracket className="absolute left-0 top-0 h-8 w-8 text-[#c9a869]/50 sm:h-11 sm:w-11" />
        <Bracket className="absolute right-0 top-0 h-8 w-8 rotate-90 text-[#9fd8e8]/50 sm:h-11 sm:w-11" />
        <Bracket className="absolute bottom-0 right-0 h-8 w-8 rotate-180 text-[#c9a869]/50 sm:h-11 sm:w-11" />
        <Bracket className="absolute bottom-0 left-0 h-8 w-8 -rotate-90 text-[#9fd8e8]/50 sm:h-11 sm:w-11" />
      </div>

      <Reticle
        className={`absolute right-[6%] top-[16%] h-24 w-24 text-[#9fd8e8]/25 sm:h-36 sm:w-36 ${animated ? "hud-pulse" : ""}`}
      />

      <WeaponSilhouette className="absolute -bottom-2 -left-6 h-14 w-56 -rotate-3 text-[#c9a869]/10 sm:h-20 sm:w-80" />
    </div>
  );
}
