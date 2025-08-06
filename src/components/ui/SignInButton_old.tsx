'use client'

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { FcGoogle } from "react-icons/fc"

// Use your theme colors from Tailwind config (update classes if you've customized!)
export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSuccess("Check your inbox to verify your email.")
      setEmail("")
      setPassword("")
    }
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin, // or your dashboard
      },
    })
    setLoading(false)
    if (error) setError(error.message)
    // The user will be redirected by Supabase if successful
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9F9F7] px-4">
      <div className="w-full max-w-md rounded-2xl shadow-xl bg-white p-8">
        <h1 className="text-3xl md:text-5xl font-bold text-[#1B1B1B] mb-2 text-center">Sign Up</h1>
        <p className="text-base text-stone-500 mb-6 text-center">Join Quillaborn – where creators connect & collaborate.</p>

        {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}
        {success && <div className="mb-4 text-green-700 text-sm text-center">{success}</div>}

        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div>
            <label className="block text-sm text-[#1B1B1B] mb-1" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="w-full rounded-xl border border-[#D6D3D1] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D5A]"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm text-[#1B1B1B] mb-1" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="w-full rounded-xl border border-[#D6D3D1] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E7D5A]"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#2E7D5A] text-white rounded-xl py-2 font-bold mt-2 hover:bg-[#215C43] transition"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up with Email"}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow h-px bg-stone-200" />
          <span className="mx-2 text-stone-400 text-sm">or</span>
          <div className="flex-grow h-px bg-stone-200" />
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-stone-200 bg-white rounded-full py-3 px-6 font-bold text-[#1B1B1B] hover:bg-gray-100 shadow-none transition"
        >
          <FcGoogle size={22} /> Sign Up with Google
        </button>

        <div className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <a href="/login" className="text-[#2E7D5A] font-semibold hover:underline">Log in</a>
        </div>
      </div>
    </div>
  )
}
