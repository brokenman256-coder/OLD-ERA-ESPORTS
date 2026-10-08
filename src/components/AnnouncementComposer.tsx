"use client";

import { useState } from "react";

interface TournamentOption {
  id: string;
  title: string;
}

export default function AnnouncementComposer({ tournaments }: { tournaments: TournamentOption[] }) {
  const [tournamentId, setTournamentId] = useState(tournaments[0]?.id ?? "");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!tournamentId) {
      setMessage({ type: "error", text: "Select which tournament this update is about." });
      return;
    }
    setSending(true);
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tournamentId, body }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) {
      setMessage({ type: "error", text: data.error ?? "Something went wrong" });
      return;
    }
    setBody("");
    setMessage({ type: "success", text: "Sent to everyone registered for this tournament." });
  }

  if (tournaments.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Post an approved tournament first to send announcements about it.
      </p>
    );
  }

  return (
    <form onSubmit={send} className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Which tournament is this about?</label>
        <select
          value={tournamentId}
          onChange={(e) => setTournamentId(e.target.value)}
          className="mt-1 w-full rounded-md premium-input px-3 py-2"
        >
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Update</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          required
          maxLength={1000}
          placeholder="e.g. Registration extended by 2 days, or match timing changed to 9 PM."
          className="mt-1 w-full rounded-md premium-input px-3 py-2"
        />
      </div>
      {message && (
        <p className={`text-sm ${message.type === "error" ? "text-red-500" : "text-green-500"}`}>{message.text}</p>
      )}
      <button
        disabled={sending}
        className="clip-corner-sm premium-btn px-4 py-2 text-sm font-bold uppercase tracking-wide disabled:opacity-50"
      >
        {sending ? "Sending..." : "Send to registered players"}
      </button>
    </form>
  );
}
