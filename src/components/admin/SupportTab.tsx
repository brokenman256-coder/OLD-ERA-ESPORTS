"use client";

import { useEffect, useRef, useState } from "react";

interface ThreadUser {
  id: string;
  name: string;
  email: string;
  role: string;
  firmName: string | null;
}

interface Message {
  id: string;
  body: string;
  fromAdmin: boolean;
  createdAt: string;
}

interface Thread {
  user: ThreadUser;
  lastMessage: Message | null;
  unreadCount: number;
}

const POLL_MS = 8000;

export default function SupportTab() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUser, setActiveUser] = useState<ThreadUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  async function loadThreads() {
    const res = await fetch("/api/admin/support");
    const data = await res.json();
    setThreads(data.threads ?? []);
    setLoading(false);
  }

  async function openThread(user: ThreadUser) {
    setActiveUser(user);
    const res = await fetch(`/api/admin/support/${user.id}`);
    const data = await res.json();
    setMessages(data.messages ?? []);
    loadThreads();
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- simple client-side data fetch on mount, then polled
    loadThreads();
    const interval = setInterval(loadThreads, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeUser) return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/admin/support/${activeUser.id}`);
      const data = await res.json();
      setMessages(data.messages ?? []);
    }, POLL_MS);
    return () => clearInterval(interval);
  }, [activeUser]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!activeUser) return;
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setText("");
    const res = await fetch(`/api/admin/support/${activeUser.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setSending(false);
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      loadThreads();
    }
  }

  if (loading) return <p className="text-neutral-500">Loading...</p>;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-2 lg:col-span-1">
        {threads.length === 0 ? (
          <p className="text-neutral-500">No support messages yet.</p>
        ) : (
          threads.map((t) => (
            <button
              key={t.user.id}
              onClick={() => openThread(t.user)}
              className={`block w-full rounded-lg border p-3 text-left ${
                activeUser?.id === t.user.id
                  ? "border-cyan-500/60 bg-neutral-900"
                  : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {t.user.name}
                  {t.user.firmName && <span className="text-neutral-500"> ({t.user.firmName})</span>}
                </p>
                {t.unreadCount > 0 && (
                  <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                    {t.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-500">
                {t.user.email} · {t.user.role}
              </p>
              {t.lastMessage && (
                <p className="mt-1 truncate text-sm text-neutral-400">
                  {t.lastMessage.fromAdmin ? "You: " : ""}
                  {t.lastMessage.body}
                </p>
              )}
            </button>
          ))
        )}
      </div>

      <div className="lg:col-span-2">
        {!activeUser ? (
          <p className="text-neutral-500">Select a conversation to view and reply.</p>
        ) : (
          <div className="flex h-[32rem] flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
            <div className="border-b border-neutral-800 px-4 py-3">
              <p className="font-bold">
                {activeUser.name}
                {activeUser.firmName && <span className="text-neutral-500"> ({activeUser.firmName})</span>}
              </p>
              <p className="text-xs text-neutral-500">
                {activeUser.email} · {activeUser.role}
              </p>
            </div>

            <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-3">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.fromAdmin ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      m.fromAdmin
                        ? "bg-gradient-to-r from-cyan-600 to-purple-700 text-white"
                        : "bg-neutral-800 text-neutral-100"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={send} className="flex gap-2 border-t border-neutral-800 p-3">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Reply as Support Team..."
                className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
              />
              <button
                disabled={sending || !text.trim()}
                className="rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
