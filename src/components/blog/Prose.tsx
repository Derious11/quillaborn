// src/components/blog/Prose.tsx
import React from "react";

export default function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={[
        "prose prose-invert max-w-none",
        // base text + headings
        "prose-p:text-gray-200 prose-li:text-gray-200",
        "prose-headings:text-white prose-h2:mt-10 prose-h2:text-2xl prose-h3:text-xl",
        // links
        "prose-a:text-green-400 hover:prose-a:text-green-300",
        // quotes
        "prose-blockquote:border-l-green-400 prose-blockquote:text-gray-200",
        // code
        "prose-code:text-green-300 prose-pre:bg-gray-800",
        // images
        "prose-img:rounded-2xl",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
