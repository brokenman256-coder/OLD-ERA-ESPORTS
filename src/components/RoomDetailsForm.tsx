"use client";

import { useState } from "react";

export default function RoomDetailsForm({
  tournamentId,
  initialRoomId,
  initialRoomPassword,
}: {
  tournamentId: string;
  initialRoomId: string | null;
  initialRoomPassword: string | null;
}) {
  const [roomId, setRoomId] = useState(initialRoomId ?? "");
  const [roomPassword, setRoomPassword] = useState(initialRoomPassword ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    const res = await fetch(`/api/tournaments/${tournamentId}/room`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, roomPassword }),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  return (
    <div className="mt-3 rounded-md border border-neutral-800 bg-neutral-950/60 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-cyan-400">
        Room ID &amp; password — shared with approved players
      </p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <input
          value={roomId}
          onChange={(e) => {
            setRoomId(e.target.value);
            setSaved(false);
          }}
          placeholder="Room ID"
          className="rounded-md premium-input px-3 py-1.5 text-sm"
        />
        <input
          value={roomPassword}
          onChange={(e) => {
            setRoomPassword(e.target.value);
            setSaved(false);
          }}
          placeholder="Room password"
          className="rounded-md premium-input px-3 py-1.5 text-sm"
        />
      </div>
      <div className="mt-2 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="clip-corner-sm premium-btn px-3 py-1.5 text-xs font-bold uppercase tracking-wide disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save room details"}
        </button>
        {saved && <span className="text-xs text-emerald-400">Saved — visible to approved players now.</span>}
      </div>
    </div>
  );
}
