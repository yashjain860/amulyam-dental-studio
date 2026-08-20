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

  // Date State (default to tomorrow)
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [appointmentDate, setAppointmentDate] = useState<string>(tomorrowStr);
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[1]); // e.g. 10:45 AM
  const [unavailableSlots, setUnavailableSlots] = useState<string[]>([]);
  const [isDateClosed, setIsDateClosed] = useState(false);
  const [closedReason, setClosedReason] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Patient Details & Auth
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [accountPassword, setAccountPassword] = useState("");

  const [formData, setFormData] = useState({
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    age: "",
    gender: "Female",
    notes: querySource === "cost-estimator" && queryTotal ? `Pre-estimated Package (Est. Total: ₹${queryTotal})` : "",
    preferredDoctor: LEAD_DOCTOR.name,
  });

  // Fetch real-time booked & blocked slots for selected appointment date
  useEffect(() => {
    let isCancelled = false;
    const fetchSlotAvailability = async () => {
      setLoadingSlots(true);
      try {
        const res = await fetch(`/api/admin/slots?date=${appointmentDate}`);
        const data = await res.json();
        if (data.success && !isCancelled) {
          const booked: string[] = data.bookedSlots || [];
          const override = (data.overrides || []).find((o: any) => o.date === appointmentDate);

          if (override?.isClosedFullDay) {
            setIsDateClosed(true);
            setClosedReason(override.reason || "Clinic is closed on this date.");
            setUnavailableSlots(TIME_SLOTS);
          } else {
            setIsDateClosed(false);
            setClosedReason("");
            const blocked: string[] = override?.blockedSlots || [];
            const allUnavailable = Array.from(new Set([...booked, ...blocked]));
            setUnavailableSlots(allUnavailable);

            // If current selected slot is booked, auto-select first available slot
            if (allUnavailable.includes(selectedSlot)) {
              const firstFree = TIME_SLOTS.find((s) => !allUnavailable.includes(s));
              if (firstFree) setSelectedSlot(firstFree);
            }
          }
        }
      } catch (e) {
      } finally {
        if (!isCancelled) setLoadingSlots(false);
      }
    };

    fetchSlotAvailability();
    return () => {
      isCancelled = true;
    };
  }, [appointmentDate]);

  // 1. Restore draft booking progress from sessionStorage on mount (especially after Google OAuth return)
  useEffect(() => {
    try {
      const savedDraft = sessionStorage.getItem("amulyam_booking_draft");
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.selectedServiceIds && draft.selectedServiceIds.length > 0 && !queryServices && !queryService) {
          setSelectedServiceIds(draft.selectedServiceIds);
        }
        if (draft.appointmentDate) setAppointmentDate(draft.appointmentDate);
        if (draft.selectedSlot) setSelectedSlot(draft.selectedSlot);
        if (draft.formData) {
          setFormData((prev) => ({
            ...prev,
            ...draft.formData,
          }));
        }
        if (draft.step && draft.step >= 1 && draft.step <= 4) {
          setStep(draft.step);
        }
      }
    } catch (e) {}
  }, [queryServices, queryService]);

  // 2. Sync state if URL params change explicitly
  useEffect(() => {
    if (queryServices) {
      const ids = queryServices.split(",").map((s) => s.trim()).filter(Boolean);
      if (ids.length > 0) setSelectedServiceIds(ids);
    } else if (queryService) {
      setSelectedServiceIds([queryService]);
    }
  }, [queryServices, queryService]);

  // 3. Auto-save booking progress draft to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(
        "amulyam_booking_draft",
        JSON.stringify({
          step,
          selectedServiceIds,
          appointmentDate,
          selectedSlot,
          formData,
        })
      );
    } catch (e) {}
  }, [step, selectedServiceIds, appointmentDate, selectedSlot, formData]);

  // Check active user session to auto-fill
  useEffect(() => {
    const checkUser = async () => {
      try {
        let activeUser = null;
        const local = localStorage.getItem("amulyam_patient_session");
        if (local) {
          activeUser = JSON.parse(local);
        } else {
          const res = await fetch("/api/auth/session");
          const data = await res.json();
          if (data.patient) {
            activeUser = data.patient;
          }
        }

        if (activeUser) {
          setCurrentUser(activeUser);
          setFormData((prev) => ({
            ...prev,
            patientName: activeUser.name || prev.patientName || "",
            patientEmail: activeUser.email || prev.patientEmail || "",
            patientPhone: activeUser.phone || prev.patientPhone || "",
          }));
        }
      } catch (e) {}
    };

    checkUser();
  }, []);

  const selectedServices = CLINIC_SERVICES.filter((s) =>
    selectedServiceIds.includes(s.id)
  );

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
    const fullReadable = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    return { iso, dayName, monthName, dayNum, fullReadable, isSunday: d.getDay() === 0 };
  });

  const selectedDateObj = availableDates.find((d) => d.iso === appointmentDate);
  const formattedSelectedDate = selectedDateObj ? selectedDateObj.fullReadable : appointmentDate;

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

      // Clear draft storage
      try {
        sessionStorage.removeItem("amulyam_booking_draft");
      } catch (e) {}

      // Redirect to digital pass
      router.push(`/booking-confirmation/${data.booking.refNumber}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const stepTitles = [
    `Treatment ${selectedServices.length > 1 ? `(${selectedServices.length})` : ""}`,
    "Date & Time",
    "Patient Info",
    "Confirmation",
  ];

  return (
    <div className="bg-white dark:bg-[#181715] rounded-3xl border border-[#C9A227]/25 shadow-2xl p-4 sm:p-8 md:p-10 max-w-4xl mx-auto relative overflow-hidden">
      {/* Pre-Selected Package Notification Banner */}
      {selectedServices.length > 1 && (
        <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-[#C9A227]/15 border border-[#C9A227] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#C9A227] text-white flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#C9A227] block">
                Active Custom Treatment Plan ({selectedServices.length} procedures selected)
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#1A1A1A] dark:text-white line-clamp-1">
                {selectedServices.map((s) => s.title).join(" • ")}
              </p>
            </div>
          </div>
          {queryTotal && (
            <span className="self-end sm:self-auto text-xs font-black text-[#C9A227] bg-white dark:bg-[#121110] px-3 py-1.5 rounded-xl border border-[#C9A227]/30 flex-shrink-0">
              Est. ₹{Number(queryTotal).toLocaleString("en-IN")}
            </span>
          )}
        </div>
      )}

      {/* Progress Bar & Responsive Header */}
      <div className="mb-6 sm:mb-8">
        {/* Desktop Step labels */}
        <div className="hidden sm:grid grid-cols-4 gap-2 text-xs font-semibold uppercase tracking-wider text-[#A39E93] mb-3">
          {stepTitles.map((title, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1.5 ${
                step === idx + 1
                  ? "text-[#C9A227] font-bold"
                  : step > idx + 1
                  ? "text-[#1A1A1A] dark:text-white"
                  : "text-[#A39E93]"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === idx + 1
                    ? "bg-[#C9A227] text-white"
                    : step > idx + 1
                    ? "bg-green-600 text-white"
                    : "bg-[#E5DFD5] dark:bg-[#332F28] text-[#777]"
                }`}
              >
                {step > idx + 1 ? "✓" : idx + 1}
              </span>
              <span>{title}</span>
            </div>
          ))}
        </div>

        {/* Mobile Header indicator */}
        <div className="flex sm:hidden items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#C9A227] text-white font-bold text-xs flex items-center justify-center">
              {step}
            </span>
            <span className="text-xs font-bold text-[#1A1A1A] dark:text-white uppercase tracking-wider">
              {stepTitles[step - 1]}
            </span>
          </div>
          <span className="text-[11px] font-semibold text-[#888]">Step {step} of 4</span>
        </div>

        {/* Step Progress Line */}
        <div className="h-1.5 sm:h-2 w-full bg-[#FAF8F5] dark:bg-[#26231E] rounded-full overflow-hidden border border-[#C9A227]/20">
          <div
            className="h-full bg-gradient-to-r from-[#C9A227] to-[#DDB83C] transition-all duration-500 rounded-full"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3.5 sm:p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 flex items-center gap-3 text-red-700 dark:text-red-300 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: SELECT TREATMENT */}
      {step === 1 && (
        <div>
          <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#F8F6F2]">
                Select Your Dental Treatment
              </h2>
              <p className="text-xs sm:text-sm text-[#7A7265] dark:text-[#A39E93] mt-1">
                You can select one or multiple treatments for your session.
              </p>
            </div>
            {selectedServiceIds.length > 1 && (
              <button
                type="button"
                onClick={() => setSelectedServiceIds([selectedServiceIds[0]])}
                className="text-xs text-[#888] hover:text-[#C9A227] underline cursor-pointer"
              >
                Reset to single selection
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2.5 mb-5 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[380px] sm:max-h-[420px] overflow-y-auto pr-1">
            {filteredServices.map((service) => {
              const isSelected = selectedServiceIds.includes(service.id);
              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative ${
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
                      <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold text-[#C9A227] bg-[#C9A227]/10 px-2 py-0.5 rounded-full">
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
                  <p className="text-xs text-[#7A7265] dark:text-[#A39E93] line-clamp-2 mb-2.5">
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
          <div className="mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#F8F6F2]">
              Choose Date &amp; Time Slot
            </h2>
            <p className="text-xs sm:text-sm text-[#7A7265] dark:text-[#A39E93] mt-1">
              Select your convenient schedule. Clinic operates Monday to Saturday: 10:00 AM – 8:00 PM.
            </p>
          </div>

          {/* Date Selector Carousel */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#A39E93] mb-2.5">
              Available Dates (Next 14 Days)
            </label>
            <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar snap-x">
              {availableDates.map((item) => {
                const isSelected = appointmentDate === item.iso;
                return (
                  <button
                    key={item.iso}
                    type="button"
                    onClick={() => setAppointmentDate(item.iso)}
                    className={`flex-shrink-0 snap-start flex flex-col items-center justify-center min-w-[64px] sm:min-w-[76px] py-2.5 sm:py-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#C9A227] bg-[#C9A227] text-white shadow-lg scale-105"
                        : "border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#1C1A17] text-[#1A1A1A] dark:text-[#F8F6F2] hover:border-[#C9A227]"
                    }`}
                  >
                    <span className="text-[10px] sm:text-[11px] font-medium opacity-80">{item.dayName}</span>
                    <span className="text-base sm:text-lg font-black my-0.5">{item.dayNum}</span>
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wider">{item.monthName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots Grid */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#A39E93] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Available Consultation Slots</span>
              </label>
              <span className="text-xs text-[#C9A227] font-semibold">
                {formattedSelectedDate}
              </span>
            </div>

            {isDateClosed ? (
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
                <span className="text-sm font-bold text-amber-900 dark:text-amber-200 block">
                  Clinic is closed on {formattedSelectedDate}
                </span>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  {closedReason || "Please select another date from the calendar above."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {TIME_SLOTS.map((slot) => {
                  const isBooked = unavailableSlots.includes(slot);
                  const isSelected = selectedSlot === slot && !isBooked;

                  if (isBooked) {
                    return (
                      <div
                        key={slot}
                        className="py-2.5 sm:py-3 px-3 rounded-xl border border-[#E5DFD5]/40 dark:border-[#2A2620] bg-gray-100/60 dark:bg-[#151412] text-gray-400 dark:text-gray-600 text-xs sm:text-sm font-medium flex items-center justify-between opacity-50 cursor-not-allowed select-none"
                      >
                        <div className="flex items-center gap-1 line-through">
                          <Clock className="w-3.5 h-3.5 opacity-40" />
                          <span>{slot}</span>
                        </div>
                        <span className="text-[9px] uppercase tracking-wider font-bold text-red-500/80 bg-red-100/60 dark:bg-red-950/50 px-1.5 py-0.5 rounded">
                          Booked
                        </span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 sm:py-3 px-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "border-[#C9A227] bg-[#C9A227] text-white shadow-md scale-102"
                          : "border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#1C1A17] text-[#333] dark:text-[#DDD] hover:border-[#C9A227] hover:text-[#C9A227]"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{slot}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: PATIENT INFORMATION & AUTH */}
      {step === 3 && (
        <div>
          <div className="mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#F8F6F2]">
              Patient Contact &amp; Care Details
            </h2>
            <p className="text-xs sm:text-sm text-[#7A7265] dark:text-[#A39E93] mt-1">
              We will send your digital appointment pass and preparation guidelines to these details.
            </p>
          </div>

          {/* User Session or Google One-Tap */}
          {currentUser ? (
            <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                  {currentUser.name ? currentUser.name.charAt(0) : "P"}
                </div>
                <div>
                  <span className="text-xs font-bold text-green-900 dark:text-green-200 block">
                    Verified Account: {currentUser.name}
                  </span>
                  <span className="text-[11px] text-green-700 dark:text-green-400">
                    {currentUser.email}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#C9A227]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs text-[#666] dark:text-[#AAA]">
                <span className="font-bold text-[#1A1A1A] dark:text-white block">Have a Google Account?</span>
                <span>Sign in for 1-click auto-fill &amp; instant pass tracking.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  window.location.href = `/api/auth/google?role=patient&redirectUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`;
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white dark:bg-[#121110] border border-[#E5DFD5] dark:border-[#332F28] hover:bg-[#FAF8F5] text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer whitespace-nowrap"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A39E93] mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#A39E93] absolute left-3.5 top-3" />
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
                  Mobile Number (WhatsApp Active) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#A39E93] absolute left-3.5 top-3" />
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#A39E93] mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#A39E93] absolute left-3.5 top-3" />
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
              <div className="p-3.5 sm:p-4 bg-[#FAF8F5] dark:bg-[#1C1A17] rounded-2xl border border-[#E5DFD5] dark:border-[#332F28] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-semibold text-[#1A1A1A] dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
                    <span>Create Account Password (Optional)</span>
                  </label>
                  <span className="text-[10px] text-[#C9A227] font-bold">Enables 1-Click Care Pass Access</span>
                </div>
                <input
                  type="password"
                  placeholder="Enter a secure password (min 6 chars) to access portal anytime"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-white dark:bg-[#121110] text-xs focus:outline-none focus:border-[#C9A227]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#A39E93] mb-1.5">
                Dental Symptoms / Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Mention any tooth sensitivity, pain, past root canals, or questions for Dr. Shreya..."
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
          <div className="mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-3xl font-bold text-[#1A1A1A] dark:text-[#F8F6F2]">
              Review &amp; Instant Confirmation
            </h2>
            <p className="text-xs sm:text-sm text-[#7A7265] dark:text-[#A39E93] mt-1">
              Please double check your appointment summary before confirming.
            </p>
          </div>

          {/* Summary Card */}
          <div className="bg-[#FAF8F5] dark:bg-[#1C1A17] border border-[#C9A227]/30 rounded-2xl p-4 sm:p-6 mb-5 space-y-3.5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 pb-3 border-b border-[#E8E0D2] dark:border-[#332F28]">
              <span className="text-xs uppercase tracking-wider text-[#7A7265] dark:text-[#A39E93] font-semibold">
                Treatment Plan ({selectedServices.length} Selected)
              </span>
              <span className="font-bold text-[#1A1A1A] dark:text-white text-sm sm:text-base">
                {combinedServiceName}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-[#E8E0D2] dark:border-[#332F28] text-xs sm:text-sm">
              <div>
                <span className="text-xs text-[#7A7265] dark:text-[#A39E93] block">Date &amp; Time</span>
                <span className="font-semibold text-[#C9A227] text-sm">
                  {formattedSelectedDate} at {selectedSlot}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#7A7265] dark:text-[#A39E93] block">Attending Doctor</span>
                <span className="font-semibold text-[#1A1A1A] dark:text-white">
                  {LEAD_DOCTOR.name} ({LEAD_DOCTOR.qualifications})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-[#E8E0D2] dark:border-[#332F28] text-xs sm:text-sm">
              <div>
                <span className="text-xs text-[#7A7265] dark:text-[#A39E93] block">Patient Name</span>
                <span className="font-semibold text-[#1A1A1A] dark:text-white">
                  {formData.patientName} {formData.age ? `(${formData.age} yrs)` : ""}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#7A7265] dark:text-[#A39E93] block">Contact Details</span>
                <span className="font-semibold text-[#1A1A1A] dark:text-white">
                  {formData.patientPhone} • {formData.patientEmail}
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

          <div className="flex items-center gap-2.5 p-3.5 bg-[#C9A227]/10 rounded-xl text-xs text-[#8A6D14] dark:text-[#DDB83C] mb-5">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            <span>
              Instant confirmation will be sent to <strong>{formData.patientEmail}</strong>. Free cancellation or rescheduling anytime.
            </span>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-5 border-t border-[#E8E0D2] dark:border-[#332F28] mt-5 gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="px-4 sm:px-5 py-2.5 rounded-xl border border-[#C9A227]/40 text-[#C9A227] hover:bg-[#C9A227]/10 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer"
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
            className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl bg-[#C9A227] hover:bg-[#DDB83C] text-black font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <span>
              {step === 1
                ? "Next: Date & Time"
                : step === 2
                ? "Next: Patient Info"
                : "Next: Review Booking"}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="px-6 sm:px-8 py-3 rounded-xl bg-gradient-to-r from-[#C9A227] to-[#DDB83C] hover:from-[#DDB83C] hover:to-[#C9A227] text-black font-bold text-xs sm:text-base flex items-center gap-2 shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span>Confirming Booking...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Confirm Appointment</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
