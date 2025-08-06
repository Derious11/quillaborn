"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Image from "next/image";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },

  { label: "Contact", href: "/contact" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

interface HeaderProps {
  onJoinWaitlist: () => void;
}

export default function Header({ onJoinWaitlist }: HeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="relative z-50 px-6 py-4 border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/Green_Quill_noback.png" alt="Quillaborn Logo" width={48} height={48} className="w-12 h-12 brightness-125" />
          <span className="text-xl font-bold text-white">Quillaborn</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-6">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium hover:text-green-400 transition-colors duration-200 ${
                pathname === href ? "text-green-400" : "text-gray-300"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-300 hover:text-green-400"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* CTA Button */}
        <button
          onClick={onJoinWaitlist}
          className="ml-4 px-4 py-2 text-sm font-semibold rounded bg-green-500 hover:bg-green-400 text-gray-900 shadow hidden md:block"
        >
          Join Waitlist
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden mt-4 space-y-2">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setIsOpen(false)}
              className={`block text-sm font-medium px-2 py-1 rounded hover:bg-gray-800 transition-colors duration-150 ${
                pathname === href ? "text-green-400" : "text-gray-300"
              }`}
            >
              {label}
            </Link>
          ))}

          <button
            onClick={onJoinWaitlist}
            className="w-full text-left mt-2 px-4 py-2 text-sm font-semibold rounded bg-green-500 hover:bg-green-400 text-gray-900 shadow"
          >
            Join Waitlist
          </button>
        </div>
      )}
    </header>
  );
}
