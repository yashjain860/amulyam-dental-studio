"use client";

import React, { useState, useEffect } from "react";
import { QueueToken, QueueStatus, Booking } from "@/lib/types";
import { CLINIC_SERVICES } from "@/lib/constants";
import {
  Users,
  PlusCircle,
  Clock,
  CheckCircle2,
  Phone,
  MessageSquare,
  Armchair,
  Trash2,
  Check,
  RotateCcw,
  Volume2,
  FileText,
  Receipt,
  Stethoscope,
  ChevronRight,
  UserCheck,
  Calendar,
  RotateCw,
} from "lucide-react";

interface LiveWaitingRoomQueueProps {
  queue: QueueToken[];
  todayBookings?: Booking[];
  onRefresh: () => void;
  onOpenBilling: (token: QueueToken) => void;
  onOpenDentalChart: (token: QueueToken) => void;
}

export default function LiveWaitingRoomQueue({
  queue,
  todayBookings = [],
  onRefresh,
  onOpenBilling,
  onOpenDentalChart,
}: LiveWaitingRoomQueueProps) {
  const [localQueue, setLocalQueue] = useState<QueueToken[]>(queue);
  const [filterTodayOnly, setFilterTodayOnly] = useState(true);
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

  useEffect(() => {
    setLocalQueue(queue);
  }, [queue]);

  useEffect(() => {
    if (isWalkInModalOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isWalkInModalOpen]);

  const todayStr = new Date().toISOString().split("T")[0];

  // 1-Click Check-In from "Not Yet Arrived"
  const handleCheckInBooking = async (booking: Booking) => {
    setLoading(true);
    const tempToken: QueueToken = {
      id: `q-temp-${Date.now()}`,
      tokenNumber: `#T-${String(localQueue.length + 1).padStart(2, "0")}`,
      bookingId: booking.id,
      patientName: booking.patientName,
      patientPhone: booking.patientPhone,
      serviceName: booking.serviceName,
      status: "WAITING",
      chairAssigned: "Chair 1 (Main Operatory)",
      checkInTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      notes: booking.notes || `Scheduled appointment for ${booking.timeSlot}`,
    };

    // Optimistic UI update
    setLocalQueue((prev) => [...prev, tempToken]);

    try {
      const res = await fetch("/api/admin/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          patientName: booking.patientName,
          patientPhone: booking.patientPhone,
          serviceName: booking.serviceName,
          chairAssigned: "Chair 1 (Main Operatory)",
          notes: booking.notes || `Scheduled appointment for ${booking.timeSlot}`,
          status: "WAITING",
        }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        setLocalQueue((prev) => prev.map((q) => (q.id === tempToken.id ? data.token : q)));
      }
      onRefresh();
    } catch (e) {
      console.error("Check-in error:", e);
      setLocalQueue((prev) => prev.filter((q) => q.id !== tempToken.id));
    } finally {
      setLoading(false);
    }
  };

  // Play audio chime when calling patient to chair
  const handleCallPatient = async (token: QueueToken) => {
    setCallingToken(token.id);
    handleUpdateStatus(token.id, "IN_CHAIR");

    try {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(
          `Token number ${token.tokenNumber.replace("#", "")}, ${token.patientName}, please proceed to ${token.chairAssigned || "Operatory Chair 1"}`
        );
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setCallingToken(null), 3000);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: QueueStatus) => {
    const previousQueue = [...localQueue];
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Optimistic UI state update
    setLocalQueue((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              status: newStatus,
              calledAt: newStatus === "IN_CHAIR" && !q.calledAt ? nowTime : q.calledAt,
              completedAt: newStatus === "COMPLETED" ? nowTime : q.completedAt,
            }
          : q
      )
    );

    try {
      const res = await fetch("/api/admin/queue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: newStatus,
          calledAt: newStatus === "IN_CHAIR" ? nowTime : undefined,
          completedAt: newStatus === "COMPLETED" ? nowTime : undefined,
        }),
      });
      if (!res.ok) throw new Error("Status update failed");
      onRefresh();
    } catch (e) {
      console.error(e);
      setLocalQueue(previousQueue);
    }
  };

  const handleDeleteToken = async (id: string) => {
    if (!confirm("Are you sure you want to remove this patient from the live queue?")) return;
    const previousQueue = [...localQueue];
    setLocalQueue((prev) => prev.filter((q) => q.id !== id));

    try {
      const res = await fetch(`/api/admin/queue?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      onRefresh();
    } catch (e) {
      console.error(e);
      setLocalQueue(previousQueue);
    }
  };

  const handleCreateWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim()) return;
    setLoading(true);

    const tempToken: QueueToken = {
      id: `q-walkin-${Date.now()}`,
      tokenNumber: `#T-${String(localQueue.length + 1).padStart(2, "0")}`,
      patientName: walkInName.trim(),
      patientPhone: walkInPhone.trim(),
      serviceName: walkInService,
      chairAssigned: walkInChair,
      notes: walkInNotes.trim(),
      status: "WAITING",
      checkInTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setLocalQueue((prev) => [...prev, tempToken]);

    try {
      const res = await fetch("/api/admin/queue", {
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

      const data = await res.json();
      if (data.success && data.token) {
        setLocalQueue((prev) => prev.map((q) => (q.id === tempToken.id ? data.token : q)));
      }

      setWalkInName("");
      setWalkInPhone("");
      setWalkInNotes("");
      setIsWalkInModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      setLocalQueue((prev) => prev.filter((q) => q.id !== tempToken.id));
    } finally {
      setLoading(false);
    }
  };

  // Filter out bookings that are actively in the live queue
  const activeTokens = localQueue.filter((q) => q.status !== "COMPLETED");
  const checkedInBookingIds = new Set(activeTokens.map((q) => q.bookingId).filter(Boolean));
  const checkedInPhones = new Set(
    activeTokens.map((q) => (q.patientPhone || "").replace(/\D/g, "")).filter(Boolean)
  );

  const notArrivedBookings = todayBookings.filter((b) => {
    if (filterTodayOnly && b.appointmentDate && b.appointmentDate !== todayStr) {
      return false;
    }
    const cleanPhone = (b.patientPhone || "").replace(/\D/g, "");
    const isAlreadyCheckedIn =
      checkedInBookingIds.has(b.id) ||
      (cleanPhone && cleanPhone.length >= 10 && checkedInPhones.has(cleanPhone)) ||
      b.status === "COMPLETED" ||
      b.status === "CANCELLED";
    return !isAlreadyCheckedIn;
  });

  const waitingList = localQueue.filter((q) => q.status === "WAITING");
  const inChairList = localQueue.filter((q) => q.status === "IN_CHAIR");
  const billingList = localQueue.filter((q) => q.status === "BILLING");
  const completedList = localQueue.filter((q) => q.status === "COMPLETED");

  return (
    <div className="space-y-4">
      {/* Top Banner with Express Walk-In Action */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#1C1A17] dark:text-white leading-tight">
                Live Waiting Room &amp; Token Queue Kanban
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20 text-[10px] font-bold">
                5-Stage Flow
              </span>
            </div>
            <p className="text-xs text-[#7A7265] dark:text-slate-400 mt-0.5">
              Real-time patient flow: Not Arrived ➔ Waiting ➔ Chair ➔ POS Billing ➔ Discharged
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
            title="Refresh Live Queue"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsWalkInModalOpen(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Express Walk-In Patient</span>
          </button>
        </div>
      </div>

      {/* 5-COLUMN KANBAN BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 items-start">
        {/* ================= COLUMN 0: NOT YET ARRIVED ================= */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-3 flex flex-col min-h-[500px] shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500" />
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                0. Not Yet Arrived
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterTodayOnly(!filterTodayOnly)}
                className={`text-[9px] px-1.5 py-0.5 rounded font-bold transition ${
                  filterTodayOnly
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    : "bg-amber-500 text-slate-950"
                }`}
                title={filterTodayOnly ? "Showing today's schedule. Click to show all" : "Showing all uncompleted bookings"}
              >
                {filterTodayOnly ? "Today" : "All"}
              </button>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold">
                {notArrivedBookings.length}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {notArrivedBookings.map((b) => (
              <div
                key={b.id}
                className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 hover:border-amber-500/40 rounded-xl p-3 space-y-2 shadow-sm transition"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-mono font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-500" /> {b.timeSlot}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{b.appointmentDate || b.refNumber}</span>
                </div>

                <div>
                  <h4 className="font-bold text-[#1C1A17] dark:text-white text-xs leading-snug">{b.patientName}</h4>
                  <p className="text-[11px] text-amber-600 dark:text-amber-300/80 font-medium truncate">{b.serviceName}</p>
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-1">
                  <span>📞 {b.patientPhone}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCheckInBooking(b)}
                  disabled={loading}
                  className="w-full py-1.5 px-2 bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 mt-1 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Check In &amp; Issue Token →</span>
                </button>
              </div>
            ))}

            {notArrivedBookings.length === 0 && (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center gap-1">
                <Check className="w-6 h-6 text-slate-400 dark:text-slate-600 mb-1" />
                <span>All scheduled patients checked in</span>
              </div>
            )}
          </div>
        </div>

        {/* ================= COLUMN 1: WAITING LOUNGE ================= */}
        <div className="bg-white dark:bg-slate-900/80 border border-amber-500/30 rounded-2xl p-3.5 space-y-3 flex flex-col min-h-[500px] shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-amber-500/20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="text-xs font-bold text-amber-600 dark:text-amber-300 uppercase tracking-wider">
                1. Waiting Lounge
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-mono font-bold">
              {waitingList.length}
            </span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {waitingList.map((token) => (
              <div
                key={token.id}
                className="bg-slate-50 dark:bg-slate-950 border border-amber-500/40 rounded-xl p-3 space-y-2 shadow hover:shadow-amber-500/5 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-mono font-black text-xs">
                    {token.tokenNumber}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">In: {token.checkInTime}</span>
                </div>

                <div>
                  <h4 className="font-bold text-[#1C1A17] dark:text-white text-xs leading-snug">{token.patientName}</h4>
                  <p className="text-[11px] text-amber-600 dark:text-amber-200/70 truncate">{token.serviceName}</p>
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-lg flex items-center justify-between">
                  <span>💺 {token.chairAssigned || "Chair 1"}</span>
                  <span>📞 {token.patientPhone.slice(-5)}</span>
                </div>

                {token.notes && (
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 italic truncate bg-slate-100 dark:bg-slate-900/50 p-1 rounded">
                    "{token.notes}"
                  </p>
                )}

                <div className="pt-1 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCallPatient(token)}
                    disabled={callingToken === token.id}
                    className="w-full py-1.5 px-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{callingToken === token.id ? "Calling Patient..." : "🔊 Call to Chair →"}</span>
                  </button>

                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200 dark:border-slate-800/80">
                    <button
                      onClick={() => handleUpdateStatus(token.id, "IN_CHAIR")}
                      className="text-slate-500 dark:text-slate-400 hover:text-amber-500"
                    >
                      Skip Audio ➔
                    </button>
                    <button
                      onClick={() => handleDeleteToken(token.id)}
                      className="text-rose-500 dark:text-rose-400 hover:text-rose-600 p-0.5"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {waitingList.length === 0 && (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                No patients waiting in lobby
              </div>
            )}
          </div>
        </div>

        {/* ================= COLUMN 2: IN OPERATORY CHAIR ================= */}
        <div className="bg-white dark:bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-3.5 space-y-3 flex flex-col min-h-[500px] shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-300 uppercase tracking-wider">
                2. In Operatory Chair
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold">
              {inChairList.length}
            </span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {inChairList.map((token) => (
              <div
                key={token.id}
                className="bg-slate-50 dark:bg-slate-950 border border-emerald-500/40 rounded-xl p-3 space-y-2.5 shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-mono font-black text-xs">
                    {token.tokenNumber}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    Active: {token.calledAt || "Now"}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-[#1C1A17] dark:text-white text-xs leading-snug">{token.patientName}</h4>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-200/70 truncate">{token.serviceName}</p>
                </div>

                {/* Chair Assignment Tag */}
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 p-1.5 rounded-lg text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                  <Armchair className="w-3.5 h-3.5" />
                  <span>{token.chairAssigned || "Chair 1 (Main Operatory)"}</span>
                </div>

                {/* Doctor Clinical Actions */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenDentalChart(token)}
                    className="py-1 px-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-300 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition"
                  >
                    <Stethoscope className="w-3 h-3" />
                    <span>Odontogram</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenBilling(token)}
                    className="py-1 px-1.5 bg-sky-600/15 hover:bg-sky-600/25 text-sky-700 dark:text-sky-300 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition border border-sky-500/30"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Write Rx</span>
                  </button>
                </div>

                {/* Move to Billing Action */}
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(token.id, "BILLING")}
                  className="w-full py-1.5 px-2 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg text-xs font-black transition flex items-center justify-center gap-1 mt-1 shadow"
                >
                  <span>Proceed to Billing →</span>
                </button>
              </div>
            ))}

            {inChairList.length === 0 && (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                All operatory chairs available
              </div>
            )}
          </div>
        </div>

        {/* ================= COLUMN 3: BILLING & POS ================= */}
        <div className="bg-white dark:bg-slate-900/80 border border-sky-500/30 rounded-2xl p-3.5 space-y-3 flex flex-col min-h-[500px] shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-sky-500/20">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <h3 className="text-xs font-bold text-sky-600 dark:text-sky-300 uppercase tracking-wider">
                3. Billing &amp; POS
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-700 dark:text-sky-300 text-xs font-mono font-bold">
              {billingList.length}
            </span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {billingList.map((token) => (
              <div
                key={token.id}
                className="bg-slate-50 dark:bg-slate-950 border border-sky-500/40 rounded-xl p-3 space-y-2.5 shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-sky-500 text-slate-950 font-mono font-black text-xs">
                    {token.tokenNumber}
                  </span>
                  <span className="text-[10px] text-sky-600 dark:text-sky-300 font-mono">Awaiting POS</span>
                </div>

                <div>
                  <h4 className="font-bold text-[#1C1A17] dark:text-white text-xs leading-snug">{token.patientName}</h4>
                  <p className="text-[11px] text-sky-600 dark:text-sky-200/70 truncate">{token.serviceName}</p>
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  <span>📞 {token.patientPhone}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenBilling(token)}
                  className="w-full py-1.5 px-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 rounded-lg text-xs font-black transition flex items-center justify-center gap-1 shadow"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>🧾 Generate POS Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUpdateStatus(token.id, "COMPLETED")}
                  className="w-full py-1 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[11px] font-semibold transition flex items-center justify-center gap-1"
                >
                  <span>Mark Discharged ✓</span>
                </button>
              </div>
            ))}

            {billingList.length === 0 && (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                No pending billing invoices
              </div>
            )}
          </div>
        </div>

        {/* ================= COLUMN 4: DISCHARGED / COMPLETED ================= */}
        <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 space-y-3 flex flex-col min-h-[500px] shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <h3 className="text-xs font-bold text-purple-600 dark:text-purple-300 uppercase tracking-wider">
                4. Discharged
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-mono font-bold">
              {completedList.length}
            </span>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {completedList.map((token) => (
              <div
                key={token.id}
                className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 space-y-1.5 text-slate-600 dark:text-slate-400 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 font-mono font-bold text-xs">
                    {token.tokenNumber}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Done {token.completedAt}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-[#1C1A17] dark:text-slate-200 text-xs">{token.patientName}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{token.serviceName}</p>
                </div>

                <div className="text-[10px] text-slate-500 pt-1 flex justify-between items-center border-t border-slate-200 dark:border-slate-900">
                  <button
                    onClick={() => handleUpdateStatus(token.id, "WAITING")}
                    className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <RotateCw className="w-2.5 h-2.5" /> Re-admit
                  </button>
                  <button
                    onClick={() => handleDeleteToken(token.id)}
                    className="text-slate-400 dark:text-slate-600 hover:text-rose-500 p-0.5"
                    title="Clear from history"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}

            {completedList.length === 0 && (
              <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                No patients discharged yet today
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Express Walk-In Patient Modal */}
      {isWalkInModalOpen && (
        <div
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overscroll-contain"
        >
          <div
            data-lenis-prevent
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-500/30 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 overscroll-contain max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h4 className="text-base font-bold text-[#1C1A17] dark:text-white">Express Walk-In Patient Entry</h4>
              <button onClick={() => setIsWalkInModalOpen(false)} className="text-slate-400 hover:text-black dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateWalkIn} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="e.g. Ramesh Chandra"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs sm:text-sm text-[#1C1A17] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1">Phone Number (10 Digits)</label>
                <input
                  type="tel"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  placeholder="+91 98260 00000"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs sm:text-sm text-[#1C1A17] dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1">Dental Treatment / Service</label>
                <select
                  value={walkInService}
                  onChange={(e) => setWalkInService(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs sm:text-sm text-[#1C1A17] dark:text-white focus:outline-none"
                >
                  <option value="Emergency Toothache / Pain Relief">Emergency Toothache / Pain Relief</option>
                  {CLINIC_SERVICES.map((s) => (
                    <option key={s.id} value={s.title}>{s.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1">Assign Operatory Chair</label>
                <select
                  value={walkInChair}
                  onChange={(e) => setWalkInChair(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs sm:text-sm text-[#1C1A17] dark:text-white focus:outline-none"
                >
                  <option value="Chair 1 (Main Operatory)">Chair 1 (Main Operatory - Endodontics)</option>
                  <option value="Chair 2 (Hygiene & Scaling)">Chair 2 (Hygiene & Diagnostic)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-700 dark:text-slate-300 font-semibold mb-1">Chief Complaint / Triage Notes</label>
                <input
                  type="text"
                  value={walkInNotes}
                  onChange={(e) => setWalkInNotes(e.target.value)}
                  placeholder="e.g. Broken filling, severe sensitivity"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-[#1C1A17] dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsWalkInModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                >
                  {loading ? "Adding..." : "Issue Token & Check In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
