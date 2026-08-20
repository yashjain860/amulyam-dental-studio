"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, ArrowRight, Check, Sparkles } from "lucide-react";
import MotionReveal from "../ui/MotionReveal";

export default function CostEstimator() {
  const [selectedItems, setSelectedItems] = useState<string[]>(["checkup", "scaling"]);

  const options = [
    { id: "checkup", serviceId: "checkup-xray", label: "Comprehensive Consultation & RVG X-Ray", cost: 500, time: "20 mins" },
    { id: "scaling", serviceId: "scaling-polishing", label: "Full Mouth Ultrasonic Scaling & Polishing", cost: 800, time: "30 mins" },
    { id: "whitening", serviceId: "teeth-whitening", label: "In-Office Laser Teeth Whitening", cost: 3500, time: "45 mins" },
    { id: "rct", serviceId: "rct", label: "Rotary Root Canal Treatment (Painless)", cost: 2500, time: "45 mins" },
    { id: "crown", serviceId: "crowns-bridges", label: "CAD/CAM High-Strength Ceramic/Zirconia Crown", cost: 3000, time: "2 visits" },
    { id: "implant", serviceId: "dental-implants", label: "Permanent Titanium Dental Implant", cost: 18000, time: "60 mins" },
    { id: "aligners", serviceId: "aligners", label: "Invisible Clear Aligners (3D Scan + Plan)", cost: 35000, time: "Custom" },
  ];

  const toggleItem = (id: string) => {
    if (selectedItems.includes(id)) {
      if (selectedItems.length > 1) {
        setSelectedItems(selectedItems.filter((i) => i !== id));
      }
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const totalCost = options
    .filter((o) => selectedItems.includes(o.id))
    .reduce((sum, o) => sum + o.cost, 0);

  // Map chosen options to actual clinic service IDs
  const mappedServiceIds = options
    .filter((o) => selectedItems.includes(o.id))
    .map((o) => o.serviceId)
    .join(",");

  return (
    <section className="py-16 md:py-24 bg-[#FAF8F5] dark:bg-[#151412] border-t border-[#C9A227]/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionReveal direction="up">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#A88214] dark:text-[#E5C76B] text-xs font-semibold uppercase tracking-wider mb-3">
              <Calculator className="w-3.5 h-3.5" />
              <span>Interactive Price Calculator</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-[#F8F6F2]">
              Estimate Your <span className="gold-text-gradient">Treatment Budget</span>
            </h2>
            <p className="text-sm sm:text-base text-[#6B6B6B] dark:text-[#A8A29E] mt-3">
              Select one or more procedures to get an approximate transparent cost estimate before your visit.
            </p>
          </div>
        </MotionReveal>

        <MotionReveal direction="up" delay={0.2}>
          <div className="bg-white dark:bg-[#181715] rounded-3xl border border-[#C9A227]/30 shadow-2xl p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Options Matrix */}
            <div className="lg:col-span-7 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#A39E93] block mb-2">
                Select Treatments (Multi-Select Enabled):
              </label>
              {options.map((opt) => {
                const isChecked = selectedItems.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleItem(opt.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isChecked
                        ? "border-[#C9A227] bg-[#C9A227]/10 dark:bg-[#C9A227]/15 shadow-sm"
                        : "border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5]/50 dark:bg-[#1C1A17] hover:border-[#C9A227]/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          isChecked
                            ? "bg-[#C9A227] text-white"
                            : "border border-[#AAA] dark:border-[#555]"
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-semibold text-[#1A1A1A] dark:text-[#F8F6F2] block">
                          {opt.label}
                        </span>
                        <span className="text-[11px] text-[#888]">⏱ Est. Time: {opt.time}</span>
                      </div>
                    </div>

                    <span className="font-bold text-xs sm:text-sm text-[#C9A227]">
                      ₹{opt.cost.toLocaleString("en-IN")}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculation Summary Card */}
            <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#C9A227]/30">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#C9A227] uppercase tracking-wider mb-3">
                  <Sparkles className="w-4 h-4" />
                  <span>Estimate Summary ({selectedItems.length} selected)</span>
                </div>

                <div className="space-y-2 mb-6 text-xs text-[#555] dark:text-[#AAA]">
                  {options
                    .filter((o) => selectedItems.includes(o.id))
                    .map((o) => (
                      <div key={o.id} className="flex justify-between">
                        <span className="truncate pr-2">{o.label}</span>
                        <span className="font-semibold text-[#1A1A1A] dark:text-white">
                          ₹{o.cost.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-[#E8E0D2] dark:border-[#332F28]">
                  <div className="text-xs text-[#888] mb-1">Estimated Total Starting At:</div>
                  <div className="text-3xl font-extrabold text-[#C9A227]">
                    ₹{totalCost.toLocaleString("en-IN")}*
                  </div>
                  <p className="text-[11px] text-[#888] mt-2 leading-relaxed">
                    *Exact cost may vary depending on individual clinical examination, diagnostic RVG x-rays, and material selection.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href={`/book?services=${encodeURIComponent(mappedServiceIds)}&source=cost-estimator&total=${totalCost}`}
                  className="w-full text-center bg-[#C9A227] hover:bg-[#DDB83C] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <span>Book This Selected Plan ({selectedItems.length} Items)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
