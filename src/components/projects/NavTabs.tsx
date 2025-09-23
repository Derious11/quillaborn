"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavTabs({ slug }: { slug: string }) {
  const pathname = usePathname();
  const base = `/p/${slug}`;

  const links = [
    { href: base, label: "Dashboard" },
    { href: `${base}/updates`, label: "Updates" },
    { href: `${base}/chat`, label: "Chat" },
    { href: `${base}/files`, label: "Files" },
    { href: `${base}/board`, label: "Board" },
    { href: `${base}/settings`, label: "Settings" },
  ];

  return (
    <nav className="flex overflow-x-auto space-x-4 sm:space-x-6 text-sm font-medium border-b border-gray-700 scrollbar-hide">
      {links.map(({ href, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`whitespace-nowrap pb-2 border-b-2 transition-colors ${
              isActive
                ? "border-green-400 text-green-400"
                : "border-transparent text-gray-300 hover:text-green-400 hover:border-green-400"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
