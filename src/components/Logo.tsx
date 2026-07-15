export default function Logo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="vantixMark" x1="6" y1="5" x2="34" y2="33" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff6b1a" />
            <stop offset="50%" stopColor="#ffb020" />
            <stop offset="100%" stopColor="#ffd60a" />
          </linearGradient>
          <linearGradient id="vantixSpark" x1="10" y1="8" x2="27" y2="16" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffe066" />
            <stop offset="100%" stopColor="#ffcc66" />
          </linearGradient>
          <filter id="vantixGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#vantixGlow)">
          <path
            d="M6 5 L20 33 L34 5"
            stroke="url(#vantixMark)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <line x1="11" y1="9" x2="26.5" y2="16.5" stroke="url(#vantixSpark)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="20" cy="33" r="2.6" fill="#ffcc66" />
        </g>
      </svg>
      <span
        className="font-heading skew-x-[-6deg] bg-gradient-to-r from-orange-300 via-amber-400 to-yellow-400 bg-clip-text font-black tracking-tight text-transparent"
        style={{ fontSize: size * 0.62 }}
      >
        VANTIX
      </span>
    </span>
  );
}
