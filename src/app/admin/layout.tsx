// app/admin/layout.tsx
import type { ReactNode } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AdminTabs from "@/components/admin/AdminTabs";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Site header (same as landing) */}
      <Header />

      {/* Themed admin container */}
      <main className="relative flex-1 overflow-hidden">
        {/* soft green gradient like landing */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-gray-900 to-gray-900 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto w-full px-6 py-6 lg:py-10">
          {/* Top bar with Back button */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <h1 className="text-lg font-semibold tracking-tight">Admin</h1>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-green-500 transition"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {/* Tabs across all admin pages */}
          <AdminTabs />

          {/* Page content */}
          <div className="mt-6">
            {children}
          </div>
        </div>
      </main>

      {/* Site footer (same as landing) */}
      <Footer />
    </div>
  );
}
