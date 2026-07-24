import type { Metadata } from "next";
import { Suspense } from "react";
import { Anton, Geist, Geist_Mono, Inter_Tight } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Chat } from "@/app/_components/chat";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "TreinoPro.AI",
  description: "O app que vai transformar a forma como você treina.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TreinoPro.AI",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${interTight.variable} ${anton.variable} bg-canvas antialiased`}
      >
        <NuqsAdapter>
          <div className="relative mx-auto min-h-svh max-w-[480px] bg-background">
            {children}
          </div>
          <Suspense>
            <Chat />
          </Suspense>
        </NuqsAdapter>
      </body>
    </html>
  );
}
