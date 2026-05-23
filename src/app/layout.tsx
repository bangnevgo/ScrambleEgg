import type { Metadata } from "next";
import { Geist, Geist_Mono, Bangers, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
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

const bangers = Bangers({
  variable: "--font-bangers",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const malamPoek = localFont({
  src: [
    {
      path: "../fonts/MalamPoek.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-malam-poek",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Scramble Egg — Dump Your Brain, AI Organizes It",
  description: "The chaotic productivity app that embraces your mess. Dump ideas, tasks, and thoughts — AI auto-organizes everything. No empty state anxiety, just pure brain dump.",
  keywords: ["Scramble Egg", "productivity", "brain dump", "AI organizer", "task management", "idea capture"],
  authors: [{ name: "Scramble Egg Team" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.webp",
    apple: "/logo.webp",
  },
  appleWebApp: {
    capable: true,
    title: "Scramble Egg",
    statusBarStyle: "default",
  },
  themeColor: "#e07c3c",
  openGraph: {
    title: "Scramble Egg — Dump Your Brain, AI Organizes It",
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
        className={`${geistSans.variable} ${geistMono.variable} ${bangers.variable} ${playfair.variable} ${malamPoek.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  );
}
