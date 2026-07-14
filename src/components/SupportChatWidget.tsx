"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  body: string;
  fromAdmin: boolean;
  createdAt: string;
}

interface Me {
  id: string;
  role: string;
}

const POLL_MS = 5000;

export default function SupportChatWidget() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setMe(data.user))
      .catch(() => setMe(null));
  }, []);

  async function load() {
    const res = await fetch("/api/support");
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data.messages ?? []);
  }

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- simple client-side data fetch on open, then polled
    load();
    const interval = setInterval(load, POLL_MS);
    return () => clearInterval(interval);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setText("");
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setSending(false);
    if (res.ok) load();
  }

  if (!me || me.role === "ADMIN") return null;

  return (
    <div className="fixed bottom-5 right-5 z-30">
      {open && (
        <div className="mb-3 flex h-96 w-80 flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 shadow-2xl shadow-black/50">
          <div className="flex items-center justify-between bg-gradient-to-r from-cyan-600 to-purple-700 px-4 py-3">
            <p className="text-sm font-bold text-white">Support Chat</p>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white" aria-label="Close chat">
              ✕
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-3">
            {messages.length === 0 ? (
              <p className="mt-4 text-center text-sm text-neutral-500">
                Send us a message and our support team will get back to you here.
              </p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.fromAdmin ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      m.fromAdmin
                        ? "bg-neutral-800 text-neutral-100"
                        : "bg-gradient-to-r from-cyan-600 to-purple-700 text-white"
                    }`}
                  >
                    {m.fromAdmin && <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-400">Support Team</p>}
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={send} className="flex gap-2 border-t border-neutral-800 p-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-md premium-input px-3 py-2 text-sm"
            />
            <button
              disabled={sending || !text.trim()}
              className="clip-corner-sm premium-btn px-3 py-2 text-sm font-bold uppercase tracking-wide disabled:cursor-not-allowed"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle support chat"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-2xl text-white shadow-lg shadow-cyan-900/40 transition hover:scale-105"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
