"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import ThemeToggle from "@/components/ThemeToggle";
import Logo from "@/components/Logo";

interface Me {
  id: string;
  name: string;
  email: string;
  role: string;
  firmName: string | null;
  avatarUrl: string | null;
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

  const profileHref =
    user?.role === "ORGANIZER" ? `/organizers/${user.id}` : user?.role === "PLAYER" ? `/players/${user.id}` : null;

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-black text-white shadow-[0_1px_0_0_rgba(244,63,94,0.3)]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="transition hover:opacity-90">
          <Logo />
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/tournaments" className="hover:text-cyan-400">
            Tournaments
          </Link>
          {user !== undefined && <ThemeToggle />}
          {user === undefined ? null : user ? (
            <>
              <Link href={dashboardHref} className="hover:text-red-400">
                Dashboard
              </Link>
              {user.role === "PLAYER" && (
                <Link href="/teams" className="hover:text-red-400">
                  Teams
                </Link>
              )}
              <Link href="/account" className="hover:text-red-400">
                Account
              </Link>
              {profileHref && (
                <Link href={profileHref} className="flex items-center gap-2 hover:opacity-80">
                  <Avatar name={user.firmName || user.name} src={user.avatarUrl} size={28} />
                  <span className="hidden text-white/50 sm:inline">{user.name}</span>
                </Link>
              )}
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
