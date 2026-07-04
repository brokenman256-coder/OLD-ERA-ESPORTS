import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
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
  title: "Old Era Esports | Tournament Platform",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-black/10 py-6 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} Old Era Esports. All payments are verified manually by our admin team.
        </footer>
      </body>
    </html>
  );
}
