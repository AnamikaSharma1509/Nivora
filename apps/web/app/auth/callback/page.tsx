"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, setStoredToken } from "@/lib/api";
import { Sparkles, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const errorParam = searchParams.get("error");
    const errorDesc = searchParams.get("error_description");

    if (errorParam) {
      setError(errorDesc || `Google sign-in was cancelled or denied (${errorParam}).`);
      return;
    }

    if (!code) {
      setError("No authorization code was received from Google.");
      return;
    }

    const completeAuth = async () => {
      try {
        const res = await api.googleCallback({
          code: code,
          state: state || undefined,
        });
        setStoredToken(res.access_token);
        
        // Redirect new users or users who haven't completed onboarding to the goal-centric onboarding flow
        if (res.is_new_user || !res.has_completed_onboarding) {
          router.push("/onboarding");
        } else {
          router.push("/today");
        }
      } catch (err: any) {
        console.error("Auth callback failed", err);
        setError(err.message || "Failed to complete Google authentication.");
      }
    };

    completeAuth();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#14151D] text-[#F6F5F8] flex items-center justify-center p-4">
      <div className="glass-panel rounded-2xl p-8 max-w-md w-full text-center space-y-5 border border-[#393B4B]">
        {error ? (
          <>
            <div className="w-12 h-12 rounded-full bg-[#F2D15C]/15 border border-[#F2D15C]/30 flex items-center justify-center mx-auto text-[#F2D15C]">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-[#F6F5F8]">Authentication Incomplete</h2>
            <p className="text-xs text-[#858B98] leading-relaxed px-2">{error}</p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-[#F2D15C] text-[#171923] text-xs font-bold hover:bg-[#e6c44d] transition-all shadow-md"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </>
        ) : (
          <>
            <Sparkles className="w-8 h-8 text-[#F2D15C] animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-[#F6F5F8]">Authenticating with Google</h2>
            <p className="text-xs text-[#858B98]">Connecting your verified Google identity to your personal Nivora workspace...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#14151D] text-[#F6F5F8] flex items-center justify-center p-4">
        <div className="glass-panel rounded-2xl p-8 max-w-sm w-full text-center space-y-4 border border-[#393B4B]">
          <Sparkles className="w-8 h-8 text-[#F2D15C] animate-spin mx-auto" />
          <h2 className="text-lg font-bold text-[#F6F5F8]">Authenticating...</h2>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
