"use client";

import React, { useState } from "react";
import { QueueToken, QueueStatus, Booking } from "@/lib/types";
import { CLINIC_SERVICES, TIME_SLOTS } from "@/lib/constants";
import {
  Users,
  PlusCircle,
  Bell,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Armchair,
  Trash2,
  Check,
  RotateCcw,
} from "lucide-react";

interface LiveWaitingRoomQueueProps {
  queue: QueueToken[];
  onRefresh: () => void;
  onOpenBilling: (token: QueueToken) => void;
  onOpenDentalChart: (token: QueueToken) => void;
}

export default function LiveWaitingRoomQueue({
  queue,
  onRefresh,
  onOpenBilling,
  onOpenDentalChart,
}: LiveWaitingRoomQueueProps) {
  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInService, setWalkInService] = useState(CLINIC_SERVICES[0].title);
  const [walkInChair, setWalkInChair] = useState<"Chair 1 (Main Operatory)" | "Chair 2 (Hygiene & Scaling)">(
    "Chair 1 (Main Operatory)"
  );
  const [walkInNotes, setWalkInNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [callingToken, setCallingToken] = useState<string | null>(null);

  // Play audio chime when calling patient
  const handleCallPatient = async (token: QueueToken) => {
    setCallingToken(token.id);
    try {
      // Audio synth chime
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(
          `Token number ${token.tokenNumber.replace("#", "")}, ${token.patientName}, please proceed to ${token.chairAssigned || "Operatory Chair 1"}`
        );
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }

      await fetch("/api/admin/queue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: token.id,
          status: "IN_CHAIR",
          calledAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }),
      });

      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setCallingToken(null), 3000);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: QueueStatus) => {
    try {
      await fetch("/api/admin/queue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: newStatus,
          completedAt: newStatus === "COMPLETED" ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
        }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteToken = async (id: string) => {
    if (!confirm("Are you sure you want to remove this patient from the queue?")) return;
    try {
      await fetch(`/api/admin/queue?id=${id}`, { method: "DELETE" });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim()) return;
    setLoading(true);

    try {
      await fetch("/api/admin/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: walkInName.trim(),
          patientPhone: walkInPhone.trim(),
          serviceName: walkInService,
          chairAssigned: walkInChair,
          notes: walkInNotes.trim(),
          status: "WAITING",
        }),
      });

      setWalkInName("");
      setWalkInPhone("");
      setWalkInNotes("");
      setIsWalkInModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const waitingList = queue.filter((q) => q.status === "WAITING");
  const inChairList = queue.filter((q) => q.status === "IN_CHAIR");
  const billingList = queue.filter((q) => q.status === "BILLING");
  const completedList = queue.filter((q) => q.status === "COMPLETED");

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 p-4 sm:p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">Live Waiting Room &amp; Token Queue</h3>
              <p className="text-xs text-slate-400">Manage real-time patient flow, chair assignments, and audio token announcements</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            title="Refresh Queue"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsWalkInModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Express Walk-In Patient</span>
          </button>
        </div>
      </div>

      {/* Queue Columns Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* 1. Waiting Lounge Column */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">1. Waiting Lounge</h4>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">
              {waitingList.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] no-scrollbar">
            {waitingList.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">No patients waiting</div>
            ) : (
              waitingList.map((token) => (
                <div
                  key={token.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition space-y-2.5 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {token.tokenNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {token.checkInTime}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-bold text-white text-sm">{token.patientName}</h5>
                    <p className="text-[11px] text-amber-200/80 font-medium">{token.serviceName}</p>
                    {token.patientPhone && (
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        {token.patientPhone}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-850 flex items-center gap-1.5">
                    <button
                      onClick={() => handleCallPatient(token)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition ${
                        callingToken === token.id
                          ? "bg-emerald-400 animate-bounce"
                          : "bg-amber-500 hover:bg-amber-400"
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{callingToken === token.id ? "Announcing..." : "Call to Chair"}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteToken(token.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. In Operatory Chair Column */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">2. In Operatory Chair</h4>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
              {inChairList.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] no-scrollbar">
            {inChairList.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">All chairs available</div>
            ) : (
              inChairList.map((token) => (
                <div
                  key={token.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2.5 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {token.tokenNumber}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      {token.chairAssigned?.split(" ")[0]} {token.chairAssigned?.split(" ")[1]}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-bold text-white text-sm">{token.patientName}</h5>
                    <p className="text-[11px] text-slate-300">{token.serviceName}</p>
                    {token.notes && (
                      <p className="text-[10px] text-slate-400 italic mt-0.5">"{token.notes}"</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => onOpenDentalChart(token)}
                      className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-[11px] flex items-center justify-center gap-1 transition"
                    >
                      <span>Tooth Chart</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(token.id, "BILLING")}
                      className="py-1 px-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1 transition"
                    >
                      <span>To Billing →</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Billing & POS Column */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">3. Billing &amp; POS</h4>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-mono font-bold">
              {billingList.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] no-scrollbar">
            {billingList.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">No pending invoices</div>
            ) : (
              billingList.map((token) => (
                <div
                  key={token.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-sky-500/40 space-y-2.5 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      {token.tokenNumber}
                    </span>
                    <span className="text-[10px] text-sky-300 font-bold">Checkout Ready</span>
                  </div>

                  <div>
                    <h5 className="font-bold text-white text-sm">{token.patientName}</h5>
                    <p className="text-[11px] text-slate-300">{token.serviceName}</p>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => onOpenBilling(token)}
                    className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Generate Invoice / POS</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 4. Completed / Discharged Column */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">4. Discharged</h4>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-mono font-bold">
              {completedList.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] no-scrollbar">
            {completedList.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">No discharged patients today</div>
            ) : (
              completedList.slice(0, 10).map((token) => (
                <div
                  key={token.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 opacity-75 hover:opacity-100 transition space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-semibold text-slate-400">{token.tokenNumber}</span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {token.completedAt || "Completed"}
                    </span>
                  </div>
                  <h5 className="font-semibold text-slate-200 text-xs">{token.patientName}</h5>
                  <p className="text-[10px] text-slate-400">{token.serviceName}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Express Walk-In Patient Modal */}
      {isWalkInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white">Express Walk-In Patient Entry</h4>
              <button onClick={() => setIsWalkInModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateWalkIn} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Phone Number (10 Digits)</label>
                <input
                  type="tel"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  placeholder="+91 98260 00000"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Dental Treatment / Service</label>
                <select
                  value={walkInService}
                  onChange={(e) => setWalkInService(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:outline-none"
                >
                  <option value="Emergency Toothache / Pain Relief">Emergency Toothache / Pain Relief</option>
                  {CLINIC_SERVICES.map((s) => (
                    <option key={s.id} value={s.title}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Assign Operatory Chair</label>
                <select
                  value={walkInChair}
                  onChange={(e) => setWalkInChair(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs sm:text-sm text-white focus:outline-none"
                >
                  <option value="Chair 1 (Main Operatory)">Chair 1 (Main Operatory - Endodontics)</option>
                  <option value="Chair 2 (Hygiene &amp; Scaling)">Chair 2 (Hygiene &amp; Diagnostic)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Chief Complaint / Triage Notes</label>
                <input
                  type="text"
                  value={walkInNotes}
                  onChange={(e) => setWalkInNotes(e.target.value)}
                  placeholder="e.g. Broken filling, severe sensitivity"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsWalkInModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                >
                  {loading ? "Adding..." : "Issue Token &amp; Check In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
