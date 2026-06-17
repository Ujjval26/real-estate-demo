import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { CompareBar } from "@/components/compare-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Estateably — UK Property Portal",
  description:
    "Buy, rent, or list property across the UK. A clean, modern property portal inspired by Rightmove and Zoopla.",
  keywords: [
    "UK property",
    "property for sale",
    "property to rent",
    "estate agent",
    "real estate UK",
    "Estateably",
  ],
  authors: [{ name: "Estateably" }],
  openGraph: {
    title: "Estateably — UK Property Portal",
    description:
      "Buy, rent, or list property across the UK. A clean, modern property portal inspired by Rightmove and Zoopla.",
    siteName: "Estateably",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Estateably — UK Property Portal",
    description:
      "Buy, rent, or list property across the UK. A clean, modern property portal inspired by Rightmove and Zoopla.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="bottom-right" richColors />
        <CompareBar />
      </body>
    </html>
  );
}
