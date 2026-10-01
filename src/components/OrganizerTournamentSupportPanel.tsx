"use client";

import { useEffect, useState } from "react";

interface Message {
  id: string;
  body: string;
  fromOrganizer: boolean;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

export default function OrganizerTournamentSupportPanel({ tournamentId }: { tournamentId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);

  async function load() {
    const res = await fetch(`/api/tournaments/${tournamentId}/support`);
    const data = await res.json();
    setMessages(data.messages ?? []);
    setLoading(false);
  }

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- simple client-side data fetch on open
      setLoading(true);
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const threads = Object.values(
    messages.reduce<Record<string, { user: Message["user"]; messages: Message[] }>>((acc, m) => {
      if (!acc[m.user.id]) acc[m.user.id] = { user: m.user, messages: [] };
      acc[m.user.id].messages.push(m);
      return acc;
    }, {})
  ).sort((a, b) => {
    const at = new Date(a.messages[a.messages.length - 1].createdAt).getTime();
    const bt = new Date(b.messages[b.messages.length - 1].createdAt).getTime();
    return bt - at;
  });

  const activeThread = threads.find((t) => t.user.id === selectedUserId);

  async function sendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!reply.trim() || !selectedUserId) return;
    setSending(true);
    await fetch(`/api/tournaments/${tournamentId}/support`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: reply.trim(), targetUserId: selectedUserId }),
    });
    setReply("");
    setSending(false);
    load();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white"
      >
        Help center
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-md border border-neutral-800 bg-neutral-950/60 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">Help center</p>
        <button onClick={() => setOpen(false)} className="text-xs text-neutral-500 hover:underline">
          Close
        </button>
      </div>

      {loading ? (
        <p className="mt-2 text-sm text-neutral-500">Loading...</p>
      ) : threads.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-500">No player questions yet.</p>
      ) : (
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            {threads.map((t) => (
              <button
                key={t.user.id}
                onClick={() => setSelectedUserId(t.user.id)}
                className={`block w-full rounded-md px-2 py-1.5 text-left text-sm ${
                  selectedUserId === t.user.id ? "bg-orange-500/20 text-orange-200" : "bg-white/5 hover:bg-white/10"
                }`}
              >
                {t.user.name} <span className="text-xs text-neutral-500">({t.messages.length})</span>
              </button>
            ))}
          </div>

          {activeThread && (
            <div>
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {activeThread.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`rounded-md px-2 py-1.5 text-xs ${
                      m.fromOrganizer ? "ml-auto max-w-[90%] bg-orange-500/10" : "max-w-[90%] bg-white/10"
                    }`}
                  >
                    {m.body}
                  </div>
                ))}
              </div>
              <form onSubmit={sendReply} className="mt-2 flex gap-2">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Reply..."
                  className="flex-1 rounded-md premium-input px-2 py-1 text-xs"
                />
                <button
                  disabled={sending}
                  className="clip-corner-sm premium-btn px-3 py-1 text-xs font-bold uppercase tracking-wide disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
