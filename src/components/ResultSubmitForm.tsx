"use client";

import { useState } from "react";

export default function ResultSubmitForm({ registrationId }: { registrationId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Please choose a screenshot of the match result.");
      return;
    }
    setLoading(true);
    setError(null);
    const form = new FormData();
    form.set("resultProof", file);
    const res = await fetch(`/api/registrations/${registrationId}/result`, {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="mt-4 rounded-md border border-emerald-800 bg-emerald-950 p-4 text-sm text-emerald-300">
        Result screenshot submitted. Thanks!
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mt-4 rounded-md border border-amber-800 bg-amber-950 p-4"
    >
      <p className="text-sm font-semibold text-amber-300">
        Match result screenshot required
      </p>
      <p className="mt-1 text-sm text-amber-400/90">
        Upload a screenshot of your final placement / match result so we can verify standings.
      </p>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="mt-3 w-full text-sm"
      />
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <button
        disabled={loading}
        className="mt-3 rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Submit result"}
      </button>
    </form>
  );
}
