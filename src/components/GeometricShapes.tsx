type ShapeProps = { className?: string; style?: React.CSSProperties };

function Hexagon({ className, style }: ShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="50,4 93,27 93,73 50,96 7,73 7,27" />
      <polygon points="50,24 76,38 76,62 50,76 24,62 24,38" opacity="0.5" />
    </svg>
  );
}

function Triangle({ className, style }: ShapeProps) {
  return (
    <svg viewBox="0 0 100 90" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="50,4 96,86 4,86" />
    </svg>
  );
}

function CubeWire({ className, style }: ShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="30,10 80,10 80,60 30,60" />
      <polygon points="10,30 60,30 60,80 10,80" />
      <line x1="30" y1="10" x2="10" y2="30" />
      <line x1="80" y1="10" x2="60" y2="30" />
      <line x1="80" y1="60" x2="60" y2="80" />
      <line x1="30" y1="60" x2="10" y2="80" />
    </svg>
  );
}

function Diamond({ className, style }: ShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="50,4 96,50 50,96 4,50" />
      <line x1="50" y1="4" x2="50" y2="96" opacity="0.4" />
      <line x1="4" y1="50" x2="96" y2="50" opacity="0.4" />
    </svg>
  );
}

export default function GeometricShapes({ animated = false }: { animated?: boolean }) {
  const a = animated ? "shape-float-a" : "";
  const b = animated ? "shape-float-b" : "";
  const c = animated ? "shape-float-c" : "";

  return (
    <div className="absolute inset-0">
      <Hexagon className={`${a} absolute left-[8%] top-[18%] h-16 w-16 text-cyan-300/20 sm:h-24 sm:w-24`} />
      <Triangle className={`${b} absolute right-[12%] top-[62%] h-14 w-14 text-purple-300/20 sm:h-20 sm:w-20`} />
      <CubeWire className={`${c} absolute left-[20%] top-[70%] h-16 w-16 text-blue-300/15 sm:h-24 sm:w-24`} />
      <Diamond
        className={`${a} absolute right-[22%] top-[10%] h-10 w-10 text-cyan-300/20 sm:h-14 sm:w-14`}
        style={{ animationDelay: "-7s" }}
      />
      <Hexagon
        className={`${b} absolute right-[38%] top-[30%] h-8 w-8 text-purple-300/15 sm:h-12 sm:w-12`}
        style={{ animationDelay: "-12s" }}
      />
    </div>
  );
}
