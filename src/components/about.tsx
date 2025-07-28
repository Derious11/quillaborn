"use client";

import { useState } from "react";
import { Sparkles, Users, PenTool, Wrench, Sprout } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WaitlistModal from "../components/WaitlistModal";

export default function AboutPage() {
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

        <main className="px-6 py-16 max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-heading font-bold text-white flex justify-center items-center gap-3">
              <Sparkles className="w-6 h-6 text-green-400" /> About Quillaborn
            </h1>
            <p className="text-lg text-gray-300">
              Where stories come to life—together.
            </p>
            <p className="text-gray-400">
              Quillaborn is a creative sanctuary built for writers, artists, and storytellers of all skill levels who believe in the magic of collaboration.
              We’re more than a platform—we’re a movement. One that celebrates unfinished ideas, fan-made worlds, scribbled notes, and ambitious dreams.
              Whether you’re just starting out or a seasoned creator, Quillaborn is your space to connect, co-create, and bring narratives to life with others who share your passion.
            </p>
          </div>

          <section className="space-y-12 text-gray-300">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" /> Our Mission
              </h2>
              <p className="mt-2">To empower creators through collaborative storytelling and community-driven expression—where every sketch, script, and spark of imagination can find its match.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <PenTool className="w-5 h-5 text-green-400" /> What We Stand For
              </h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Creative Freedom:</strong> Retain full rights to your own work. Collaborate on your terms.</li>
                <li><strong>Inclusivity:</strong> Open to beginners, fan creators, professionals, and everyone in between.</li>
                <li><strong>Safe Spaces:</strong> NSFW content is allowed in gated, age-verified areas. Respect is non-negotiable.</li>
                <li><strong>Shared Growth:</strong> Learn from others, get inspired, and grow your craft through connection.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-green-400" /> How We’re Building It
              </h2>
              <p className="mt-2">We started Quillaborn as fellow creators frustrated by the isolation of idea-hoarding platforms and the gatekeeping in professional spaces. We wanted a place that felt like a shared sketchbook—messy, passionate, and full of possibility.</p>
              <p className="mt-2">This project is community-first, built with no-code tools, open feedback loops, and constant iteration. You’re not just a user—you’re part of the story.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sprout className="w-5 h-5 text-green-400" /> Join the Movement
              </h2>
              <p className="mt-2">
                Help us build the world’s first platform where fan fiction meets concept art, where worldbuilders meet illustrators, and where creators help creators thrive.
                Because the next legendary universe? It’s probably sitting in someone’s drafts—waiting for a collab.
              </p>
              <p className="mt-2 flex items-center justify-center gap-2">
                <img src="/Green_Quill_noback.png" alt="Quill Icon" className="w-12 h-12 brightness-125" />
                Be Quillaborn.
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
