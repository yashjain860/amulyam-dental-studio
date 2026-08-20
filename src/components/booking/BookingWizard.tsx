"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Check,
  Layers,
} from "lucide-react";
import confetti from "canvas-confetti";
import { CLINIC_SERVICES, TIME_SLOTS, LEAD_DOCTOR } from "@/lib/constants";
import { Booking } from "@/lib/types";

interface BookingWizardProps {
  initialServiceId?: string;
}

export default function BookingWizard({ initialServiceId }: BookingWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse query parameters
  const queryService = searchParams.get("service");
  const queryServices = searchParams.get("services");
  const queryTotal = searchParams.get("total");
  const querySource = searchParams.get("source");

  // Initial selection logic
  const parseInitialIds = (): string[] => {
    if (queryServices) {
      const ids = queryServices.split(",").map((s) => s.trim()).filter(Boolean);
      if (ids.length > 0) return ids;
    }
    if (queryService) return [queryService];
    if (initialServiceId) return [initialServiceId];
    return [CLINIC_SERVICES[0].id];
  };

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form State - Multi-select supported
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(parseInitialIds);

  // Sync state if URL params change
  useEffect(() => {
    if (queryServices) {
      const ids = queryServices.split(",").map((s) => s.trim()).filter(Boolean);
      if (ids.length > 0) setSelectedServiceIds(ids);
    } else if (queryService) {
      setSelectedServiceIds([queryService]);
    }
  }, [queryServices, queryService]);

  // Date State (default to tomorrow)
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [appointmentDate, setAppointmentDate] = useState<string>(tomorrowStr);
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[1]); // e.g. 10:45 AM

  // Patient Details & Auth
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [accountPassword, setAccountPassword] = useState("");
  const [createAccountChecked, setCreateAccountChecked] = useState(true);

  const [formData, setFormData] = useState({
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    age: "",
    gender: "Female",
    notes: querySource === "cost-estimator" && queryTotal ? `Pre-estimated Package (Est. Total: ₹${queryTotal})` : "",
    preferredDoctor: LEAD_DOCTOR.name,
  });

  // Check active user session to auto-fill
  useEffect(() => {
    const checkUser = async () => {
      try {
        const local = localStorage.getItem("amulyam_patient_session");
        if (local) {
          const u = JSON.parse(local);
          setCurrentUser(u);
          setFormData((prev) => ({
            ...prev,
            patientName: prev.patientName || u.name || "",
            patientEmail: prev.patientEmail || u.email || "",
            patientPhone: prev.patientPhone || u.phone || "",
          }));
          return;
        }

        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.patient) {
          setCurrentUser(data.patient);
          setFormData((prev) => ({
            ...prev,
            patientName: prev.patientName || data.patient.name || "",
            patientEmail: prev.patientEmail || data.patient.email || "",
            patientPhone: prev.patientPhone || data.patient.phone || "",
          }));
        }
      } catch (e) {}
    };

    checkUser();
  }, []);


  const selectedServices = CLINIC_SERVICES.filter((s) =>
    selectedServiceIds.includes(s.id)
  );

  const primaryService = selectedServices[0] || CLINIC_SERVICES[0];

  const categories = [
    "ALL",
    "Endodontics",
    "Implantology",
    "Cosmetic",
    "Preventive",
    "Orthodontics",
    "Surgery",
    "Prosthodontics",
    "Diagnostic",
  ];

  const filteredServices =
    selectedCategory === "ALL"
      ? CLINIC_SERVICES
      : CLINIC_SERVICES.filter((s) => s.category === selectedCategory);

  // Toggle single/multi-selection
  const toggleService = (id: string) => {
    if (selectedServiceIds.includes(id)) {
      if (selectedServiceIds.length > 1) {
        setSelectedServiceIds(selectedServiceIds.filter((item) => item !== id));
      }
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  // Generate next 14 available dates
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() + 86400000 * (i + 1));
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const monthName = d.toLocaleDateString("en-US", { month: "short" });
    const dayNum = d.getDate();
    const iso = d.toISOString().split("T")[0];
    return { iso, dayName, monthName, dayNum, isSunday: d.getDay() === 0 };
  });

  const handleNext = () => {
    setError("");
    if (step === 1) {
      if (selectedServiceIds.length === 0) {
        setError("Please select at least one dental treatment to proceed.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!appointmentDate || !selectedSlot) {
        setError("Please pick your preferred date and time slot.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!formData.patientName.trim()) {
        setError("Please provide your full name.");
        return;
      }
      if (!formData.patientPhone.trim() || formData.patientPhone.length < 10) {
        setError("Please provide a valid 10-digit phone number.");
        return;
      }
      if (!formData.patientEmail.trim() || !formData.patientEmail.includes("@")) {
        setError("Please provide a valid email address for confirmation pass.");
        return;
      }
      setStep(4);
    }
  };

  const handleBack = () => {
    setError("");
    if (step > 1) setStep(step - 1);
  };

  const combinedServiceName =
    selectedServices.length === 1
      ? selectedServices[0].title
      : selectedServices.map((s) => s.title).join(" + ");

  const combinedCategory =
    selectedServices.length === 1
      ? selectedServices[0].category
      : "Custom Dental Treatment Package";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        patientName: formData.patientName,
        patientPhone: formData.patientPhone,
        patientEmail: formData.patientEmail,
        age: formData.age || undefined,
        gender: formData.gender,
        serviceId: selectedServices.map((s) => s.id).join(","),
        serviceName: combinedServiceName,
        category: combinedCategory,
        preferredDoctor: formData.preferredDoctor,
        appointmentDate,
        timeSlot: selectedSlot,
        notes: formData.notes,
        password: accountPassword || undefined,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create booking.");
      }

      if (data.user) {
        localStorage.setItem("amulyam_patient_session", JSON.stringify(data.user));
      }


      // Confetti celebrate
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#C9A227", "#DDB83C", "#1C1A17", "#4ADE80"],
        });
      } catch (e) {}

      // Redirect to digital pass
      router.push(`/booking-confirmation/${data.booking.refNumber}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#181715] rounded-3xl border border-[#C9A227]/25 shadow-2xl p-6 sm:p-10 max-w-4xl mx-auto relative overflow-hidden">
      {/* Pre-Selected Package Notification Banner */}
      {selectedServices.length > 1 && (
        <div className="mb-6 p-4 rounded-2xl bg-[#C9A227]/15 border border-[#C9A227] flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C9A227] text-white flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C9A227] block">
                Active Custom Treatment Plan ({selectedServices.length} procedures selected)
              </span>
              <p className="text-xs font-semibold text-[#1A1A1A] dark:text-white line-clamp-1">
                {selectedServices.map((s) => s.title).join(" • ")}
              </p>
            </div>
          </div>
          {queryTotal && (
            <span className="text-xs font-black text-[#C9A227] bg-white dark:bg-[#121110] px-3 py-1.5 rounded-xl border border-[#C9A227]/30 flex-shrink-0">
              Est. ₹{Number(queryTotal).toLocaleString("en-IN")}
            </span>
          )}
        </div>
      )}

      {/* Progress Bar & Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#A39E93] mb-3">
          <span className={step >= 1 ? "text-[#C9A227]" : ""}>
            1. Treatment {selectedServices.length > 1 ? `(${selectedServices.length})` : ""}
          </span>
          <span className={step >= 2 ? "text-[#C9A227]" : ""}>2. Date &amp; Time</span>
          <span className={step >= 3 ? "text-[#C9A227]" : ""}>3. Patient Info</span>
          <span className={step >= 4 ? "text-[#C9A227]" : ""}>4. Confirmation</span>
        </div>

        {/* Step Progress Line */}
        <div className="h-2 w-full bg-[#FAF8F5] dark:bg-[#26231E] rounded-full overflow-hidden border border-[#C9A227]/20">
          <div
            className="h-full bg-gradient-to-r from-[#C9A227] to-[#DDB83C] transition-all duration-500 rounded-full"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 flex items-center gap-3 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: SELECT TREATMENT */}
      {step === 1 && (
        <div>
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#F8F6F2]">
                Select Your Dental Treatment
              </h2>
              <p className="text-sm text-[#7A7265] dark:text-[#A39E93] mt-1">
                You can select one or multiple treatments for your comprehensive session.
              </p>
            </div>
            {selectedServiceIds.length > 1 && (
              <button
                type="button"
                onClick={() => setSelectedServiceIds([selectedServiceIds[0]])}
                className="text-xs text-[#888] hover:text-[#C9A227] underline"
              >
                Reset to single selection
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#C9A227] text-white shadow-md"
                    : "bg-[#FAF8F5] dark:bg-[#26231E] text-[#555] dark:text-[#AAA] hover:bg-[#C9A227]/15 hover:text-[#C9A227]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-1">
            {filteredServices.map((service) => {
              const isSelected = selectedServiceIds.includes(service.id);
              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative ${
                    isSelected
                      ? "border-[#C9A227] bg-[#C9A227]/10 dark:bg-[#C9A227]/15 shadow-md transform scale-[1.01]"
                      : "border-[#E5DFD5] dark:border-[#332F28] hover:border-[#C9A227]/50 bg-[#FAF8F5]/50 dark:bg-[#1C1A17]"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center ${
                          isSelected ? "bg-[#C9A227] text-white" : "border border-[#888]"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-[#C9A227] bg-[#C9A227]/10 px-2.5 py-0.5 rounded-full">
                        {service.category}
                      </span>
                    </div>

                    {service.isPopular && (
                      <span className="text-[10px] text-white bg-[#C9A227] px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
                        <Sparkles className="w-3 h-3" /> Popular
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm sm:text-base text-[#1A1A1A] dark:text-[#F8F6F2] mb-1">
                    {service.title}
                  </h3>
                  <p className="text-xs text-[#7A7265] dark:text-[#A39E93] line-clamp-2 mb-3">
                    {service.description}
                  </p>
                  <div className="flex justify-between items-center text-xs text-[#8A8175] pt-2 border-t border-[#E8E0D2]/50 dark:border-[#332F28]">
                    <span>⏱ {service.duration}</span>
                    <span className="font-semibold text-[#C9A227]">{service.priceEstimate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: SELECT DATE & TIME SLOT */}
      {step === 2 && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#F8F6F2]">
              Choose Date &amp; Time Slot
            </h2>
            <p className="text-sm text-[#7A7265] dark:text-[#A39E93] mt-1">
              Select your convenient schedule. Clinic operates Monday to Saturday: 10:00 AM – 8:00 PM.
            </p>
          </div>

          {/* Date Selector Carousel */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#A39E93] mb-3">
              Available Dates (Next 14 Days)
            </label>
            <div className="flex gap-2.5 overflow-x-auto pb-3">
              {availableDates.map((item) => {
                const isSelected = appointmentDate === item.iso;
                return (
                  <button
                    key={item.iso}
                    type="button"
                    onClick={() => setAppointmentDate(item.iso)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center w-16 sm:w-20 py-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#C9A227] bg-[#C9A227] text-white shadow-lg scale-105"
                        : "border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#1C1A17] text-[#1A1A1A] dark:text-[#F8F6F2] hover:border-[#C9A227]"
                    }`}
                  >
                    <span className="text-[11px] font-medium opacity-80">{item.dayName}</span>
                    <span className="text-lg font-bold my-0.5">{item.dayNum}</span>
                    <span className="text-[10px] uppercase tracking-wider">{item.monthName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#A39E93] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Available Consultation Slots</span>
              </label>
              <span className="text-xs text-[#C9A227] font-medium">Selected Date: {appointmentDate}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? "border-[#C9A227] bg-[#C9A227] text-white shadow-md"
                        : "border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#1C1A17] text-[#333] dark:text-[#DDD] hover:border-[#C9A227] hover:text-[#C9A227]"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{slot}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: PATIENT INFORMATION & AUTH */}
      {step === 3 && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#F8F6F2]">
              Patient Contact &amp; Care Details
            </h2>
            <p className="text-sm text-[#7A7265] dark:text-[#A39E93] mt-1">
              We will send your digital appointment pass and preparation guidelines to these details.
            </p>
          </div>

          {/* User Session or Google One-Tap */}
          {currentUser ? (
            <div className="mb-6 p-4 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                  {currentUser.name ? currentUser.name.charAt(0) : "P"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-green-900 dark:text-green-200">
                      Booking with Verified Account: {currentUser.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-green-700 dark:text-green-400">
                    {currentUser.email}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#C9A227]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-[#666] dark:text-[#AAA] text-center sm:text-left">
                <span className="font-bold text-[#1A1A1A] dark:text-white block">Already have a Care Pass or Google Account?</span>
                <span>Sign in for 1-click auto-fill and instant booking tracking.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  window.location.href = `/api/auth/google?role=patient&redirectUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`;
                }}
                className="px-4 py-2 rounded-xl bg-white dark:bg-[#121110] border border-[#E5DFD5] dark:border-[#332F28] hover:bg-[#FAF8F5] text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A39E93] mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#A39E93] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#1C1A17] text-sm focus:outline-none focus:border-[#C9A227]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A39E93] mb-1.5">
                  Phone Number (WhatsApp Active) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#A39E93] absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98XXX XXXXX"
                    value={formData.patientPhone}
                    onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#1C1A17] text-sm focus:outline-none focus:border-[#C9A227]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A39E93] mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A39E93] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={formData.patientEmail}
                    onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#1C1A17] text-sm focus:outline-none focus:border-[#C9A227]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A39E93] mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  min={3}
                  max={110}
                  placeholder="e.g. 28"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#1C1A17] text-sm focus:outline-none focus:border-[#C9A227]"
                />
              </div>
            </div>

            {!currentUser && (
              <div className="p-4 bg-[#FAF8F5] dark:bg-[#1C1A17] rounded-2xl border border-[#E5DFD5] dark:border-[#332F28] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#1A1A1A] dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
                    <span>Create Secure Account Password (Recommended)</span>
                  </label>
                  <span className="text-[10px] text-[#C9A227] font-bold">Protects Your Booking Privacy</span>
                </div>
                <input
                  type="password"
                  placeholder="Create a password (min 6 characters) to manage visits & care pass"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-white dark:bg-[#121110] text-xs focus:outline-none focus:border-[#C9A227]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A39E93] mb-1.5">
                Dental Concerns / Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Mention any tooth pain, sensitivity, previous treatments, or specific questions for Dr. Shreya..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#1C1A17] text-sm focus:outline-none focus:border-[#C9A227]"
              />
            </div>
          </div>
        </div>
      )}


      {/* STEP 4: REVIEW & CONFIRM */}
      {step === 4 && (
        <div>
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#F8F6F2]">
              Review &amp; Instant Confirmation
            </h2>
            <p className="text-sm text-[#7A7265] dark:text-[#A39E93] mt-1">
              Please double check your appointment summary before confirming.
            </p>
          </div>

          {/* Summary Card */}
          <div className="bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#C9A227]/30 rounded-2xl p-6 mb-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#E8E0D2] dark:border-[#332F28]">
              <span className="text-xs uppercase tracking-wider text-[#7A7265] dark:text-[#A39E93] font-semibold">
                Treatment Plan ({selectedServices.length} Selected)
              </span>
              <span className="font-bold text-[#1A1A1A] dark:text-white text-sm sm:text-base text-right">
                {combinedServiceName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-[#E8E0D2] dark:border-[#332F28] text-sm">
              <div>
                <span className="text-xs text-[#7A7265] dark:text-[#A39E93] block">Date &amp; Time</span>
                <span className="font-semibold text-[#C9A227]">
                  {appointmentDate} at {selectedSlot}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#7A7265] dark:text-[#A39E93] block">Doctor</span>
                <span className="font-semibold text-[#1A1A1A] dark:text-white">
                  {LEAD_DOCTOR.name} ({LEAD_DOCTOR.qualifications})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-[#E8E0D2] dark:border-[#332F28] text-sm">
              <div>
                <span className="text-xs text-[#7A7265] dark:text-[#A39E93] block">Patient Name</span>
                <span className="font-semibold text-[#1A1A1A] dark:text-white">
                  {formData.patientName} {formData.age ? `(${formData.age} yrs)` : ""}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#7A7265] dark:text-[#A39E93] block">Contact</span>
                <span className="font-semibold text-[#1A1A1A] dark:text-white">
                  {formData.patientPhone} | {formData.patientEmail}
                </span>
              </div>
            </div>

            {formData.notes && (
              <div className="text-xs">
                <span className="text-[#7A7265] dark:text-[#A39E93] block mb-1">Notes / Plan Reference:</span>
                <p className="italic text-[#444] dark:text-[#CCC] bg-white dark:bg-[#121110] p-3 rounded-lg border border-[#E5DFD5] dark:border-[#332F28]">
                  "{formData.notes}"
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 p-4 bg-[#C9A227]/10 rounded-xl text-xs text-[#8A6D14] dark:text-[#DDB83C] mb-6">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <span>
              Instant confirmation will be sent to <strong>{formData.patientEmail}</strong>. Free cancellation up to 2 hours before your slot.
            </span>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-[#E8E0D2] dark:border-[#332F28] mt-6">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-2.5 rounded-xl border border-[#C9A227]/40 text-[#C9A227] hover:bg-[#C9A227]/10 font-semibold text-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-7 py-3 rounded-xl bg-[#C9A227] hover:bg-[#DDB83C] text-white font-bold text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Continue to Date &amp; Time</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#C9A227] to-[#DDB83C] hover:from-[#DDB83C] hover:to-[#C9A227] text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Confirming Booking...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm Appointment</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
