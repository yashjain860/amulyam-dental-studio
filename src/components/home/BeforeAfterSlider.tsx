"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { BEFORE_AFTER_CASES } from "@/lib/constants";
import MotionReveal from "../ui/MotionReveal";

export default function BeforeAfterSlider() {
  const [activeCase, setActiveCase] = useState(0);
  const current = BEFORE_AFTER_CASES[activeCase] || BEFORE_AFTER_CASES[0];

  return (
    <section className="py-16 md:py-24 bg-[#FAF8F5] dark:bg-[#121110] border-y border-[#C9A227]/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionReveal direction="up">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#A88214] dark:text-[#E5C76B] text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Proven Smile Transformations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-[#F8F6F2]">
              Real Results, <span className="gold-text-gradient">Real Confidence</span>
            </h2>
            <p className="text-sm sm:text-base text-[#6B6B6B] dark:text-[#A8A29E] mt-3">
              See how Dr. Shreya Nidhi restores natural dental aesthetics, alignment, and long-lasting chewing function.
            </p>
          </div>
        </MotionReveal>

        {/* Case Selector Tabs */}
        <MotionReveal direction="up" delay={0.1}>
          <div className="flex justify-center gap-3 mb-8">
            {BEFORE_AFTER_CASES.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveCase(idx)}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeCase === idx
                    ? "bg-[#C9A227] text-white shadow-lg scale-105"
                    : "bg-white dark:bg-[#1C1A17] text-[#666] dark:text-[#AAA] border border-[#C9A227]/25 hover:border-[#C9A227]"
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
        </MotionReveal>

        {/* Transformation Showcase Card with Motion */}
        <MotionReveal direction="up" delay={0.2}>
          <div className="bg-white dark:bg-[#181715] rounded-3xl border border-[#C9A227]/30 shadow-2xl p-6 sm:p-10 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-6 relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-[#C9A227]/30 bg-black group">
                <Image
                  src={current.image}
                  alt={current.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-[#DDB83C] border border-[#C9A227]/30">
                  ✨ Verified Clinical Case
                </div>
              </div>
            </div>

            <div className="md:col-span-6 space-y-4">
              <span className="text-xs uppercase tracking-wider font-bold text-[#C9A227] bg-[#C9A227]/10 px-3 py-1 rounded-full">
                {current.treatment}
              </span>

              <h3 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] dark:text-[#F8F6F2]">
                {current.title}
              </h3>

              <div className="space-y-2 text-xs sm:text-sm">
                <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E0D2] dark:border-[#332F28]">
                  <strong className="text-red-600 dark:text-red-400 block text-xs mb-0.5">
                    Initial Condition:
                  </strong>
                  <span className="text-[#555] dark:text-[#CCC]">{current.beforeText}</span>
                </div>

                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40">
                  <strong className="text-green-700 dark:text-green-400 block text-xs mb-0.5">
                    Outcome After Treatment:
                  </strong>
                  <span className="text-[#333] dark:text-[#DDD]">{current.afterText}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#888] pt-2">
                <span>⏱ Total Time: <strong>{current.duration}</strong></span>
                <span>👨‍⚕️ Provider: <strong>Dr. Shreya Nidhi</strong></span>
              </div>

              <div className="pt-2">
                <Link
                  href="/book"
                  className="inline-flex items-center gap-2 bg-[#C9A227] hover:bg-[#DDB83C] text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl shadow transition-all"
                >
                  <span>Get Your Smile Assessment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
