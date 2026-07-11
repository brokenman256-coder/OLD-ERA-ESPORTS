export default function EnergyWaves({ animated = false }: { animated?: boolean }) {
  const cls = animated ? "energy-wave" : "";
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className={`${cls} absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/20 sm:h-56 sm:w-56`}
      />
      <div
        className={`${cls} absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-purple-300/20 sm:h-56 sm:w-56`}
        style={{ animationDelay: "-2.5s" }}
      />
      <div
        className={`${cls} absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-300/20 sm:h-56 sm:w-56`}
        style={{ animationDelay: "-5s" }}
      />
    </div>
  );
}
