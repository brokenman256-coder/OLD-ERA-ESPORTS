"use client";

import { useEffect, useState } from "react";

interface WalletUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface TopUp {
  id: string;
  amount: number;
  proof: string;
  status: string;
  reviewNote: string | null;
  createdAt: string;
  user: WalletUser;
}

interface Withdrawal {
  id: string;
  amount: number;
  payoutInfo: string;
  status: string;
  reviewNote: string | null;
  createdAt: string;
  user: WalletUser;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  walletBalance: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  note: string | null;
  createdAt: string;
  user: WalletUser;
}

const SUB_TABS = ["Top-ups", "Withdrawals", "Balances", "Ledger"] as const;

export default function WalletTab() {
  const [subTab, setSubTab] = useState<(typeof SUB_TABS)[number]>("Top-ups");

  return (
    <div>
      <div className="flex gap-2">
        {SUB_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setSubTab(t)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              subTab === t
                ? "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white"
                : "border border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {subTab === "Top-ups" && <TopUpsPanel />}
        {subTab === "Withdrawals" && <WithdrawalsPanel />}
        {subTab === "Balances" && <BalancesPanel />}
        {subTab === "Ledger" && <LedgerPanel />}
      </div>
    </div>
  );
}

function TopUpsPanel() {
  const [topUps, setTopUps] = useState<TopUp[]>([]);
  const [filter, setFilter] = useState<"PENDING" | "ALL">("PENDING");
  const [loading, setLoading] = useState(true);

  async function load() {
    const qs = filter === "ALL" ? "" : `?status=${filter}`;
    const res = await fetch(`/api/admin/wallet/topups${qs}`);
    const data = await res.json();
    setTopUps(data.topUps ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- simple client-side data fetch on filter change
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function verify(id: string, status: "APPROVED" | "REJECTED") {
    const reviewNote = status === "REJECTED" ? window.prompt("Reason (optional):") ?? undefined : undefined;
    await fetch(`/api/admin/wallet/topups/${id}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewNote }),
    });
    load();
  }

  return (
    <div>
      <div className="flex gap-2">
        {(["PENDING", "ALL"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              filter === f ? "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white" : "border border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-4 text-neutral-500">Loading...</p>
      ) : topUps.length === 0 ? (
        <p className="mt-4 text-neutral-500">No top-up requests here.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {topUps.map((t) => (
            <div key={t.id} className="glass-panel clip-corner p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold">₹{t.amount}</p>
                  <p className="text-sm text-neutral-500">
                    {t.user.name} ({t.user.email}) · {t.user.role}
                  </p>
                  <p className="text-xs text-neutral-500">{new Date(t.createdAt).toLocaleString()}</p>
                </div>
                <span className="rounded-full bg-amber-900 px-2 py-0.5 text-xs font-semibold text-amber-300">
                  {t.status}
                </span>
              </div>
              <a href={t.proof} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary-sized user-uploaded screenshot */}
                <img src={t.proof} alt="Top-up payment proof" className="mt-2 max-h-40 rounded-md border border-neutral-700" />
              </a>
              {t.reviewNote && <p className="mt-2 text-sm text-neutral-400">Note: {t.reviewNote}</p>}
              {t.status === "PENDING" && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => verify(t.id, "APPROVED")}
                    className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-500"
                  >
                    Approve &amp; credit
                  </button>
                  <button
                    onClick={() => verify(t.id, "REJECTED")}
                    className="clip-corner-sm premium-btn px-3 py-1.5 text-sm font-bold uppercase tracking-wide"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WithdrawalsPanel() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [filter, setFilter] = useState<"PENDING" | "ALL">("PENDING");
  const [loading, setLoading] = useState(true);

  async function load() {
    const qs = filter === "ALL" ? "" : `?status=${filter}`;
    const res = await fetch(`/api/admin/wallet/withdrawals${qs}`);
    const data = await res.json();
    setWithdrawals(data.withdrawals ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- simple client-side data fetch on filter change
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function verify(id: string, status: "PAID" | "REJECTED") {
    const reviewNote = window.prompt("Note (optional):") ?? undefined;
    await fetch(`/api/admin/wallet/withdrawals/${id}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewNote }),
    });
    load();
  }

  return (
    <div>
      <div className="flex gap-2">
        {(["PENDING", "ALL"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              filter === f ? "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 text-white" : "border border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="mt-4 text-neutral-500">Loading...</p>
      ) : withdrawals.length === 0 ? (
        <p className="mt-4 text-neutral-500">No withdrawal requests here.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {withdrawals.map((w) => (
            <div key={w.id} className="glass-panel clip-corner p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold">₹{w.amount}</p>
                  <p className="text-sm text-neutral-500">
                    {w.user.name} ({w.user.email}) · {w.user.role}
                  </p>
                  <p className="text-sm">Payout to: {w.payoutInfo}</p>
                  <p className="text-xs text-neutral-500">Requested {new Date(w.createdAt).toLocaleString()}</p>
                </div>
                <span className="rounded-full bg-amber-900 px-2 py-0.5 text-xs font-semibold text-amber-300">
                  {w.status}
                </span>
              </div>
              {w.reviewNote && <p className="mt-2 text-sm text-neutral-400">Note: {w.reviewNote}</p>}
              {w.status === "PENDING" && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => verify(w.id, "PAID")}
                    className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-500"
                  >
                    Mark paid
                  </button>
                  <button
                    onClick={() => verify(w.id, "REJECTED")}
                    className="clip-corner-sm premium-btn px-3 py-1.5 text-sm font-bold uppercase tracking-wide"
                  >
                    Reject &amp; refund
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BalancesPanel() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- simple client-side data fetch on mount
    load();
  }, []);

  async function submitAdjust(id: string) {
    setError(null);
    const res = await fetch(`/api/admin/wallet/users/${id}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), direction, note }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setAdjustingId(null);
    setAmount("");
    setNote("");
    load();
  }

  if (loading) return <p className="mt-4 text-neutral-500">Loading...</p>;

  return (
    <div className="mt-4 space-y-3">
      {users.map((u) => (
        <div key={u.id} className="glass-panel clip-corner p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">
                {u.name} <span className="text-neutral-500">({u.email})</span>
              </p>
              <p className="text-xs text-neutral-500">{u.role}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-bold text-orange-400">₹{u.walletBalance}</p>
              <button
                onClick={() => setAdjustingId(adjustingId === u.id ? null : u.id)}
                className="rounded-md bg-neutral-800 px-3 py-1.5 text-xs font-medium hover:bg-neutral-700"
              >
                Adjust
              </button>
            </div>
          </div>
          {adjustingId === u.id && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-800 pt-3">
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as "CREDIT" | "DEBIT")}
                className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm"
              >
                <option value="CREDIT">Credit</option>
                <option value="DEBIT">Debit</option>
              </select>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount (₹)"
                className="w-28 rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm"
              />
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note (optional)"
                className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm"
              />
              <button
                onClick={() => submitAdjust(u.id)}
                className="clip-corner-sm premium-btn px-3 py-1.5 text-sm font-bold uppercase tracking-wide"
              >
                Apply
              </button>
            </div>
          )}
          {error && adjustingId === u.id && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      ))}
    </div>
  );
}

function LedgerPanel() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/wallet/transactions")
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data.transactions ?? []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="mt-4 text-neutral-500">Loading...</p>;
  if (transactions.length === 0) return <p className="mt-4 text-neutral-500">No wallet activity yet.</p>;

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-800 text-neutral-500">
            <th className="py-2 pr-4">User</th>
            <th className="py-2 pr-4">Type</th>
            <th className="py-2 pr-4">Amount</th>
            <th className="py-2 pr-4">Balance after</th>
            <th className="py-2 pr-4">Note</th>
            <th className="py-2 pr-4">Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} className="border-b border-neutral-900">
              <td className="py-2 pr-4">{t.user.name}</td>
              <td className="py-2 pr-4">{t.type}</td>
              <td className={`py-2 pr-4 font-semibold ${t.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {t.amount >= 0 ? "+" : ""}
                {t.amount}
              </td>
              <td className="py-2 pr-4">₹{t.balanceAfter}</td>
              <td className="py-2 pr-4 text-neutral-400">{t.note}</td>
              <td className="py-2 pr-4 text-neutral-500">{new Date(t.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
