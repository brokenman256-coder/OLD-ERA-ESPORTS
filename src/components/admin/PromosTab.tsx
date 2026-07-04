"use client";

import { useEffect, useState } from "react";

interface Promo {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string | null;
  order: number;
  active: boolean;
}

export default function PromosTab() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/promos");
    const data = await res.json();
    setPromos(data.promos ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- simple client-side data fetch on mount
    load();
  }, []);

  async function createPromo(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!image) {
      setError("Please choose an image.");
      return;
    }
    setCreating(true);
    const form = new FormData();
    form.set("title", title);
    form.set("linkUrl", linkUrl);
    form.set("image", image);
    const res = await fetch("/api/admin/promos", { method: "POST", body: form });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setTitle("");
    setLinkUrl("");
    setImage(null);
    load();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/admin/promos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    load();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this banner?")) return;
    await fetch(`/api/admin/promos/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="max-w-2xl">
      <form
        onSubmit={createPromo}
        className="space-y-3 rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <h3 className="font-bold">Add a promo banner</h3>
        <p className="text-sm text-neutral-500">
          Shown as a rotating banner on the homepage — great for spotlighting a live BGMI event or any promotion.
        </p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Title, e.g. BGMI Live Cup"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
        />
        <input
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="Link when clicked (optional)"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-950"
        />
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          className="w-full text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={creating}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
        >
          {creating ? "Adding..." : "Add banner"}
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {promos.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- admin-uploaded promo banner */}
            <img src={p.imageUrl} alt={p.title} className="h-16 w-28 rounded-md object-cover" />
            <div className="flex-1">
              <p className="font-medium">{p.title}</p>
              {p.linkUrl && <p className="text-xs text-neutral-500">{p.linkUrl}</p>}
            </div>
            <button
              onClick={() => toggleActive(p.id, p.active)}
              className={`rounded-md px-3 py-1 text-xs font-medium ${
                p.active
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  : "bg-neutral-100 dark:bg-neutral-800"
              }`}
            >
              {p.active ? "Active" : "Hidden"}
            </button>
            <button onClick={() => remove(p.id)} className="text-sm text-red-600 hover:underline">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
