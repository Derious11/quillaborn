"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Home, 
  User as UserIcon, 
  Search, 
  Bell, 
  MessageCircle, 
  FolderOpen,
  Menu,
  X
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  href: string;
}

interface SidebarProps {
  user: User;
  profile: Profile;
  activeTab: string;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
}

export default function Sidebar({ user, profile, activeTab, sidebarOpen: externalSidebarOpen, setSidebarOpen: externalSetSidebarOpen }: SidebarProps) {
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(false);
  const router = useRouter();
  
  // Use external state if provided, otherwise use internal state
  const sidebarOpen = externalSidebarOpen !== undefined ? externalSidebarOpen : internalSidebarOpen;
  const setSidebarOpen = externalSetSidebarOpen || setInternalSidebarOpen;

  const navigationItems: NavigationItem[] = [
    { id: 'home', label: 'Home', icon: Home, href: '/dashboard' },
    { id: 'profile', label: 'Profile', icon: UserIcon, href: '/dashboard/profile' },
    { id: 'explore', label: 'Explore', icon: Search, href: '/dashboard/explore' },
    { id: 'notifications', label: 'Notifications', icon: Bell, href: '/dashboard/notifications' },
    { id: 'messages', label: 'Messages', icon: MessageCircle, href: '/dashboard/messages' },
    { id: 'projects', label: 'Projects', icon: FolderOpen, href: '/dashboard/projects' },
  ];

  const handleNavigation = (item: NavigationItem) => {
    setSidebarOpen(false);
    router.push(item.href);
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <Image
                src="/Green_Quill_noback.png"
                alt="Quillaborn Logo"
                width={48}
                height={48}
                className="w-12 h-12 brightness-125"
              />
              <span className="text-xl font-bold text-white">Quillaborn</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigation(item)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                        ${activeTab === item.id 
                          ? 'bg-green-500 text-gray-900 font-medium' 
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }
                      `}
                    >
                      <Icon size={20} />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">
                  {profile.display_name?.[0] || profile.username[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {profile.display_name || profile.username}
                </p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 