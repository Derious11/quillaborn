"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import HeaderSimple from "@/components/layout/HeaderSimple";
import Footer from "@/components/layout/Footer";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { supabase } = useSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      setError(error.message);
      return;
    }

    if (data.user) {
      // Check user's profile including early access
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_complete, early_access')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // If we can't fetch profile, redirect to no-access to be safe
        window.location.href = "/no-access";
        return;
      }

      // Check early access first
      if (!profile?.early_access) {
        console.log('User does not have early access, redirecting to no-access');
        window.location.href = "/no-access";
        return;
      }

      // User has early access, check onboarding status
      if (profile.onboarding_complete) {
        console.log('User has early access and onboarding complete, redirecting to dashboard');
        window.location.href = "/dashboard";
      } else {
        console.log('User has early access but onboarding incomplete, redirecting to onboarding');
        window.location.href = "/username";
      }
    }
  }

  // Handler for Google login
  async function handleGoogleLogin() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#19222e] to-[#21292f] text-white flex flex-col">
      <HeaderSimple />

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
  );
}
