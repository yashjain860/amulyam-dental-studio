"use client";

import React, { useState } from "react";
import { DentalLabOrder, LabOrderStatus } from "@/lib/types";
import {
  FlaskConical,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Sparkles,
  Calendar,
  Layers,
  Search,
  Filter,
  DollarSign,
  ChevronRight,
  X,
} from "lucide-react";

interface DentalLabTrackerProps {
  orders: DentalLabOrder[];
  onRefresh: () => void;
}

export default function DentalLabTracker({ orders, onRefresh }: DentalLabTrackerProps) {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // New Order Form state
  const [patientName, setPatientName] = useState("");
  const [toothNumbers, setToothNumbers] = useState("16");
  const [prostheticType, setProstheticType] = useState<any>("Monolithic Zirconia Crown");
  const [shade, setShade] = useState("A2");
  const [labPartner, setLabPartner] = useState<any>("DentCare Dental Lab");
  const [expectedDate, setExpectedDate] = useState("");
  const [patientCharge, setPatientCharge] = useState(6000);
  const [costToClinic, setCostToClinic] = useState(1200);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = async (orderId: string, newStatus: LabOrderStatus) => {
    try {
      await fetch(`/api/admin/clinical?type=lab_order`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName) return;
    setLoading(true);

    const newOrder: DentalLabOrder = {
      id: `lab-${Date.now()}`,
      orderNumber: `LAB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: `pt-${Date.now()}`,
      patientName,
      toothNumbers: toothNumbers.split(",").map((s) => Number(s.trim())).filter(Boolean),
      prostheticType,
      shade,
      labPartner,
      impressionDate: new Date().toISOString().split("T")[0],
      expectedDate: expectedDate || new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
      status: "IMPRESSION_TAKEN",
      costToClinic: Number(costToClinic),
      patientCharge: Number(patientCharge),
      notes,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/admin/clinical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CREATE_LAB_ORDER", data: newOrder }),
      });
      const data = await res.json();
      if (data.success) {
        setIsNewModalOpen(false);
        setPatientName("");
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.patientName.toLowerCase().includes(q) ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.prostheticType.toLowerCase().includes(q) ||
        o.labPartner.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 text-[#1C1A17] dark:text-white">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-[#1C1A17] dark:text-white leading-tight">
                Dental Lab &amp; Prosthetics Tracker
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                Crown &amp; Aligner Logistics
              </span>
            </div>
            <p className="text-xs text-[#7A7265] dark:text-slate-400 mt-0.5">
              Tracks impression dispatch, Katana/DentCare lab fabrication, trial fitting, and final cementation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Send New Lab Order</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-[#7A7265] dark:text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient, order #, crown type, or lab partner..."
            className="bg-transparent border-none text-[#1C1A17] dark:text-white focus:outline-none w-full placeholder-slate-400 dark:placeholder-slate-500 text-xs sm:text-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 rounded-xl px-3 py-1.5 focus:outline-none font-semibold"
        >
          <option value="ALL">All Statuses</option>
          <option value="IMPRESSION_TAKEN">Impression Taken</option>
          <option value="SENT_TO_LAB">Sent to Lab</option>
          <option value="IN_FABRICATION">In Fabrication</option>
          <option value="TRIAL_RECEIVED">Trial Received</option>
          <option value="READY_FOR_CEMENTATION">Ready for Cementation</option>
          <option value="COMPLETED">Delivered &amp; Cemented</option>
        </select>
      </div>

      {/* Lab Orders Table */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[#7A7265] dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50">
                <th className="py-3 px-3.5 font-bold">Order #</th>
                <th className="py-3 px-3.5 font-bold">Patient &amp; Tooth</th>
                <th className="py-3 px-3 font-bold">Prosthetic Type &amp; Shade</th>
                <th className="py-3 px-3 font-bold">Lab Partner</th>
                <th className="py-3 px-3 font-bold">Expected Date</th>
                <th className="py-3 px-3 font-bold">Fee / Margin</th>
                <th className="py-3 px-3 font-bold">Status</th>
                <th className="py-3 px-3.5 text-right font-bold">Advance Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-3.5 font-mono font-bold text-amber-600 dark:text-amber-300">
                    {o.orderNumber}
                  </td>

                  <td className="py-3.5 px-3.5">
                    <span className="font-bold text-[#1C1A17] dark:text-white block">{o.patientName}</span>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono font-semibold">
                      Teeth: #{o.toothNumbers.join(", #")}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-xs">{o.prostheticType}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-amber-700 dark:text-amber-300 font-mono font-bold border border-slate-200 dark:border-slate-700">
                      Shade: {o.shade}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300">
                    <span className="font-semibold block">{o.labPartner}</span>
                    <span className="text-[10px] text-[#7A7265] dark:text-slate-500">Sent: {o.impressionDate}</span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-mono text-slate-800 dark:text-white flex items-center gap-1 font-semibold">
                      <Calendar className="w-3 h-3 text-purple-500" /> {o.expectedDate}
                    </span>
                    {o.scheduledSeatingDate && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-semibold">
                        Pt Visit: {o.scheduledSeatingDate}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 font-mono">
                    <span className="text-[#1C1A17] dark:text-white font-bold block">₹{o.patientCharge.toLocaleString("en-IN")}</span>
                    <span className="text-[10px] text-[#7A7265] dark:text-slate-400 font-medium">Lab Cost: ₹{o.costToClinic}</span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        o.status === "READY_FOR_CEMENTATION" || o.status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                          : o.status === "TRIAL_RECEIVED"
                          ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/30"
                          : o.status === "IN_FABRICATION"
                          ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/30"
                          : "bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </td>

                  <td className="py-3.5 px-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {o.status === "IMPRESSION_TAKEN" && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, "SENT_TO_LAB")}
                          className="py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold transition cursor-pointer"
                        >
                          Dispatch to Lab ➔
                        </button>
                      )}
                      {o.status === "SENT_TO_LAB" && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, "IN_FABRICATION")}
                          className="py-1 px-2.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-[11px] font-bold transition cursor-pointer"
                        >
                          Mark in Fabrication ➔
                        </button>
                      )}
                      {o.status === "IN_FABRICATION" && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, "TRIAL_RECEIVED")}
                          className="py-1 px-2.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-700 dark:text-sky-300 border border-sky-500/30 text-[11px] font-bold transition cursor-pointer"
                        >
                          Trial Received in Clinic ➔
                        </button>
                      )}
                      {o.status === "TRIAL_RECEIVED" && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, "READY_FOR_CEMENTATION")}
                          className="py-1 px-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition cursor-pointer"
                        >
                          Ready for Patient Seating ➔
                        </button>
                      )}
                      {o.status === "READY_FOR_CEMENTATION" && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, "COMPLETED")}
                          className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition cursor-pointer"
                        >
                          ✓ Cemented &amp; Closed
                        </button>
                      )}
                      {o.status === "COMPLETED" && (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Cemented
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Lab Order Modal */}
      {isNewModalOpen && (
        <div
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overscroll-contain"
        >
          <div
            data-lenis-prevent
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-500/30 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 overscroll-contain max-h-[90vh] overflow-y-auto text-[#1C1A17] dark:text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h4 className="text-base font-bold text-[#1C1A17] dark:text-white">Send New Dental Lab Order</h4>
              <button onClick={() => setIsNewModalOpen(false)} className="p-1 rounded-lg text-[#7A7265] dark:text-slate-400 hover:text-black dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-[#1C1A17] dark:text-white focus:outline-none focus:border-amber-500 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Tooth FDI Numbers *</label>
                  <input
                    type="text"
                    required
                    value={toothNumbers}
                    onChange={(e) => setToothNumbers(e.target.value)}
                    placeholder="e.g. 16, 17"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-[#1C1A17] dark:text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">VITA Shade *</label>
                  <select
                    value={shade}
                    onChange={(e) => setShade(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-[#1C1A17] dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    {["A1", "A2", "A3", "A3.5", "B1", "B2", "BL1 (Bleach)", "BL2"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Prosthetic Type</label>
                  <select
                    value={prostheticType}
                    onChange={(e) => setProstheticType(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-[#1C1A17] dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Monolithic Zirconia Crown">Monolithic Zirconia Crown</option>
                    <option value="Multi-Layered Katana Zirconia">Multi-Layered Katana Zirconia</option>
                    <option value="E-Max Lithium Disilicate Veneer">E-Max Lithium Disilicate Veneer</option>
                    <option value="PFM (Porcelain Fused to Metal)">PFM (Porcelain Fused to Metal)</option>
                    <option value="Clear Aligner Tray">Clear Aligner Tray</option>
                    <option value="Custom Night Guard / Splint">Custom Night Guard / Splint</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Lab Partner</label>
                  <select
                    value={labPartner}
                    onChange={(e) => setLabPartner(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-[#1C1A17] dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="DentCare Dental Lab">DentCare Dental Lab</option>
                    <option value="Katana Zirconia Studio">Katana Zirconia Studio</option>
                    <option value="C-Dent Bhopal">C-Dent Bhopal</option>
                    <option value="In-House Lab">In-House Lab</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-[#1C1A17] dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Patient Charge (₹)</label>
                  <input
                    type="number"
                    value={patientCharge}
                    onChange={(e) => setPatientCharge(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-[#1C1A17] dark:text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Special Lab Instructions / Occlusion</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Provide high translucency, clear buccal margins"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-[#1C1A17] dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition cursor-pointer shadow-md"
                >
                  {loading ? "Sending..." : "Create & Dispatch Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
