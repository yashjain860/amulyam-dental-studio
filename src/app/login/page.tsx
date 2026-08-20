"use client";

import Link from "next/link";
import { User, ShieldCheck, ArrowRight, Sparkles, Calendar, HeartPulse } from "lucide-react";
import MotionReveal from "@/components/ui/MotionReveal";

export default function LoginPage() {
  return (
    <div className="py-12 md:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <MotionReveal direction="up" className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#DDB83C] text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Amulyam Portal Access</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-[#1A1A1A] dark:text-white">
          Sign In to <span className="gold-text-gradient">Your Portal</span>
        </h1>
        <p className="text-sm sm:text-base text-[#8A8175] max-w-xl mx-auto">
          Please select whether you are accessing your personal Patient Care Account or the Clinical Doctor &amp; Admin ERP.
        </p>
      </MotionReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Card 1: Patient Portal */}
        <MotionReveal direction="right" delay={0.1}>
          <div className="bg-white dark:bg-[#181715] border border-[#C9A227]/30 rounded-3xl p-8 shadow-xl flex flex-col justify-between h-full hover:border-[#C9A227] transition-all group">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#C9A227]/15 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227]">
                <User className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-white">Patient Portal</h2>
              <p className="text-xs sm:text-sm text-[#7A7265] dark:text-[#A8A29E] leading-relaxed">
                Track your upcoming appointments, download verified digital boarding passes, view prescription history, and manage your profile.
              </p>
              <ul className="space-y-2 text-xs text-[#555] dark:text-[#CCC] pt-2">
                <li className="flex items-center gap-2">✓ Instant Booking Tracking &amp; QR Pass</li>
                <li className="flex items-center gap-2">✓ Medical History &amp; Profile Editing</li>
                <li className="flex items-center gap-2">✓ Reschedule or Cancel Slots Anytime</li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                href="/patient-portal"
                className="w-full py-3.5 px-6 rounded-2xl bg-[#C9A227] hover:bg-[#DDB83C] text-black font-bold text-sm shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>Access Patient Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </MotionReveal>

        {/* Card 2: Doctor & Admin ERP */}
        <MotionReveal direction="left" delay={0.2}>
          <div className="bg-gradient-to-b from-[#1C1A17] to-[#12110F] border border-amber-500/40 rounded-3xl p-8 shadow-2xl flex flex-col justify-between h-full hover:border-amber-400 transition-all group text-white">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-white">Doctor &amp; Admin ERP</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase">Staff Only</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Full-scale clinical operating system for Dr. Shreya Nidhi &amp; clinic receptionist with real-time waiting room queue, odontogram, and POS.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-2">⚡ 5-Stage Waiting Room Kanban &amp; Audio Chimes</li>
                <li className="flex items-center gap-2">🦷 FDI 32-Tooth Chart &amp; RVG X-Ray Caliper</li>
                <li className="flex items-center gap-2">💳 Express POS Billing &amp; Dynamic UPI QR Codes</li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                href="/admin/login"
                className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl transition flex items-center justify-center gap-2"
              >
                <span>Doctor &amp; Admin Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </MotionReveal>
      </div>
    </div>
  );
}
