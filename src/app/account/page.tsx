"use client";

import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";

interface Me {
  id: string;
  name: string;
  email: string;
  role: string;
  firmName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  discordHandle: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;
}

export default function AccountPage() {
  const [me, setMe] = useState<Me | null>(null);

  const [name, setName] = useState("");
  const [firmName, setFirmName] = useState("");
  const [bio, setBio] = useState("");
  const [discordHandle, setDiscordHandle] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  const [avatarUploading, setAvatarUploading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMessage, setPwMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) return;
        setMe(data.user);
        setName(data.user.name ?? "");
        setFirmName(data.user.firmName ?? "");
        setBio(data.user.bio ?? "");
        setDiscordHandle(data.user.discordHandle ?? "");
        setTwitterUrl(data.user.twitterUrl ?? "");
        setWebsiteUrl(data.user.websiteUrl ?? "");
      });
  }, []);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    const form = new FormData();
    form.set("avatar", file);
    const res = await fetch("/api/me/avatar", { method: "POST", body: form });
    const data = await res.json();
    setAvatarUploading(false);
    if (res.ok) {
      setMe((prev) => (prev ? { ...prev, avatarUrl: data.avatarUrl } : prev));
    }
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    setProfileSaving(true);

    const res = await fetch("/api/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, firmName, bio, discordHandle, twitterUrl, websiteUrl }),
    });
    const data = await res.json();
    setProfileSaving(false);

    if (!res.ok) {
      setProfileMsg({ type: "error", text: data.error ?? "Something went wrong" });
      return;
    }
    setMe(data.user);
    setProfileMsg({ type: "success", text: "Profile updated." });
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPwMessage(null);
    setPwLoading(true);

    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setPwLoading(false);

    if (!res.ok) {
      setPwMessage({ type: "error", text: data.error ?? "Something went wrong" });
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setPwMessage({ type: "success", text: "Password updated." });
  }

  if (!me) return null;

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <h1 className="text-2xl font-bold">Account settings</h1>

      <div className="mt-6 flex items-center gap-4">
        <Avatar name={me.firmName || me.name} src={me.avatarUrl} size={64} />
        <label className="cursor-pointer text-sm font-medium text-red-600 hover:underline">
          {avatarUploading ? "Uploading..." : "Change avatar"}
          <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarChange} />
        </label>
      </div>

      <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4 rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="font-bold">Profile</h2>
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
        {me.role === "ORGANIZER" && (
          <div>
            <label className="block text-sm font-medium">Firm / company name</label>
            <input
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Discord handle</label>
            <input
              value={discordHandle}
              onChange={(e) => setDiscordHandle(e.target.value)}
              placeholder="username"
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Twitter/X URL</label>
            <input
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
              placeholder="https://x.com/..."
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
        </div>
        {me.role === "ORGANIZER" && (
          <div>
            <label className="block text-sm font-medium">Website URL</label>
            <input
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
        )}
        {profileMsg && (
          <p className={`text-sm ${profileMsg.type === "error" ? "text-red-600" : "text-green-600"}`}>{profileMsg.text}</p>
        )}
        <button
          disabled={profileSaving}
          className="w-full rounded-md bg-black px-4 py-2 font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {profileSaving ? "Saving..." : "Save profile"}
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4 rounded-lg border border-neutral-200 p-5 dark:border-neutral-800">
        <h2 className="font-bold">Password</h2>
        <div>
          <label className="block text-sm font-medium">Current password</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">New password</label>
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>
        {pwMessage && (
          <p className={`text-sm ${pwMessage.type === "error" ? "text-red-600" : "text-green-600"}`}>{pwMessage.text}</p>
        )}
        <button
          disabled={pwLoading}
          className="w-full rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500 disabled:opacity-50"
        >
          {pwLoading ? "Saving..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
