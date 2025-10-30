"use client";

import { useState } from "react";

export default function TimelineComposer() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const limit = 2000;

  const remaining = limit - text.length;
  const disabled = loading || text.trim().length === 0 || text.length > limit;

  async function submit() {
    if (disabled) return;
    setLoading(true);

    try {
      const res = await fetch("/api/me/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });

      const out = await res.json();
      if (!res.ok) throw new Error(out?.error ?? "Failed to post");

      // ✅ Clear text input
      setText("");

      // ✅ Trigger feed refresh event
      window.dispatchEvent(new CustomEvent("timeline:refresh"));

      // ✅ Trigger modal close event
      window.dispatchEvent(new CustomEvent("post:created"));
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
      <label htmlFor="timeline-composer" className="sr-only">
        Share an update
      </label>

      <textarea
        id="timeline-composer"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share an update…"
        rows={3}
        className="w-full resize-y rounded-xl bg-white/10 p-3 text-white placeholder-white/50 outline-none focus:ring-2 ring-emerald-400/30"
        maxLength={limit + 1}
      />

      <div className="flex items-center justify-between text-sm text-white/70">
        <span aria-live="polite">{remaining} characters left</span>

        <button
          onClick={submit}
          disabled={disabled}
          className={`px-4 py-1.5 rounded-full font-medium transition ${
            disabled
              ? "bg-emerald-700/40 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-400 text-gray-900"
          }`}
          aria-label="Publish post"
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}
