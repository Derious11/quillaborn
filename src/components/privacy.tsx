"use client";

import { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  LockKeyhole,
  Eye,
  Trash,
  Mail,
  UserCheck,
  FileText,
  Info,
  Zap,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WaitlistModal from "../components/WaitlistModal";

export default function PrivacyPolicy() {
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
              <ShieldCheck className="w-6 h-6 text-green-400" /> Privacy Policy
            </h1>
            <p className="text-lg text-gray-300">Effective Date: [07/27/2025]</p>
            <p className="text-gray-400">
              At Quillaborn, your privacy is sacred—just like your creative rights. This policy explains what data we collect, how we use it, and how we keep it safe.
            </p>
          </div>

          <section className="space-y-8 text-gray-300">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-400" /> 1. Information We Collect
              </h2>
              <p className="font-semibold">A. Account Information</p>
              <ul className="list-disc list-inside ml-4">
                <li>Name / username</li>
                <li>Email address</li>
                <li>Password (encrypted)</li>
                <li>Age verification (for NSFW access)</li>
                <li>Role/Preferences (writer, artist, genres, etc.)</li>
              </ul>
              <p className="font-semibold mt-3">B. Content & Activity</p>
              <ul className="list-disc list-inside ml-4">
                <li>Projects you create or join</li>
                <li>Messages, uploads, and collaboration history</li>
                <li>NSFW opt-in status (if applicable)</li>
              </ul>
              <p className="font-semibold mt-3">C. Technical Information</p>
              <ul className="list-disc list-inside ml-4">
                <li>Device/browser type</li>
                <li>IP address</li>
                <li>Usage data (e.g., clicks, page visits, feature usage)</li>
              </ul>
              <p className="mt-2 text-sm text-gray-400">We do not use third-party cookies or invasive trackers.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-400" /> 2. How We Use Your Data
              </h2>
              <ul className="list-disc list-inside ml-4">
                <li>To operate and personalize your experience on Quillaborn</li>
                <li>To match you with collaborators and projects</li>
                <li>To moderate content and enforce guidelines</li>
                <li>To send essential service emails</li>
                <li>To improve the platform through anonymized analytics</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-400" /> 3. Who We Share It With
              </h2>
              <ul className="list-disc list-inside ml-4">
                <li>Trusted services helping us run the platform (e.g., email, hosting)</li>
                <li>Legal requirements (e.g., court orders)</li>
                <li>To protect the community from harm or abuse</li>
              </ul>
              <p className="text-sm text-gray-400">No selling, renting, or trading of your personal data. Ever.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <LockKeyhole className="w-5 h-5 text-green-400" /> 4. Data Storage & Security
              </h2>
              <ul className="list-disc list-inside ml-4">
                <li>Data is stored on secure, encrypted servers</li>
                <li>Passwords are hashed and salted</li>
                <li>NSFW access data is stored separately</li>
                <li>Access is limited to authorized team only</li>
              </ul>
              <p className="text-sm text-gray-400">We take data protection seriously—but please use strong passwords!</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Trash className="w-5 h-5 text-green-400" /> 5. Your Rights & Choices
              </h2>
              <ul className="list-disc list-inside ml-4">
                <li>View, edit, or delete your account anytime</li>
                <li>Opt out of NSFW content</li>
                <li>Request your data via email</li>
                <li>Delete your data permanently</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Info className="w-5 h-5 text-green-400" /> 6. Children’s Privacy
              </h2>
              <p>Quillaborn is not intended for users under 13 (or 16 in some regions). Verified 18+ only for NSFW features.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-400" /> 7. Communication Preferences
              </h2>
              <p>By signing up, you agree to service emails. Newsletters and updates are optional and can be managed in settings.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-400" /> 8. Changes to This Policy
              </h2>
              <p>We may update this policy. Major updates will be communicated via email or on the site.</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-400" /> 9. Contact Us
              </h2>
              <p>Email: <a href="mailto:privacy@quillaborn.com" className="underline text-green-400">privacy@quillaborn.com</a></p>
            </div>

            <div className="bg-gray-800 p-4 rounded-xl text-center">
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-green-400" /> TL;DR Summary
              </h2>
              <p className="mt-2">We collect the minimum data needed to power collaboration.<br />We don't sell it. We protect it. You control it.<br />Your creativity stays yours—and so does your privacy.</p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}