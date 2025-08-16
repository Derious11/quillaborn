// app/403/page.tsx
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-gray-900 to-gray-900 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">403 · Forbidden</h1>
          <p className="text-lg text-gray-300 mb-8">
            You don’t have permission to view this page.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/"
              className="bg-green-500 hover:bg-green-600 text-gray-900 px-6 py-3 rounded-full font-bold transition-all"
            >
              Go Home
            </Link>
            <Link
              href="/login"
              className="border border-white/20 hover:border-white/40 px-6 py-3 rounded-full font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
