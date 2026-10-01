"use client";

import { useEffect, useState } from "react";

interface Message {
  id: string;
  body: string;
  fromOrganizer: boolean;
  createdAt: string;
}

export default function TournamentHelpCenter({ tournamentId }: { tournamentId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
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

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    await fetch(`/api/tournaments/${tournamentId}/support`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: text.trim() }),
    });
    setText("");
    setSending(false);
    load();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 text-sm font-medium text-orange-400 hover:underline"
      >
        Need help with this tournament? Message the organizer →
      </button>
    );
  }

  return (
    <div className="mt-4 glass-panel clip-corner p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">Help center</h3>
        <button onClick={() => setOpen(false)} className="text-xs text-neutral-500 hover:underline">
          Close
        </button>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        Message goes directly to this tournament&apos;s organizer.
      </p>

      {loading ? (
        <p className="mt-3 text-sm text-neutral-500">Loading...</p>
      ) : (
        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
          {messages.length === 0 && <p className="text-sm text-neutral-500">No messages yet.</p>}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-md px-3 py-2 text-sm ${
                m.fromOrganizer
                  ? "bg-orange-500/10 text-orange-200"
                  : "ml-auto bg-white/10 text-neutral-200"
              }`}
            >
              <p>{m.body}</p>
              <p className="mt-1 text-[10px] text-neutral-500">
                {m.fromOrganizer ? "Organizer" : "You"} · {new Date(m.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={send} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your question..."
          className="flex-1 rounded-md premium-input px-3 py-2 text-sm"
        />
        <button
          disabled={sending}
          className="clip-corner-sm premium-btn px-4 py-2 text-sm font-bold uppercase tracking-wide disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
