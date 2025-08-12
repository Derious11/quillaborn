"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { CheckCircle, Mail } from "lucide-react";
import Header from "@/components/layout/Header";
import WaitlistModal from "@/components/features/public/WaitlistModal";
import Footer from "@/components/layout/Footer";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const { supabase } = useSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const router = useRouter();

  // Handler for email/password signup
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    setLoading(false);
    
    if (error) {
      setError(error.message);
      return;
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      // Email confirmation required
      setShowConfirmation(true);
    } else if (data.session) {
      // User is immediately authenticated (email confirmation might be disabled)
      router.push("/username");
    }
  }

  // Handler for Google signup
  async function handleGoogleSignup() {
    setLoading(true);
    const redirectTo = typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : "/auth/callback";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo }
    });
    setLoading(false);
    if (error) setError(error.message);
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#19222e] to-[#21292f] text-white flex flex-col">
        <Header onJoinWaitlist={() => setShowWaitlistModal(true)} />
        <WaitlistModal show={showWaitlistModal} onClose={() => setShowWaitlistModal(false)} />
        <main className="flex-1 flex items-center justify-center px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-gray-900 to-gray-900 pointer-events-none z-0"></div>
          <div className="absolute inset-0 opacity-50 bg-gray-900 pointer-events-none z-0"></div>
          
          <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center pt-12 pb-20 text-center">
            <div className="bg-green-500/20 rounded-full p-4 mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">
              Check your email
            </h1>
            <p className="text-gray-300 text-lg mb-6">
              We've sent a confirmation link to <strong>{email}</strong>
            </p>
            <div className="bg-gray-800 rounded-lg p-6 mb-6 w-full">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold">Next steps:</h3>
              </div>
              <ul className="text-sm text-gray-300 space-y-2 text-left">
                <li>• Check your email inbox (and spam folder)</li>
                <li>• Click the confirmation link in the email</li>
                <li>• Complete your profile setup</li>
              </ul>
            </div>
            <button
              onClick={() => setShowConfirmation(false)}
              className="text-green-400 hover:text-green-300 underline"
            >
              Back to signup
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#19222e] to-[#21292f] text-white flex flex-col">
      <Header onJoinWaitlist={() => setShowWaitlistModal(true)} />
      <WaitlistModal show={showWaitlistModal} onClose={() => setShowWaitlistModal(false)} />

      <main className="flex-1 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Gradient overlays for on-brand look */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-gray-900 to-gray-900 pointer-events-none z-0"></div>
        <div className="absolute inset-0 opacity-50 bg-gray-900 pointer-events-none z-0"></div>

        <section className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center pt-12 pb-20">
          <Image
            src="/Green_Quill_noback.png"
            alt="Quillaborn Logo"
            width={72}
            height={72}
            className="mb-4"
          />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-white text-center">
            Create your account
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-[#2E7D5A] mb-4 text-center">
            for creators
          </h2>
          <p className="text-gray-300 text-center mb-8 text-lg">
            Join Quillaborn — where creators connect & collaborate.
          </p>

          {/* Google Sign Up Button */}
          <button
            onClick={handleGoogleSignup}
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-stone-200 bg-white rounded-full py-3 px-6 font-bold text-[#1B1B1B] hover:bg-gray-100 shadow-none transition mb-4"
            disabled={loading}
          >
            <FcGoogle size={22} /> Sign Up with Google
          </button>
          <div className="w-full flex items-center my-4">
            <div className="flex-grow h-px bg-stone-700" />
            <span className="mx-2 text-stone-400 text-sm">or</span>
            <div className="flex-grow h-px bg-stone-700" />
          </div>

          {/* Email/Password Sign Up Form */}
          <form onSubmit={handleSignup} className="w-full flex flex-col gap-4">
            <input
              type="email"
              required
              placeholder="Email"
              autoComplete="email"
              className="px-6 py-3 rounded-full w-full text-gray-900 bg-white focus:outline-none focus:ring-4 focus:ring-green-500/20 placeholder-gray-400"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              required
              placeholder="Password"
              autoComplete="new-password"
              className="px-6 py-3 rounded-full w-full text-gray-900 bg-white focus:outline-none focus:ring-4 focus:ring-green-500/20 placeholder-gray-400"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />
            {error && (
              <div className="text-red-400 text-sm mt-2 text-center">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-gray-900 px-8 py-3 rounded-full font-bold w-full mt-2 transition"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>
          <div className="w-full flex flex-col md:flex-row justify-between items-center mt-6 text-sm text-stone-300 gap-2">
            <div>
              Already have an account?{" "}
              <Link href="/login" className="underline text-green-400 hover:text-green-300 font-semibold">
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
