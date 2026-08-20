"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Stethoscope,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Zap,
} from "lucide-react";
import { CLINIC_SERVICES, LEAD_DOCTOR } from "@/lib/constants";

export default function RecommendationModel() {
  const [step, setStep] = useState(1);
  const [selectedConcern, setSelectedConcern] = useState<string>("pain");
  const [painLevel, setPainLevel] = useState<string>("severe");
  const [priority, setPriority] = useState<string>("relief");

  // Recommendation Engine Logic
  const calculateRecommendation = () => {
    if (selectedConcern === "pain" || painLevel === "severe") {
      return {
        serviceId: "rct",
        title: "Painless Rotary Root Canal Treatment (RCT) + Crown",
        urgency: "HIGH (Same-Day Relief Recommended)",
        category: "Endodontics",
        description:
          "Based on your severe pain/sensitivity symptoms, an infected dental nerve or deep decay is likely. Our painless rotary endodontic therapy will immediately eliminate pain and save your natural tooth.",
        duration: "45 mins (Single sitting option)",
        recovery: "Immediate relief within 24 hours",
        matchedDoctor: LEAD_DOCTOR.name,
        priceEstimate: "Starting from ₹2,500",
      };
    } else if (selectedConcern === "missing") {
      return {
        serviceId: "dental-implants",
        title: "Permanent Titanium Dental Implant",
        urgency: "MODERATE",
        category: "Implantology",
        description:
          "For missing tooth replacement, a dental implant is the clinical gold standard, restoring 100% natural chewing power and preventing adjacent teeth from shifting.",
        duration: "60 mins procedure",
        recovery: "Normal routine next day",
        matchedDoctor: LEAD_DOCTOR.name,
        priceEstimate: "Starting from ₹18,000",
      };
    } else if (selectedConcern === "stains") {
      return {
        serviceId: "teeth-whitening",
        title: "In-Office Laser Teeth Whitening + Polishing",
        urgency: "ELECTIVE (Instant Smile Upgrade)",
        category: "Cosmetic",
        description:
          "Professional single-sitting laser bleaching that removes tough tea, coffee, and tobacco stains to brighten teeth by up to 6 shades without harming enamel.",
        duration: "45 mins",
        recovery: "Zero downtime",
        matchedDoctor: LEAD_DOCTOR.name,
        priceEstimate: "Starting from ₹3,500",
      };
    } else if (selectedConcern === "crooked") {
      return {
        serviceId: "aligners",
        title: "3D Custom Clear Aligners",
        urgency: "ELECTIVE",
        category: "Orthodontics",
        description:
          "Virtually invisible, removable aligner trays designed with 3D digital smile simulation to straighten teeth smoothly without metal brackets or wires.",
        duration: "Customized 3D plan",
        recovery: "Smooth adaptation",
        matchedDoctor: LEAD_DOCTOR.name,
        priceEstimate: "0% EMI Available",
      };
    } else {
      return {
        serviceId: "scaling-polishing",
        title: "Ultrasonic Scaling & Comprehensive Checkup",
        urgency: "ROUTINE",
        category: "Preventive",
        description:
          "Gentle removal of tartar, calculus, and plaque buildup to ensure healthy gums, fresh breath, and long-term oral hygiene.",
        duration: "30 mins",
        recovery: "Immediate freshness",
        matchedDoctor: LEAD_DOCTOR.name,
        priceEstimate: "Starting from ₹800",
      };
    }
  };

  const rec = calculateRecommendation();

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-[#FAF8F5] via-[#F3EFE8]/80 to-[#FAF8F5] dark:from-[#0F0E0D] dark:via-[#181715] dark:to-[#0F0E0D] border-y border-[#C9A227]/25 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C9A227]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#A88214] dark:text-[#E5C76B] text-xs font-semibold uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>AI Treatment Recommender</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-[#F8F6F2]">
            Find Your Ideal <span className="gold-text-gradient">Treatment Plan</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6B6B] dark:text-[#A8A29E] mt-2 max-w-xl mx-auto">
            Not sure which procedure you need? Select your symptoms below and our clinical recommendation algorithm will suggest the best treatment.
          </p>
        </div>

        {/* Wizard Card */}
        <div className="bg-white dark:bg-[#1C1A17] rounded-3xl border-2 border-[#C9A227]/30 shadow-2xl p-6 sm:p-10">
          {step < 4 ? (
            <div className="space-y-6">
              {/* Question 1: Dental Concern */}
              {step === 1 && (
                <div>
                  <span className="text-xs font-bold text-[#C9A227] uppercase tracking-wider block mb-1">
                    Step 1 of 3
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] dark:text-white mb-4">
                    What is your primary dental concern or symptom?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: "pain", label: "Toothache / Hot & Cold Sensitivity" },
                      { id: "missing", label: "Missing / Broken Tooth" },
                      { id: "stains", label: "Yellow / Stained Teeth" },
                      { id: "crooked", label: "Crooked / Gapped Teeth" },
                      { id: "gums", label: "Bleeding Gums / Bad Breath" },
                      { id: "routine", label: "Routine Dental Checkup & Cleaning" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedConcern(item.id)}
                        className={`p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all ${
                          selectedConcern === item.id
                            ? "border-[#C9A227] bg-[#C9A227]/15 text-[#1A1A1A] dark:text-white shadow-md scale-[1.01]"
                            : "border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#121110] text-[#555] dark:text-[#AAA] hover:border-[#C9A227]/50"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question 2: Pain Level */}
              {step === 2 && (
                <div>
                  <span className="text-xs font-bold text-[#C9A227] uppercase tracking-wider block mb-1">
                    Step 2 of 3
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] dark:text-white mb-4">
                    How severe is your current pain or discomfort?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: "none", label: "No Pain (Cosmetic / Routine)" },
                      { id: "mild", label: "Mild / Occasional Sensitivity" },
                      { id: "severe", label: "Severe / Throbbing Pain" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPainLevel(item.id)}
                        className={`p-4 rounded-2xl border text-center text-xs sm:text-sm font-semibold transition-all ${
                          painLevel === item.id
                            ? "border-[#C9A227] bg-[#C9A227]/15 text-[#1A1A1A] dark:text-white shadow-md"
                            : "border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#121110] text-[#555] dark:text-[#AAA] hover:border-[#C9A227]/50"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question 3: Priority */}
              {step === 3 && (
                <div>
                  <span className="text-xs font-bold text-[#C9A227] uppercase tracking-wider block mb-1">
                    Step 3 of 3
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] dark:text-white mb-4">
                    What is your most important treatment goal?
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: "relief", label: "Immediate Pain Relief" },
                      { id: "beauty", label: "Smile Beauty & Aesthetics" },
                      { id: "permanent", label: "Permanent Lifetime Strength" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPriority(item.id)}
                        className={`p-4 rounded-2xl border text-center text-xs sm:text-sm font-semibold transition-all ${
                          priority === item.id
                            ? "border-[#C9A227] bg-[#C9A227]/15 text-[#1A1A1A] dark:text-white shadow-md"
                            : "border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#121110] text-[#555] dark:text-[#AAA] hover:border-[#C9A227]/50"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step Navigation Controls */}
              <div className="flex justify-between items-center pt-4 border-t border-[#E8E0D2] dark:border-[#332F28]">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="text-xs font-semibold text-[#888] hover:text-[#C9A227]"
                  >
                    ← Previous Question
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#DDB83C] text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow"
                >
                  <span>{step === 3 ? "Generate Recommendation" : "Next Question"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* STEP 4: RECOMMENDATION RESULT */
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/15 text-green-700 dark:text-green-400 text-xs font-bold uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Personalized Recommendation Ready</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-[#888] hover:text-[#C9A227] flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Re-calculate
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#C9A227]/30 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <span className="text-xs font-bold text-[#C9A227] uppercase tracking-wider">
                      Recommended Procedure:
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[#1A1A1A] dark:text-white mt-0.5">
                      {rec.title}
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/40">
                    {rec.urgency}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#555] dark:text-[#CCC] leading-relaxed">
                  {rec.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-[#E8E0D2] dark:border-[#26231E]">
                  <div>
                    <span className="text-[#888] block">Attending Doctor:</span>
                    <span className="font-bold text-[#1A1A1A] dark:text-white">{rec.matchedDoctor}</span>
                  </div>
                  <div>
                    <span className="text-[#888] block">Procedure Time:</span>
                    <span className="font-bold text-[#1A1A1A] dark:text-white">{rec.duration}</span>
                  </div>
                  <div>
                    <span className="text-[#888] block">Pricing Guidance:</span>
                    <span className="font-bold text-[#C9A227]">{rec.priceEstimate}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href={`/book?service=${rec.serviceId}`}
                  className="w-full sm:w-auto flex-1 text-center bg-[#C9A227] hover:bg-[#DDB83C] text-black font-bold py-3.5 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Book This Recommended Treatment Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={`https://wa.me/919203604211?text=${encodeURIComponent(
                    `Hello Dr. Shreya, I used the online dental recommender and received a plan for: ${rec.title}. Could I ask a few questions before booking?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto text-center border border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10 font-bold py-3.5 px-6 rounded-xl text-sm transition-all"
                >
                  Ask Doctor on WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
