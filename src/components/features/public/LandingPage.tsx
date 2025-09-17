// src/pages/LandingPage.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Head from "next/head";  // ✅ add Head for SEO
import { PenTool, Users, ArrowRight, MessageCircle, Palette, Zap } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WaitlistModal from "@/components/features/public/WaitlistModal";

export default function LandingPage() {
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);

  // ✅ JSON-LD structured data
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Quillaborn",
    "url": "https://quillaborn.com",
    "logo": "https://quillaborn.com/Green_Quill_noback.png",
    "sameAs": [
      "https://twitter.com/quillaborn",
      "https://discord.gg/your-community"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://quillaborn.com",
    "name": "Quillaborn",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://quillaborn.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Head>
        {/* ✅ Title + Meta Description */}
        <title>Quillaborn | Collaborative Storytelling for Writers & Artists</title>
        <meta
          name="description"
          content="Quillaborn is a collaborative storytelling platform where writers, artists, and creators connect to bring ideas to life. Join our creative community today."
        />
        {/* ✅ Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([orgSchema, websiteSchema]),
          }}
        />
      </Head>

      <Header onJoinWaitlist={() => setShowWaitlistModal(true)} />
      <WaitlistModal show={showWaitlistModal} onClose={() => setShowWaitlistModal(false)} />

      <main className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-gray-900 to-gray-900"></div>
        <div className="absolute inset-0 opacity-50 bg-gray-900"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
              <span className="text-white">IMAGINE A PLACE...</span>
              <br />
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                for creators
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              ...where you can belong to a creative community. Where you can collaborate with fellow artists, writers, and dreamers.{" "}
              Learn more <Link href="/about" className="text-green-400 underline">about Quillaborn</Link> 
              {" "}or explore our <Link href="/pricing" className="text-green-400 underline">pricing options</Link> to get started.
            </p>
            <div className="flex flex-col items-center">
              <button
                onClick={() => setShowWaitlistModal(true)}
                className="bg-green-500 hover:bg-green-600 text-gray-900 px-8 py-4 rounded-full font-bold transition-all duration-200 transform hover:scale-105 whitespace-nowrap flex items-center gap-2"
              >
                Join Early Access
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/login"
                className="text-sm text-gray-400 hover:text-green-400 transition-colors duration-200 mt-3"
              >
                Already have access? Login
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-500/10 rounded-full animate-pulse hidden lg:block"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-green-400/20 rounded-lg rotate-45 animate-bounce hidden lg:block"></div>
        <div className="absolute bottom-20 left-1/4 w-8 h-8 bg-green-300/30 rounded-full animate-ping hidden lg:block"></div>
      </main>

      {/* ... rest of the file unchanged ... */}

      <Footer />
    </div>
  );
}
