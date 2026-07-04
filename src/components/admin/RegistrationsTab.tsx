"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";

interface Registration {
  id: string;
  teamName: string | null;
  paymentProof: string | null;
  status: string;
  reviewNote: string | null;
  player?: { name: string; email: string };
  tournament: { title: string; game: string; entryFee: number };
}

const FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;

export default function RegistrationsTab() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("PENDING");
  const [loading, setLoading] = useState(true);

  async function load() {
    const qs = filter === "ALL" ? "" : `?status=${filter}`;
    const res = await fetch(`/api/admin/registrations${qs}`);
    const data = await res.json();
    setRegistrations(data.registrations ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- simple client-side data fetch on filter change
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function verify(id: string, status: "APPROVED" | "REJECTED") {
    const reviewNote =
      status === "REJECTED" ? window.prompt("Reason for rejection (optional):") ?? undefined : undefined;
    await fetch(`/api/admin/registrations/${id}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewNote }),
    });
    load();
  }

  return (
    <div>
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              filter === f ? "bg-black text-white" : "bg-neutral-100 text-neutral-600"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-6 text-neutral-500">Loading...</p>
      ) : registrations.length === 0 ? (
        <p className="mt-6 text-neutral-500">No registrations here.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {registrations.map((r) => (
            <div key={r.id} className="rounded-lg border border-neutral-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">{r.tournament.title}</h3>
                  <p className="text-sm text-neutral-500">{r.tournament.game}</p>
                  <p className="mt-1 text-sm">
                    Player: {r.player?.name} ({r.player?.email})
                    {r.teamName ? ` · Team/IGN: ${r.teamName}` : ""}
                  </p>
                  <p className="mt-1 text-sm">Entry fee: ₹{r.tournament.entryFee}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>

              {r.paymentProof && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-neutral-500">Entry fee payment screenshot:</p>
                  <a href={r.paymentProof} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary-sized user-uploaded screenshot */}
                    <img
                      src={r.paymentProof}
                      alt="Entry fee payment proof"
                      className="mt-1 max-h-48 rounded-md border border-neutral-200"
                    />
                  </a>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {r.status !== "APPROVED" && (
                  <button
                    onClick={() => verify(r.id, "APPROVED")}
                    className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-500"
                  >
                    Approve
                  </button>
                )}
                {r.status !== "REJECTED" && (
                  <button
                    onClick={() => verify(r.id, "REJECTED")}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
