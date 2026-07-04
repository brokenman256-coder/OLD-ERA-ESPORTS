"use client";

import { useEffect, useState } from "react";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  firmName: string | null;
  isBanned: boolean;
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

  async function removeUser(id: string) {
    if (!window.confirm("Delete this user and all their tournaments/registrations?")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p className="text-neutral-500">Loading...</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-neutral-500">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Role</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-neutral-100">
              <td className="py-2 pr-4">
                {u.name}
                {u.firmName && <span className="text-neutral-500"> ({u.firmName})</span>}
              </td>
              <td className="py-2 pr-4">{u.email}</td>
              <td className="py-2 pr-4">
                <select
                  value={u.role}
                  disabled={u.id === currentAdminId}
                  onChange={(e) => setRole(u.id, e.target.value)}
                  className="rounded-md border border-neutral-300 px-2 py-1"
                >
                  <option value="PLAYER">PLAYER</option>
                  <option value="ORGANIZER">ORGANIZER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>
              <td className="py-2 pr-4">{u.isBanned ? "Banned" : "Active"}</td>
              <td className="py-2 pr-4 space-x-2">
                <button
                  disabled={u.id === currentAdminId}
                  onClick={() => toggleBan(u.id, u.isBanned)}
                  className="rounded-md bg-neutral-100 px-3 py-1 text-xs font-medium hover:bg-neutral-200 disabled:opacity-40"
                >
                  {u.isBanned ? "Unban" : "Ban"}
                </button>
                <button
                  disabled={u.id === currentAdminId}
                  onClick={() => removeUser(u.id)}
                  className="rounded-md bg-neutral-100 px-3 py-1 text-xs font-medium text-red-600 hover:bg-neutral-200 disabled:opacity-40"
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
