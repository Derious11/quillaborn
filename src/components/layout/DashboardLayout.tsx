"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import SignOutButton from "@/components/ui/signoutbutton";
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';

interface DashboardLayoutProps {
  user: User;
  profile: Profile;
  userInterests?: any[];
  userRole?: any;
  children: React.ReactNode;
}

export default function DashboardLayout({ user, profile, userInterests, userRole, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determine active tab based on current pathname
  const getActiveTab = () => {
    // Remove trailing slash and split
    const cleanPath = pathname.replace(/\/$/, '');
    const path = cleanPath.split('/').pop() || 'home';
    return path === 'dashboard' ? 'home' : path;
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      home: 'Home',
      profile: 'Profile',
      explore: 'Explore',
      notifications: 'Notifications',
      messages: 'Messages',
      projects: 'Projects',
    };
    return titles[getActiveTab()] || 'Dashboard';
  };

  // Force re-render when pathname changes
  const activeTab = getActiveTab();
  const pageTitle = getPageTitle();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex" key={pathname}>
      <Sidebar 
        user={user} 
        profile={profile} 
        activeTab={activeTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[9999] text-green-400 hover:text-green-300 bg-gray-800 rounded-lg p-2 shadow-lg border border-gray-600"
      >
        <Menu size={24} />
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="relative z-40 px-6 py-4 border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 ml-12 lg:ml-0">
              <Image 
                src="/Green_Quill_noback.png" 
                alt="Quillaborn Logo" 
                width={48} 
                height={48} 
                className="w-12 h-12 brightness-125" 
              />
              <span className="text-xl font-bold text-white">
                {pageTitle}
              </span>
            </div>
            <SignOutButton />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 