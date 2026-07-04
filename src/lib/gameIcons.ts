const GAME_ICONS: Record<string, string> = {
  valorant: "🎯",
  "counter-strike": "🔫",
  cs2: "🔫",
  csgo: "🔫",
  fortnite: "🏗️",
  "league of legends": "🐉",
  lol: "🐉",
  dota: "🛡️",
  "dota 2": "🛡️",
  overwatch: "🦸",
  apex: "🪂",
  "apex legends": "🪂",
  pubg: "🪖",
  "call of duty": "🎖️",
  cod: "🎖️",
  fifa: "⚽",
  efootball: "⚽",
  rocket: "🚀",
  "rocket league": "🚀",
  minecraft: "⛏️",
  chess: "♟️",
  "clash royale": "👑",
  "clash of clans": "🏰",
  bgmi: "🪖",
  "free fire": "🔥",
  smash: "🥊",
  street: "🥋",
  fighting: "🥋",
};

export function gameIcon(game: string): string {
  const key = game.trim().toLowerCase();
  if (GAME_ICONS[key]) return GAME_ICONS[key];
  const match = Object.keys(GAME_ICONS).find((k) => key.includes(k));
  return match ? GAME_ICONS[match] : "🎮";
}
