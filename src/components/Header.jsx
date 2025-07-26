import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sparkles, Menu, X } from "lucide-react";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/how" },
  { label: "Pricing", href: "/pricing" },
  { label: "NSFW Policy", href: "/nsfw" },
  { label: "Contact", href: "/contact" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

export default function Header({ onJoinWaitlist }) {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="relative z-50 px-6 py-4 border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-gray-900" />
          </div>
          <span className="text-xl font-bold text-white">Quillaborn</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-6">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              to={href}
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
              to={href}
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
