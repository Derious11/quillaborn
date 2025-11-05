"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Home,
  User as UserIcon,
  Search,
  Bell,
  MessageCircle,
  FolderOpen,
  Users,
  X,
  Settings,
  ChevronDown,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import { useNotifications } from "@/components/providers/NotificationsProvider";

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

export default function Sidebar({
  user,
  profile,
  activeTab,
  sidebarOpen: externalSidebarOpen,
  setSidebarOpen: externalSetSidebarOpen,
}: SidebarProps) {
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { unreadMessages, unreadNotifications } = useNotifications();

  const sidebarOpen =
    externalSidebarOpen !== undefined
      ? externalSidebarOpen
      : internalSidebarOpen;
  const setSidebarOpen = externalSetSidebarOpen || setInternalSidebarOpen;

  const navigationItems: NavigationItem[] = [
  { id: "home", label: "Home", icon: Home, href: "/dashboard" },
  { id: "profile", label: "Profile", icon: UserIcon, href: "/dashboard/profile" },
  { id: "explore", label: "Explore", icon: Search, href: "/dashboard/explore" },
  { id: "community", label: "Community", icon: Users, href: "/dashboard/community" },
  { id: "notifications", label: "Notifications", icon: Bell, href: "/dashboard/notifications" },
  { id: "messages", label: "Messages", icon: MessageCircle, href: "/dashboard/messages" },
  { id: "projects", label: "Projects", icon: FolderOpen, href: "/dashboard/projects" },
];

  const isAdmin = ["admin", "owner"].includes((profile as any)?.role);

  const handleNavigation = (href: string) => {
    setSidebarOpen(false);
    setMenuOpen(false);
    router.push(href);
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
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

            {/* ✅ Accessible close button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
              title="Close sidebar"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigation(item.href)}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors
                        ${
                          isActive
                            ? "bg-green-500 text-gray-900 font-medium"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                        }
                      `}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={20} />
                        {item.label}
                      </span>

                      {/* Unread badge for Notifications */}
                      {item.id === "notifications" && unreadNotifications > 0 && (
                        <span
                          className={`
                            inline-flex items-center justify-center min-w-[1.5rem] px-1.5 h-6 text-xs font-semibold rounded-full
                            ${
                              isActive
                                ? "bg-gray-900 text-amber-300"
                                : "bg-amber-500/20 text-amber-200"
                            }
                            border ${
                              isActive
                                ? "border-gray-700"
                                : "border-amber-500/40"
                            }
                          `}
                          aria-label={`${unreadNotifications} unread notifications`}
                        >
                          {unreadNotifications > 99 ? "99+" : unreadNotifications}
                        </span>
                      )}

                      {/* Unread badge for Messages */}
                      {item.id === "messages" && unreadMessages > 0 && (
                        <span
                          className={`
                            inline-flex items-center justify-center min-w-[1.5rem] px-1.5 h-6 text-xs font-semibold rounded-full
                            ${
                              isActive
                                ? "bg-gray-900 text-green-300"
                                : "bg-emerald-600/30 text-emerald-200"
                            }
                            border ${
                              isActive
                                ? "border-gray-800"
                                : "border-emerald-500/40"
                            }
                          `}
                          aria-label={`${unreadMessages} unread messages`}
                        >
                          {unreadMessages}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer / Profile */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">
                  {profile.display_name?.[0] ||
                    profile.username[0]?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {profile.display_name || profile.username}
                </p>

                {/* ✅ Accessible dropdown trigger */}
                <button
                  onClick={() => setMenuOpen((s) => !s)}
                  className="mt-1 inline-flex items-center gap-2 text-xs text-gray-400 hover:text-green-400 transition-colors"
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  aria-controls="settings-menu"
                >
                  <Settings size={12} />
                  Settings
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${
                      menuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div
                    id="settings-menu"
                    role="menu"
                    aria-hidden={!menuOpen}
                    ref={menuRef}
                    className="absolute bottom-12 left-0 z-50 w-56 rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur shadow-xl overflow-hidden"
                  >
                    <button
                      role="menuitem"
                      onClick={() => handleNavigation("/dashboard/settings")}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-white/10"
                    >
                      Account Settings
                    </button>

                    {isAdmin && (
                      <>
                        <div className="px-4 py-2 text-xs uppercase tracking-wide text-gray-400 border-t border-white/5">
                          Admin
                        </div>
                        <button
                          role="menuitem"
                          onClick={() => handleNavigation("/admin/users")}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-white/10"
                        >
                          Users
                        </button>
                        <button
                          role="menuitem"
                          onClick={() => handleNavigation("/admin/waitlist")}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-white/10"
                        >
                          Waitlist
                        </button>
                        <button
                          role="menuitem"
                          onClick={() => handleNavigation("/admin/metrics")}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-white/10"
                        >
                          Metrics
                        </button>
                        <button
                          role="menuitem"
                          onClick={() => handleNavigation("/admin/settings")}
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-200 hover:bg-white/10"
                        >
                          Admin Settings
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
