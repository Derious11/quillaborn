"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import SignOutButton from "@/components/ui/signoutbutton";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import { NotificationsProvider } from "@/components/providers/NotificationsProvider";

interface DashboardLayoutProps {
  user: User;
  profile: Profile;
  userInterests?: any[];
  userRole?: any;
  children: React.ReactNode;
}

export default function DashboardLayout({
  user,
  profile,
  userInterests,
  userRole,
  children,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getActiveTab = () => {
    const cleanPath = pathname.replace(/\/$/, "");
    if (cleanPath.includes("/dashboard/u/")) return "explore";
    const path = cleanPath.split("/").pop() || "home";
    return path === "dashboard" ? "home" : path;
  };

  const titles: Record<string, string> = {
    home: "Home",
    profile: "Profile",
    explore: "Explore",
    notifications: "Notifications",
    messages: "Messages",
    projects: "Projects",
  };
  const activeTab = getActiveTab();
  const pageTitle = titles[activeTab] || "Dashboard";

  return (
    <NotificationsProvider>
      <div className="h-screen flex overflow-hidden bg-gray-900 text-white" key={pathname}>
        {/* ---- Desktop Sidebar ---- */}
        <aside className="hidden lg:flex w-64 fixed inset-y-0 left-0 z-40 bg-gray-900 border-r border-gray-800">
          <Sidebar
            user={user}
            profile={profile}
            activeTab={activeTab}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </aside>

        {/* ---- Mobile Sidebar Overlay ---- */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            {/* Dimmed background */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Slide-in panel */}
            <div className="relative w-64 bg-gray-900 border-r border-gray-800 animate-slideInLeft">
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
              <Sidebar
                user={user}
                profile={profile}
                activeTab={activeTab}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            </div>
          </div>
        )}

        {/* ---- Mobile Menu Button ---- */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-[9999] text-green-400 hover:text-green-300 bg-gray-800 rounded-lg p-2 shadow-lg border border-gray-600"
        >
          <Menu size={24} />
        </button>

        {/* ---- Main Content Area ---- */}
        <div className="flex-1 lg:ml-64 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 px-6 py-4 border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 ml-12 lg:ml-0">
                <Image
                  src="/Green_Quill_noback.png"
                  alt="Quillaborn Logo"
                  width={48}
                  height={48}
                  className="w-12 h-12 brightness-125"
                />
                <span className="text-xl font-bold text-white">{pageTitle}</span>
              </div>
              <SignOutButton />
            </div>
          </header>

          {/* Scrollable Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-6xl mx-auto">{children}</div>
          </main>
        </div>
      </div>

      {/* ---- Simple animation (Tailwind) ---- */}
      <style jsx global>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.25s ease-out;
        }
      `}</style>
    </NotificationsProvider>
  );
}
