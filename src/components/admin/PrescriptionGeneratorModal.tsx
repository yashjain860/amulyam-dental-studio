"use client";

import React, { useState, useEffect } from "react";
import { Prescription, RxMedicine, Booking, UserAccount } from "@/lib/types";
import { CLINIC_INFO, LEAD_DOCTOR } from "@/lib/constants";
import {
  Stethoscope,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  X,
  FileText,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface PrescriptionGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking | null;
  patient?: UserAccount | null;
  onSaved?: (prescription: Prescription) => void;
}

const COMMON_DENTAL_MEDS = [
  {
    name: "Tab. Augmentin 625mg (Amoxycillin + Clavulanic Acid)",
    dosage: "625mg",
    freq: "1-0-1",
    timing: "AFTER_FOOD",
    dur: "5 Days",
    instr: "Take after heavy meals. Complete full 5-day antibiotic course.",
  },
  {
    name: "Tab. Zerodol-SP (Aceclofenac + Paracetamol + Serratiopeptidase)",
    dosage: "100/325/15mg",
    freq: "1-0-1",
    timing: "AFTER_FOOD",
    dur: "3 Days",
    instr: "For pain & swelling relief. Discontinue once swelling resolves.",
  },
  {
    name: "Tab. Ketorol-DT (Ketorolac Tromethamine)",
    dosage: "10mg",
    freq: "SOS",
    timing: "AFTER_FOOD",
    dur: "2 Days",
    instr: "Dissolve 1 tablet in 1 glass of water for acute severe tooth pain.",
  },
  {
    name: "Tab. Metrogyl 400mg (Metronidazole)",
    dosage: "400mg",
    freq: "1-0-1",
    timing: "AFTER_FOOD",
    dur: "5 Days",
    instr: "For anaerobic gum infection. Strictly avoid alcohol during treatment.",
  },
  {
    name: "Hexidine 0.2% Antiseptic Mouthwash (Chlorhexidine Gluconate)",
    dosage: "10ml",
    freq: "1-0-1",
    timing: "AFTER_FOOD",
    dur: "7 Days",
    instr: "Swish 10ml undiluted for 60 seconds after brushing. Do not rinse with water.",
  },
  {
    name: "Tab. Pantocid 40mg (Pantoprazole)",
    dosage: "40mg",
    freq: "1-0-0",
    timing: "BEFORE_FOOD",
    dur: "5 Days",
    instr: "Take 30 minutes before morning breakfast to prevent gastric acidity.",
  },
  {
    name: "Orasore Dental Gel (Choline Salicylate + Lignocaine)",
    dosage: "Pea size",
    freq: "1-1-1",
    timing: "AFTER_FOOD",
    dur: "5 Days",
    instr: "Apply locally with clean fingertip over tender gum region.",
  },
];

