// app/admin/layout.tsx
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import SignOutButton from "@/components/ui/signoutbutton";
import AdminTabs from "@/components/admin/AdminTabs";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Dashboard-style header */}
      <header className="relative z-40 px-6 py-4 border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image 
              src="/Green_Quill_noback.png" 
              alt="Quillaborn Logo" 
              width={48} 
              height={48} 
              className="w-12 h-12 brightness-125" 
            />
            <span className="text-xl font-bold text-white">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-green-500 transition"
            >
              ← Back to Dashboard
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Tabs across all admin pages */}
          <AdminTabs />

          {/* Page content */}
          <div className="mt-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
