"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sparkles,
  Users,
  CalendarCheck,
  Film,
  History,
  Flame,
  LogOut,
  Menu,
  X,
  Compass,
  Settings as SettingsIcon,
  Sun,
  Moon,
  User as UserIcon,
  LogIn,
  UserPlus
} from "lucide-react";
import { getStoredToken, api, clearStoredToken } from "@/lib/api";
import NivoraLogo from "./NivoraLogo";
import { useTheme } from "./ThemeProvider";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isLightMode = theme === "light";
  const [token, setToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = getStoredToken();
    setToken(t);
    if (t) {
      api.getMe().then(setUserProfile).catch(() => {
        clearStoredToken();
        setToken(null);
      });
    }
  }, [pathname]);

  // Close hamburger menu on route change
  useEffect(() => {
    setHamburgerOpen(false);
  }, [pathname]);

  // Click outside and escape key listeners for hamburger menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setHamburgerOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setHamburgerOpen(false);
      }
    };

    if (hamburgerOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [hamburgerOpen]);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      clearStoredToken();
    }
    setToken(null);
    setUserProfile(null);
    setHamburgerOpen(false);
    router.push("/");
  };

  const navLinks = [
    { label: "Today", href: "/today", icon: CalendarCheck },
    { label: "Characters", href: "/characters", icon: Users },
    { label: "Episodes", href: "/episodes", icon: Film },
    { label: "Timeline", href: "/timeline", icon: History },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-[#393B4B]/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* LEFT REGION: Circular N Logo + Nivora Wordmark */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center group py-2" aria-label="Nivora Home">
              <NivoraLogo size="md" />
            </Link>
          </div>

          {/* CENTER REGION: Main Navigation Centered */}
          <div className="hidden md:flex items-center justify-center flex-1 space-x-1 lg:space-x-2 px-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#A8E6CF]/15 text-[#A8E6CF] border border-[#A8E6CF]/30 shadow-sm font-semibold"
                      : "text-[#858B98] hover:text-[#F6F5F8] hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* RIGHT REGION: Streak, Level, Hamburger Menu */}
          <div className="flex items-center space-x-3 shrink-0">
            {token && userProfile ? (
              <div className="flex items-center space-x-2.5">
                {/* Streak Pill - Persisted from user records */}
                <Link
                  href="/timeline"
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#F2D15C]/15 border border-[#F2D15C]/30 text-[#F2D15C] text-xs font-semibold hover:scale-105 transition-transform"
                  title="Your active streak"
                >
                  <Flame className="w-4 h-4 text-[#F2D15C]" />
                  <span>{userProfile.current_streak ?? 0}d Streak</span>
                </Link>

                {/* Level Pill - Persisted from user records */}
                <div
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-[#20232E] border border-[#393B4B] text-[#A8E6CF] text-xs font-semibold"
                  title={`Level ${userProfile.level ?? 1}`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Lvl {userProfile.level ?? 1}</span>
                </div>
              </div>
            ) : null}

            {/* Hamburger Menu Toggle Button */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setHamburgerOpen(!hamburgerOpen)}
                aria-label="Account and Navigation Menu"
                aria-expanded={hamburgerOpen}
                className="p-2 rounded-xl bg-[#20232E] hover:bg-[#252735] border border-[#393B4B] text-[#F6F5F8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#A8E6CF]/50"
              >
                {hamburgerOpen ? <X className="w-5 h-5 text-[#A8E6CF]" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Hamburger Dropdown Panel */}
              {hamburgerOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#20232E] border border-[#393B4B] shadow-2xl p-2.5 space-y-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-2xl"
                >
                  {/* Top Entry: Explore Other Lives */}
                  <Link
                    href="/explore-other-lives"
                    onClick={() => setHamburgerOpen(false)}
                    className="flex items-center space-x-3 w-full px-3.5 py-3 rounded-xl bg-gradient-to-r from-[#A8E6CF]/15 to-transparent border border-[#A8E6CF]/30 hover:border-[#A8E6CF]/60 text-sm font-bold text-[#A8E6CF] transition-all group"
                  >
                    <Compass className="w-5 h-5 text-[#A8E6CF] group-hover:rotate-45 transition-transform" />
                    <div className="flex-1 text-left">
                      <div className="font-extrabold text-white text-xs">Explore Other Lives</div>
                      <div className="text-[10px] text-[#858B98] font-normal">Browse demo characters & sample stories</div>
                    </div>
                  </Link>

                  <div className="h-px bg-[#393B4B]/60 my-1" />

                  {/* Mobile Navigation Links if on mobile */}
                  <div className="md:hidden space-y-1">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = pathname === link.href;
                      return (
                        <Link
                          key={link.label}
                          href={link.href}
                          onClick={() => setHamburgerOpen(false)}
                          className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                            isActive
                              ? "bg-[#A8E6CF]/15 text-[#A8E6CF]"
                              : "text-[#858B98] hover:text-[#F6F5F8] hover:bg-white/5"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                    <div className="h-px bg-[#393B4B]/60 my-1" />
                  </div>

                  {/* Settings */}
                  <Link
                    href="/settings"
                    onClick={() => setHamburgerOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-[#F6F5F8] hover:bg-white/5 transition-colors"
                  >
                    <SettingsIcon className="w-4 h-4 text-[#858B98]" />
                    <span>Settings & Reminders</span>
                  </Link>

                  {/* Theme Mode Toggle */}
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-medium text-[#F6F5F8] hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      {isLightMode ? (
                        <Sun className="w-4 h-4 text-[#FFB347]" />
                      ) : (
                        <Moon className="w-4 h-4 text-[#858B98]" />
                      )}
                      <span>Theme: {isLightMode ? "Light" : "Dark"}</span>
                    </div>
                    <span className="text-[10px] text-[#858B98] uppercase font-bold tracking-wider">
                      {isLightMode ? "Light" : "Dark"}
                    </span>
                  </button>

                  {/* Account Information / Auth Actions */}
                  <div className="h-px bg-[#393B4B]/60 my-1" />

                  {token && userProfile ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="px-3 py-1.5 rounded-lg bg-[#14151D] border border-[#393B4B]/50">
                        <div className="text-[11px] font-bold text-[#F6F5F8] truncate">
                          {userProfile.display_name}
                        </div>
                        <div className="text-[10px] text-[#858B98] truncate">{userProfile.email}</div>
                      </div>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center space-x-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#E8EAF0] hover:bg-white/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-[#858B98]" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Link
                        href="/login"
                        onClick={() => setHamburgerOpen(false)}
                        className="flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-[#252735] hover:bg-[#1D1F2B] border border-[#393B4B] text-xs font-semibold text-[#F6F5F8] transition-colors"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In</span>
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setHamburgerOpen(false)}
                        className="flex items-center justify-center space-x-1 py-2 px-3 rounded-xl bg-[#A8E6CF] hover:bg-[#7ED8B8] text-xs font-bold text-[#14151D] transition-all shadow-sm"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Register</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
