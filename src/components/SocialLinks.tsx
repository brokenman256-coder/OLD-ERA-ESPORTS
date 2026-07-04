"use client";

import { useEffect, useState } from "react";

export default function SocialLinks({ className = "" }: { className?: string }) {
  const [links, setLinks] = useState<{ whatsappLink: string | null; instagramUrl: string | null } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setLinks(data.settings))
      .catch(() => setLinks(null));
  }, []);

  if (!links || (!links.whatsappLink && !links.instagramUrl)) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {links.whatsappLink && (
        <a
          href={links.whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500"
        >
          WhatsApp
        </a>
      )}
      {links.instagramUrl && (
        <a
          href={links.instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
        >
          Instagram
        </a>
      )}
    </div>
  );
}
