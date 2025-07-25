import { useState } from "react";
import { Sparkles, EyeOff, ShieldCheck, LockKeyhole, AlertTriangle, Handshake, BookText } from "lucide-react";
import Header from "../components/Header";
import WaitlistModal from "../components/WaitlistModal";

export default function NSFWPolicyPage() {
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
              <EyeOff className="w-6 h-6 text-green-400" /> NSFW Policy & Access
            </h1>
            <p className="text-lg text-gray-300">
              Quillaborn embraces creative freedom—including adult content—within clear boundaries that prioritize safety, consent, and community respect.
            </p>
          </div>

          <section className="space-y-6 text-gray-300">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-400" /> What’s Allowed
              </h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Nudity, erotic illustration, and mature romance</li>
                <li>Dark fantasy, horror, or violence in context</li>
                <li>LGBTQIA+ NSFW content</li>
                <li>NSFW fan fiction or art (SFW preview recommended)</li>
                <li>Original or fandom-based adult content with proper tags</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" /> What’s Not Allowed
              </h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Non-consensual sexual content (real or implied)</li>
                <li>Underage/“age play” depictions (even if fictional)</li>
                <li>Incest or bestiality themes</li>
                <li>Real-life sexual images or pornography</li>
                <li>Harassment, fetishization, or exploitation</li>
                <li>Any illegal, hate-driven, or predatory content</li>
              </ul>
              <p className="text-sm text-red-300 mt-2">Violation of these terms will result in a ban.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <LockKeyhole className="w-5 h-5 text-green-400" /> NSFW Access Requirements
              </h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>You must be 18+ and verify your age during onboarding or in settings</li>
                <li>You must opt in to see or create NSFW content</li>
                <li>You will be prompted to accept community guidelines specific to adult spaces</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookText className="w-5 h-5 text-green-400" /> NSFW Tools & Controls
              </h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>NSFW project tags and filters</li>
                <li>Hide/blur NSFW previews by default</li>
                <li>Create NSFW-only projects (invite-only or private)</li>
                <li>Turn NSFW visibility off at any time in your profile settings</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Handshake className="w-5 h-5 text-green-400" /> NSFW but Respectful
              </h2>
              <p>
                Adult content isn’t a free-for-all. If you’re here to collaborate, explore mature themes with depth, or push creative boundaries—welcome.
                If you’re here just to provoke, post porn, or make others uncomfortable, this isn’t the place.
              </p>
              <p className="mt-2">We’re building a space where maturity = creativity + consent.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-400" /> Questions or Concerns?
              </h2>
              <p>
                If you see something inappropriate or unclear, reach out to our mod team or report the content directly.
                We’re here to keep Quillaborn respectful and real.
              </p>
            </div>
          </section>
        </main>

        <footer className="bg-gray-950 py-12 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-gray-900" />
                </div>
                <span className="text-xl font-bold">Quillaborn</span>
              </div>
              <div className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Quillaborn. Built for creators, by creators.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
