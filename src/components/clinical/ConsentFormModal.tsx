"use client";

import React, { useState, useRef, useEffect } from "react";
import { UserAccount, ConsentForm } from "@/lib/types";
import { LEAD_DOCTOR, CLINIC_INFO } from "@/lib/constants";
import {
  FileCheck2,
  X,
  Languages,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Printer,
  ShieldCheck,
  Calendar,
  PenTool,
} from "lucide-react";

interface ConsentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: UserAccount | null;
  onSigned?: (form: ConsentForm) => void;
}

export default function ConsentFormModal({
  isOpen,
  onClose,
  patient,
  onSigned,
}: ConsentFormModalProps) {
  const [treatmentType, setTreatmentType] = useState<"RCT" | "IMPLANT_SURGERY" | "EXTRACTION">("RCT");
  const [language, setLanguage] = useState<"EN" | "HI">("EN");
  const [acknowledgedRisks, setAcknowledgedRisks] = useState<boolean[]>([]);
  const [isSigned, setIsSigned] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const templates: Record<string, { title: string; en: string; hi: string; risks: string[] }> = {
    RCT: {
      title: "Root Canal Treatment (RCT) & Crown Restoration Consent",
      en: "I hereby authorize Dr. Shreya Nidhi to perform Endodontic Root Canal Therapy on the specified tooth. I understand that the goal is to relieve infection, alleviate pain, and preserve the natural tooth. Possible outcomes including post-treatment soreness, need for full-coverage crown restoration, and follow-up reviews have been clearly explained to me.",
      hi: "मैं डॉ. श्रेया निधि को अपने दांत का रूट कैनाल ट्रीटमेंट एवं कैपिंग करने की अनुमति देता/देती हूँ। मुझे उपचार के सभी चरणों, सावधानियों एवं संभावित जटिलताओं के बारे में विस्तार से समझा दिया गया है।",
      risks: [
        "Mild post-operative tenderness or soreness for 2-3 days while tissues heal.",
        "Mandatory requirement for permanent crown / cap to prevent tooth fracture.",
        "Rare anatomical canal variations or calcification requiring multi-visit therapy."
      ]
    },
    IMPLANT_SURGERY: {
      title: "Dental Implant Surgery & Bone Grafting Consent",
      en: "I consent to the surgical placement of titanium dental implant fixture(s) under local anesthesia. I understand osseointegration requires 3-4 months of healing. I have disclosed all medical history including diabetes, hypertension, and osteoporosis medications.",
      hi: "मैं अपने जबड़े में डेंटल इम्प्लांट सर्जरी की अनुमति देता/देती हूँ। मुझे ज्ञात है कि इम्प्लांट को जबड़े की हड्डी में सेट होने में 3-4 महीने का समय लगता है। मैंने अपनी सभी मेडिकल हिस्ट्री की पूरी जानकारी दी है।",
      risks: [
        "Surgical swelling, minor bruising, and jaw stiffness for 48-72 hours.",
        "Need for strict oral hygiene maintenance and periodic follow-up reviews.",
        "Rare risk of implant integration failure requiring fixture replacement."
      ]
    },
    EXTRACTION: {
      title: "Tooth Extraction & Minor Oral Surgery Consent",
      en: "I authorize the extraction of the indicated tooth under local anesthesia. I agree to follow all post-operative instructions including biting firmly on the cotton gauze pack and strictly avoiding spitting, smoking, or drinking through a straw for 24 hours.",
      hi: "मैं स्थानीय एनेस्थीसिया के तहत दांत निकालने की अनुमति देता/देती हूँ। मैं सभी सावधानियों जैसे 24 घंटे थूकना नहीं और गर्म भोजन से परहेज का पालन करने के लिए सहमत हूँ।",
      risks: [
        "Minor bleeding, swelling, and temporary difficulty in opening mouth.",
        "Risk of dry socket if post-extraction precautions (no spitting) are violated.",
        "Need to adhere to prescribed antibiotic and painkiller schedule."
      ]
    }
  };

  const currentTemplate = templates[treatmentType];

  useEffect(() => {
    setAcknowledgedRisks(new Array(currentTemplate.risks.length).fill(true));
  }, [treatmentType]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#C9A227";
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setIsSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsSigned(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div
      data-lenis-prevent
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overscroll-contain"
    >
      <div
        data-lenis-prevent
        className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-3xl p-4 sm:p-6 shadow-2xl space-y-4 overscroll-contain max-h-[92vh] overflow-y-auto flex flex-col justify-between"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                Medico-Legal Clinical Consent Form
              </h3>
              <p className="text-xs text-slate-400">
                Patient: <strong className="text-white">{patient?.name || "Aarav Sharma"}</strong> • Dr. Shreya Nidhi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === "EN" ? "HI" : "EN")}
              className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs text-amber-300 font-bold flex items-center gap-1.5 hover:bg-slate-700"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{language === "EN" ? "हिंदी (Hindi)" : "English"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Treatment Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: "RCT", label: "Root Canal Therapy (RCT)" },
            { id: "IMPLANT_SURGERY", label: "Dental Implant Placement" },
            { id: "EXTRACTION", label: "Tooth Extraction / Surgery" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setTreatmentType(tab.id as any);
                clearSignature();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                treatmentType === tab.id
                  ? "bg-amber-500 text-slate-950 shadow"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body Document Preview */}
        <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 text-xs space-y-4 text-slate-300">
          <div className="border-b border-slate-800 pb-2 flex justify-between items-center text-slate-400 text-[11px]">
            <span>Amulyam Dental Studio, Awadhpuri Bhopal</span>
            <span>Date: {new Date().toLocaleDateString("en-IN")}</span>
          </div>

          <h4 className="text-sm font-bold text-white">{currentTemplate.title}</h4>

          <p className="leading-relaxed text-slate-200">
            {language === "EN" ? currentTemplate.en : currentTemplate.hi}
          </p>

          {/* Risk Factors Checklist */}
          <div className="space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
              Informed Risk Factor Acknowledgments:
            </span>
            {currentTemplate.risks.map((risk, idx) => (
              <label key={idx} className="flex items-start gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={acknowledgedRisks[idx] ?? true}
                  onChange={(e) => {
                    const next = [...acknowledgedRisks];
                    next[idx] = e.target.checked;
                    setAcknowledgedRisks(next);
                  }}
                  className="mt-0.5 accent-amber-500 rounded"
                />
                <span className="text-xs">{risk}</span>
              </label>
            ))}
          </div>

          {/* Interactive Digital Signature Pad */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-amber-400" /> Patient Digital Signature (Sign with finger / mouse) *
              </span>
              <button
                type="button"
                onClick={clearSignature}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Clear Signature
              </button>
            </div>

            <div className="border-2 border-dashed border-amber-500/40 rounded-xl bg-slate-900 overflow-hidden relative">
              <canvas
                ref={canvasRef}
                width={650}
                height={120}
                className="w-full h-28 touch-none cursor-crosshair block"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              {!isSigned && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-500 text-xs">
                  Draw patient signature here with finger or mouse
                </div>
              )}
            </div>
          </div>

          {/* Doctor Verification Stamp */}
          <div className="pt-2 flex justify-between items-center text-[11px] text-slate-400 border-t border-slate-800">
            <div>
              <span className="font-bold text-white block">Dr. Shreya Nidhi (BDS, MDS)</span>
              <span>Lead Dental Surgeon • Reg: MP-DC-2018-XXXX</span>
            </div>
            <div className="text-right">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Medico-Legal Verified
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Form</span>
          </button>

          <button
            type="button"
            disabled={!isSigned}
            onClick={() => {
              alert("Consent form signed and cryptographically attached to patient profile!");
              onClose();
            }}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl shadow-lg transition flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Accept &amp; Save Signed Consent</span>
          </button>
        </div>
      </div>
    </div>
  );
}
