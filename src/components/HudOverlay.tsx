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

function ControllerSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 100" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M50 30 H150 C178 30 190 55 182 78 C176 96 156 98 144 82 L128 62 H72 L56 82 C44 98 24 96 18 78 C10 55 22 30 50 30 Z" />
      <circle cx="56" cy="52" r="7" />
      <path d="M56 45 V59 M49 52 H63" strokeLinecap="round" />
      <circle cx="150" cy="46" r="5" />
      <circle cx="164" cy="60" r="5" />
      <circle cx="136" cy="60" r="5" />
      <circle cx="150" cy="74" r="5" />
    </svg>
  );
}

function CircuitTrace({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 160" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M0 40 H60 L80 60 H140 L160 40 H240" />
      <path d="M0 100 H40 L60 80 H120 L140 100 H240" />
      <path d="M100 0 V30 L120 50" />
      <path d="M180 0 V50" />
      <circle cx="80" cy="60" r="3" fill="currentColor" />
      <circle cx="160" cy="40" r="3" fill="currentColor" />
      <circle cx="60" cy="80" r="3" fill="currentColor" />
      <circle cx="140" cy="100" r="3" fill="currentColor" />
      <circle cx="180" cy="50" r="3" fill="currentColor" />
    </svg>
  );
}

export default function HudOverlay({ animated = false }: { animated?: boolean }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-4 sm:inset-8">
        <Bracket className="absolute left-0 top-0 h-8 w-8 text-cyan-300/45 sm:h-11 sm:w-11" />
        <Bracket className="absolute right-0 top-0 h-8 w-8 rotate-90 text-purple-300/45 sm:h-11 sm:w-11" />
        <Bracket className="absolute bottom-0 right-0 h-8 w-8 rotate-180 text-cyan-300/45 sm:h-11 sm:w-11" />
        <Bracket className="absolute bottom-0 left-0 h-8 w-8 -rotate-90 text-purple-300/45 sm:h-11 sm:w-11" />
      </div>

      <Reticle
        className={`absolute right-[6%] top-[16%] h-24 w-24 text-cyan-300/25 sm:h-36 sm:w-36 ${animated ? "hud-pulse" : ""}`}
      />

      <ControllerSilhouette className="absolute -bottom-3 -left-8 h-14 w-40 -rotate-3 text-purple-300/10 sm:h-20 sm:w-60" />

      <CircuitTrace className="absolute -right-4 bottom-[8%] h-24 w-36 text-cyan-300/10 sm:h-32 sm:w-48" />
    </div>
  );
}
