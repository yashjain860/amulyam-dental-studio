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
          cycleNumber: `CYCLE-${new Date().toISOString().split("T")[0]}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          autoclaveUnit,
          temperatureCelsius: Number(temperatureCelsius),
          pressurePsi: Number(pressurePsi),
          holdingTimeMinutes: Number(holdingTimeMinutes),
          biologicalIndicator,
          chemicalIndicator: "PASS",
          pouchesSterilized: Number(pouchesSterilized),
          technicianName,
          date: new Date().toISOString().split("T")[0],
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: biologicalIndicator.includes("PASS") ? "CERTIFIED_STERILE" : "RE_RUN_REQUIRED",
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
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                Consumables &amp; Autoclave Sterilization Hub
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                NABH Hygiene Standards
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Material batch tracking, expiry alerts, and autoclave cycle sterilization audit trail.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "STERILIZATION" ? (
            <button
              onClick={() => setIsCycleModalOpen(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Log Autoclave Cycle</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              {lowStockCount > 0 && (
                <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1.5">
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
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "INVENTORY"
              ? "bg-amber-500 text-slate-950 shadow"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Dental Material Stock &amp; Expiry</span>
        </button>

        <button
          onClick={() => setActiveTab("STERILIZATION")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "STERILIZATION"
              ? "bg-emerald-500 text-slate-950 shadow"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Autoclave Sterilization Log ({sterilizationLogs.length} Cycles)</span>
        </button>
      </div>

      {/* Tab 1: Dental Materials & Consumables */}
      {activeTab === "INVENTORY" && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                  <th className="py-3 px-3.5">Item Name &amp; Category</th>
                  <th className="py-3 px-3">Cabinet Location</th>
                  <th className="py-3 px-3">Batch &amp; Expiry</th>
                  <th className="py-3 px-3">Unit Cost</th>
                  <th className="py-3 px-3">Stock Level</th>
                  <th className="py-3 px-3.5 text-right">Adjust Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {inventory.map((item) => {
                  const isLow = item.currentStock <= item.minThreshold;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-3.5">
                        <span className="font-bold text-white block">{item.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold inline-block mt-0.5">
                          {item.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-300">
                        {item.location}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-mono text-slate-300 block">{item.batchNumber}</span>
                        <span className="text-[10px] text-slate-500">Exp: {item.expiryDate}</span>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-white">
                        ₹{item.unitCost}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold text-sm ${
                              isLow ? "text-amber-400" : "text-emerald-400"
                            }`}
                          >
                            {item.currentStock} {item.unit}
                          </span>
                          {isLow && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9px] font-bold border border-amber-500/30">
                              REORDER
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleStockAdjust(item.id, -1)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 flex items-center justify-center transition border border-slate-700"
                            title="Used 1 unit"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleStockAdjust(item.id, 1)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-emerald-950 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition border border-slate-700"
                            title="Added 1 unit"
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

      {/* Tab 2: Autoclave Sterilization Compliance Audit Log */}
      {activeTab === "STERILIZATION" && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                  <th className="py-3 px-3.5">Cycle # &amp; Date</th>
                  <th className="py-3 px-3">Autoclave Unit</th>
                  <th className="py-3 px-3">Parameters (Temp / Pressure / Time)</th>
                  <th className="py-3 px-3">Pouches</th>
                  <th className="py-3 px-3">Spore / Bio Test</th>
                  <th className="py-3 px-3">Technician</th>
                  <th className="py-3 px-3.5 text-right">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sterilizationLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-3.5">
                      <span className="font-mono font-bold text-amber-300 block">{log.cycleNumber}</span>
                      <span className="text-[10px] text-slate-500">{log.date} • {log.time}</span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-200 font-medium">
                      {log.autoclaveUnit}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-slate-300">
                      <span>{log.temperatureCelsius}°C</span> • <span>{log.pressurePsi} PSI</span> • <span>{log.holdingTimeMinutes} min</span>
                    </td>

                    <td className="py-3.5 px-3 font-bold text-white font-mono">
                      {log.pouchesSterilized} Pouches
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        {log.biologicalIndicator}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-slate-400">
                      {log.technicianName}
                    </td>

                    <td className="py-3.5 px-3.5 text-right">
                      <span className="text-emerald-400 font-bold flex items-center justify-end gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Certified Sterile
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overscroll-contain"
        >
          <div
            data-lenis-prevent
            className="bg-slate-900 border border-emerald-500/30 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 overscroll-contain max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white">Log Autoclave Sterilization Cycle</h4>
              <button onClick={() => setIsCycleModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleLogSterilization} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Autoclave Unit</label>
                <select
                  value={autoclaveUnit}
                  onChange={(e) => setAutoclaveUnit(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="B-Class Autoclave (Main)">B-Class Autoclave (Main)</option>
                  <option value="Flash Autoclave 2">Flash Autoclave 2</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    value={temperatureCelsius}
                    onChange={(e) => setTemperatureCelsius(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pressure (PSI)</label>
                  <input
                    type="number"
                    value={pressurePsi}
                    onChange={(e) => setPressurePsi(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Time (Min)</label>
                  <input
                    type="number"
                    value={holdingTimeMinutes}
                    onChange={(e) => setHoldingTimeMinutes(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pouches Sterilized</label>
                  <input
                    type="number"
                    value={pouchesSterilized}
                    onChange={(e) => setPouchesSterilized(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Biological Indicator</label>
                  <select
                    value={biologicalIndicator}
                    onChange={(e) => setBiologicalIndicator(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="PASS (Negative)">PASS (Negative)</option>
                    <option value="FAIL (Positive)">FAIL (Positive)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Staff / Technician Name</label>
                <input
                  type="text"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCycleModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition"
                >
                  Certify Cycle ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
