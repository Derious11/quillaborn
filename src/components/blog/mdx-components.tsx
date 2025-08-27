// src/components/blog/mdx-components.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import Callout from "@/components/blog/callout";
import SocialLinks from "@/components/ui/SocialLinks";

/** Links: internal -> <Link/>, external -> <a target=_blank/> */
function A(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const href = props.href ?? "#";
  const isInternal = href.startsWith("/") || href.startsWith("#");
  const className = ["text-green-400 hover:underline", props.className].filter(Boolean).join(" ");
  if (isInternal) return <Link href={href} className={className}>{props.children}</Link>;
  return <a {...props} className={className} target="_blank" rel="noopener noreferrer" />;
}

/** Optimized image with optional caption */
function Img({
  src,
  alt,
  width = 1200,
  height = 720,
  caption,
}: { src: string; alt: string; width?: number | string; height?: number | string; caption?: string }) {
  const w = typeof width === "string" ? parseInt(width, 10) : width;
  const h = typeof height === "string" ? parseInt(height, 10) : height;
  return (
    <figure className="my-6">
      <Image src={src} alt={alt} width={w} height={h} className="rounded-2xl shadow" />
      {caption && <figcaption className="mt-2 text-sm text-gray-400">{caption}</figcaption>}
    </figure>
  );
}

/** CTA button used inside MDX: <CTA href="/signup">Join</CTA> */
function CTA({ href, children }: { href: string; children: React.ReactNode }) {
  const isInternal = href.startsWith("/");
  const className =
     "not-prose inline-flex items-center rounded-full px-6 py-3 font-semibold " +
    "bg-green-500 hover:bg-green-600 !text-white no-underline " + // force white, kill underline
    "shadow-md hover:shadow-lg transition-transform hover:scale-105";
  return isInternal ? (
    <Link href={href} className={className}>{children}</Link>
  ) : (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">{children}</a>
  );
}

export const mdxComponents = {
  a: A,
  Img,
  Callout,
  CTA,
  SocialLinks,  // ✅ now available in MDX as <SocialLinks />
} as const;

