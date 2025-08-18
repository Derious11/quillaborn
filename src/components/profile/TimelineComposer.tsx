// components/profile/TimelineComposer.tsx
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
      setText("");
      // Notify the timeline list to refresh
      window.dispatchEvent(new CustomEvent("timeline:refresh"));
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
        className="w-full resize-y rounded-xl bg-white/10 p-3 outline-none focus:ring-2 ring-white/20"
      />
      <div className="flex items-center justify-between text-sm opacity-80">
        <span aria-live="polite">{remaining} left</span>
        <button
          onClick={submit}
          disabled={disabled}
          className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
          aria-label="Publish post"
        >
          Post
        </button>
      </div>
    </div>
  );
}
