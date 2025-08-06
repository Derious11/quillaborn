"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Menu } from "lucide-react";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

export default function HeaderSimple() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative w-full px-4 pt-6 pb-4 bg-transparent z-20">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo and title left */}
        <Link href="/" className="flex items-center gap-2 min-w-max">
          <Image src="/Green_Quill_noback.png" alt="Quillaborn Logo" width={40} height={40} />
          <span className="text-white text-2xl font-extrabold">Quillaborn</span>
        </Link>
        {/* Navigation centered */}
        <nav className="hidden md:flex flex-1 justify-center gap-8 text-white text-base font-semibold">
          {navLinks.map(({ label, href }) => (
            <Link key={href} href={href} className="hover:text-[#2E7D5A] transition">
              {label}
            </Link>
          ))}
        </nav>
        {/* Hamburger for mobile */}
        <button
          className="flex md:hidden ml-auto"
          onClick={() => setOpen(!open)}
          aria-label="Open menu"
        >
          <Menu className="w-8 h-8 text-white" />
        </button>
      </div>
      {/* Mobile menu overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
          <button
            className="absolute top-6 right-6 text-white"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-8 h-8" />
          </button>
          <nav className="flex flex-col gap-8 text-white text-2xl font-semibold">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="hover:text-[#2E7D5A] transition"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
