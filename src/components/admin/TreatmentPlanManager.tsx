"use client";

import React, { useState } from "react";
import { TreatmentPlan, TreatmentPlanStep, Booking } from "@/lib/types";
import {
  Layers,
  PlusCircle,
  CheckCircle2,
  Clock,
  Check,
  ChevronRight,
  Sparkles,
  Calendar,
} from "lucide-react";

interface TreatmentPlanManagerProps {
  plans: TreatmentPlan[];
  booking?: Booking | null;
  onRefresh: () => void;
}

export default function TreatmentPlanManager({
  plans,
  booking,
  onRefresh,
}: TreatmentPlanManagerProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || "");
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState("");
  const [patientName, setPatientName] = useState(booking?.patientName || "Aarav Sharma");
  const [patientEmail, setPatientEmail] = useState(booking?.patientEmail || "aarav.sharma@example.com");
  const [loading, setLoading] = useState(false);

  const activePlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const handleToggleStep = async (stepId: string, currentStatus: string) => {
    if (!activePlan) return;
    const nextStatus = currentStatus === "COMPLETED" ? "PLANNED" : "COMPLETED";

    const updatedSteps = activePlan.steps.map((s) => {
      if (s.id === stepId) {
        return {
          ...s,
          status: nextStatus as any,
          completedAt: nextStatus === "COMPLETED" ? new Date().toISOString() : undefined,
        };
      }
      return s;
    });

    try {
      await fetch("/api/admin/clinical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_TREATMENT_PLAN",
          data: {
            id: activePlan.id,
            updates: { steps: updatedSteps },
          },
        }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanTitle) return;
    setLoading(true);

    try {
      const res = await fetch("/api/admin/clinical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_TREATMENT_PLAN",
          data: {
            patientName,
            patientEmail,
            title: newPlanTitle,
            steps: [
              {
                id: `step-${Date.now()}-1`,
                title: "Diagnostic RVG & Treatment Scoping",
                description: "Clinical evaluation & pre-op radiograph",
                estimatedCost: 500,
                status: "COMPLETED",
              },
              {
                id: `step-${Date.now()}-2`,
                title: "Core Clinical Procedure",
                description: "Primary endodontic or cosmetic treatment",
                estimatedCost: 4500,
                status: "IN_PROGRESS",
              },
              {
                id: `step-${Date.now()}-3`,
                title: "Final Aesthetic Crown / Restoration & Recall",
                description: "High-strength restoration & post-care check",
                estimatedCost: 6500,
                status: "PLANNED",
              },
            ],
            totalEstimatedCost: 11500,
            totalPaid: 5000,
            status: "ACTIVE",
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedPlanId(data.treatmentPlan.id);
        setIsNewPlanModalOpen(false);
        setNewPlanTitle("");
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-amber-500/30 p-4 sm:p-5 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Layers className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white leading-tight">Multi-Stage Treatment Plans</h3>
            <p className="text-xs text-slate-400">Track multi-visit procedures, progress milestones, and patient financial estimates</p>
          </div>
        </div>

        <button
          onClick={() => setIsNewPlanModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Create Treatment Plan</span>
        </button>
      </div>

      {/* Main View */}
      {activePlan ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plan Selector Sidebar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Patient Treatment Plans</h4>
            <div className="space-y-2">
              {plans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    p.id === activePlan.id
                      ? "bg-amber-500/20 border-amber-400 text-white shadow-lg"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <h5 className="font-bold text-xs leading-tight">{p.title}</h5>
                  <p className="text-[11px] text-amber-300/80 mt-1">{p.patientName}</p>
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-mono">
                    <span>Est: ₹{p.totalEstimatedCost.toLocaleString("en-IN")}</span>
                    <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">{p.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Plan Roadmap */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-white">{activePlan.title}</h4>
                <p className="text-xs text-amber-200/70">Patient: <span className="font-bold text-white">{activePlan.patientName}</span> ({activePlan.patientEmail})</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Estimated Cost:</span>
                <span className="text-base font-bold font-mono text-amber-400">₹{activePlan.totalEstimatedCost.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Stepper Roadmap */}
            <div className="space-y-3">
              {activePlan.steps.map((step, idx) => {
                const isCompleted = step.status === "COMPLETED";
                const isInProgress = step.status === "IN_PROGRESS";

                return (
                  <div
                    key={step.id}
                    className={`p-4 rounded-xl border transition flex items-start justify-between gap-3 ${
                      isCompleted
                        ? "bg-emerald-950/20 border-emerald-500/30"
                        : isInProgress
                        ? "bg-amber-950/20 border-amber-500/40"
                        : "bg-slate-950 border-slate-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleStep(step.id, step.status)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 transition ${
                          isCompleted
                            ? "bg-emerald-500 text-slate-950"
                            : "border-2 border-slate-600 hover:border-amber-400 text-transparent"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">
                            Visit {idx + 1}: {step.title}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                              isCompleted
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : isInProgress
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {step.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{step.description}</p>
                      </div>
                    </div>

                    <span className="font-mono text-xs font-bold text-slate-300 shrink-0">
                      ₹{step.estimatedCost.toLocaleString("en-IN")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 text-sm">No treatment plans created yet.</div>
      )}

      {/* New Plan Modal */}
      {isNewPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white">Create Multi-Stage Treatment Plan</h4>
              <button onClick={() => setIsNewPlanModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Treatment Plan Title *</label>
                <input
                  type="text"
                  required
                  value={newPlanTitle}
                  onChange={(e) => setNewPlanTitle(e.target.value)}
                  placeholder="e.g. 3-Visit Molar RCT &amp; Zirconia Crown"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Patient Email</label>
                <input
                  type="email"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewPlanModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                >
                  {loading ? "Creating..." : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
