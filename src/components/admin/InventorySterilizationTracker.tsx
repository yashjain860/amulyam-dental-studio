"use client";

import React, { useState } from "react";
import { InventoryItem, SterilizationLog } from "@/lib/types";
import {
  Boxes,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Minus,
  CheckCircle2,
  Thermometer,
  Gauge,
  Clock,
  Sparkles,
  Calendar,
  Layers,
  History,
  X,
} from "lucide-react";

interface InventorySterilizationTrackerProps {
  inventory: InventoryItem[];
  sterilizationLogs: SterilizationLog[];
  onRefresh: () => void;
}

export default function InventorySterilizationTracker({
  inventory,
  sterilizationLogs,
  onRefresh,
}: InventorySterilizationTrackerProps) {
  const [activeTab, setActiveTab] = useState<"INVENTORY" | "STERILIZATION">("INVENTORY");
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);

  // New Sterilization Cycle Form State
  const [autoclaveUnit, setAutoclaveUnit] = useState<any>("B-Class Autoclave (Main)");
  const [temperatureCelsius, setTemperatureCelsius] = useState(134);
  const [pressurePsi, setPressurePsi] = useState(30);
  const [holdingTimeMinutes, setHoldingTimeMinutes] = useState(15);
  const [pouchesSterilized, setPouchesSterilized] = useState(16);
  const [biologicalIndicator, setBiologicalIndicator] = useState<any>("PASS (Negative)");
  const [technicianName, setTechnicianName] = useState("Staff Anjali");

  const handleStockAdjust = async (id: string, delta: number) => {
    try {
      await fetch(`/api/admin/clinical?type=inventory_stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, delta }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogSterilization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`/api/admin/clinical?type=sterilization_log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "LOG_STERILIZATION",
          data: {
            id: `st-${Date.now()}`,
            cycleNumber: `CYC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
            autoclaveUnit,
            date: new Date().toISOString().split("T")[0],
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            temperatureCelsius: Number(temperatureCelsius),
            pressurePsi: Number(pressurePsi),
            holdingTimeMinutes: Number(holdingTimeMinutes),
            biologicalIndicator,
            pouchesSterilized: Number(pouchesSterilized),
            technicianName,
            status: "PASS",
            createdAt: new Date().toISOString(),
          },
        }),
      });
      setIsCycleModalOpen(false);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const lowStockCount = inventory.filter((i) => i.currentStock <= i.minThreshold).length;

  return (
    <div className="space-y-4 text-[#1C1A17] dark:text-white">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-[#1C1A17] dark:text-white leading-tight">
                Consumables &amp; Autoclave Sterilization Hub
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                NABH Hygiene Standards
              </span>
            </div>
            <p className="text-xs text-[#7A7265] dark:text-slate-400 mt-0.5">
              Material batch tracking, expiry alerts, and autoclave cycle sterilization audit trail.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "STERILIZATION" ? (
            <button
              onClick={() => setIsCycleModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Log Autoclave Cycle</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              {lowStockCount > 0 && (
                <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{lowStockCount} items low stock</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab("INVENTORY")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "INVENTORY"
              ? "bg-amber-500 text-slate-950 shadow-md font-extrabold"
              : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Dental Material Stock &amp; Expiry</span>
        </button>

        <button
          onClick={() => setActiveTab("STERILIZATION")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "STERILIZATION"
              ? "bg-emerald-600 text-white shadow-md font-extrabold"
              : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Autoclave Sterilization Log ({sterilizationLogs.length} Cycles)</span>
        </button>
      </div>

      {/* Tab 1: Dental Materials & Consumables */}
      {activeTab === "INVENTORY" && (
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[#7A7265] dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50">
                  <th className="py-3 px-3.5 font-bold">Item Name &amp; Category</th>
                  <th className="py-3 px-3 font-bold">Cabinet Location</th>
                  <th className="py-3 px-3 font-bold">Batch &amp; Expiry</th>
                  <th className="py-3 px-3 font-bold">Unit Cost</th>
                  <th className="py-3 px-3 font-bold">Stock Level</th>
                  <th className="py-3 px-3.5 text-right font-bold">Adjust Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {inventory.map((item) => {
                  const isLow = item.currentStock <= item.minThreshold;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-3.5">
                        <span className="font-bold text-[#1C1A17] dark:text-white block">{item.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold inline-block mt-0.5 border border-slate-200 dark:border-slate-700">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                        {item.location}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-mono text-slate-800 dark:text-slate-300 block font-semibold">{item.batchNumber}</span>
                        <span className="text-[10px] text-[#7A7265] dark:text-slate-500">Exp: {item.expiryDate}</span>
                      </td>

                      <td className="py-3.5 px-3 font-mono font-bold text-slate-800 dark:text-white">
                        ₹{item.unitCost}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-extrabold text-sm ${
                              isLow ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {item.currentStock} {item.unit}
                          </span>
                          {isLow && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-400 text-[9px] font-bold border border-amber-500/30">
                              REORDER
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleStockAdjust(item.id, -1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white text-slate-700 dark:text-slate-300 font-bold transition flex items-center justify-center cursor-pointer"
                            title="Consume / Deduct 1 Unit"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleStockAdjust(item.id, 1)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white text-slate-700 dark:text-slate-300 font-bold transition flex items-center justify-center cursor-pointer"
                            title="Restock / Add 1 Unit"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Sterilization Cycles Log */}
      {activeTab === "STERILIZATION" && (
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[#7A7265] dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50">
                  <th className="py-3 px-3.5 font-bold">Cycle ID &amp; Unit</th>
                  <th className="py-3 px-3 font-bold">Date &amp; Time</th>
                  <th className="py-3 px-3 font-bold">Parameters (Temp / Pressure / Time)</th>
                  <th className="py-3 px-3 font-bold">Pouches Sterilized</th>
                  <th className="py-3 px-3 font-bold">Biological Indicator</th>
                  <th className="py-3 px-3 font-bold">Logged By</th>
                  <th className="py-3 px-3.5 text-right font-bold">Cycle Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {sterilizationLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-3.5">
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-300 block">{log.cycleNumber}</span>
                      <span className="text-[11px] text-[#7A7265] dark:text-slate-400">{log.autoclaveUnit}</span>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-slate-800 dark:text-slate-300">
                      <div>{log.date}</div>
                      <div className="text-[10px] text-[#7A7265] dark:text-slate-500">{log.time}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2 font-mono text-slate-800 dark:text-slate-200 font-semibold">
                        <span className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400">
                          <Thermometer className="w-3 h-3" /> {log.temperatureCelsius}°C
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-sky-600 dark:text-sky-400">
                          <Gauge className="w-3 h-3" /> {log.pressurePsi} psi
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                          <Clock className="w-3 h-3" /> {log.holdingTimeMinutes} min
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 font-mono font-bold text-slate-800 dark:text-white">
                      {log.pouchesSterilized} pouches
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        {log.biologicalIndicator}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                      {log.technicianName}
                    </td>

                    <td className="py-3.5 px-3.5 text-right">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4" /> PASSED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Autoclave Cycle Modal */}
      {isCycleModalOpen && (
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
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <h4 className="text-base font-bold text-[#1C1A17] dark:text-white">Record Autoclave Sterilization Cycle</h4>
              </div>
              <button onClick={() => setIsCycleModalOpen(false)} className="p-1 rounded-lg text-[#7A7265] dark:text-slate-400 hover:text-black dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogSterilization} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Autoclave Unit *</label>
                <select
                  value={autoclaveUnit}
                  onChange={(e) => setAutoclaveUnit(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-[#1C1A17] dark:text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="B-Class Autoclave (Main)">B-Class Autoclave (Main Operatory 1)</option>
                  <option value="Flash Autoclave (Op 2)">Flash Autoclave (Op 2)</option>
                  <option value="UV Sterilization Cabinet">UV Sterilization Cabinet</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    value={temperatureCelsius}
                    onChange={(e) => setTemperatureCelsius(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-[#1C1A17] dark:text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Pressure (psi)</label>
                  <input
                    type="number"
                    value={pressurePsi}
                    onChange={(e) => setPressurePsi(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-[#1C1A17] dark:text-white font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Holding (min)</label>
                  <input
                    type="number"
                    value={holdingTimeMinutes}
                    onChange={(e) => setHoldingTimeMinutes(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-[#1C1A17] dark:text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Pouches Sterilized</label>
                  <input
                    type="number"
                    value={pouchesSterilized}
                    onChange={(e) => setPouchesSterilized(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-[#1C1A17] dark:text-white font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Biological Indicator</label>
                  <select
                    value={biologicalIndicator}
                    onChange={(e) => setBiologicalIndicator(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-[#1C1A17] dark:text-white focus:outline-none"
                  >
                    <option value="PASS (Negative)">PASS (Negative - No Growth)</option>
                    <option value="FAIL (Positive)">FAIL (Positive - Spores Detected)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-800 dark:text-slate-300 font-bold mb-1">Technician / Staff Name *</label>
                <input
                  type="text"
                  required
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-[#1C1A17] dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCycleModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition cursor-pointer shadow-md"
                >
                  Save Sterilization Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
