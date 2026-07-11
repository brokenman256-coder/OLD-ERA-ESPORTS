"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#e8e6df", "#9fd8e8", "#c9a869"];
const FOCAL = 340;
const COUNT = 60;

interface Particle {
  x: number;
  y: number;
  z: number;
  color: string;
}

export default function Particles3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;

    function spawn(): Particle {
      return {
        x: (Math.random() - 0.5) * width * 2.2,
        y: (Math.random() - 0.5) * height * 2.2,
        z: Math.random() * FOCAL + 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = Array.from({ length: COUNT }, spawn);

    if (reduceMotion) {
      ctx.globalCompositeOperation = "lighter";
      for (const p of particles) {
        const scale = FOCAL / p.z;
        const sx = width / 2 + p.x * scale * 0.02;
        const sy = height / 2 + p.y * scale * 0.02;
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(0.5, scale * 0.25);
        ctx.arc(sx, sy, Math.max(0.5, scale * 0.7), 0, Math.PI * 2);
        ctx.fill();
      }
      return () => window.removeEventListener("resize", resize);
    }

    let raf: number;
    function frame() {
      ctx!.clearRect(0, 0, width, height);
      ctx!.globalCompositeOperation = "lighter";
      for (const p of particles) {
        p.z -= 0.55;
        if (p.z <= 1) Object.assign(p, spawn(), { z: FOCAL });

        const scale = FOCAL / p.z;
        const sx = width / 2 + p.x * scale * 0.02;
        const sy = height / 2 + p.y * scale * 0.02;
        if (sx < -20 || sx > width + 20 || sy < -20 || sy > height + 20) continue;

        const r = Math.max(0.3, scale * 0.55);
        ctx!.beginPath();
        ctx!.fillStyle = p.color;
        ctx!.shadowColor = p.color;
        ctx!.shadowBlur = r * 4;
        ctx!.globalAlpha = Math.min(0.45, scale * 0.16);
        ctx!.arc(sx, sy, r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.shadowBlur = 0;
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0" />;
}
