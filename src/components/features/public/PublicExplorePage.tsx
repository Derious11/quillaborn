"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WaitlistModal from "@/components/features/public/WaitlistModal";
import ExploreContent from "@/components/features/explore/ExploreContent";
import Head from "next/head";
import Link from "next/link";

<Head>
  <title>Explore Creators | Quillaborn Community</title>
  <meta 
    name="description" 
    content="Explore Quillaborn's creative community. Browse profiles of writers, artists, and worldbuilders. Connect with collaborators and discover new talent." 
  />
  <script 
    type="application/ld+json" 
    dangerouslySetInnerHTML={{
      __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Explore Creators",
        "url": "https://quillaborn.com/explore",
        "about": "Discover and connect with creators on Quillaborn"
      })
    }} 
  />
</Head>

export default function PublicExplorePage() {
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header onJoinWaitlist={() => setShowWaitlistModal(true)} />
      <WaitlistModal show={showWaitlistModal} onClose={() => setShowWaitlistModal(false)} />
      

      {/* Explore Content Section */}
      <section className="py-8 lg:py-12 bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
           <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Meet our <span className="text-green-400">creative</span> community
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Browse profiles, discover new talents, and connect with creators who share your interests and vision.
            </p>
            <br />  
            <p className="text-lg text-gray-300 text-center max-w-2xl mx-auto mb-8">
              Not sure what Quillaborn is? Learn more <Link href="/about" className="text-green-400 underline">about us</Link> or see <Link href="/how-it-works" className="text-green-400 underline">how it works</Link>.
            </p>
          </div>
          
          {/* Search and Filter Interface */}
          <div className="bg-gray-900 rounded-2xl p-8 mb-8">
            <ExploreContent inDashboard={false} />
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
}
