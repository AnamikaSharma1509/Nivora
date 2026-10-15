"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, ArrowRight, AlertCircle, Info } from "lucide-react";
import { api, setStoredToken } from "@/lib/api";
import NivoraLogo from "@/components/NivoraLogo";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configNotice, setConfigNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setConfigNotice(null);
    setLoading(true);
    try {
      const res = await api.register({
        display_name: displayName,
        email,
        password,
      });
      setStoredToken(res.access_token);
      // New user always starts the goal-centric onboarding flow
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      setConfigNotice(null);
      const authUrlData = await api.getGoogleAuthUrl();
      if (authUrlData.configured && authUrlData.url && authUrlData.url.startsWith("https://accounts.google.com")) {
        window.location.href = authUrlData.url;
      } else {
        setConfigNotice(
          "Google OAuth is not configured on this server. To enable Google Sign-In, set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env configuration."
        );
      }
    } catch (err: any) {
      setError(err.message || "Unable to initiate Google sign-up.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#14151D] text-[#F6F5F8] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-[#F2D15C]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 relative z-10 space-y-6 border border-[#393B4B]">
        {/* 1. Nivora Logo & Concise Welcome Heading */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center">
            <NivoraLogo size="lg" />
          </Link>
          <h1 className="text-2xl font-extrabold text-[#F6F5F8] pt-1">Create Your Account</h1>
          <p className="text-xs text-[#858B98]">Define your ambition and turn your daily progress into episodes.</p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3.5 rounded-xl bg-[#20232E] border border-[#F2D15C]/40 text-xs text-[#F2D15C] font-medium flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Configuration Notice */}
        {configNotice && (
          <div className="p-3.5 rounded-xl bg-[#20232E] border border-[#60A5FA]/40 text-xs text-[#E8EAF0] font-normal flex items-start space-x-2">
            <Info className="w-4 h-4 text-[#60A5FA] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-[#60A5FA] block">Google OAuth Setup Required</span>
              <span>{configNotice}</span>
            </div>
          </div>
        )}

        {/* 2. Display Name, Email, and Password Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#858B98]">Your Name / Identity</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#858B98]" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., Alex Mercer"
                className="w-full pl-10 pr-4 py-2.5 bg-[#14151D] border border-[#393B4B] rounded-xl text-sm text-[#F6F5F8] placeholder-[#858B98]/50 focus:outline-none focus:border-[#F2D15C] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#858B98]">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#858B98]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#14151D] border border-[#393B4B] rounded-xl text-sm text-[#F6F5F8] placeholder-[#858B98]/50 focus:outline-none focus:border-[#A8E6CF] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#858B98]">Password (Min 8 characters)</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#858B98]" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#14151D] border border-[#393B4B] rounded-xl text-sm text-[#F6F5F8] placeholder-[#858B98]/50 focus:outline-none focus:border-[#A8E6CF] transition-colors"
              />
            </div>
          </div>

          {/* 3. Primary Email Registration Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#A8E6CF] hover:bg-[#7ED8B8] text-[#14151D] font-bold text-sm shadow-md transition-all hover:scale-[1.01] flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? "Creating Account..." : "Create Account & Define Goal"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 4. Properly Aligned Separator with Centered "OR" */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-[#393B4B] w-full" />
          <span className="bg-[#20232E] px-3 text-[11px] font-bold text-[#858B98] uppercase tracking-wider shrink-0">
            OR
          </span>
          <div className="border-t border-[#393B4B] w-full" />
        </div>

        {/* 5. Google Sign-Up Button with Official Identity */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleLoading}
          className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl bg-[#20232E] hover:bg-[#252735] border border-[#393B4B] hover:border-[#858B98] text-sm font-semibold text-[#F6F5F8] transition-all hover:scale-[1.01] shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{googleLoading ? "Connecting..." : "Continue with Google"}</span>
        </button>

        {/* 6. Correctly Positioned Link to Switch to Login */}
        <p className="text-center text-xs text-[#858B98]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#F2D15C] font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
