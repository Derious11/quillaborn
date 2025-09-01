"use client";
export const dynamic = 'force-dynamic';

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import Header from "@/components/layout/Header";
import WaitlistModal from "@/components/features/public/WaitlistModal";
import Footer from "@/components/layout/Footer";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { getWaitlistStatus } from "@/lib/waitlist";

function LoginPageInner() {
  const { supabase, session } = useSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Open waitlist modal if instructed by query param (e.g., after OAuth callback)
  useEffect(() => {
    const show = searchParams?.get('showWaitlist') === '1';
    if (!show) return;

    let canceled = false;
    let timeout: any;

    const run = async () => {
      // Give the session a brief moment to hydrate to avoid modal flash
      let s = session;
      if (!s) {
        const result = await supabase.auth.getSession();
        s = result.data.session ?? null;
      }

      const authedEmail = s?.user?.email?.toLowerCase();
      if (authedEmail) {
        try {
          const status = await getWaitlistStatus(authedEmail);
          if (status === 'pending') { if (!canceled) router.replace(`/no-access?state=pending&email=${encodeURIComponent(authedEmail)}`); return; }
          if (status === 'approved') { if (!canceled) router.replace('/username'); return; }
          if (!canceled) router.replace(`/no-access?state=unknown&email=${encodeURIComponent(authedEmail)}`);
          return;
        } catch {
          // fall through to show modal after timeout
        }
      }

      // If still no session, only open the modal after a short delay
      timeout = setTimeout(() => {
        if (!canceled) setShowWaitlistModal(true);
      }, 350);
    };

    run();

    return () => {
      canceled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [searchParams, session, supabase, router]);

  // Handler for email/password login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    setLoading(false);
    
    if (error) {
      const normalized = (email || '').toLowerCase().trim();
      if (/invalid login credentials/i.test(error.message) && normalized) {
        try {
          const status = await getWaitlistStatus(normalized);
          if (status === 'approved') { router.replace(`/signup?email=${encodeURIComponent(normalized)}`); return; }
          if (status === 'pending') { router.replace(`/no-access?state=pending&email=${encodeURIComponent(normalized)}`); return; }
        } catch {/* ignore and fall through */}
        // Unknown email: route to no-access unknown
        router.replace(`/no-access?state=unknown&email=${encodeURIComponent(normalized)}`);
        return;
      }
      setError(error.message);
      return;
    }

    if (data.user) {
      // Waitlist status check via service-backed API (avoids RLS + uses email_norm)
      const normalized = (data.user.email || '').toLowerCase().trim();
      let status: string = 'unknown';
      try { status = await getWaitlistStatus(normalized); } catch { /* ignore */ }

      if (status === 'approved') {
        // Approved: proceed to profile onboarding check
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('id', data.user.id)
          .single();

        if (profileError) { console.error('Error fetching profile:', profileError); router.replace("/username"); return; }

        if (profile?.onboarding_complete) router.replace("/dashboard"); else router.replace("/username");
        return;
      }

      if (status === 'pending') { router.replace(`/no-access?state=pending&email=${encodeURIComponent(normalized)}`); return; }

      // Not on waitlist: route to no-access unknown (no modal)
      router.replace(`/no-access?state=unknown&email=${encodeURIComponent(normalized)}`);
      return;
    }
  }

  // Handler for Google login
  async function handleGoogleLogin() {
    setLoading(true);
    const redirectTo = `${location.origin}/auth/callback/`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo }
    });
    setLoading(false);
    if (error) setError(error.message);
  }

  return (
    <Suspense fallback={null}>
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
            Welcome back
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-[#2E7D5A] mb-4 text-center">
            to Quillaborn
          </h2>
          <p className="text-gray-300 text-center mb-8 text-lg">
            Sign in to continue your creative journey.
          </p>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center gap-3 border border-stone-200 bg-white rounded-full py-3 px-6 font-bold text-[#1B1B1B] hover:bg-gray-100 shadow-none transition mb-4"
            disabled={loading}
          >
            <FcGoogle size={22} /> Sign In with Google
          </button>
          <div className="w-full flex items-center my-4">
            <div className="flex-grow h-px bg-stone-700" />
            <span className="mx-2 text-stone-400 text-sm">or</span>
            <div className="flex-grow h-px bg-stone-700" />
          </div>

          {/* Email/Password Sign In Form */}
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
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
              autoComplete="current-password"
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
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <div className="w-full flex flex-col md:flex-row justify-between items-center mt-6 text-sm text-stone-300 gap-2">
            <div>
              Don't have an account?{" "}
              <Link href="/signup" className="underline text-green-400 hover:text-green-300 font-semibold">
                Sign up
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
    </Suspense>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}
