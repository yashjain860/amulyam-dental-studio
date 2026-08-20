"use client";

import React, { useState } from "react";
import { Prescription, RxMedicine, Booking } from "@/lib/types";
import { CLINIC_INFO, LEAD_DOCTOR } from "@/lib/constants";
import {
  FileText,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  X,
  Sparkles,
  Stethoscope,
  Send,
} from "lucide-react";

interface PrescriptionGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking | null;
  onSaved?: (rx: Prescription) => void;
}

const COMMON_DENTAL_MEDS = [
  { name: "Augmentin (Amoxicillin + Clavulanate)", dosage: "625 mg", freq: "1-0-1", timing: "After Food", dur: "5 Days", instr: "Complete full antibiotic course." },
  { name: "Zerodol-SP (Aceclofenac + Paracetamol + Serratiopeptidase)", dosage: "1 Tab", freq: "1-0-1", timing: "After Food", dur: "3 Days", instr: "Take after meals for pain & inflammation." },
  { name: "Ketorol-DT (Ketorolac Tromethamine)", dosage: "10 mg", freq: "SOS", timing: "After Food", dur: "2 Days", instr: "Disperse in 1 tablespoon water for severe pain." },
  { name: "Metrogyl (Metronidazole)", dosage: "400 mg", freq: "1-0-1", timing: "After Food", dur: "5 Days", instr: "For anaerobic gum infections." },
  { name: "Hexidine Mouthwash (Chlorhexidine 0.2%)", dosage: "10 ml", freq: "1-0-1", timing: "After Food", dur: "7 Days", instr: "Rinse mouth for 1 minute twice daily." },
  { name: "Orasore Dental Gel", dosage: "Pea size", freq: "1-1-1", timing: "Before Food", dur: "5 Days", instr: "Apply topically over ulcers/friction areas." },
  { name: "Pan-D (Pantoprazole + Domperidone)", dosage: "40 mg", freq: "1-0-0", timing: "Before Food", dur: "5 Days", instr: "Take empty stomach in morning." },
];

export default function PrescriptionGeneratorModal({
  isOpen,
  onClose,
  booking,
  onSaved,
}: PrescriptionGeneratorModalProps) {
  const [patientName, setPatientName] = useState(booking?.patientName || "Aarav Sharma");
  const [patientAge, setPatientAge] = useState(booking?.age || 29);
  const [patientGender, setPatientGender] = useState(booking?.gender || "Male");
  const [patientPhone, setPatientPhone] = useState(booking?.patientPhone || "+91 98260 12345");
  const [patientEmail, setPatientEmail] = useState(booking?.patientEmail || "aarav.sharma@example.com");
  const [chiefComplaint, setChiefComplaint] = useState(booking?.notes || "Throbbing pain in lower left molar (#36) on chewing.");
  const [diagnosis, setDiagnosis] = useState(booking?.doctorNotes || "Acute Irreversible Pulpitis #36. Rotary Endodontics recommended.");
  const [specialAdvice, setSpecialAdvice] = useState("Avoid chewing hard or sticky food on the treated side. Maintain strict oral hygiene.");
  
  const [medicines, setMedicines] = useState<RxMedicine[]>([
    {
      name: "Augmentin (Amoxicillin + Clavulanate)",
      dosage: "625 mg",
      frequency: "1-0-1",
      timing: "After Food",
      duration: "5 Days",
      instructions: "Complete entire course.",
    },
    {
      name: "Zerodol-SP",
      dosage: "1 Tab",
      frequency: "1-0-1",
      timing: "After Food",
      duration: "3 Days",
      instructions: "Take strictly after food.",
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [savedRx, setSavedRx] = useState<Prescription | null>(null);

  if (!isOpen) return null;

  const handleAddMedicine = (med: typeof COMMON_DENTAL_MEDS[0]) => {
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

  const handleRemoveMedicine = (idx: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveRx = async () => {
    setSaving(true);
    const payload = {
      bookingId: booking?.id,
      patientName,
      patientAge,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">Digital Clinical Prescription (E-Rx)</h3>
              <p className="text-xs text-amber-200/60 leading-tight">Dr. Shreya Nidhi (BDS, MDS) • Reg: MPDC-8842-A</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {savedRx && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-lg border border-amber-500/30 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Rx Letterhead</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
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
                <p className="text-[10px] text-slate-500 font-mono">Reg No: MPDC-8842-A</p>
              </div>
            </div>

            {/* Patient Demographic Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-amber-50/50 p-3 rounded-lg border border-amber-200 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Patient Name:</span>
                <span className="font-bold text-slate-900">{patientName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Age / Gender:</span>
                <span className="font-bold text-slate-900">{patientAge} Yrs / {patientGender}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Phone / Ref:</span>
                <span className="font-bold text-slate-900">{patientPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Date:</span>
                <span className="font-bold text-slate-900">{new Date().toLocaleDateString("en-IN")}</span>
              </div>
            </div>

            {/* Diagnosis & Chief Complaint */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">Chief Complaint:</span>
                <input
                  type="text"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs text-slate-900 mt-1 font-medium"
                />
              </div>
              <div>
                <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">Clinical Diagnosis:</span>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs text-slate-900 mt-1 font-medium"
                />
              </div>
            </div>

            {/* Medicine Rx Table */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 border-b border-slate-300 pb-1">
                <span className="text-lg font-serif font-black text-amber-700">℞</span>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Prescribed Medications</span>
              </div>

              <div className="space-y-2">
                {medicines.map((med, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-slate-50 border border-slate-200 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900">{idx + 1}. {med.name} ({med.dosage})</span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">{med.frequency}</span>
                        <span>• {med.timing}</span>
                        <span>• Duration: {med.duration}</span>
                      </div>
                      {med.instructions && (
                        <p className="text-[10px] text-slate-500 italic">{med.instructions}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveMedicine(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Remove medicine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Medicine Adder */}
            <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
              <span className="text-[11px] font-bold text-slate-700 block mb-1.5">+ Quick Add Standard Dental Medication:</span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_DENTAL_MEDS.map((med, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAddMedicine(med)}
                    className="px-2 py-1 bg-white hover:bg-amber-100 text-slate-800 border border-slate-300 rounded text-[11px] font-medium transition"
                  >
                    + {med.name.split(" ")[0]} ({med.dosage})
                  </button>
                ))}
              </div>
            </div>

            {/* Special Instructions & Signature */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex-1">
                <span className="text-[11px] font-bold text-slate-700 block">Post-Treatment Advice:</span>
                <input
                  type="text"
                  value={specialAdvice}
                  onChange={(e) => setSpecialAdvice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded p-1.5 text-xs text-slate-800 mt-1"
                />
              </div>

              <div className="text-center sm:text-right shrink-0">
                <div className="w-32 h-10 border-b border-dashed border-slate-400 mx-auto sm:ml-auto"></div>
                <span className="text-[11px] font-bold text-slate-900 block mt-1">Dr. Shreya Nidhi</span>
                <span className="text-[10px] text-slate-500">Sign &amp; Clinic Stamp</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-amber-500/20 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            {savedRx ? `Saved: ${savedRx.rxNumber}` : "Ready to save prescription"}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
            >
              Close
            </button>
            <button
              onClick={handleSaveRx}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
            >
              {saving ? (
                <span className="animate-spin">✦</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{savedRx ? "Update Prescription" : "Save & Generate Rx"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
