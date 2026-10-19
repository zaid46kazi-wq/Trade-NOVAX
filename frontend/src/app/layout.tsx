import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trade-NOVAX | Institutional AI Trading Terminal",
  description: "Bloomberg-inspired multi-asset AI market intelligence and quant execution terminal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-[#090a0c] text-slate-100 min-h-screen antialiased selection:bg-amber-500/20 selection:text-amber-200 overflow-x-hidden`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

