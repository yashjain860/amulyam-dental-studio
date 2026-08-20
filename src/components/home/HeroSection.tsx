"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Calendar,
  Phone,
  Star,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { CLINIC_INFO, LEAD_DOCTOR } from "@/lib/constants";
import MotionReveal, { StaggerContainer, StaggerItem } from "../ui/MotionReveal";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-10 left-[-100px] w-96 h-96 bg-[#C9A227]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-[-100px] w-96 h-96 bg-[#DDB83C]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <MotionReveal direction="up" delay={0.1}>
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#A88214] dark:text-[#E5C76B] text-xs font-semibold uppercase tracking-wider animate-pulseGlow">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A227] animate-spin duration-3000" />
                <span>Premium Dental Excellence in Bhopal</span>
              </div>
            </MotionReveal>

            <MotionReveal direction="up" delay={0.2}>
              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1A1A1A] dark:text-[#F8F6F2] tracking-tight leading-[1.15]">
                Precision Care for{" "}
                <span className="gold-text-gradient">Beautiful, Confident</span> Smiles
              </h1>
            </MotionReveal>

            <MotionReveal direction="up" delay={0.3}>
              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#6B6B6B] dark:text-[#A8A29E] leading-relaxed max-w-2xl font-normal">
                Experience advanced, pain-free dental care designed for your entire family. From routine checkups to complete smile makeovers, Dr. Shreya Nidhi and our team ensure your smile remains radiant, healthy, and confident.
              </p>
            </MotionReveal>

            {/* Quick Action Badges */}
            <MotionReveal direction="up" delay={0.4}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-[#444] dark:text-[#CCC] bg-white/70 dark:bg-[#1C1A17]/70 p-2.5 rounded-xl border border-[#C9A227]/20 hover:border-[#C9A227] transition-all">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A227]" />
                  <span>100% Painless Tech</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#444] dark:text-[#CCC] bg-white/70 dark:bg-[#1C1A17]/70 p-2.5 rounded-xl border border-[#C9A227]/20 hover:border-[#C9A227] transition-all">
                  <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
                  <span>5-Tier Sterilization</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#444] dark:text-[#CCC] bg-white/70 dark:bg-[#1C1A17]/70 p-2.5 rounded-xl border border-[#C9A227]/20 col-span-2 sm:col-span-1 hover:border-[#C9A227] transition-all">
                  <Award className="w-4 h-4 text-[#C9A227]" />
                  <span>Digital 3D Smile Scan</span>
                </div>
              </div>
            </MotionReveal>

            {/* CTA Buttons */}
            <MotionReveal direction="up" delay={0.5}>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                <Link
                  href="/book"
                  className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#C9A227] to-[#DDB83C] hover:from-[#DDB83C] hover:to-[#C9A227] text-white font-bold text-sm sm:text-base px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Book Appointment Online</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={`tel:${CLINIC_INFO.rawPhone}`}
                  className="inline-flex items-center justify-center gap-2.5 bg-white dark:bg-[#1C1A17] hover:bg-[#FAF8F5] dark:hover:bg-[#26231E] border border-[#C9A227]/40 text-[#1A1A1A] dark:text-[#F8F6F2] font-semibold text-sm sm:text-base px-6 py-4 rounded-2xl transition-all duration-300"
                >
                  <Phone className="w-5 h-5 text-[#C9A227]" />
                  <span>Call Clinic: {CLINIC_INFO.phone}</span>
                </a>
              </div>
            </MotionReveal>

            {/* Social Proof Bar */}
            <MotionReveal direction="up" delay={0.6}>
              <div className="flex items-center gap-6 pt-4 border-t border-[#C9A227]/15">
                <div className="flex items-center gap-1 text-[#C9A227]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <div className="text-xs text-[#6B6B6B] dark:text-[#A8A29E]">
                  <strong className="text-[#1A1A1A] dark:text-[#F8F6F2]">5.0 Star Rating</strong> on Google Reviews ({CLINIC_INFO.stats.happyPatients} Happy Smiles)
                </div>
              </div>
            </MotionReveal>
          </div>

          {/* Right Column: Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <MotionReveal direction="left" delay={0.3}>
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#C9A227]/30 bg-[#1C1A17] group">
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    <Image
                      src="/images/s14.jpg"
                      alt="Amulyam Dental Studio Treatment"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-[#DDB83C]">{LEAD_DOCTOR.name}</h4>
                        <p className="text-xs text-gray-300">{LEAD_DOCTOR.role} • BDS, MDS</p>
                      </div>
                      <span className="text-xs bg-[#C9A227] text-black font-bold px-2.5 py-1 rounded-full">
                        5+ Yrs Exp
                      </span>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-6 -right-6 hidden sm:flex items-center gap-3 bg-white dark:bg-[#1C1A17] p-3.5 rounded-2xl shadow-xl border border-[#C9A227]/30 animate-float">
                  <div className="w-10 h-10 rounded-full bg-[#C9A227]/15 flex items-center justify-center text-[#C9A227]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1A1A1A] dark:text-[#F8F6F2]">
                      Laser Whitening
                    </div>
                    <div className="text-[10px] text-[#7A7265] dark:text-[#A8A29E]">
                      1-Sitting Results
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 bg-white dark:bg-[#1C1A17] p-3.5 rounded-2xl shadow-xl border border-[#C9A227]/30">
                  <div className="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center text-green-600 dark:text-green-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1A1A1A] dark:text-[#F8F6F2]">
                      Quick Scheduling
                    </div>
                    <div className="text-[10px] text-[#7A7265] dark:text-[#A8A29E]">
                      Zero Waiting Time
                    </div>
                  </div>
                </div>
              </div>
            </MotionReveal>
          </div>
        </div>

        {/* 4-Metric Stats Bar with Stagger Animation */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-16 pt-12 border-t border-[#C9A227]/20" staggerDelay={0.15}>
          <StaggerItem className="p-5 rounded-2xl bg-white dark:bg-[#181715] border border-[#C9A227]/20 text-center shadow-sm hover:shadow-md transition-all hover:scale-105">
            <div className="text-2xl sm:text-4xl font-extrabold text-[#C9A227] mb-1">
              {CLINIC_INFO.stats.happyPatients}
            </div>
            <div className="text-xs sm:text-sm font-medium text-[#6B6B6B] dark:text-[#A8A29E]">
              Happy Patients
            </div>
          </StaggerItem>

          <StaggerItem className="p-5 rounded-2xl bg-white dark:bg-[#181715] border border-[#C9A227]/20 text-center shadow-sm hover:shadow-md transition-all hover:scale-105">
            <div className="text-2xl sm:text-4xl font-extrabold text-[#C9A227] mb-1">
              {CLINIC_INFO.stats.teethWhitened}
            </div>
            <div className="text-xs sm:text-sm font-medium text-[#6B6B6B] dark:text-[#A8A29E]">
              Teeth Whitened
            </div>
          </StaggerItem>

          <StaggerItem className="p-5 rounded-2xl bg-white dark:bg-[#181715] border border-[#C9A227]/20 text-center shadow-sm hover:shadow-md transition-all hover:scale-105">
            <div className="text-2xl sm:text-4xl font-extrabold text-[#C9A227] mb-1">
              {CLINIC_INFO.stats.dentalImplants}
            </div>
            <div className="text-xs sm:text-sm font-medium text-[#6B6B6B] dark:text-[#A8A29E]">
              Dental Implants Done
            </div>
          </StaggerItem>

          <StaggerItem className="p-5 rounded-2xl bg-white dark:bg-[#181715] border border-[#C9A227]/20 text-center shadow-sm hover:shadow-md transition-all hover:scale-105">
            <div className="text-2xl sm:text-4xl font-extrabold text-[#C9A227] mb-1">
              {CLINIC_INFO.stats.yearsExperience}
            </div>
            <div className="text-xs sm:text-sm font-medium text-[#6B6B6B] dark:text-[#A8A29E]">
              Years Clinical Experience
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}
