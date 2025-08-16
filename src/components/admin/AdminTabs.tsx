// components/admin/AdminTabs.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin/users", label: "Users" },
  { href: "/admin/waitlist", label: "Waitlist" },
  { href: "/admin/metrics", label: "Metrics" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminTabs() {
  const pathname = usePathname();
  return (
    <nav className="mb-6 flex flex-wrap gap-2">
      {tabs.map(t => {
        const active = pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-4 py-2 rounded-full border transition ${
              active
                ? "bg-green-500 text-gray-900 border-green-500"
                : "border-white/10 hover:bg-white/10"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
