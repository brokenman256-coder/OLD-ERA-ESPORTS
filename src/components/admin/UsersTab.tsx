"use client";

import { useEffect, useState } from "react";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  firmName: string | null;
  phone: string | null;
  isBanned: boolean;
  isVerified: boolean;
  createdAt: string;
}

export default function UsersTab({ currentAdminId }: { currentAdminId: string }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

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

  async function setRole(id: string, role: string) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    load();
  }

  async function toggleBan(id: string, isBanned: boolean) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBanned: !isBanned }),
    });
    load();
  }

  async function toggleVerified(id: string, isVerified: boolean) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVerified: !isVerified }),
    });
    load();
  }

  async function removeUser(id: string) {
    if (!window.confirm("Delete this user and all their tournaments/registrations?")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    load();
  }

  async function resetPassword(id: string, email: string) {
    const newPassword = window.prompt(`Set a new password for ${email} (min 8 characters):`);
    if (!newPassword) return;
    if (newPassword.length < 8) {
      window.alert("Password must be at least 8 characters.");
      return;
    }
    const res = await fetch(`/api/admin/users/${id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });
    if (res.ok) {
      window.alert(`Password updated. Share it with ${email} directly — it can't be viewed again after this.`);
    } else {
      const data = await res.json().catch(() => ({}));
      window.alert(data.error ?? "Something went wrong");
    }
  }

  if (loading) return <p className="text-neutral-500">Loading...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-neutral-500 dark:border-neutral-800">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Phone</th>
            <th className="py-2 pr-4">Role</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-neutral-100 dark:border-neutral-900">
              <td className="py-2 pr-4">
                {u.name}
                {u.firmName && <span className="text-neutral-500"> ({u.firmName})</span>}
              </td>
              <td className="py-2 pr-4">{u.email}</td>
              <td className="py-2 pr-4">
                {u.phone ? (
                  <a href={`tel:${u.phone}`} className="text-orange-400 hover:underline">
                    {u.phone}
                  </a>
                ) : (
                  <span className="text-neutral-500">—</span>
                )}
              </td>
              <td className="py-2 pr-4">
                <select
                  value={u.role}
                  disabled={u.id === currentAdminId}
                  onChange={(e) => setRole(u.id, e.target.value)}
                  className="rounded-md premium-input px-2 py-1"
                >
                  <option value="PLAYER">PLAYER</option>
                  <option value="ORGANIZER">ORGANIZER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>
              <td className="py-2 pr-4">{u.isBanned ? "Banned" : "Active"}</td>
              <td className="py-2 pr-4 space-x-2">
                <button
                  onClick={() => toggleVerified(u.id, u.isVerified)}
                  className={`rounded-md px-3 py-1 text-xs font-medium hover:opacity-80 ${
                    u.isVerified
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                      : "border border-white/10 bg-white/5 text-neutral-400 hover:bg-white/10"
                  }`}
                >
                  {u.isVerified ? "Verified ✓" : "Verify"}
                </button>
                <button
                  onClick={() => resetPassword(u.id, u.email)}
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white"
                >
                  Reset password
                </button>
                <button
                  disabled={u.id === currentAdminId}
                  onClick={() => toggleBan(u.id, u.isBanned)}
                  className="rounded-md border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                >
                  {u.isBanned ? "Unban" : "Ban"}
                </button>
                <button
                  disabled={u.id === currentAdminId}
                  onClick={() => removeUser(u.id)}
                  className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-40"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
