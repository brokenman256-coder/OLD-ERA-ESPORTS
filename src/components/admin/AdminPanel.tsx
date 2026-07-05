"use client";

import { useState } from "react";
import TournamentsTab from "./TournamentsTab";
import RegistrationsTab from "./RegistrationsTab";
import UsersTab from "./UsersTab";
import SettingsTab from "./SettingsTab";
import PromosTab from "./PromosTab";
import SupportTab from "./SupportTab";
import PlayerMatchesTab from "./PlayerMatchesTab";

const TABS = [
  { key: "tournaments", label: "Tournaments & Hosting Fees" },
  { key: "registrations", label: "Player Payments" },
  { key: "matches", label: "Player Matches" },
  { key: "users", label: "Users" },
  { key: "support", label: "Support Chat" },
  { key: "settings", label: "Payment & Contact Settings" },
  { key: "promos", label: "Promotions" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function AdminPanel({ currentAdminId }: { currentAdminId: string }) {
  const [tab, setTab] = useState<TabKey>("tournaments");

  return (
    <div>
      <div className="flex flex-wrap gap-2 border-b border-neutral-200 dark:border-neutral-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              tab === t.key
                ? "border-red-600 text-red-600"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
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
        {tab === "users" && <UsersTab currentAdminId={currentAdminId} />}
        {tab === "support" && <SupportTab />}
        {tab === "settings" && <SettingsTab />}
        {tab === "promos" && <PromosTab />}
      </div>
    </div>
  );
}
