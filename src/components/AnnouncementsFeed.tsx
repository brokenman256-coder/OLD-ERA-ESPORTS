"use client";

import { useEffect, useState } from "react";
import VerifiedBadge from "@/components/VerifiedBadge";

interface Announcement {
  id: string;
  body: string;
  createdAt: string;
  organizerName: string;
  organizerVerified: boolean;
  tournament: { id: string; title: string } | null;
}

export default function AnnouncementsFeed() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/announcements")
      .then((res) => res.json())
      .then((data) => setAnnouncements(data.announcements ?? []))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (announcements.length === 0) {
    return <p className="text-sm text-neutral-500">No announcements yet.</p>;
  }

  return (
    <div className="space-y-3">
      {announcements.map((a) => (
        <div key={a.id} className="glass-panel clip-corner p-4">
          <div className="flex items-center gap-2">
            <span className="font-bold">{a.organizerName}</span>
            {a.organizerVerified && <VerifiedBadge label="Verified" variant="organizer" />}
            {a.tournament && <span className="text-xs text-neutral-500">· {a.tournament.title}</span>}
          </div>
          <p className="mt-1 text-sm text-neutral-300">{a.body}</p>
          <p className="mt-1 text-xs text-neutral-500">{new Date(a.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
