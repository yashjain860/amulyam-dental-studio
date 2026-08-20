"use client";

import React, { useState } from "react";
import {
  ToothRecord,
  ToothCondition,
  PatientDentalChart,
  ToothSurfaceState,
} from "@/lib/types";
import {
  Sparkles,
  Save,
  Check,
  AlertCircle,
  RotateCcw,
  Activity,
  CheckCircle2,
  Info,
} from "lucide-react";

interface DentalChartOdontogramProps {
  initialChart?: PatientDentalChart | null;
  patientName: string;
  patientEmail: string;
  onSave?: (chart: PatientDentalChart) => void;
}

// FDI Notation Quadrants
// Upper Right (18 -> 11) | Upper Left (21 -> 28)
// Lower Right (48 -> 41) | Lower Left (31 -> 38)
const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

const CONDITION_COLORS: Record<ToothCondition, { bg: string; text: string; border: string; label: string }> = {
  SOUND: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", label: "Healthy / Sound" },
  CARIES: { bg: "bg-rose-500/20", text: "text-rose-400", border: "border-rose-500/50", label: "Caries / Cavity" },
  RESTORED: { bg: "bg-sky-500/20", text: "text-sky-400", border: "border-sky-500/50", label: "Restored / Filled" },
  RCT_NEEDED: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/50", label: "RCT Needed" },
  RCT_DONE: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/50", label: "RCT Completed" },
  CROWN: { bg: "bg-yellow-500/20", text: "text-yellow-300", border: "border-yellow-500/50", label: "Crown Placed" },
  IMPLANT: { bg: "bg-teal-500/20", text: "text-teal-300", border: "border-teal-500/50", label: "Implant" },
  MISSING: { bg: "bg-slate-800", text: "text-slate-500", border: "border-slate-700", label: "Missing / Extracted" },
  FRACTURED: { bg: "bg-red-600/20", text: "text-red-400", border: "border-red-500/50", label: "Fractured" },
  BLEEDING: { bg: "bg-pink-500/20", text: "text-pink-400", border: "border-pink-500/50", label: "Bleeding Gums" },
};

