"use client";

import React, { useState, useEffect } from "react";
import { UserAccount } from "@/lib/types";
import {
  User,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  HeartPulse,
  MapPin,
  FileText,
  CheckCircle2,
  X,
  Plus,
  ShieldCheck,
} from "lucide-react";

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: UserAccount | null;
  onSaved: (patient: UserAccount) => void;
}

export default function PatientProfileModal({
  isOpen,
  onClose,
  patient,
  onSaved,
}: PatientProfileModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("Male");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [medicalHistory, setMedicalHistory] = useState("None");
  const [allergies, setAllergies] = useState("None");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [source, setSource] = useState<"WEBSITE" | "WALK_IN" | "PHONE" | "REFERRAL">("WALK_IN");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (patient) {
      setName(patient.name || "");
      setPhone(patient.phone || "");
      setEmail(patient.email || "");
      setAge(patient.age || "");
      setGender(patient.gender || "Male");
      setBloodGroup(patient.bloodGroup || "O+");
      setMedicalHistory(patient.medicalHistory || "None");
      setAllergies(patient.allergies || "None");
      setAddress(patient.address || "");
      setEmergencyContact(patient.emergencyContact || "");
      setSource(patient.source || "WALK_IN");
      setNotes(patient.notes || "");
    } else {
      setName("");
      setPhone("");
      setEmail("");
      setAge("");
      setGender("Male");
      setBloodGroup("O+");
      setMedicalHistory("None");
      setAllergies("None");
      setAddress("");
      setEmergencyContact("");
      setSource("WALK_IN");
      setNotes("");
    }
  }, [patient, isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Patient name is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (patient?.id) {
        // Edit existing patient profile
        const res = await fetch("/api/admin/patients", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: patient.id,
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            age: age ? Number(age) : undefined,
            gender,
            bloodGroup,
            medicalHistory,
            allergies,
            address,
            emergencyContact,
            source,
            notes,
          }),
        });
        const data = await res.json();
        if (data.success) {
          onSaved(data.patient);
          onClose();
        } else {
          setError(data.error || "Failed to update profile.");
        }
      } else {
        // Create new offline/walk-in patient profile
        const res = await fetch("/api/admin/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            age: age ? Number(age) : undefined,
            gender,
            bloodGroup,
            medicalHistory,
            allergies,
            address,
            emergencyContact,
            source,
            notes,
          }),
        });
        const data = await res.json();
        if (data.success) {
          onSaved(data.patient);
          onClose();
        } else {
          setError(data.error || "Failed to create patient profile.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      data-lenis-prevent
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto overscroll-contain"
    >
      <div
        data-lenis-prevent
        className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {patient ? `Edit Medical Profile: ${patient.name}` : "Register Offline / Walk-In Patient Profile"}
              </h3>
              <p className="text-xs text-amber-200/60 leading-tight">
                Master Patient Index (MPI), Clinical History &amp; Demographics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit}
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          className="p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm overscroll-contain"
        >
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Demographics */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1">
              <User className="w-3.5 h-3.5" /> 1. Patient Demographics &amp; Contact
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Chandra Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Mobile / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98260 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="e.g. 35"
                    value={age}
                    onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : "")}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Alerts & Medical History */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1">
              <HeartPulse className="w-3.5 h-3.5" /> 2. Medical Alerts, Conditions &amp; Allergies
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white focus:outline-none font-bold"
                >
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Patient Origin Source</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="WALK_IN">🚶 Walk-In / Frontdesk</option>
                  <option value="PHONE">📞 Phone Call / Inquiry</option>
                  <option value="WEBSITE">🌐 Website Online Booking</option>
                  <option value="REFERRAL">🤝 Doctor / Patient Referral</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Systemic Medical History (e.g. Diabetes, BP, Cardiac)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Type 2 Diabetes, Hypertension on medication"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Drug &amp; Material Allergies (Crucial for Local Anaesthesia &amp; Antibiotics)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa drugs, Latex (or None)"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full bg-slate-950 border border-rose-500/40 focus:border-rose-400 rounded-xl p-2.5 text-xs text-rose-300 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Address & Emergency Contact */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1">
              <MapPin className="w-3.5 h-3.5" /> 3. Address &amp; Emergency Contact
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Residential Address (Bhopal)</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 302, BDA Colony, Awadhpuri, Bhopal"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Emergency Contact &amp; Relation</label>
                <input
                  type="text"
                  placeholder="e.g. Sunita Sharma (Spouse) +91 98260 99999"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1">Internal Doctor / Clinic Notes</label>
              <textarea
                rows={2}
                placeholder="e.g. Prefers evening appointments, anxious about dental drills, needs bite guard"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{saving ? "Saving..." : patient ? "Save Profile Changes" : "Register Patient"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
