import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Oklo — International Market Assessment",
  description: "Nuclear market opportunity scoring across EU and SE Asia",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.setAttribute('data-theme',d?'dark':'light')}catch(e){}})()\n`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased font-[family-name:var(--font-geist-sans)]`}>
        <nav className="border-b border-[var(--card-border)] bg-[var(--card)] sticky top-0 z-50">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3">
            <Link href="/" className="flex items-center gap-3 text-lg font-bold tracking-tight">
              <span className="text-[var(--accent)] font-black text-xl">OKLO</span>
              <span className="text-[var(--card-border)] font-normal">|</span>
              <span className="font-semibold text-[var(--foreground)] text-sm">International Market Assessment</span>
            </Link>
            <div className="flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Map</Link>
              <Link href="/pipeline" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">Pipeline</Link>
              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] border border-[var(--card-border)] px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] inline-block" />
                EU + SE Asia
              </span>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
