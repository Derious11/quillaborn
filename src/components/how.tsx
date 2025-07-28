"use client";

import { useState } from "react";
import { Sparkles, User, Search, Brain, Layers, Star, Users, MessageCircle } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WaitlistModal from "../components/WaitlistModal";

export default function HowItWorksPage() {
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

        <main className="px-6 py-16 max-w-3xl mx-auto space-y-10">
          <h1 className="text-4xl font-heading font-bold text-white flex items-center gap-3">
            <Layers className="w-6 h-6 text-green-400" />
            How It Works
          </h1>
          <p className="text-lg text-gray-300">
            Quillaborn helps creators connect, collaborate, and complete amazing stories—together.
            <br /><br />
            Whether you are an artist, a writer, or both, here’s how the journey unfolds:
          </p>

          <div className="space-y-8 text-gray-300">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2"><User className="w-5 h-5 text-green-400" /> 1. Create Your Profile</h2>
              <p>
                Choose your path. Are you a writer, an artist, or a hybrid dream-weaver? Select your creative role,
                set your genres, mark your NSFW preferences, and share what you&apos;re excited to build.
                <br />→ Don’t worry—this can evolve as you do.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2"><Search className="w-5 h-5 text-green-400" /> 2. Discover Your Creative Match</h2>
              <p>
                Find your collab partner or join a project. Use filters to explore creators or projects by genre,
                skill level, or creative need (e.g. “Looking for artist”). You can swipe, follow, invite, or apply to join.
                <br />→ Think “creative Tinder,” but for passion projects.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2"><Brain className="w-5 h-5 text-green-400" /> 3. Start a New Project</h2>
              <p>
                Got a concept? Post it. Upload your idea—whether it’s a one-line prompt, a fanfic AU, or an illustrated universe.
                Set roles you&apos;re looking to fill, attach inspiration, and choose your privacy level.
                <br />→ Open to the world or invite-only—it’s up to you.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2"><MessageCircle className="w-5 h-5 text-green-400" /> 4. Collaborate in Your Workspace</h2>
              <p>Co-create in one shared space. Each project gets its own creative hub:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Chat thread for brainstorming</li>
                <li>File uploads & version control</li>
                <li>Shared task list & milestones</li>
                <li>Optional moodboards or storyboards</li>
              </ul>
              <p>→ No more lost Google Docs or Discord chaos.</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2"><Star className="w-5 h-5 text-green-400" /> 5. Publish or Showcase</h2>
              <p>
                Finish something together. Show it off. When you are ready, you can publish a collaborative showcase page
                with full creator credits, download links, and shareable previews.
                <br />→ Tag it as complete, archived, or open to more.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-green-400" /> Who It’s For</h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Fanfiction writers looking for illustrators</li>
                <li>Concept artists seeking worldbuilders</li>
                <li>Beginners who want guided practice</li>
                <li>Professionals looking to build IP together</li>
                <li>Anyone tired of going solo</li>
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-green-400" /> Still Curious?</h2>
              <p>
                Join the community, test ideas, or lurk until you are ready to jump in.
                Quillaborn is built to support you wherever you are on your creative path.
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
