"use client";

import React, { useState } from "react";
import { SmileTransformation } from "@/lib/types";
import { Sparkles, Sliders, CheckCircle2, Star, Clock, User, ChevronLeft, ChevronRight } from "lucide-react";

interface BeforeAfterSmileStudioProps {
  cases: SmileTransformation[];
  isChairside?: boolean;
}

export default function BeforeAfterSmileStudio({ cases, isChairside = false }: BeforeAfterSmileStudioProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedCase, setSelectedCase] = useState<SmileTransformation>(cases[0] || null);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState(false);

  const categories = ["All", "Cosmetic Veneers", "Teeth Whitening", "Clear Aligners", "Dental Implants"];

  const filteredCases = activeCategory === "All"
    ? cases
    : cases.filter((c) => c.category === activeCategory);

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  return (
    <div className="space-y-6 text-[#1C1A17] dark:text-white">
      {/* Category Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                activeCategory === cat
                  ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
                  : "bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isChairside && (
          <span className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Chairside Patient Consultation Mode
          </span>
        )}
      </div>

      {/* Main Interactive Split Comparison Showcase */}
      {selectedCase && (
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-[10px] font-extrabold uppercase">
                  {selectedCase.category}
                </span>
                <span className="text-xs text-[#7A7265] dark:text-slate-400">Patient: {selectedCase.patientInitials} ({selectedCase.patientAge} yrs)</span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#1C1A17] dark:text-white mt-1">{selectedCase.title}</h3>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#7A7265] dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Duration: <strong className="text-[#1C1A17] dark:text-white">{selectedCase.treatmentDuration}</strong></span>
            </div>
          </div>

          {/* Interactive Drag Split Screen */}
          <div
            className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden cursor-ew-resize select-none border border-amber-500/30 shadow-inner"
            onMouseMove={(e) => isDragging && handleSliderMove(e)}
            onTouchMove={(e) => handleSliderMove(e)}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onClick={handleSliderMove}
          >
            {/* After Image (Background) */}
            <img
              src={selectedCase.afterImage}
              alt="After Makeover"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-emerald-900/90 border border-emerald-500/50 backdrop-blur-md px-3 py-1 rounded-full text-emerald-200 text-xs font-bold shadow-lg">
              ✨ AFTER
            </div>

            {/* Before Image (Clipped Overlay) */}
            <div
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={selectedCase.beforeImage}
                alt="Before Makeover"
                className="absolute inset-0 w-full h-full object-cover max-w-none"
                style={{ width: "100%", height: "100%" }}
              />
              <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-700 backdrop-blur-md px-3 py-1 rounded-full text-slate-200 text-xs font-bold shadow-lg">
                BEFORE
              </div>
            </div>

            {/* Drag Divider Line */}
            <div
              className="absolute inset-y-0 w-1 bg-amber-400 shadow-2xl flex items-center justify-center pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 shadow-xl flex items-center justify-center font-bold text-xs border-2 border-white">
                ⬄
              </div>
            </div>
          </div>

          <div className="text-center text-xs text-[#7A7265] dark:text-slate-400 font-medium">
            👆 Drag or tap the slider left / right to compare clinical before &amp; after results
          </div>

          {/* Doctor Clinical Notes */}
          <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl text-xs text-slate-700 dark:text-slate-300">
            <span className="font-bold text-amber-700 dark:text-amber-300 block mb-1">👨‍⚕️ Clinical Protocol by Dr. Shreya Nidhi:</span>
            <p className="leading-relaxed">{selectedCase.doctorNotes}</p>
          </div>
        </div>
      )}

      {/* Cases Thumbnail Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {filteredCases.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setSelectedCase(c);
              setSliderPosition(50);
            }}
            className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
              selectedCase?.id === c.id
                ? "bg-slate-100 dark:bg-slate-800 border-amber-500/60 shadow-md scale-102"
                : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
              <img src={c.afterImage} alt={c.title} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">{c.category}</span>
              <h4 className="text-xs font-bold text-[#1C1A17] dark:text-white truncate">{c.title}</h4>
              <p className="text-[11px] text-[#7A7265] dark:text-slate-400 truncate">{c.treatmentDuration}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
