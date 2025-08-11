// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import SupabaseProvider from "@/components/providers/SupabaseProvider";
import AuthListener from "@/components/features/auth/AuthListener";
import { Toaster } from "@/components/ui/toaster";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "Quillaborn – Creative Hub for Artists & Writers",
  description: "Quillaborn helps creators collaborate on original and fan projects. Join a vibrant community today.",
  metadataBase: new URL("https://quillaborn.com"),
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: "Quillaborn",
    description: "Collaborate. Create. Connect.",
    url: "https://quillaborn.com",
    images: [
      {
        url: "https://quillaborn.com/og-image.jpg",
        alt: "Quillaborn Cover",
      },
    ],
    type: "website",
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
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <SupabaseProvider>
          <AuthListener />
          {children}
        </SupabaseProvider>
        <Toaster />
        
        {/* This will only render the Analytics component in production */}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  );
}
