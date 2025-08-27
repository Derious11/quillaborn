"use client";

import { FaTiktok, FaInstagram, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { SiBluesky } from "react-icons/si";

const socials = [
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@quillaborn",
    icon: FaTiktok,
    color: "text-black",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/social.quillaborn/",
    icon: FaInstagram,
    color: "text-pink-500",
  },
  {
    name: "X (Twitter)",
    href: "https://x.com/quillaborn",
    icon: FaXTwitter,
    color: "text-slate-800",
  },
  {
    name: "Bluesky",
    href: "https://bsky.app/profile/quillaborn.bsky.social",
    icon: SiBluesky,
    color: "text-sky-500",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@Quillaborn",
    icon: FaYoutube,
    color: "text-red-600",
  },
];

export default function SocialLinks() {
  return (
    <div className="mt-10 flex flex-wrap gap-4">
      {socials.map(({ name, href, icon: Icon, color }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <Icon className={`w-5 h-5 ${color}`} />
          <span className="text-sm font-medium">{name}</span>
        </a>
      ))}
    </div>
  );
}
