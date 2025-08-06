"use client";

import { useState } from "react";
import { XCircle, Sparkles, ArrowRight } from "lucide-react";

interface WaitlistModalProps {
  show: boolean;
  onClose: () => void;
}

// Email validation utility (outside component for reuse/performance)
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function WaitlistModal({ show, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Email validation
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

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="bg-gray-900 text-white rounded-2xl p-8 max-w-sm w-full shadow-xl relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Close waitlist modal"
        >
          <XCircle className="w-6 h-6" />
        </button>

        <h3 className="text-2xl font-bold mb-2 text-green-400">Join the Waitlist</h3>
        <p className="text-gray-300 mb-4 text-sm">
          Enter your email and we’ll let you know as soon as Quillaborn opens for creators.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              autoComplete="email"
            />
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-gray-900 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all"
            >
              Submit
              <ArrowRight className="w-4 h-4" />
            </button>
            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
          </form>
        ) : (
          <div className="bg-green-500/20 border border-green-500/30 px-6 py-4 rounded-xl">
            <p className="text-green-300 font-bold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              You are in! We will be in touch soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