export default function PrescriptionGeneratorModal({
  isOpen,
  onClose,
  booking,
  patient,
  onSaved,
}: PrescriptionGeneratorModalProps) {
  // Patient details state
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState<number | undefined>(29);
  const [patientGender, setPatientGender] = useState("Male");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");

  // Clinical info state
  const [chiefComplaint, setChiefComplaint] = useState(
    "Acute localized throbbing pain in lower left molar with cold/hot sensitivity"
  );
  const [diagnosis, setDiagnosis] = useState(
    "Acute Irreversible Pulpitis w/ Apical Periodontitis (Tooth #36)"
  );
  const [medicines, setMedicines] = useState<RxMedicine[]>([]);
  const [specialAdvice, setSpecialAdvice] = useState(
    "Avoid chewing hard food from the left side. Maintain warm saline gargles 3 times a day. Return for root canal obturation appointment in 3 days."
  );

  // Custom drug inputs
  const [customDrugName, setCustomDrugName] = useState("");
  const [customDosage, setCustomDosage] = useState("500mg");
  const [customFreq, setCustomFreq] = useState<"1-0-1" | "1-1-1" | "0-0-1" | "1-0-0" | "SOS" | "STAT">("1-0-1");
  const [customTiming, setCustomTiming] = useState<"AFTER_FOOD" | "BEFORE_FOOD" | "WITH_FOOD">("AFTER_FOOD");
  const [customDuration, setCustomDuration] = useState("5 Days");
  const [customInstructions, setCustomInstructions] = useState("Take after meals with water.");

  const [saving, setSaving] = useState(false);
  const [savedRx, setSavedRx] = useState<Prescription | null>(null);

  // Sync patient info from props
  useEffect(() => {
    const name = booking?.patientName || patient?.name || "Aarav Sharma";
    const phone = booking?.patientPhone || patient?.phone || "+91 98260 12345";
    const email = booking?.patientEmail || patient?.email || "aarav.sharma@example.com";
    const age = booking?.age || patient?.age || 29;
    const gender = booking?.gender || patient?.gender || "Male";

    setPatientName(name);
    setPatientPhone(phone);
    setPatientEmail(email);
    setPatientAge(age);
    setPatientGender(gender);

    if (medicines.length === 0) {
      setMedicines([
        {
          name: "Tab. Augmentin 625mg (Amoxycillin + Clavulanic Acid)",
          dosage: "625mg",
          frequency: "1-0-1",
          timing: "AFTER_FOOD",
          duration: "5 Days",
          instructions: "Complete the full 5-day antibiotic course.",
        },
        {
          name: "Tab. Zerodol-SP (Aceclofenac + Paracetamol + Serratiopeptidase)",
          dosage: "100/325/15mg",
          frequency: "1-0-1",
          timing: "AFTER_FOOD",
          duration: "3 Days",
          instructions: "For pain & swelling. Discontinue if pain subsides.",
        },
        {
          name: "Tab. Pantocid 40mg (Pantoprazole)",
          dosage: "40mg",
          frequency: "1-0-0",
          timing: "BEFORE_FOOD",
          duration: "5 Days",
          instructions: "Take 30 mins before breakfast to prevent gastric distress.",
        },
      ]);
    }
  }, [booking, patient]);

  // Lock body scroll when modal opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Add custom medicine
  const handleAddCustomDrug = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDrugName.trim()) return;

    const newMed: RxMedicine = {
      name: customDrugName.trim(),
      dosage: customDosage.trim(),
      frequency: customFreq,
      timing: customTiming,
      duration: customDuration.trim(),
      instructions: customInstructions.trim(),
    };

    setMedicines((prev) => [...prev, newMed]);
    setCustomDrugName("");
    setCustomDosage("");
    setCustomInstructions("Take after meals with water.");
  };

  // Add preset medicine
  const handleAddPresetMedicine = (med: typeof COMMON_DENTAL_MEDS[0]) => {
    setMedicines((prev) => [
      ...prev,
      {
        name: med.name,
        dosage: med.dosage,
        frequency: med.freq as any,
        timing: med.timing as any,
        duration: med.dur,
        instructions: med.instr,
      },
    ]);
  };

  // Inline row update
  const handleUpdateMedicine = (idx: number, field: keyof RxMedicine, value: any) => {
    setMedicines((prev) => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        [field]: value,
      };
      return updated;
    });
  };

  const handleRemoveMedicine = (idx: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveRx = async () => {
    setSaving(true);
    const payload = {
      bookingId: booking?.id,
      patientName,
      patientAge: Number(patientAge) || 29,
      patientGender,
      patientPhone,
      patientEmail,
      diagnosis,
      chiefComplaint,
      medicines,
      specialAdvice,
      doctorName: LEAD_DOCTOR.name,
      doctorRegistration: "MPDC-8842-A",
    };

    try {
      const res = await fetch("/api/admin/clinical", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CREATE_RX", data: payload }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedRx(data.prescription);
        if (onSaved) onSaved(data.prescription);
      }
    } catch (e) {
      console.error("Save Rx error:", e);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      data-lenis-prevent
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto overscroll-contain"
    >
      <div
        data-lenis-prevent
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-500/30 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-[#1C1A17] dark:text-white"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#1C1A17] dark:text-white leading-tight">Digital Clinical Prescription (E-Rx)</h3>
              <p className="text-xs text-[#7A7265] dark:text-slate-400 leading-tight">Dr. Shreya Nidhi (BDS, MDS) • Reg: MPDC-8842-A</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedRx && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-800 dark:text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Rx Letterhead</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#7A7265] dark:text-slate-400 hover:text-black dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm overscroll-contain"
        >
          {/* Printable Letterhead Preview Container */}
          <div id="printable-prescription" className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 space-y-5">
            {/* Clinic Brand Header */}
            <div className="flex items-start justify-between border-b-2 border-amber-600 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{CLINIC_INFO.name}</h2>
                <p className="text-xs font-semibold text-amber-700">ADVANCED ENDODONTICS, COSMETIC &amp; IMPLANT STUDIO</p>
                <p className="text-[11px] text-slate-600 mt-1">{CLINIC_INFO.address}</p>
                <p className="text-[11px] text-slate-600">📞 {CLINIC_INFO.phone} • ✉️ {CLINIC_INFO.email}</p>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-bold text-slate-900">{LEAD_DOCTOR.name}</h3>
                <p className="text-[11px] font-semibold text-amber-700">{LEAD_DOCTOR.qualifications}</p>
                <p className="text-[10px] text-slate-500">Chief Endodontist &amp; Smile Specialist</p>
                <p className="text-[10px] font-mono text-slate-400 mt-1">MPDC Reg: 8842-A</p>
              </div>
            </div>

            {/* Editable Patient Demographics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <div>
                <label className="text-slate-500 block text-[10px] font-semibold mb-0.5">Patient Name *</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-slate-500 block text-[10px] font-semibold mb-0.5">Age / Gender</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={patientAge || ""}
                    onChange={(e) => setPatientAge(parseInt(e.target.value) || 0)}
                    className="w-12 bg-white border border-slate-300 rounded px-1 py-0.5 text-xs font-bold text-slate-900"
                  />
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded px-1 py-0.5 text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-slate-500 block text-[10px] font-semibold mb-0.5">Contact Phone</label>
                <input
                  type="text"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-500 block text-[10px] font-semibold mb-0.5">Date</label>
                <span className="font-mono text-xs text-slate-800 font-bold block pt-1">{new Date().toLocaleDateString("en-IN")}</span>
              </div>
            </div>

            {/* Diagnosis & Chief Complaint (Editable) */}
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-slate-500 block text-[10px] font-bold uppercase">Chief Complaint:</label>
                <input
                  type="text"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-slate-500 block text-[10px] font-bold uppercase">Clinical Diagnosis:</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full bg-amber-50/50 border border-amber-200 rounded px-2.5 py-1 text-xs font-bold text-amber-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Rx Symbol & Medication Table */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 border-b-2 border-slate-900 pb-1">
                <span className="text-2xl font-serif font-black text-amber-700 italic">℞</span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Prescribed Medications</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="py-2 px-1">#</th>
                      <th className="py-2 px-2">Medicine / Generic Formulation</th>
                      <th className="py-2 px-2 w-20">Dosage</th>
                      <th className="py-2 px-2 w-24">Frequency</th>
                      <th className="py-2 px-2 w-24">Timing</th>
                      <th className="py-2 px-2 w-20">Duration</th>
                      <th className="py-2 px-2">Instructions</th>
                      <th className="py-2 px-1 text-center w-8">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medicines.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-1 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-2">
                          <input
                            type="text"
                            value={m.name}
                            onChange={(e) => handleUpdateMedicine(idx, "name", e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 font-bold text-slate-900 px-1 py-0.5 focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="text"
                            value={m.dosage}
                            onChange={(e) => handleUpdateMedicine(idx, "dosage", e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 font-mono text-slate-700 px-1 py-0.5 focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-2">
                          <select
                            value={m.frequency}
                            onChange={(e) => handleUpdateMedicine(idx, "frequency", e.target.value)}
                            className="bg-amber-100 text-amber-900 rounded px-1.5 py-0.5 font-mono text-[11px] font-bold"
                          >
                            <option value="1-0-1">1-0-1 (Twice)</option>
                            <option value="1-1-1">1-1-1 (Thrice)</option>
                            <option value="1-0-0">1-0-0 (Morning)</option>
                            <option value="0-0-1">0-0-1 (Night)</option>
                            <option value="SOS">SOS (When in pain)</option>
                            <option value="STAT">STAT (Immediately)</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-2">
                          <select
                            value={m.timing}
                            onChange={(e) => handleUpdateMedicine(idx, "timing", e.target.value)}
                            className="text-[11px] font-semibold text-slate-700 bg-slate-100 rounded px-1 py-0.5"
                          >
                            <option value="AFTER_FOOD">After Food</option>
                            <option value="BEFORE_FOOD">Before Food</option>
                            <option value="WITH_FOOD">With Food</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="text"
                            value={m.duration}
                            onChange={(e) => handleUpdateMedicine(idx, "duration", e.target.value)}
                            className="w-16 bg-transparent border-b border-transparent hover:border-slate-300 font-mono text-[11px] font-bold text-slate-800 px-1 py-0.5 focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="text"
                            value={m.instructions}
                            onChange={(e) => handleUpdateMedicine(idx, "instructions", e.target.value)}
                            className="w-full bg-transparent border-b border-transparent hover:border-slate-300 text-[11px] text-slate-600 px-1 py-0.5 focus:outline-none"
                          />
                        </td>
                        <td className="py-2.5 px-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(idx)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                            title="Remove Drug"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {medicines.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-6 text-center text-slate-400">
                          No medications added yet. Add custom drugs or select from quick clinical presets below.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Custom Drug Form */}
            <form onSubmit={handleAddCustomDrug} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1 w-full sm:w-auto">
                <Plus className="w-3.5 h-3.5" /> Add Custom Medicine:
              </span>
              <input
                type="text"
                placeholder="Medicine Name (e.g. Tab. Doxycycline 100mg)"
                value={customDrugName}
                onChange={(e) => setCustomDrugName(e.target.value)}
                className="flex-1 min-w-[200px] bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="Strength (100mg)"
                value={customDosage}
                onChange={(e) => setCustomDosage(e.target.value)}
                className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 focus:outline-none"
              />
              <select
                value={customFreq}
                onChange={(e) => setCustomFreq(e.target.value as any)}
                className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none"
              >
                <option value="1-0-1">1-0-1 (Twice)</option>
                <option value="1-1-1">1-1-1 (Thrice)</option>
                <option value="1-0-0">1-0-0 (Morning)</option>
                <option value="0-0-1">0-0-1 (Night)</option>
                <option value="SOS">SOS (When needed)</option>
                <option value="STAT">STAT (Immediately)</option>
              </select>
              <select
                value={customTiming}
                onChange={(e) => setCustomTiming(e.target.value as any)}
                className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none"
              >
                <option value="AFTER_FOOD">After Food</option>
                <option value="BEFORE_FOOD">Before Food</option>
                <option value="WITH_FOOD">With Food</option>
              </select>
              <input
                type="text"
                placeholder="Duration (5 Days)"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-900 focus:outline-none"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow transition"
              >
                + Add to Rx
              </button>
            </form>

            {/* Quick 1-Click Common Dental Pharmacology Catalog */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">+ Quick Add Common Dental Medicine:</span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_DENTAL_MEDS.map((med, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPresetMedicine(med)}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 text-[11px] font-medium transition shadow-xs"
                  >
                    + {med.name.split("(")[0].trim()} ({med.freq})
                  </button>
                ))}
              </div>
            </div>

            {/* Special Instructions & Signature */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
              <div>
                <label className="text-slate-500 block text-[10px] font-bold uppercase mb-1">
                  Doctor's Special Advice &amp; Post-Care:
                </label>
                <textarea
                  rows={3}
                  value={specialAdvice}
                  onChange={(e) => setSpecialAdvice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex flex-col justify-end items-end text-right pr-4 pt-4 sm:pt-0">
                <div className="w-36 border-b border-slate-400 pb-1 text-center">
                  <span className="font-serif italic text-sm text-slate-800 font-bold">Dr. Shreya Nidhi</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1">Authorized Medical Signatory</span>
                <span className="text-[9px] text-slate-400">Amulyam Dental Studio, Bhopal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-[#7A7265] dark:text-slate-400 font-mono">
            {savedRx ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Prescription Saved! Ready to print letterhead.
              </span>
            ) : (
              <span>Review medication dosage &amp; sign electronically</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSaveRx}
              disabled={saving || medicines.length === 0}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? "Signing..." : savedRx ? "Update E-Prescription" : "Save & Generate E-Rx"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
