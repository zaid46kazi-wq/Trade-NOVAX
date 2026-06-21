import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trade Nova Terminal",
  description: "Advanced AI-powered trading terminal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-[#020617] text-slate-50 min-h-screen antialiased selection:bg-cyan-500/30 selection:text-cyan-50 overflow-hidden`}
        suppressHydrationWarning
      >
        {/* Ambient background glow */}
        <div className="fixed top-0 left-0 w-[40%] h-[40%] rounded-full bg-cyan-900/20 blur-[120px] pointer-events-none -translate-x-[10%] -translate-y-[10%]" />
        <div className="fixed bottom-0 right-0 w-[40%] h-[40%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none translate-x-[10%] translate-y-[10%]" />
        
        {children}
      </body>
    </html>
  );
}
