"use client";

import { useState } from "react";
import TournamentsTab from "./TournamentsTab";
import RegistrationsTab from "./RegistrationsTab";
import UsersTab from "./UsersTab";
import SettingsTab from "./SettingsTab";
import PromosTab from "./PromosTab";
import SupportTab from "./SupportTab";
import PlayerMatchesTab from "./PlayerMatchesTab";
import WalletTab from "./WalletTab";

const TABS = [
  { key: "tournaments", label: "Tournaments & Hosting Fees" },
  { key: "registrations", label: "Player Payments" },
  { key: "matches", label: "Player Matches" },
  { key: "wallet", label: "Wallet" },
  { key: "users", label: "Users" },
  { key: "support", label: "Support Chat" },
  { key: "settings", label: "Settings & Bot" },
  { key: "promos", label: "Promotions" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function AdminPanel({ currentAdminId }: { currentAdminId: string }) {
  const [tab, setTab] = useState<TabKey>("tournaments");

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-white/10">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-bold uppercase tracking-wide transition ${
              tab === t.key
                ? "border-cyan-400 bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                : "border-transparent text-neutral-500 hover:text-neutral-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "tournaments" && <TournamentsTab />}
        {tab === "registrations" && <RegistrationsTab />}
        {tab === "matches" && <PlayerMatchesTab />}
        {tab === "wallet" && <WalletTab />}
        {tab === "users" && <UsersTab currentAdminId={currentAdminId} />}
        {tab === "support" && <SupportTab />}
        {tab === "settings" && <SettingsTab />}
        {tab === "promos" && <PromosTab />}
      </div>
    </div>
  );
}
