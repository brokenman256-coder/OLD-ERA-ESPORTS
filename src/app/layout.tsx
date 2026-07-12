import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SocialLinks from "@/components/SocialLinks";
import Logo from "@/components/Logo";
import SupportChatWidget from "@/components/SupportChatWidget";
import SiteBackground from "@/components/SiteBackground";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vantix | Tournament Platform",
  description:
    "Discover and register for gaming tournaments, or post your own tournament as an organizer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
        <SiteBackground />
        <Navbar />
        <main className="flex-1">{children}</main>
        <SupportChatWidget />
        <footer className="border-t border-white/10 bg-black/60 py-8 text-center text-xs text-neutral-400 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Logo size={22} />
            <SocialLinks />
            <Link href="/contact" className="text-cyan-400 hover:underline">
              Contact & Support
            </Link>
            <p>
              © {new Date().getFullYear()} Vantix. All payments are verified manually by our admin team.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
