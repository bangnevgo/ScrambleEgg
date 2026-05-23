import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scramble Egg — Dump Your Brain, AI Organizes It 🍳",
  description: "The chaotic productivity app that embraces your mess. Dump ideas, tasks, and thoughts — AI auto-organizes everything. No empty state anxiety, just pure brain dump.",
  keywords: ["Scramble Egg", "productivity", "brain dump", "AI organizer", "task management", "idea capture"],
  authors: [{ name: "Scramble Egg Team" }],
  icons: {
    icon: "/logo.webp",
  },
  openGraph: {
    title: "Scramble Egg — Dump Your Brain, AI Organizes It 🍳",
    description: "The chaotic productivity app that embraces your mess.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
