"use client";

import { usePathname } from "next/navigation";
import AnimatedBackground from "@/components/AnimatedBackground";
import StaticGamingBackground from "@/components/StaticGamingBackground";

export default function SiteBackground() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return isHome ? <AnimatedBackground /> : <StaticGamingBackground />;
}
