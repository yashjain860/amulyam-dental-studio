"use client";

import React, { useState, useEffect } from "react";
import { UserAccount } from "@/lib/types";
import {
  User,
  Phone,
  Mail,
  HeartPulse,
  MapPin,
  CheckCircle2,
  X,
  AlertTriangle,
} from "lucide-react";

interface PatientEditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: any;
  onUpdated: (updatedUser: any) => void;
}

export default function PatientEditProfileModal({
  isOpen,
  onClose,
  patient,
  onUpdated,
}: PatientEditProfileModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState("Male");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [medicalHistory, setMedicalHistory] = useState("None");
  const [allergies, setAllergies] = useState("None");
  const [address, setAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (patient) {
      setName(patient.name || "");
      setPhone(patient.phone || "");
      setAge(patient.age || "");
      setGender(patient.gender || "Male");
      setBloodGroup(patient.bloodGroup || "O+");
      setMedicalHistory(patient.medicalHistory || "None");
      setAllergies(patient.allergies || "None");
      setAddress(patient.address || "");
      setEmergencyContact(patient.emergencyContact || "");
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        id: patient.id || patient.email,
        name: name.trim(),
        phone: phone.trim(),
        age: age ? Number(age) : undefined,
        gender,
        bloodGroup,
        medicalHistory,
        allergies,
        address,
        emergencyContact,
      };

      const res = await fetch("/api/admin/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess("Profile updated successfully!");
        // Update local session storage
        const updatedObj = { ...patient, ...payload };
        localStorage.setItem("amulyam_patient_session", JSON.stringify(updatedObj));
        onUpdated(updatedObj);
        setTimeout(() => {
          setSuccess("");
          onClose();
        }, 1200);
      } else {
        setError(data.error || "Failed to update profile.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      data-lenis-prevent
      onWheel={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto overscroll-contain"
    >
      <div
        data-lenis-prevent
        className="bg-white dark:bg-[#181715] border border-[#C9A227]/40 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5DFD5] dark:border-[#332F28] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C9A227]/15 text-[#C9A227] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1A1A1A] dark:text-white">Edit My Health Profile</h3>
              <p className="text-xs text-[#888]">Keep your contact and dental medical history up to date</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSave}
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          className="p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm overscroll-contain"
        >
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#666] dark:text-[#AAA] mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#121110] text-xs focus:outline-none focus:border-[#C9A227]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#666] dark:text-[#AAA] mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#121110] text-xs focus:outline-none focus:border-[#C9A227]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#666] dark:text-[#AAA] mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : "")}
                className="w-full px-3 py-2 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#121110] text-xs focus:outline-none focus:border-[#C9A227]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#666] dark:text-[#AAA] mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#121110] text-xs focus:outline-none focus:border-[#C9A227]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#666] dark:text-[#AAA] mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#121110] text-xs font-bold focus:outline-none focus:border-[#C9A227]"
              >
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#666] dark:text-[#AAA] mb-1">Emergency Contact</label>
              <input
                type="text"
                placeholder="Name &amp; Phone"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#121110] text-xs focus:outline-none focus:border-[#C9A227]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#666] dark:text-[#AAA] mb-1">Address in Bhopal</label>
            <input
              type="text"
              placeholder="e.g. Awadhpuri, Bhopal"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#121110] text-xs focus:outline-none focus:border-[#C9A227]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#666] dark:text-[#AAA] mb-1">
                Medical History / Conditions
              </label>
              <input
                type="text"
                placeholder="e.g. Diabetes, Asthma (or None)"
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#121110] text-xs focus:outline-none focus:border-[#C9A227]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-600 dark:text-rose-400 mb-1">
                Known Drug Allergies
              </label>
              <input
                type="text"
                placeholder="e.g. Penicillin (or None)"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-[#FAF8F5] dark:bg-[#121110] text-xs text-rose-700 dark:text-rose-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5DFD5] dark:border-[#332F28] flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#C9A227] hover:bg-[#DDB83C] text-black font-bold text-xs shadow-md disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save My Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
