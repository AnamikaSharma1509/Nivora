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
  title: "Nivora | AI Episodic Productivity & Daily Series",
  description:
    "Transform daily goals and tasks into a cinematic AI web series. Voice-first productivity, custom digital identities, persistent streaks, and episodic storytelling.",
};

import { Suspense } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col antialiased transition-colors duration-200">
        <ThemeProvider>
          <Suspense fallback={<div className="h-16 bg-[#14151D] border-b border-[#393B4B]" />}>
            <Navbar />
          </Suspense>
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
