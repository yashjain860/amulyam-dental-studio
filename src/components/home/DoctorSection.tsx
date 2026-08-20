"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Award,
  CheckCircle2,
  Calendar,
  Sparkles,
  Play,
} from "lucide-react";
import { LEAD_DOCTOR } from "@/lib/constants";
import MotionReveal, { StaggerContainer, StaggerItem } from "../ui/MotionReveal";

export default function DoctorSection() {
  return (
    <section className="py-16 md:py-24 bg-[#F5F1EA]/60 dark:bg-[#151412] border-y border-[#C9A227]/20 relative overflow-hidden">
      <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-80 h-80 bg-[#C9A227]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Video Reels & Doctor Image */}
          <div className="lg:col-span-5">
            <MotionReveal direction="right" delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#C9A227]/30 aspect-[3/4] bg-[#1C1A17] hover:scale-[1.02] transition-transform">
                  <Image
                    src="/images/dr_shreya_.jpg"
                    alt={LEAD_DOCTOR.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white text-xs">
                    <div className="font-bold text-[#DDB83C]">{LEAD_DOCTOR.name}</div>
                    <div className="text-[10px] text-gray-300">Lead Dentist</div>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#C9A227]/30 aspect-[3/4] bg-black group hover:scale-[1.02] transition-transform">
                  <video
                    src="/images/v1.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-[#DDB83C] font-semibold flex items-center gap-1 border border-[#C9A227]/30">
                    <Play className="w-2.5 h-2.5 fill-current" /> Clinic Reel
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white text-[11px] font-medium">
                    Watch Chairside Experience
                  </div>
                </div>
              </div>
            </MotionReveal>
          </div>

          {/* Right: Biography & Credentials */}
          <div className="lg:col-span-7 space-y-6">
            <MotionReveal direction="left" delay={0.2}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#A88214] dark:text-[#E5C76B] text-xs font-semibold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                <span>Meet Your Dental Expert</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-[#F8F6F2] leading-tight mt-2">
                Gentle Hands, Caring Heart, &amp;{" "}
                <span className="gold-text-gradient">Clinical Precision</span>
              </h2>

              <p className="text-sm sm:text-base text-[#6B6B6B] dark:text-[#A8A29E] leading-relaxed mt-3">
                {LEAD_DOCTOR.bio}
              </p>
            </MotionReveal>

            {/* Credential Metrics Grid */}
            <StaggerContainer className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2" staggerDelay={0.1}>
              <StaggerItem className="p-3.5 rounded-xl bg-white dark:bg-[#1C1A17] border border-[#C9A227]/20">
                <span className="text-[11px] uppercase tracking-wider text-[#8A8175] block font-medium">
                  Experience
                </span>
                <span className="text-base sm:text-lg font-bold text-[#C9A227]">
                  {LEAD_DOCTOR.experience}
                </span>
              </StaggerItem>

              <StaggerItem className="p-3.5 rounded-xl bg-white dark:bg-[#1C1A17] border border-[#C9A227]/20">
                <span className="text-[11px] uppercase tracking-wider text-[#8A8175] block font-medium">
                  Qualification
                </span>
                <span className="text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-white">
                  BDS, MDS
                </span>
              </StaggerItem>

              <StaggerItem className="p-3.5 rounded-xl bg-white dark:bg-[#1C1A17] border border-[#C9A227]/20 col-span-2">
                <span className="text-[11px] uppercase tracking-wider text-[#8A8175] block font-medium">
                  Specialization
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#1A1A1A] dark:text-white">
                  Cosmetic, Implants &amp; Rotary RCT
                </span>
              </StaggerItem>
            </StaggerContainer>

            {/* Achievements Bullet List */}
            <MotionReveal direction="up" delay={0.4}>
              <div className="space-y-2.5 pt-2">
                {LEAD_DOCTOR.achievements.map((ach, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#4A453C] dark:text-[#D1C7B7]">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A227] flex-shrink-0 mt-0.5" />
                    <span>{ach}</span>
                  </div>
                ))}
              </div>

              {/* Action Trigger */}
              <div className="pt-6 flex items-center gap-4">
                <Link
                  href="/book"
                  className="inline-flex items-center gap-2 bg-[#C9A227] hover:bg-[#DDB83C] text-white font-semibold text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Consult with Dr. Shreya</span>
                </Link>

                <Link
                  href="/about"
                  className="text-xs sm:text-sm font-semibold text-[#1A1A1A] dark:text-white hover:text-[#C9A227] underline underline-offset-4"
                >
                  Clinic Philosophy →
                </Link>
              </div>
            </MotionReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