export default function DentalChartOdontogram({
  initialChart,
  patientName,
  patientEmail,
  onSave,
}: DentalChartOdontogramProps) {
  const [teeth, setTeeth] = useState<Record<number, ToothRecord>>(
    initialChart?.teeth || {}
  );
  const [selectedTooth, setSelectedTooth] = useState<number | null>(36);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentRecord: ToothRecord = selectedTooth && teeth[selectedTooth]
    ? teeth[selectedTooth]
    : {
        toothNumber: selectedTooth || 36,
        condition: "SOUND",
        surfaces: {},
        notes: "",
        updatedAt: new Date().toISOString(),
      };

  const handleSelectCondition = (cond: ToothCondition) => {
    if (!selectedTooth) return;
    setTeeth((prev) => ({
      ...prev,
      [selectedTooth]: {
        ...currentRecord,
        toothNumber: selectedTooth,
        condition: cond,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const handleToggleSurface = (surface: keyof ToothSurfaceState) => {
    if (!selectedTooth) return;
    const currentSurfaces = currentRecord.surfaces || {};
    setTeeth((prev) => ({
      ...prev,
      [selectedTooth]: {
        ...currentRecord,
        surfaces: {
          ...currentSurfaces,
          [surface]: !currentSurfaces[surface],
        },
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const handleNotesChange = (notes: string) => {
    if (!selectedTooth) return;
    setTeeth((prev) => ({
      ...prev,
      [selectedTooth]: {
        ...currentRecord,
        notes,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const handleSaveChart = async () => {
    setSaving(true);
    const updatedChart: PatientDentalChart = {
      patientId: `pt-${patientEmail}`,
      patientEmail,
      patientName,
      teeth,
      lastUpdated: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/admin/clinical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SAVE_CHART", data: updatedChart }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        if (onSave) onSave(updatedChart);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error("Save chart error:", e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 sm:p-6 text-white space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Activity className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-bold text-white">Interactive 32-Tooth Odontogram</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            FDI Standard Clinical Odontogram for <span className="text-amber-300 font-semibold">{patientName}</span> ({patientEmail})
          </p>
        </div>

        <button
          onClick={handleSaveChart}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
        >
          {saving ? (
            <span className="animate-spin">✦</span>
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Chart Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Dental Chart</span>
            </>
          )}
        </button>
      </div>

      {/* Tooth Arch Map */}
      <div className="space-y-4 bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
        <div className="text-center">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Maxillary Arch (Upper Jaw)
          </span>
          <div className="flex items-center justify-center gap-1 sm:gap-2 mt-2 overflow-x-auto pb-2 no-scrollbar">
            {UPPER_TEETH.map((tNum) => {
              const rec = teeth[tNum];
              const cond = rec?.condition || "SOUND";
              const style = CONDITION_COLORS[cond];
              const isSelected = selectedTooth === tNum;

              return (
                <button
                  key={tNum}
                  onClick={() => setSelectedTooth(tNum)}
                  className={`group relative flex flex-col items-center justify-center w-8 sm:w-10 h-14 sm:h-16 rounded-xl border transition-all duration-200 shrink-0 ${
                    isSelected
                      ? "ring-2 ring-amber-400 border-amber-400 scale-105 shadow-lg bg-amber-500/20"
                      : `${style.bg} ${style.border} hover:scale-105`
                  }`}
                >
                  <span className="text-[11px] font-mono font-bold text-white group-hover:text-amber-300">
                    {tNum}
                  </span>
                  <div className="w-4 h-5 mt-1 rounded-sm border border-slate-600/50 flex flex-col items-center justify-center bg-slate-800/80">
                    <span className="text-[8px] font-bold text-slate-300">
                      {cond === "SOUND" ? "•" : cond[0]}
                    </span>
                  </div>
                  {rec?.surfaces?.occlusal && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full h-px bg-slate-800 my-2 flex items-center justify-center">
          <span className="bg-slate-950 px-3 text-[10px] text-slate-500 font-mono">MIDLINE &amp; OCCLUSION PLANE</span>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2 overflow-x-auto pb-2 no-scrollbar">
            {LOWER_TEETH.map((tNum) => {
              const rec = teeth[tNum];
              const cond = rec?.condition || "SOUND";
              const style = CONDITION_COLORS[cond];
              const isSelected = selectedTooth === tNum;

              return (
                <button
                  key={tNum}
                  onClick={() => setSelectedTooth(tNum)}
                  className={`group relative flex flex-col items-center justify-center w-8 sm:w-10 h-14 sm:h-16 rounded-xl border transition-all duration-200 shrink-0 ${
                    isSelected
                      ? "ring-2 ring-amber-400 border-amber-400 scale-105 shadow-lg bg-amber-500/20"
                      : `${style.bg} ${style.border} hover:scale-105`
                  }`}
                >
                  <div className="w-4 h-5 mb-1 rounded-sm border border-slate-600/50 flex flex-col items-center justify-center bg-slate-800/80">
                    <span className="text-[8px] font-bold text-slate-300">
                      {cond === "SOUND" ? "•" : cond[0]}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-white group-hover:text-amber-300">
                    {tNum}
                  </span>
                  {rec?.surfaces?.occlusal && (
                    <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  )}
                </button>
              );
            })}
          </div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Mandibular Arch (Lower Jaw)
          </span>
        </div>
      </div>

      {/* Selected Tooth Clinical Editor */}
      {selectedTooth && (
        <div className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-sm border border-amber-500/30">
                Tooth #{selectedTooth}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {selectedTooth >= 11 && selectedTooth <= 18 ? "Upper Right Quadrant" :
                 selectedTooth >= 21 && selectedTooth <= 28 ? "Upper Left Quadrant" :
                 selectedTooth >= 31 && selectedTooth <= 38 ? "Lower Left Quadrant" : "Lower Right Quadrant"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Current Status:</span>
              <span className={`px-2 py-0.5 rounded font-bold text-[11px] border ${CONDITION_COLORS[currentRecord.condition].bg} ${CONDITION_COLORS[currentRecord.condition].text} ${CONDITION_COLORS[currentRecord.condition].border}`}>
                {CONDITION_COLORS[currentRecord.condition].label}
              </span>
            </div>
          </div>

          {/* Condition Selector Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Clinical Diagnosis / Status:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(Object.keys(CONDITION_COLORS) as ToothCondition[]).map((cond) => {
                const isCurrent = currentRecord.condition === cond;
                const info = CONDITION_COLORS[cond];
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => handleSelectCondition(cond)}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-medium border flex items-center justify-between transition ${
                      isCurrent
                        ? `${info.bg} ${info.text} ${info.border} ring-1 ring-amber-400 font-bold`
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <span>{info.label}</span>
                    {isCurrent && <Check className="w-3.5 h-3.5 ml-1 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Surface Checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Affected Surfaces (Mesial, Distal, Occlusal, Buccal, Lingual):
            </label>
            <div className="flex flex-wrap gap-2">
              {(["occlusal", "mesial", "distal", "buccal", "lingual"] as const).map((surf) => {
                const isChecked = !!currentRecord.surfaces?.[surf];
                return (
                  <button
                    key={surf}
                    type="button"
                    onClick={() => handleToggleSurface(surf)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border transition ${
                      isChecked
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {surf} {isChecked && "✓"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clinical Doctor Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Clinical Findings &amp; Procedure Notes for Tooth #{selectedTooth}:
            </label>
            <textarea
              value={currentRecord.notes || ""}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="e.g. Deep disto-occlusal caries invading pulp horn. Rotary RCT recommended with CAD/CAM Zirconia crown."
              rows={2}
              className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none transition"
            />
          </div>
        </div>
      )}
    </div>
  );
}
