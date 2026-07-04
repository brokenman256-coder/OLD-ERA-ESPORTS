"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Me {
  id: string;
  name: string;
  email: string;
  role: string;
  firmName: string | null;
}

export default function Navbar() {
  const [user, setUser] = useState<Me | null | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/dashboard/admin"
      : user?.role === "ORGANIZER"
        ? "/dashboard/organizer"
        : "/dashboard/player";

  return (
    <header className="border-b border-black/10 dark:border-white/10 bg-black text-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          OLD ERA ESPORTS
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/tournaments" className="hover:text-red-400">
            Tournaments
          </Link>
          {user === undefined ? null : user ? (
            <>
              <Link href={dashboardHref} className="hover:text-red-400">
                Dashboard
              </Link>
              <Link href="/account" className="hover:text-red-400">
                Account
              </Link>
              <span className="hidden text-white/50 sm:inline">
                {user.name} ({user.role})
              </span>
              <button
                onClick={logout}
                className="rounded-md bg-white/10 px-3 py-1.5 hover:bg-white/20"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-red-400">
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-red-600 px-3 py-1.5 font-medium hover:bg-red-500"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
