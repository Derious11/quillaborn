import { useState } from "react";
import { XCircle, Sparkles, ArrowRight } from "lucide-react";

export default function WaitlistModal({ show, onClose }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch(`https://api.airtable.com/v0/${import.meta.env.VITE_AIRTABLE_BASE_ID}/Waitlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
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
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="bg-gray-900 text-white rounded-2xl p-8 max-w-sm w-full shadow-xl relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
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
              You're in! We’ll be in touch soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
