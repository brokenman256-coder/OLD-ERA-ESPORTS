"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AnimatedBackground, { BG_THEME_NAMES, type BgThemeName } from "@/components/AnimatedBackground";
import StaticGamingBackground from "@/components/StaticGamingBackground";

export default function SiteBackground() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [theme, setTheme] = useState<BgThemeName>("neon");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pick a random background theme once per page view, client-only
    setTheme(BG_THEME_NAMES[Math.floor(Math.random() * BG_THEME_NAMES.length)]);
  }, []);

  if (!isHome) return <StaticGamingBackground />;
  return <AnimatedBackground theme={theme} />;
}
