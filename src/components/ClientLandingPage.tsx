"use client";

import { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

export default function ClientLandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch(`https://api.airtable.com/v0/${process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID}/Waitlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_AIRTABLE_API_KEY}`,
        },
        body: JSON.stringify({
          fields: {
            Email: email,
          },
        }),
      });

      if (!res.ok) throw new Error("Failed to submit");
      setSubmitted(true);
      setEmail("");
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div id="waitlist" className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
      {!submitted ? (
        <>
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="px-6 py-4 rounded-full w-full sm:flex-1 text-gray-900 bg-white focus:outline-none focus:ring-4 focus:ring-green-500/20 text-center sm:text-left"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-600 text-gray-900 px-8 py-4 rounded-full font-bold transition-all duration-200 transform hover:scale-105 whitespace-nowrap flex items-center gap-2"
          >
            Join Waitlist
            <ArrowRight className="w-4 h-4" />
          </button>
        </>
      ) : (
        <div className="bg-green-500/20 border border-green-500/30 px-8 py-4 rounded-full">
          <p className="text-green-300 font-bold text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            You are in! We will be in touch soon.
          </p>
        </div>
      )}
      {error && (
        <p className="text-red-400 text-sm mt-4 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg inline-block">
          {error}
        </p>
      )}
    </div>
  );
} 