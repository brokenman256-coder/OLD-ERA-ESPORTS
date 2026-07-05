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
