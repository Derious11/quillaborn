"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WaitlistModal from "@/components/features/public/WaitlistModal";
import ExploreContent from "@/components/features/explore/ExploreContent";

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
