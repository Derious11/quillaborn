import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Quillaborn – Creative Hub for Artists & Writers",
  description: "Quillaborn helps creators collaborate on original and fan projects. Join a vibrant community today.",
  metadataBase: new URL("https://quillaborn.com"),
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
