"use client";
export const dynamic = 'force-dynamic';

import { ArrowLeft, Sparkles, Clock } from "lucide-react";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import HeaderSimple from "@/components/layout/HeaderSimple";
import Footer from "@/components/layout/Footer";
import WaitlistModal from "@/components/features/public/WaitlistModal";
import { useSupabase } from "@/components/providers/SupabaseProvider";

function NoAccessPageInner() {
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const params = useSearchParams();
  const state = params.get("state") || "unknown"; // pending | unknown
  const emailParam = params.get("email") || "";
  const { user } = useSupabase();

  const content = useMemo(() => {
    if (state === "pending") {
      return {
        badgeBg: "bg-amber-500/20",
        badgeFg: "text-amber-400",
        TitleIcon: Clock,
        title: "You’re on the waitlist",
        body:
          "Keep an eye out for an email — your exclusive invite to the First Quills is on the way.",
        showWaitlistCta: false,
      } as const;
    }
    return {
      badgeBg: "bg-green-500/20",
      badgeFg: "text-green-400",
      TitleIcon: Sparkles,
      title: "Early Access Required",
      body:
        "Thanks for your interest in Quillaborn! We're currently in early access. Join the waitlist below to request access.",
      showWaitlistCta: true,
    } as const;
  }, [state]);

  const { badgeBg, badgeFg, TitleIcon, title, body, showWaitlistCta } = content;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <HeaderSimple />

      <main className="flex items-center justify-center min-h-[80vh] px-6">
        <div className="max-w-md w-full text-center">
          <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
            <div className={`w-16 h-16 ${badgeBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <TitleIcon className={`w-8 h-8 ${badgeFg}`} />
            </div>

            <h1 className={`text-2xl font-bold mb-4 ${badgeFg}`}>
              {title}
            </h1>

            <p className="text-gray-300 mb-6 leading-relaxed">
              {body}
            </p>

            {state === "pending" && (user?.email || emailParam) && (
              <p className="text-sm text-gray-400 mb-6">
                Pending for <span className="font-semibold text-gray-200">{user?.email ?? emailParam}</span>
              </p>
            )}

            {showWaitlistCta && (
              <button
                onClick={() => setShowWaitlistModal(true)}
                className="bg-green-500 hover:bg-green-600 text-gray-900 font-bold px-6 py-3 rounded-full transition"
              >
                Join the Waitlist
              </button>
            )}

            <div className="mt-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <WaitlistModal show={showWaitlistModal} onClose={() => setShowWaitlistModal(false)} />
    </div>
  );
}

export default function NoAccessPage() {
  return (
    <Suspense fallback={null}>
      <NoAccessPageInner />
    </Suspense>
  );
}

