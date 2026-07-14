"use client";

import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";

interface TeamMember {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface Team {
  id: string;
  name: string;
  tag: string | null;
  captainId: string;
  members?: TeamMember[];
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [meId, setMeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [tag, setTag] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState<Record<string, string>>({});
  const [inviteError, setInviteError] = useState<Record<string, string>>({});

  async function load() {
    const [teamsRes, meRes] = await Promise.all([fetch("/api/teams"), fetch("/api/me")]);
    const teamsData = await teamsRes.json();
    const meData = await meRes.json();
    setTeams(teamsData.teams ?? []);
    setMeId(meData.user?.id ?? null);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- simple client-side data fetch on mount
    load();
  }, []);

  async function createTeam(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, tag }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setCreateError(data.error ?? "Something went wrong");
      return;
    }
    setName("");
    setTag("");
    load();
  }

  async function inviteMember(teamId: string) {
    const email = inviteEmail[teamId]?.trim();
    if (!email) return;
    setInviteError((p) => ({ ...p, [teamId]: "" }));
    const res = await fetch(`/api/teams/${teamId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      setInviteError((p) => ({ ...p, [teamId]: data.error ?? "Something went wrong" }));
      return;
    }
    setInviteEmail((p) => ({ ...p, [teamId]: "" }));
    load();
  }

  async function removeMember(teamId: string, userId: string) {
    await fetch(`/api/teams/${teamId}/members/${userId}`, { method: "DELETE" });
    load();
  }

  async function deleteTeam(teamId: string) {
    if (!window.confirm("Delete this team?")) return;
    await fetch(`/api/teams/${teamId}`, { method: "DELETE" });
    load();
  }

  if (loading) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="section-title text-3xl font-black uppercase tracking-wide">My Teams</h1>
      <p className="mt-1 text-neutral-500 dark:text-neutral-400">
        Squad up with teammates so you can register for tournaments together.
      </p>

      <form
        onSubmit={createTeam}
        className="mt-6 flex flex-wrap items-end gap-3 glass-panel clip-corner p-5"
      >
        <div className="flex-1">
          <label className="block text-sm font-medium">Team name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-md premium-input px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Tag</label>
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            maxLength={10}
            placeholder="TSM"
            className="mt-1 w-28 rounded-md premium-input px-3 py-2"
          />
        </div>
        <button
          disabled={creating}
          className="rounded-md bg-gradient-to-r from-red-600 to-red-800 px-4 py-2 font-semibold text-white shadow-md shadow-red-900/20 transition hover:from-red-500 hover:to-red-700 disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create team"}
        </button>
        {createError && <p className="w-full text-sm text-red-600">{createError}</p>}
      </form>

      <div className="mt-8 space-y-6">
        {teams.length === 0 ? (
          <p className="text-neutral-500">You&apos;re not on any teams yet.</p>
        ) : (
          teams.map((team) => {
            const isCaptain = team.captainId === meId;
            return (
              <div
                key={team.id}
                className="glass-panel clip-corner p-5"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">
                    {team.name} {team.tag && <span className="text-neutral-400">[{team.tag}]</span>}
                  </h2>
                  {isCaptain && (
                    <button
                      onClick={() => deleteTeam(team.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete team
                    </button>
                  )}
                </div>

                <div className="mt-3 space-y-2">
                  {team.members?.map((m) => (
                    <div key={m.userId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar name={m.name} src={m.avatarUrl} size={28} />
                        <span className="text-sm">
                          {m.name} {m.userId === team.captainId && <span className="text-neutral-400">(captain)</span>}
                        </span>
                      </div>
                      {(isCaptain || m.userId === meId) && m.userId !== team.captainId && (
                        <button
                          onClick={() => removeMember(team.id, m.userId)}
                          className="text-xs text-neutral-500 hover:text-red-600"
                        >
                          {m.userId === meId ? "Leave" : "Remove"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {isCaptain && (
                  <div className="mt-4 flex gap-2">
                    <input
                      type="email"
                      placeholder="Invite by email"
                      value={inviteEmail[team.id] ?? ""}
                      onChange={(e) => setInviteEmail((p) => ({ ...p, [team.id]: e.target.value }))}
                      className="flex-1 rounded-md premium-input px-3 py-1.5 text-sm"
                    />
                    <button
                      onClick={() => inviteMember(team.id)}
                      className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white"
                    >
                      Add
                    </button>
                  </div>
                )}
                {inviteError[team.id] && <p className="mt-2 text-sm text-red-600">{inviteError[team.id]}</p>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
