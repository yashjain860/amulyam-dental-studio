"use client";

import React, { useState } from "react";
import { PostOpProtocol, UserAccount } from "@/lib/types";
import {
  MessageSquare,
  Send,
  Calendar,
  AlertCircle,
  Clock,
  Sparkles,
  CheckCircle2,
  Phone,
  ShieldAlert,
  HeartPulse,
} from "lucide-react";

interface PostOpCareRecallEngineProps {
  protocols: PostOpProtocol[];
  patients: UserAccount[];
}

export default function PostOpCareRecallEngine({ protocols, patients }: PostOpCareRecallEngineProps) {
  const [selectedProtocol, setSelectedProtocol] = useState<PostOpProtocol>(protocols[0] || null);
  const [selectedPatient, setSelectedPatient] = useState<UserAccount | null>(patients[0] || null);
  const [activeTab, setActiveTab] = useState<"POST_OP" | "RECALL_6MONTH">("POST_OP");

  const sendWhatsApp = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const getCustomizedMessage = () => {
    if (!selectedProtocol) return "";
    const name = selectedPatient?.name || "Valued Patient";
    return selectedProtocol.whatsappTemplate.replace("{patientName}", name);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                WhatsApp Post-Op Care &amp; 6-Month Recall Engine
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                Automated Patient Retention
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Instant clinical care instructions sent 2 hours post-surgery and routine hygiene recall triggers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("POST_OP")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "POST_OP"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Post-Op Care Protocols</span>
          </button>

          <button
            onClick={() => setActiveTab("RECALL_6MONTH")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === "RECALL_6MONTH"
                ? "bg-amber-500 text-slate-950 shadow"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>6-Month Hygiene Recalls</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Post-Op Care Protocol Dispatch */}
      {activeTab === "POST_OP" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Select Treatment & Patient */}
          <div className="space-y-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-xs">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <span>1. Choose Treatment Protocol:</span>
            </h4>
            <div className="space-y-1.5">
              {protocols.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProtocol(p)}
                  className={`w-full p-2.5 rounded-xl text-left font-semibold transition border ${
                    selectedProtocol?.id === p.id
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-300"
                      : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {p.treatmentName}
                </button>
              ))}
            </div>

            <h4 className="font-bold text-white pt-2 border-t border-slate-800 flex items-center gap-1.5">
              <span>2. Select Patient:</span>
            </h4>
            <select
              value={selectedPatient?.id || ""}
              onChange={(e) => {
                const found = patients.find((pat) => pat.id === e.target.value);
                if (found) setSelectedPatient(found);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white focus:outline-none focus:border-emerald-500 text-xs"
            >
              {patients.map((pat) => (
                <option key={pat.id} value={pat.id}>
                  {pat.name} ({pat.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Right: Message Preview & Care Sheet */}
          {selectedProtocol && (
            <div className="lg:col-span-2 space-y-3.5 bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800 text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-bold text-white text-sm">
                  Clinical Care Sheet: {selectedProtocol.treatmentName}
                </span>
                <span className="text-[10px] text-slate-400">Amulyam Dental Protocol</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="font-bold text-amber-400 block mb-1">⚡ Immediate Precautions:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    {selectedProtocol.immediateInstructions.map((ins, idx) => (
                      <li key={idx}>{ins}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="font-bold text-sky-400 block mb-1">🥗 Dietary &amp; Pain Management:</span>
                  <p className="text-slate-300 mb-1">{selectedProtocol.medicationGuide}</p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11px]">
                    {selectedProtocol.dietaryRestrictions.map((diet, idx) => (
                      <li key={idx}>{diet}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* WhatsApp Output Preview Card */}
              <div className="bg-[#0b141a] p-3.5 rounded-2xl border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Message to {selectedPatient?.name || "Patient"}
                  </span>
                  <span>{selectedPatient?.phone}</span>
                </div>

                <div className="bg-[#202c33] p-3 rounded-xl text-slate-100 text-xs leading-relaxed font-sans shadow-md">
                  {getCustomizedMessage()}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => sendWhatsApp(selectedPatient?.phone || "918770183178", getCustomizedMessage())}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send via WhatsApp ➔</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: 6-Month Hygiene Recalls */}
      {activeTab === "RECALL_6MONTH" && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 text-xs shadow-xl space-y-3">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <div>
              <h4 className="font-bold text-white text-sm">Patients Due for 6-Month Preventive Scaling</h4>
              <p className="text-slate-400 text-[11px]">Automated recall notifications to drive recurring clinic visits.</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold text-[10px]">
              3 Patients Due This Week
            </span>
          </div>

          <div className="divide-y divide-slate-800/60">
            {patients.slice(0, 3).map((pat, idx) => {
              const recallMsg = `Namaste ${pat.name}! It has been 6 months since your last dental checkup at Amulyam Dental Studio. Regular scaling and preventive polish keeps your teeth plaque-free and healthy. Click here to book your priority slot: https://amulyam.thewebvale.com/book`;
              return (
                <div key={pat.id || idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-white block text-sm">{pat.name}</span>
                    <span className="text-slate-400 text-[11px]">Last Visit: 6 months ago • Phone: {pat.phone}</span>
                  </div>

                  <button
                    onClick={() => sendWhatsApp(pat.phone, recallMsg)}
                    className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send 6-Month Recall on WhatsApp</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
