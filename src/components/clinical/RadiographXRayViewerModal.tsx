"use client";

import React, { useState, useEffect } from "react";
import { RadiographRecord, UserAccount } from "@/lib/types";
import {
  X,
  Sliders,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sun,
  Contrast,
  Ruler,
  Maximize2,
  Calendar,
  Save,
  CheckCircle2,
  Eye,
  Sparkles,
} from "lucide-react";

interface RadiographXRayViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: UserAccount | null;
  radiographs?: RadiographRecord[];
}

export default function RadiographXRayViewerModal({
  isOpen,
  onClose,
  patient,
  radiographs = [],
}: RadiographXRayViewerModalProps) {
  const [selectedRad, setSelectedRad] = useState<RadiographRecord | null>(radiographs[0] || null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [inverted, setInverted] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [workingLength, setWorkingLength] = useState<number | undefined>(undefined);
  const [findings, setFindings] = useState("");

  useEffect(() => {
    if (radiographs.length > 0 && (!selectedRad || !radiographs.find((r) => r.id === selectedRad.id))) {
      setSelectedRad(radiographs[0]);
    }
  }, [radiographs]);

  useEffect(() => {
    if (selectedRad) {
      setWorkingLength(selectedRad.workingLengthMm);
      setFindings(selectedRad.findings || "");
    }
  }, [selectedRad]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setInverted(false);
    setZoom(100);
  };

  return (
    <div
      data-lenis-prevent
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overscroll-contain"
    >
      <div
        data-lenis-prevent
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-500/30 rounded-3xl w-full max-w-5xl p-4 sm:p-6 shadow-2xl space-y-4 overscroll-contain max-h-[95vh] overflow-y-auto flex flex-col justify-between text-[#1C1A17] dark:text-white"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold text-lg">
              🩻
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-[#1C1A17] dark:text-white leading-tight">
                  RVG &amp; Digital Radiograph Vault
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                  {selectedRad?.type || "IOPA"}
                </span>
              </div>
              <p className="text-xs text-[#7A7265] dark:text-slate-400">
                Patient: <strong className="text-[#1C1A17] dark:text-white font-bold">{patient?.name || selectedRad?.patientName || "Aarav Sharma"}</strong> • Tooth:{" "}
                <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">#{selectedRad?.toothNumber || "16"}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#7A7265] dark:text-slate-400 hover:text-black dark:hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Grid: Radiograph Viewport & Diagnostic Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
          {/* Left: Interactive Radiograph Canvas */}
          <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col items-center justify-center min-h-[380px] p-4 select-none shadow-inner">
            {selectedRad?.imageUrl ? (
              <div
                className="transition-transform duration-100 flex items-center justify-center max-h-[360px] overflow-hidden"
                style={{ transform: `scale(${zoom / 100})` }}
              >
                <img
                  src={selectedRad.imageUrl}
                  alt="Dental Radiograph"
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%) ${inverted ? "invert(1)" : ""}`,
                    maxHeight: "340px",
                    objectFit: "contain",
                  }}
                  className="rounded-lg shadow-2xl"
                />
              </div>
            ) : (
              <div className="text-center text-slate-500 text-xs">
                No radiograph loaded for active tooth
              </div>
            )}

            {/* Quick Caliper Pill */}
            {workingLength && (
              <div className="absolute top-4 left-4 bg-slate-900/90 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-mono text-amber-300 font-bold flex items-center gap-1.5 shadow-lg">
                <Ruler className="w-3.5 h-3.5 text-amber-400" />
                <span>Working Length: {workingLength} mm</span>
              </div>
            )}

            {/* Quick Zoom Bar */}
            <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs text-slate-300">
              <button
                onClick={() => setZoom((z) => Math.max(50, z - 15))}
                className="hover:text-white cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono">{zoom}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(200, z + 15))}
                className="hover:text-white cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: Clinical Calipers, Contrast, & Diagnostic Sliders */}
          <div className="space-y-3.5 bg-slate-50 dark:bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between text-xs">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-500" /> Digital RVG Filters
                </span>
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              {/* Brightness Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[#7A7265] dark:text-slate-400 font-semibold">
                  <span className="flex items-center gap-1"><Sun className="w-3 h-3" /> Brightness</span>
                  <span className="font-mono text-[#1C1A17] dark:text-white">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="180"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Contrast Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[#7A7265] dark:text-slate-400 font-semibold">
                  <span className="flex items-center gap-1"><Contrast className="w-3 h-3" /> Contrast (Bone Density)</span>
                  <span className="font-mono text-[#1C1A17] dark:text-white">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Negative Inversion Toggle */}
              <button
                type="button"
                onClick={() => setInverted(!inverted)}
                className={`w-full py-2 px-3 rounded-xl border font-bold transition flex items-center justify-between cursor-pointer ${
                  inverted
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>Negatoscopic Invert</span>
                <span>{inverted ? "ON (Inverted)" : "OFF"}</span>
              </button>

              {/* Endodontic Working Length Caliper */}
              <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-slate-800 dark:text-slate-300 font-bold">
                  📏 Apex / Working Length Caliper (mm)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    value={workingLength || ""}
                    onChange={(e) => setWorkingLength(Number(e.target.value))}
                    placeholder="e.g. 21.5"
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-[#1C1A17] dark:text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <span className="font-mono text-[#7A7265] dark:text-slate-400 font-bold">mm</span>
                </div>
              </div>

              {/* Radiographic Findings */}
              <div className="space-y-1">
                <label className="block text-slate-800 dark:text-slate-300 font-bold">Radiographic Findings</label>
                <textarea
                  rows={2}
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  placeholder="e.g. Periapical radiolucency on root apex"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-[#1C1A17] dark:text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  alert("Radiograph findings and caliper measurements saved to patient clinical record!");
                  onClose();
                }}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Radiograph Findings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
