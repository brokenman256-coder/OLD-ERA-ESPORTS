"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
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
  const [menuOpen, setMenuOpen] = useState(false);
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
    setMenuOpen(false);
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

  const navLinks = (
    <>
      <Link href="/tournaments" className="hover:text-cyan-400" onClick={() => setMenuOpen(false)}>
        Tournaments
      </Link>
      <Link href="/leaderboard" className="hover:text-cyan-400" onClick={() => setMenuOpen(false)}>
        Leaderboard
      </Link>
      <Link href="/player-matches" className="hover:text-cyan-400" onClick={() => setMenuOpen(false)}>
        Player Matches
      </Link>
      <Link href="/contact" className="hover:text-cyan-400" onClick={() => setMenuOpen(false)}>
        Contact
      </Link>
      {user && (
        <>
          <Link href={dashboardHref} className="hover:text-red-400" onClick={() => setMenuOpen(false)}>
            Dashboard
          </Link>
          <Link href="/wallet" className="hover:text-red-400" onClick={() => setMenuOpen(false)}>
            Wallet
          </Link>
          {user.role === "PLAYER" && (
            <Link href="/teams" className="hover:text-red-400" onClick={() => setMenuOpen(false)}>
              Teams
            </Link>
          )}
          <Link href="/account" className="hover:text-red-400" onClick={() => setMenuOpen(false)}>
            Account
          </Link>
          {profileHref && (
            <Link
              href={profileHref}
              className="flex items-center gap-2 hover:opacity-80"
              onClick={() => setMenuOpen(false)}
            >
              <Avatar name={user.firmName || user.name} src={user.avatarUrl} size={28} />
              <span className="text-white/50">{user.name}</span>
            </Link>
          )}
          <button onClick={logout} className="rounded-md bg-white/10 px-3 py-1.5 text-left hover:bg-white/20">
            Log out
          </button>
        </>
      )}
      {user === null && (
        <>
          <Link href="/login" className="hover:text-red-400" onClick={() => setMenuOpen(false)}>
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-red-600 px-3 py-1.5 font-medium hover:bg-red-500"
            onClick={() => setMenuOpen(false)}
          >
            Sign up
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black text-white shadow-[0_1px_0_0_rgba(244,63,94,0.3)]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link href="/" className="transition hover:opacity-90">
          <Logo size={24} />
        </Link>

        <div className="hidden items-center gap-5 text-sm md:flex">{user !== undefined && navLinks}</div>

        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          className="rounded-md p-2 text-white hover:bg-white/10 md:hidden"
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </nav>

      {menuOpen && (
        <div className="flex flex-col gap-4 border-t border-white/10 bg-black px-4 py-4 text-sm md:hidden">
          {user !== undefined && navLinks}
        </div>
      )}
    </header>
  );
}
