"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, PenTool, Users, ArrowRight, MessageCircle, Palette, Zap, XCircle } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WaitlistModal from "@/components/features/public/WaitlistModal";

// Email validation function (can be reused anywhere)
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);

  // Strong typing for the event
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email before submitting
    if (!email || !isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const res = await fetch('/api/waitlist', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit");
      }
      
      setSubmitted(true);
      setEmail("");
    } catch (error: any) {
      setError(error.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
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
              ...where you can belong to a creative community. Where you can collaborate with fellow artists, writers, and dreamers. Where talking about your next big project is just as easy as sharing your latest work.
            </p>
            <form
              id="waitlist"
              className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto"
              onSubmit={handleSubmit}
              autoComplete="off"
            >
              {!submitted ? (
                <>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="px-6 py-4 rounded-full w-full sm:flex-1 text-gray-900 bg-white focus:outline-none focus:ring-4 focus:ring-green-500/20 text-center sm:text-left"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-gray-900 px-8 py-4 rounded-full font-bold transition-all duration-200 transform hover:scale-105 whitespace-nowrap flex items-center gap-2"
                  >
                    Join Early Access
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="bg-green-500/20 border border-green-500/30 px-8 py-4 rounded-full">
                  <p className="text-green-300 font-bold text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    You&apos;re in! We&apos;ll be in touch soon.
                  </p>
                </div>
              )}
            </form>
            {error && (
              <p className="text-red-400 text-sm mt-4 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg inline-block">
                {error}
              </p>
            )}
          </div>
        </div>
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-500/10 rounded-full animate-pulse hidden lg:block"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-green-400/20 rounded-lg rotate-45 animate-bounce hidden lg:block"></div>
        <div className="absolute bottom-20 left-1/4 w-8 h-8 bg-green-300/30 rounded-full animate-ping hidden lg:block"></div>
      </main>

      <section id="features" className="py-20 lg:py-32 bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              An <span className="text-green-400">inclusive</span> space with <span className="text-green-400">reliable</span> tech
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Quillaborn makes it easy to connect, collaborate, and create together. Join a community where your creativity matters.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[  
              {
                icon: MessageCircle,
                title: "Create & Share",
                desc: "Share your work, get feedback, and collaborate with creators who understand your vision. No algorithm drama, just real connections."
              },
              {
                icon: Users,
                title: "Find Your Tribe",
                desc: "Connect with artists, writers, and dreamers. Build lasting relationships with people who get it."
              },
              {
                icon: Palette,
                title: "Build Worlds",
                desc: "Whether it is a story, artwork, or wild creative project – bring your ideas to life with the right collaborators."
              },
              {
                icon: Zap,
                title: "Launch Together",
                desc: "Turn your creative dreams into reality. Get the support, feedback, and momentum you need to make it happen."
              },
              {
                icon: PenTool,
                title: "No Noise Zone",
                desc: "Skip the trolls and ghosters. A curated community focused on serious creativity and meaningful collaboration."
              },
              {
                icon: Sparkles,
                title: "Creator Tools",
                desc: "Access tools designed by creators, for creators. Everything you need to organize projects and grow your creative practice."
              }
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="group bg-gray-900 p-8 rounded-2xl hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-2">
                <div className="bg-green-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-500/30 transition-colors">
                  <Icon className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold mb-4">{title}</h3>
                <p className="text-gray-300 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="community" className="py-20 bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Ready to start your <span className="text-green-400">creative journey?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Coming soon. Join creators who want to build something amazing together.
          </p>
          <button
            onClick={() => setShowPopup(true)}
            className="bg-green-500 hover:bg-green-600 text-gray-900 px-8 py-4 rounded-full font-bold transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
          >
            Join the Community
          </button>
        </div>
      </section>

      {showPopup && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
          <div className="bg-gray-800 text-white rounded-2xl p-8 max-w-md w-full shadow-xl relative animate-fadeIn">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold mb-4 text-green-400">Join the Community</h3>
            <p className="text-gray-300 mb-6">
              Have you joined Early Access? We're currently in early access and require registration.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => {
                  setShowPopup(false);
                  setShowWaitlistModal(true);
                }}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                No, I need to join Early Access
              </button>
              
              <div className="text-center">
                <span className="text-gray-400 text-sm">or</span>
              </div>
              
              <Link
                href="/signup"
                onClick={() => setShowPopup(false)}
                className="w-full bg-green-500 hover:bg-green-600 text-gray-900 px-6 py-3 rounded-lg font-bold transition-colors inline-block text-center"
              >
                Yes, I'm ready to sign up
              </Link>
            </div>
            
            <p className="text-xs text-gray-400 mt-4 text-center">
              If you haven't joined Early Access yet, please do so first.
            </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
