interface PosterTheme {
  bgFrom: string;
  bgTo: string;
  accentA: string;
  accentB: string;
}

const THEMES: PosterTheme[] = [
  { bgFrom: "#0a0a12", bgTo: "#12172e", accentA: "#22d3ee", accentB: "#a855f7" },
  { bgFrom: "#0f0a14", bgTo: "#1e1030", accentA: "#a855f7", accentB: "#ec4899" },
  { bgFrom: "#0a0e14", bgTo: "#10202c", accentA: "#22d3ee", accentB: "#ec4899" },
];

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapTitle(title: string): string[] {
  if (title.length <= 20) return [title];
  const words = title.split(" ");
  let line1 = "";
  let line2 = "";
  for (const word of words) {
    if ((line1 + " " + word).trim().length <= 20 && !line2) {
      line1 = (line1 + " " + word).trim();
    } else {
      line2 = (line2 + " " + word).trim();
    }
  }
  return line2 ? [line1, line2] : [line1];
}

export function generatePosterDataUri({
  title,
  game,
  entryFee,
  prizePool,
}: {
  title: string;
  game: string;
  entryFee: number;
  prizePool: string | null;
}): string {
  const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
  const lines = wrapTitle(title.toUpperCase());
  const titleFontSize = lines.length > 1 ? 46 : 56;
  const titleY = lines.length > 1 ? [176, 232] : [204];

  const feeLabel = entryFee > 0 ? `ENTRY ₹${entryFee}` : "FREE ENTRY";
  const prizeLabel = prizePool ? `PRIZE ${prizePool}` : "AUTO-HOSTED MATCH";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="420" viewBox="0 0 1000 420">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1000" y2="420" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${theme.bgFrom}" />
      <stop offset="100%" stop-color="${theme.bgTo}" />
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${theme.accentA}" />
      <stop offset="100%" stop-color="${theme.accentB}" />
    </linearGradient>
  </defs>
  <rect width="1000" height="420" fill="url(#bg)" />
  <polygon points="0,0 340,0 260,420 0,420" fill="${theme.accentA}" opacity="0.06" />
  <polygon points="1000,0 700,0 820,420 1000,420" fill="${theme.accentB}" opacity="0.06" />
  <rect x="0" y="0" width="1000" height="6" fill="url(#accent)" />
  <rect x="0" y="414" width="1000" height="6" fill="url(#accent)" />
  <text x="60" y="110" font-family="Arial, sans-serif" font-weight="900" font-size="22" letter-spacing="6" fill="${theme.accentA}">${escapeXml(game.toUpperCase())}</text>
  ${lines
    .map(
      (line, i) =>
        `<text x="58" y="${titleY[i]}" font-family="Arial, sans-serif" font-weight="900" font-size="${titleFontSize}" fill="#f5f5f7">${escapeXml(line)}</text>`
    )
    .join("\n  ")}
  <polygon points="55,300 235,300 245,340 65,340" fill="#ffffff" opacity="0.08" />
  <text x="75" y="326" font-family="Arial, sans-serif" font-weight="800" font-size="18" letter-spacing="1" fill="${theme.accentA}">${escapeXml(feeLabel)}</text>
  <polygon points="260,300 480,300 490,340 270,340" fill="#ffffff" opacity="0.08" />
  <text x="280" y="326" font-family="Arial, sans-serif" font-weight="800" font-size="18" letter-spacing="1" fill="${theme.accentB}">${escapeXml(prizeLabel)}</text>
  <text x="940" y="395" text-anchor="end" font-family="Arial, sans-serif" font-weight="900" font-size="16" letter-spacing="2" fill="#ffffff" opacity="0.4">VANTIX</text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
