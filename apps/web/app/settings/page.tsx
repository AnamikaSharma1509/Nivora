"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Clock,
  Globe,
  Shield,
  User,
  CheckCircle2,
  AlertCircle,
  Save,
  Volume2,
  Subtitles,
  Trash2,
  RefreshCw,
  Sun,
  Moon,
  Palette
} from "lucide-react";
import { api, getStoredToken, UserProfile } from "@/lib/api";
import { useTheme } from "@/components/ThemeProvider";

const TIME_ZONES = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Australia/Sydney",
  "UTC",
];

const TONES = [
  { key: "motivational", label: "Motivational & Uplifting" },
  { key: "cinematic", label: "Cinematic & Dramatic" },
  { key: "gritty_realism", label: "Gritty Realism & Direct" },
  { key: "analytical", label: "Analytical & Systems-Focused" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [browserNotificationStatus, setBrowserNotificationStatus] = useState<string>("default");

  // Form state
  const [reminderTime, setReminderTime] = useState("20:00");
  const [timeZone, setTimeZone] = useState("Asia/Kolkata");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [preferredTone, setPreferredTone] = useState("motivational");
  const [captionsEnabled, setCaptionsEnabled] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.push("/login");
      return;
    }

    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserNotificationStatus(Notification.permission);
    }

    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getMe();
      setProfile(data);
      if (data.preferences) {
        setReminderTime(data.preferences.daily_reminder_time || "20:00");
        setTimeZone(data.preferences.time_zone || "Asia/Kolkata");
        setEmailNotifications(data.preferences.email_notifications ?? true);
        setPreferredTone(data.preferences.preferred_tone || "motivational");
        setCaptionsEnabled(data.preferences.caption_enabled ?? true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg(null);
      await api.updatePreferences({
        daily_reminder_time: reminderTime,
        time_zone: timeZone,
        email_notifications: emailNotifications,
        preferred_tone: preferredTone,
        caption_enabled: captionsEnabled,
        background_music_enabled: true,
        music_volume: 0.25,
        language: "en",
      });
      setSuccessMsg("Settings and reminder preferences saved successfully.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const requestBrowserNotifications = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      alert("Browser notifications are not supported on this device.");
      return;
    }
    const res = await Notification.requestPermission();
    setBrowserNotificationStatus(res);
    if (res === "granted") {
      new Notification("Nivora Daily Reminders", {
        body: "Ready to plan today's steps toward your goal?",
        icon: "/favicon.ico",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 space-y-3">
        <RefreshCw className="w-8 h-8 text-[#F2D15C] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#393B4B] pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#F6F5F8]">Settings & Preferences</h1>
          <p className="text-xs sm:text-sm text-[#858B98] mt-1">
            Configure daily scheduling, notifications, narrative style, and account ownership.
          </p>
        </div>

        <Link
          href="/today"
          className="px-4 py-2 rounded-xl bg-[#20232E] border border-[#393B4B] text-xs font-bold text-[#F6F5F8] hover:border-[#F2D15C] transition-all"
        >
          Back to Today
        </Link>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-[#A8E6CF]/15 border border-[#A8E6CF]/40 text-xs font-semibold text-[#A8E6CF] flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Account Profile Summary Card */}
      <div className="glass-panel rounded-2xl p-6 border border-[#393B4B] space-y-4">
        <div className="flex items-center space-x-3 border-b border-[#393B4B]/60 pb-3">
          <User className="w-5 h-5 text-[#F2D15C]" />
          <h2 className="text-base font-bold text-[#F6F5F8]">Authenticated Account</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-[#14151D] border border-[#393B4B]">
            <span className="text-[10px] text-[#858B98] uppercase font-bold">Display Name</span>
            <p className="text-sm font-bold text-[#F6F5F8] mt-1">{profile?.display_name || "User"}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#14151D] border border-[#393B4B]">
            <span className="text-[10px] text-[#858B98] uppercase font-bold">Email Address</span>
            <p className="text-sm font-bold text-[#F6F5F8] mt-1 truncate">{profile?.email || "—"}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#14151D] border border-[#393B4B]">
            <span className="text-[10px] text-[#858B98] uppercase font-bold">Level & XP</span>
            <p className="text-sm font-bold text-[#F2D15C] mt-1">Level {profile?.level || 1} • {profile?.xp || 0} XP</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#14151D] border border-[#393B4B]">
            <span className="text-[10px] text-[#858B98] uppercase font-bold">Streak Record</span>
            <p className="text-sm font-bold text-[#A8E6CF] mt-1">{profile?.current_streak || 0} days active</p>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Daily Reminders & Notifications */}
        <div className="glass-panel rounded-2xl p-6 border border-[#393B4B] space-y-5">
          <div className="flex items-center space-x-3 border-b border-[#393B4B]/60 pb-3">
            <Bell className="w-5 h-5 text-[#F2D15C]" />
            <div>
              <h2 className="text-base font-bold text-[#F6F5F8]">Daily Reminders & Notifications</h2>
              <p className="text-xs text-[#858B98]">
                Configure when and how Nivora checks in on your daily destination steps.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Preferred Reminder Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#F6F5F8] flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-[#F2D15C]" />
                <span>Preferred Reminder Time</span>
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full bg-[#14151D] border border-[#393B4B] rounded-xl px-3.5 py-2.5 text-xs text-[#F6F5F8] focus:border-[#F2D15C] outline-none"
              />
              <p className="text-[10px] text-[#858B98]">Prompt: "Ready to plan today's steps toward your goal?"</p>
            </div>

            {/* Time Zone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#F6F5F8] flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-[#F2D15C]" />
                <span>Your Time Zone</span>
              </label>
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full bg-[#14151D] border border-[#393B4B] rounded-xl px-3.5 py-2.5 text-xs text-[#F6F5F8] focus:border-[#F2D15C] outline-none"
              >
                {TIME_ZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Email Reminders Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#14151D] border border-[#393B4B]">
            <div>
              <p className="text-xs font-bold text-[#F6F5F8]">Daily Email Reminders</p>
              <p className="text-[11px] text-[#858B98]">
                Receive a daily check-in summary linking directly to your Today page.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#393B4B] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F2D15C]"></div>
            </label>
          </div>

          {/* Browser Push Notifications */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#14151D] border border-[#393B4B]">
            <div>
              <p className="text-xs font-bold text-[#F6F5F8]">Browser Push Notifications</p>
              <p className="text-[11px] text-[#858B98]">
                Status: <span className="text-[#A8E6CF] font-semibold capitalize">{browserNotificationStatus}</span>
              </p>
            </div>
            {browserNotificationStatus !== "granted" ? (
              <button
                type="button"
                onClick={requestBrowserNotifications}
                className="px-3 py-1.5 rounded-lg bg-[#20232E] hover:bg-[#2a2d3b] text-xs font-bold text-[#F2D15C] border border-[#F2D15C]/40 transition-colors"
              >
                Enable Notifications
              </button>
            ) : (
              <span className="text-xs font-bold text-[#A8E6CF] flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Active</span>
              </span>
            )}
          </div>
        </div>

        {/* Section 2: Narrative & Episode Style */}
        <div className="glass-panel rounded-2xl p-6 border border-[#393B4B] space-y-5">
          <div className="flex items-center space-x-3 border-b border-[#393B4B]/60 pb-3">
            <Subtitles className="w-5 h-5 text-[#F2D15C]" />
            <div>
              <h2 className="text-base font-bold text-[#F6F5F8]">Narrative & Episode Tone</h2>
              <p className="text-xs text-[#858B98]">
                Adjust the voice and cinematic personality of your generated episodes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TONES.map((tone) => (
              <label
                key={tone.key}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  preferredTone === tone.key
                    ? "bg-[#20232E] border-[#F2D15C] text-[#F6F5F8]"
                    : "bg-[#14151D] border-[#393B4B] text-[#858B98] hover:border-white/20"
                }`}
              >
                <span className="text-xs font-bold">{tone.label}</span>
                <input
                  type="radio"
                  name="tone"
                  value={tone.key}
                  checked={preferredTone === tone.key}
                  onChange={(e) => setPreferredTone(e.target.value)}
                  className="accent-[#F2D15C]"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Section 3: Appearance & Theme */}
        <div className="glass-panel rounded-2xl p-6 border border-[#393B4B] space-y-5">
          <div className="flex items-center space-x-3 border-b border-[#393B4B]/60 pb-3">
            <Palette className="w-5 h-5 text-[#A8E6CF]" />
            <div>
              <h2 className="text-base font-bold text-[#F6F5F8]">Theme & Appearance</h2>
              <p className="text-xs text-[#858B98]">
                Switch between Nivora dark cinematic mode and light mode across all pages.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                theme === "dark"
                  ? "bg-[#20232E] border-[#A8E6CF] text-[#F6F5F8] shadow-md ring-1 ring-[#A8E6CF]"
                  : "bg-[#14151D] border-[#393B4B] text-[#858B98] hover:border-white/20"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#14151D] border border-[#393B4B] flex items-center justify-center text-[#F2D15C]">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#F6F5F8]">Cinematic Dark (Default)</h4>
                  <p className="text-[10px] text-[#858B98]">High-contrast dark mode optimized for late-night focus</p>
                </div>
              </div>
              {theme === "dark" && <CheckCircle2 className="w-4 h-4 text-[#A8E6CF] shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                theme === "light"
                  ? "bg-[#FFFFFF] border-[#A8E6CF] text-[#0F172A] shadow-md ring-1 ring-[#A8E6CF]"
                  : "bg-[#14151D] border-[#393B4B] text-[#858B98] hover:border-white/20"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1] flex items-center justify-center text-[#FFB347]">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#0F172A]">Clean Light Mode</h4>
                  <p className="text-[10px] text-[#64748B]">Crisp, bright daylight interface with balanced contrast</p>
                </div>
              </div>
              {theme === "light" && <CheckCircle2 className="w-4 h-4 text-[#A8E6CF] shrink-0" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#A8E6CF] hover:bg-[#7ED8B8] text-[#14151D] text-xs font-bold transition-all flex items-center space-x-2 shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Preferences"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
