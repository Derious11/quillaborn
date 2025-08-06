"use client";

import { useState } from "react";
import { Sparkles, Feather, ShieldCheck, Castle, Heart, Handshake } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WaitlistModal from "@/components/features/public/WaitlistModal";

export default function PricingPage() {
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  return (
    <div className="relative min-h-screen text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-gray-900 to-gray-950"></div>
      <div className="absolute inset-0 opacity-50 bg-gray-900"></div>
      <div className="absolute top-20 left-10 w-20 h-20 bg-green-500/10 rounded-full animate-float hidden lg:block"></div>
      <div className="absolute top-40 right-20 w-12 h-12 bg-green-400/20 rounded-lg rotate-45 animate-float hidden lg:block"></div>
      <div className="absolute bottom-20 left-1/4 w-8 h-8 bg-green-300/30 rounded-full animate-float hidden lg:block"></div>

      <div className="relative z-10">
        <Header onJoinWaitlist={() => setShowWaitlistModal(true)} />
        <WaitlistModal show={showWaitlistModal} onClose={() => setShowWaitlistModal(false)} />  

        <main className="px-6 py-16 max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-heading font-bold text-white flex justify-center items-center gap-3">
              <Sparkles className="w-6 h-6 text-green-400" /> Pricing
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                              Start creating for free. Upgrade when you&apos;re ready to scale.<br />
              We believe in accessible creativity. That’s why Quillaborn’s core features will always be free for passion projects and early creators.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Feather className="w-5 h-5 text-green-400" />
                <h2 className="text-xl font-bold">Free Tier — For Explorers</h2>
              </div>
              <p className="text-gray-300 mb-2">$0 / forever</p>
              <p className="text-gray-400 mb-4">Perfect for casual creators and small collaborations.</p>
              <ul className="text-sm text-gray-300 list-disc list-inside space-y-1">
                <li>Create & join limited projects</li>
                <li>Discover & message collaborators</li>
                <li>Use shared workspaces (chat, file sharing, tasks)</li>
                <li>Showcase completed projects</li>
                <li>NSFW access (age-verified)</li>
                <li>Keep 100% rights to your work</li>
              </ul>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                <h2 className="text-xl font-bold">Pro Tier — For Builders</h2>
              </div>
              <p className="text-gray-300 mb-2">$5–10/month (TBD)</p>
              <p className="text-gray-400 mb-4 italic">Coming soon</p>
              <ul className="text-sm text-gray-300 list-disc list-inside space-y-1">
                <li>Everything in Free</li>
                <li>Project role applications & approvals</li>
                <li>Custom project templates & boards</li>
                <li>Collaboration analytics</li>
                <li>Early access to creator contests</li>
                <li>Enhanced file storage</li>
                <li>Priority feature requests</li>
              </ul>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Castle className="w-5 h-5 text-green-400" />
                <h2 className="text-xl font-bold">Studio Tier — For Teams & IP Builders</h2>
              </div>
              <p className="text-gray-300 mb-2">$25+/month</p>
              <p className="text-gray-400 mb-4 italic">Coming later</p>
              <ul className="text-sm text-gray-300 list-disc list-inside space-y-1">
                <li>Everything in Pro</li>
                <li>Private team spaces</li>
                <li>License & contract templates</li>
                <li>Shared ownership management tools</li>
                <li>Monetization toolkits</li>
                <li>Invite-only NSFW zones</li>
              </ul>
            </div>
          </div>

          <div className="space-y-8 text-gray-300">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="w-5 h-5 text-green-400" /> Pay What You Can (Future Feature)
              </h2>
              <p>
                We know not every creator can afford subscriptions. If you’re working on something meaningful and need full access—just tell us.
                We&apos;ll unlock it for free or at a discounted rate. No judgment.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Handshake className="w-5 h-5 text-green-400" /> Built for Community, Not Corporations
              </h2>
              <p>
                You create. You own it. We’re just the forge. No ads. No weird tracking. No reselling your content. Ever.
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}