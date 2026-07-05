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
          <linearGradient id="oeeMark" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="55%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#111111" />
          </linearGradient>
        </defs>
        <path
          d="M20 2 L36 10 V22 C36 30.5 29.3 36.8 20 39 C10.7 36.8 4 30.5 4 22 V10 Z"
          fill="url(#oeeMark)"
        />
        <path
          d="M20 10 L22.9 16.6 L30 17.3 L24.7 22.1 L26.2 29.1 L20 25.5 L13.8 29.1 L15.3 22.1 L10 17.3 L17.1 16.6 Z"
          fill="white"
          fillOpacity="0.95"
        />
      </svg>
      <span
        className="bg-gradient-to-r from-red-500 to-neutral-100 bg-clip-text font-black tracking-tight text-transparent"
        style={{ fontSize: size * 0.62 }}
      >
        OLD ERA ESPORTS
      </span>
    </span>
  );
}
