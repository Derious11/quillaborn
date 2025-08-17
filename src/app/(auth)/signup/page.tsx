// src/app/(auth)/signup/page.tsx
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
  const { supabase } = useSupabase(); // must be anon/browser client
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);

  // Email/password signup - handles both new users and existing users
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const origin =
      (typeof window !== "undefined" && window.location.origin) ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "";

    const normEmail = email.trim().toLowerCase();

    try {
      // First, try to sign in with existing credentials
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: normEmail,
        password,
      });

      // If sign in successful, redirect to dashboard/onboarding
      if (signInData.session && !signInError) {
        // User exists and credentials are correct, check their profile for proper routing
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, display_name, onboarding_complete, early_access')
          .eq('id', signInData.user.id)
          .single();

        if (!profile) {
          // No profile exists, redirect to create one
          router.push("/username");
          return;
        }

        if (!profile.early_access) {
          // User doesn't have early access
          router.push("/no-access");
          return;
        }

        if (!profile.onboarding_complete) {
          // User has early access but onboarding incomplete
          router.push("/username");
          return;
        }

        // User has early access and onboarding complete
        router.push("/dashboard");
        return;
      }

      // If sign in failed due to invalid credentials, try signup (new user)
      if (signInError && signInError.message.includes("Invalid login credentials")) {
        const { data, error } = await supabase.auth.signUp({
          email: normEmail,
          password,
          options: { emailRedirectTo: `${origin}/auth/callback` },
        });

        if (error) throw error;

        // If email confirmations are ON, Supabase creates a user but no session
        if (data.user && !data.session) {
          setShowConfirmation(true);
          return;
        }

        // If confirmations are OFF, we already have a session
        if (data.session) {
          router.push("/username"); // first onboarding step
          return;
        }

        // Fallback: let the callback complete session exchange if needed
        router.push("/auth/callback");
        return;
      }

      // If sign in failed for other reasons, throw the error
      if (signInError) {
        throw signInError;
      }

    } catch (err: any) {
      setError(err?.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  // Google OAuth signup
  async function handleGoogleSignup() {
    try {
      setError(null);
      setLoading(true);

      const origin =
        (typeof window !== "undefined" && window.location.origin) ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        "";

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${origin}/auth/callback` },
      });

      if (error) throw error;
      // Browser will navigate to Google and then back to /auth/callback
    } catch (err: any) {
      setError(err?.message ?? "Google sign up failed");
      setLoading(false);
    }
  }

  // Email confirmation screen
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#19222e] to-[#21292f] text-white flex flex-col">
        <Header onJoinWaitlist={() => setShowWaitlistModal(true)} />
        <WaitlistModal
          show={showWaitlistModal}
          onClose={() => setShowWaitlistModal(false)}
        />

        <main className="flex-1 flex items-center justify-center px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-gray-900 to-gray-900 pointer-events-none z-0" />
          <div className="absolute inset-0 opacity-50 bg-gray-900 pointer-events-none z-0" />

          <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center pt-12 pb-20 text-center">
            <div className="bg-green-500/20 rounded-full p-4 mb-6">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">
              Check your email
            </h1>
            <p className="text-gray-300 text-lg mb-6">
              We&apos;ve sent a confirmation link to{" "}
              <strong>{email}</strong>
            </p>

            <div className="bg-gray-800 rounded-lg p-6 mb-6 w-full">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold">Next steps:</h3>
              </div>
              <ul className="text-sm text-gray-300 space-y-2 text-left">
                <li>• Check your inbox (and spam folder)</li>
                <li>• Click the confirmation link</li>
                <li>• You&apos;ll return here to finish onboarding</li>
              </ul>
            </div>

            <Link href="/login" className="text-green-400 hover:text-green-300 underline">
              Go to login
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Main signup page
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#19222e] to-[#21292f] text-white flex flex-col">
      <Header onJoinWaitlist={() => setShowWaitlistModal(true)} />
      <WaitlistModal
        show={showWaitlistModal}
        onClose={() => setShowWaitlistModal(false)}
      />

      <main className="flex-1 flex items-center justify-center px-4 relative overflow-hidden">
        {/* On-brand overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-gray-900 to-gray-900 pointer-events-none z-0" />
        <div className="absolute inset-0 opacity-50 bg-gray-900 pointer-events-none z-0" />

        <section className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center pt-12 pb-20">
          <Image
            src="/Green_Quill_noback.png"
            alt="Quillaborn Logo"
            width={72}
            height={72}
            className="mb-4"
            priority
          />

          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-white text-center">
            Create your account
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-[#2E7D5A] mb-4 text-center">
            for creators
          </h2>
          <p className="text-gray-300 text-center mb-8 text-lg">
            Join Quillaborn — where creators connect &amp; collaborate.
          </p>

          {/* Google Sign Up */}
          <button
            onClick={handleGoogleSignup}
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-stone-200 bg-white rounded-full py-3 px-6 font-bold text-[#1B1B1B] hover:bg-gray-100 shadow-none transition mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            <FcGoogle size={22} /> Sign Up with Google
          </button>

          <div className="w-full flex items-center my-4">
            <div className="flex-grow h-px bg-stone-700" />
            <span className="mx-2 text-stone-400 text-sm">or</span>
            <div className="flex-grow h-px bg-stone-700" />
          </div>

          {/* Email/Password Sign Up */}
          <form onSubmit={handleSignup} className="w-full flex flex-col gap-4">
            <input
              type="email"
              required
              placeholder="Email"
              autoComplete="email"
              className="px-6 py-3 rounded-full w-full text-gray-900 bg-white focus:outline-none focus:ring-4 focus:ring-green-500/20 placeholder-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              required
              placeholder="Password"
              autoComplete="new-password"
              className="px-6 py-3 rounded-full w-full text-gray-900 bg-white focus:outline-none focus:ring-4 focus:ring-green-500/20 placeholder-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              minLength={6}
            />

            {error && (
              <div
                className="text-red-400 text-sm mt-2 text-center"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-gray-900 px-8 py-3 rounded-full font-bold w-full mt-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>

          <p className="text-xs text-stone-400 mt-3">
            Tip: If you joined the waitlist, use that same email for instant access.
          </p>

          <div className="w-full flex flex-col md:flex-row justify-between items-center mt-6 text-sm text-stone-300 gap-2">
            <div>
              Already have an account?{" "}
              <Link
                href="/login"
                className="underline text-green-400 hover:text-green-300 font-semibold"
              >
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
