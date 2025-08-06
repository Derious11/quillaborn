"use client";

import {
  Wrench, Mail, Lightbulb, Users, HeartHandshake, MessageSquare, Bug, HelpCircle, ArrowRight,
} from "lucide-react";
import { useState } from "react";
import Header from "@/components//layout/Header";
import Footer from "@/components/layout/Footer";
import WaitlistModal from "@/components/features/public/WaitlistModal";

// Email validation helper
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ContactSupportPage() {
  const [showBugForm, setShowBugForm] = useState(false);
  const [showFeatureForm, setShowFeatureForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Single handler for both bug and feature, now with validation!
  const handleSubmit = async (type: "bug" | "feature") => {
    setFormError(null);

    // Validate inputs
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFormError("Please fill in all fields.");
      return;
    }
    if (!isValidEmail(formData.email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    try {
      const res = await fetch("/api/airtable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type, // "bug" or "feature"
          Name: formData.name,
          Email: formData.email,
          Message: formData.message,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit.");
      }

      setFormData({ name: "", email: "", message: "" });
      setShowBugForm(false);
      setShowFeatureForm(false);
      setSuccessMessage(type === "bug" ? "Bug reported successfully!" : "Feature submitted successfully!");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage("");
      }, 4000);
    } catch (error: any) {
      setFormError(error?.message || "Something went wrong. Please try again.");
    }
  };

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
              <Mail className="w-6 h-6 text-green-400" /> Contact & Support
            </h1>
            <p className="text-lg text-gray-300">
              Need help? Have feedback? Just want to say hi? We’re creators too—and we’re here to support you every step of the way.
            </p>
          </div>

          <section className="space-y-8 text-gray-300">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-green-400" /> Get Support
              </h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-400" />
                  Email: <a href="mailto:support@quillaborn.com" className="text-green-400 underline">support@quillaborn.com</a>
                </li>
                <li className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-400" />
                  Discord Community: <span className="text-gray-100">Join Our Server</span>
                </li>
                <li className="flex items-center gap-2">
                  <Bug className="w-4 h-4 text-green-400" />
                  Report a Bug: <button onClick={() => setShowBugForm(true)} className="ml-2 text-green-400 underline">Open Form</button>
                </li>
                <li className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-green-400" />
                  Help Docs & FAQ: <span className="text-gray-400 italic">Coming Soon</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-green-400" /> Suggest a Feature
              </h2>
              <p className="mb-1">Got an idea to improve Quillaborn? We’d love to hear it.</p>
              <button onClick={() => setShowFeatureForm(true)} className="text-green-400 underline flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Submit a Feature Request
              </button>
              <p className="text-sm text-gray-400">Our roadmap is shaped by our community—your voice matters.</p>
            </div>

            {(showBugForm || showFeatureForm) && (
              <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
                <div className="bg-gray-900 text-white rounded-2xl p-6 max-w-md w-full shadow-xl relative animate-fadeIn">
                  <button
                    onClick={() => {
                      setShowBugForm(false);
                      setShowFeatureForm(false);
                      setFormError(null);
                    }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                  <h3 className="text-2xl font-bold mb-4 text-green-400 flex items-center gap-2">
                    {showBugForm ? (
                      <>
                        <Bug className="w-5 h-5" />
                        Report a Bug
                      </>
                    ) : (
                      <>
                        <Lightbulb className="w-5 h-5" />
                        Feature Request
                      </>
                    )}
                  </h3>
                  <form
                    className="space-y-3"
                    onSubmit={e => {
                      e.preventDefault();
                      handleSubmit(showBugForm ? "bug" : "feature");
                    }}
                  >
                    <input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      onChange={handleChange}
                      value={formData.name}
                      className="w-full p-3 rounded bg-gray-800 border border-gray-700"
                      autoComplete="name"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Your email"
                      onChange={handleChange}
                      value={formData.email}
                      className="w-full p-3 rounded bg-gray-800 border border-gray-700"
                      autoComplete="email"
                    />
                    <textarea
                      name="message"
                      placeholder="Describe the issue or feature..."
                      onChange={handleChange}
                      value={formData.message}
                      rows={4}
                      className="w-full p-3 rounded bg-gray-800 border border-gray-700"
                    ></textarea>
                    {formError && (
                      <div className="text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg text-sm">
                        {formError}
                      </div>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowBugForm(false);
                          setShowFeatureForm(false);
                          setFormError(null);
                        }}
                        className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-black font-semibold"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {showSuccess && (
              <div className="fixed bottom-6 right-6 bg-green-500 text-gray-900 px-6 py-4 rounded-xl shadow-lg font-medium text-sm z-50 animate-fadeInUp">
                {successMessage}
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" /> Press / Partnerships / Licensing
              </h2>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Partnerships & Press: <a href="mailto:partners@quillaborn.com" className="text-green-400 underline">partners@quillaborn.com</a></li>
                <li>Business & Licensing: <a href="mailto:team@quillaborn.com" className="text-green-400 underline">team@quillaborn.com</a></li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-green-400" /> Community Comes First
              </h2>
              <p>Quillaborn is built with creators, not corporations. We aim to respond to all messages within 48 hours, but please be kind—we’re a small team with big dreams.</p>
              <p className="mt-2">Thanks for helping us build a more collaborative, respectful creative world.</p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
