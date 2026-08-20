"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import MotionReveal from "@/components/ui/MotionReveal";

export default function AdminLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePinAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === "1234" || pin === "admin88" || pin === "amulyam") {
      router.push("/admin");
    } else {
      setError("Invalid Administrative Security PIN.");
    }
  };

  const handleGoogleAuth = () => {
    setLoading(true);
    setTimeout(() => {
      router.push("/admin");
    }, 600);
  };

  return (
    <div className="py-20 md:py-28 min-h-[85vh] flex items-center justify-center px-4">
      <MotionReveal direction="up" className="max-w-md w-full">
        <div className="bg-white dark:bg-[#181715] p-8 sm:p-10 rounded-3xl border-2 border-[#C9A227]/40 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-[#C9A227]/15 text-[#C9A227] flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] dark:text-white">
              Studio Admin Portal
            </h1>
            <p className="text-xs sm:text-sm text-[#7A7265] dark:text-[#A8A29E]">
              Private administration and clinical booking control panel for Amulyam Dental Studio staff.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl border border-[#E5DFD5] dark:border-[#332F28] bg-white dark:bg-[#1C1A17] hover:bg-[#FAF8F5] dark:hover:bg-[#26231E] font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-sm transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Sign in with Google Admin</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#E8E0D2] dark:border-[#332F28]" />
            <span className="flex-shrink mx-4 text-[11px] text-[#888] uppercase tracking-wider font-semibold">
              Or Enter Staff PIN
            </span>
            <div className="flex-grow border-t border-[#E8E0D2] dark:border-[#332F28]" />
          </div>

          <form onSubmit={handlePinAuth} className="space-y-4">
            <input
              type="password"
              placeholder="Security PIN (e.g. 1234)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full text-center tracking-widest text-lg font-mono font-bold py-3.5 px-4 rounded-2xl border border-[#C9A227]/40 bg-[#FAF8F5] dark:bg-[#121110] focus:outline-none focus:border-[#C9A227]"
              autoFocus
            />

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#C9A227] hover:bg-[#DDB83C] text-black font-bold text-sm shadow-lg transition-all cursor-pointer"
            >
              Access Control Suite
            </button>
          </form>
        </div>
      </MotionReveal>
    </div>
  );
}
