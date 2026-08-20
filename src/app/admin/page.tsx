"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Search,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  MessageCircle,
  RefreshCw,
  Edit3,
  Sparkles,
  Inbox,
  Lock,
  BarChart3,
  TrendingUp,
  Activity,
  Send,
  Bell,
  Check,
  PlusCircle,
  LogOut,
  Layers,
  Stethoscope,
  Users,
  Receipt,
  Banknote,
  FileText,
  Sliders,
  DollarSign,
  HeartPulse,
  MapPin,
  AlertTriangle,
  UserCheck,
  ChevronDown,
} from "lucide-react";
import {
  Booking,
  ContactInquiry,
  ClinicStats,
  BookingStatus,
  QueueToken,
  PatientDentalChart,
  Prescription,
  TreatmentPlan,
  Invoice,
  CashRegisterEntry,
  UserAccount,
} from "@/lib/types";
import { TIME_SLOTS, CLINIC_INFO, LEAD_DOCTOR } from "@/lib/constants";
import {
  ADMIN_COOKIE_NAME,
  getClientCookie,
  removeClientCookie,
  SessionUser,
} from "@/lib/auth";

// Modals & Clinical Subcomponents
import DentalChartOdontogram from "@/components/admin/DentalChartOdontogram";
import PrescriptionGeneratorModal from "@/components/admin/PrescriptionGeneratorModal";
import LiveWaitingRoomQueue from "@/components/admin/LiveWaitingRoomQueue";
import BillingPOSModal from "@/components/admin/BillingPOSModal";
import CashRegisterSummary from "@/components/admin/CashRegisterSummary";
import TreatmentPlanManager from "@/components/admin/TreatmentPlanManager";
import PatientProfileModal from "@/components/admin/PatientProfileModal";

type AdminTab =
  | "receptionist"
  | "doctor"
  | "patients"
  | "appointments"
  | "billing"
  | "treatment_plans"
  | "cash_register"
  | "analytics"
  | "inquiries";

export default function AdminPage() {
  const router = useRouter();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [adminUser, setAdminUser] = useState<SessionUser | null>(null);

  // Data states
  const [patients, setPatients] = useState<UserAccount[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [queue, setQueue] = useState<QueueToken[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [cashEntries, setCashEntries] = useState<CashRegisterEntry[]>([]);
  const [stats, setStats] = useState<ClinicStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [followupSuccess, setFollowupSuccess] = useState<string>("");

  // Active Selected Patient for Doctor / Frontdesk operations
  const [activePatient, setActivePatient] = useState<UserAccount | null>(null);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<AdminTab>("receptionist");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [patientSearch, setPatientSearch] = useState("");

  // Modals
  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [selectedPatientForEdit, setSelectedPatientForEdit] = useState<UserAccount | null>(null);
  const [selectedBookingForModal, setSelectedBookingForModal] = useState<Booking | null>(null);
  const [selectedTokenForModal, setSelectedTokenForModal] = useState<QueueToken | null>(null);

  // Action Modals (Status, Reschedule, Notes)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionType, setActionType] = useState<"STATUS" | "NOTES" | "RESCHEDULE" | null>(null);
  const [newStatus, setNewStatus] = useState<BookingStatus>("CONFIRMED");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlot, setRescheduleSlot] = useState(TIME_SLOTS[0]);
  const [cancellationReason, setCancellationReason] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  // Auth Gate check
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const cookie = getClientCookie(ADMIN_COOKIE_NAME);
        const local = localStorage.getItem("amulyam_admin_session");

        if (cookie || local) {
          let user: SessionUser = {
            name: "Dr. Shreya Nidhi (Admin)",
            email: "amulyamdentalstudio@gmail.com",
            role: "admin",
          };
          if (cookie) {
            try {
              user = JSON.parse(cookie);
            } catch (e) {}
          } else if (local) {
            try {
              user = JSON.parse(local);
            } catch (e) {}
          }
          setAdminUser(user);
          setIsAuthenticated(true);
          setAuthChecking(false);
          return;
        }

        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (data.admin) {
          setAdminUser(data.admin);
          setIsAuthenticated(true);
          setAuthChecking(false);
          return;
        }

        router.replace("/admin/login");
      } catch (e) {
        console.error(e);
        router.replace("/admin/login");
      }
    };

    checkAdminAuth();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resP = await fetch("/api/admin/patients");
      const dataP = await resP.json();
      if (dataP.success) {
        setPatients(dataP.patients);
        if (!activePatient && dataP.patients.length > 0) {
          setActivePatient(dataP.patients[0]);
        }
      }

      const resB = await fetch("/api/bookings");
      const dataB = await resB.json();
      if (dataB.success) setBookings(dataB.bookings);

      const resI = await fetch("/api/contact");
      const dataI = await resI.json();
      if (dataI.success) setInquiries(dataI.inquiries);

      const resQ = await fetch("/api/admin/queue");
      const dataQ = await resQ.json();
      if (dataQ.success) setQueue(dataQ.queue);

      const resC = await fetch("/api/admin/clinical?type=treatment_plan");
      const dataC = await resC.json();
      if (dataC.success) setTreatmentPlans(dataC.treatmentPlans || []);

      const resInv = await fetch("/api/admin/billing");
      const dataInv = await resInv.json();
      if (dataInv.success) setInvoices(dataInv.invoices || []);

      const resCash = await fetch("/api/admin/billing?type=cash_register");
      const dataCash = await resCash.json();
      if (dataCash.success) setCashEntries(dataCash.entries || []);

      const resS = await fetch("/api/admin/stats");
      const dataS = await resS.json();
      if (dataS.success) setStats(dataS.stats);
    } catch (e) {
      console.error("Admin fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "admin" }),
      });
    } catch (e) {}

    removeClientCookie(ADMIN_COOKIE_NAME);
    localStorage.removeItem("amulyam_admin_session");
    setIsAuthenticated(false);
    router.replace("/admin/login");
  };

  // Follow-up Email Trigger
  const handleTriggerFollowUp = async (booking: Booking, type: "REMINDER_24H" | "POST_TREATMENT_CARE") => {
    setActionLoading(true);
    setFollowupSuccess("");
    try {
      const res = await fetch("/api/admin/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, type }),
      });
      const data = await res.json();
      if (data.success) {
        setFollowupSuccess(
          `Follow-up email (${type === "REMINDER_24H" ? "24h Reminder" : "Post-Care"}) dispatched to ${booking.patientEmail}!`
        );
        setTimeout(() => setFollowupSuccess(""), 6000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Status / Action Submit
  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setActionLoading(true);

    try {
      const payload: any = {};
      if (actionType === "STATUS") {
        payload.status = newStatus;
        if (newStatus === "CANCELLED") {
          payload.cancellationReason = cancellationReason;
        }
      } else if (actionType === "NOTES") {
        payload.doctorNotes = doctorNotes;
        payload.prescription = prescription;
      } else if (actionType === "RESCHEDULE") {
        payload.appointmentDate = rescheduleDate;
        payload.timeSlot = rescheduleSlot;
        payload.status = "RESCHEDULED";
      }

      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedBooking(null);
        setActionType(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
    if (dateFilter === "TODAY" && b.appointmentDate !== todayStr) return false;
    if (dateFilter === "TOMORROW" && b.appointmentDate !== tomorrowStr) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        b.patientName.toLowerCase().includes(q) ||
        b.patientPhone.includes(q) ||
        b.patientEmail.toLowerCase().includes(q) ||
        b.refNumber.toLowerCase().includes(q) ||
        b.serviceName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const filteredPatients = patients.filter((p) => {
    if (!patientSearch) return true;
    const q = patientSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.email.toLowerCase().includes(q) ||
      (p.medicalHistory && p.medicalHistory.toLowerCase().includes(q)) ||
      (p.allergies && p.allergies.toLowerCase().includes(q))
    );
  });

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-amber-400">
        <div className="flex flex-col items-center gap-3">
          <span className="animate-spin text-3xl">✦</span>
          <p className="text-sm font-semibold tracking-wider uppercase">Authenticating Clinic Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top App Header */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg">
              ADS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">Amulyam Clinic OS</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Live Clinic ERP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Dr. Shreya Nidhi's Dental Studio • Awadhpuri, Bhopal
              </p>
            </div>
          </div>

          {/* Quick Action Strip */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab("receptionist")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "receptionist"
                  ? "bg-amber-500 text-slate-950 shadow-md scale-105"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>👩‍💼 Frontdesk &amp; Queue</span>
            </button>

            <button
              onClick={() => setActiveTab("doctor")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "doctor"
                  ? "bg-amber-500 text-slate-950 shadow-md scale-105"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>👨‍⚕️ Doctor Odontogram</span>
            </button>

            <button
              onClick={() => {
                setSelectedPatientForEdit(null);
                setIsPatientModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Add Walk-In Profile</span>
            </button>

            <button
              onClick={() => {
                setSelectedBookingForModal(bookings[0] || null);
                setIsRxModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>+ Issue E-Rx</span>
            </button>

            <button
              onClick={() => {
                setSelectedBookingForModal(bookings[0] || null);
                setIsBillingModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 text-xs font-bold transition"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>+ POS Billing</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ACTIVE PATIENT OPERATIONAL CONTEXT STRIP */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow">
                {activePatient?.name ? activePatient.name.charAt(0) : "P"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Patient in Context:</span>
                  <span className="text-sm font-extrabold text-white">{activePatient?.name || "No Patient Selected"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                  <span>{activePatient?.age ? `${activePatient.age} yrs • ` : ""}{activePatient?.gender || "Male"}</span>
                  <span className="font-mono text-amber-400 font-bold">🩸 {activePatient?.bloodGroup || "O+"}</span>
                  <span className="text-slate-400">📞 {activePatient?.phone}</span>
                </div>
              </div>
            </div>

            {/* Medical Alerts Badges */}
            {activePatient?.allergies && activePatient.allergies !== "None" && (
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Allergy: {activePatient.allergies}
              </span>
            )}
            {activePatient?.medicalHistory && activePatient.medicalHistory !== "None" && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1">
                <HeartPulse className="w-3 h-3" /> {activePatient.medicalHistory}
              </span>
            )}
          </div>

          {/* Quick Patient Switcher Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={activePatient?.id || ""}
                onChange={(e) => {
                  const selected = patients.find((p) => p.id === e.target.value);
                  if (selected) setActivePatient(selected);
                }}
                className="bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 pr-8"
              >
                <option value="" disabled>Choose Patient...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.phone.slice(-5)}) — {p.source || "Walk-In"}
                  </option>
                ))}
              </select>
            </div>

            {activePatient && (
              <button
                onClick={() => {
                  setSelectedPatientForEdit(activePatient);
                  setIsPatientModalOpen(true);
                }}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                title="Edit Active Patient Profile"
              >
                <Edit3 className="w-4 h-4 text-amber-400" />
              </button>
            )}
          </div>
        </div>

        {/* Global Alert Notification Banner */}
        {followupSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span>{followupSuccess}</span>
            <button onClick={() => setFollowupSuccess("")}>✕</button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-slate-800">
          {[
            { id: "receptionist", label: "Waiting Room & Queue", icon: Users, count: queue.filter((q) => q.status === "WAITING" || q.status === "IN_CHAIR").length },
            { id: "doctor", label: "Tooth Odontogram Chart", icon: Stethoscope },
            { id: "patients", label: "Patient Directory (CRM)", icon: UserCheck, count: patients.length },
            { id: "appointments", label: "All Appointments", icon: Calendar, count: bookings.length },
            { id: "billing", label: "Invoices & Billing", icon: Receipt, count: invoices.length },
            { id: "treatment_plans", label: "Treatment Plans", icon: Layers, count: treatmentPlans.length },
            { id: "cash_register", label: "EOD Cash Reconciliation", icon: Banknote },
            { id: "analytics", label: "Analytics & KPIs", icon: BarChart3 },
            { id: "inquiries", label: "Web Inquiries", icon: Inbox, count: inquiries.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? "bg-slate-800 text-amber-400 border border-amber-500/30 shadow-lg"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {typeof tab.count === "number" && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ----------------- TAB 1: RECEPTIONIST WAITING ROOM QUEUE ----------------- */}
        {activeTab === "receptionist" && (
          <LiveWaitingRoomQueue
            queue={queue}
            onRefresh={fetchData}
            onOpenBilling={(token) => {
              setSelectedTokenForModal(token);
              setIsBillingModalOpen(true);
            }}
            onOpenDentalChart={(token) => {
              setSelectedTokenForModal(token);
              const foundPatient = patients.find((p) => p.name === token.patientName || p.phone === token.patientPhone);
              if (foundPatient) setActivePatient(foundPatient);
              setActiveTab("doctor");
            }}
          />
        )}

        {/* ----------------- TAB 2: DOCTOR CLINICAL ODONTOGRAM ----------------- */}
        {activeTab === "doctor" && (
          <DentalChartOdontogram
            patientName={activePatient?.name || "Aarav Sharma"}
            patientEmail={activePatient?.email || "aarav.sharma@example.com"}
          />
        )}

        {/* ----------------- TAB 3: PATIENTS CRM DIRECTORY (NEW!) ----------------- */}
        {activeTab === "patients" && (
          <div className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Search patient by name, phone, email, condition, or allergy..."
                  className="bg-transparent border-none text-xs sm:text-sm text-white focus:outline-none w-full placeholder-slate-500"
                />
              </div>

              <button
                onClick={() => {
                  setSelectedPatientForEdit(null);
                  setIsPatientModalOpen(true);
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Register Walk-In / Offline Patient</span>
              </button>
            </div>

            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                      <th className="py-3 px-4">Patient Name &amp; Age</th>
                      <th className="py-3 px-3">Contact Details</th>
                      <th className="py-3 px-3">Blood Group</th>
                      <th className="py-3 px-3">Origin Source</th>
                      <th className="py-3 px-3">Medical History &amp; Alerts</th>
                      <th className="py-3 px-3">Emergency Contact</th>
                      <th className="py-3 px-4 text-right">Clinical Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredPatients.map((p) => {
                      const isCurrentActive = activePatient?.id === p.id;
                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-slate-800/40 transition ${isCurrentActive ? "bg-amber-500/5" : ""}`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-800 border border-amber-500/30 text-amber-400 font-bold flex items-center justify-center text-xs">
                                {p.name.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-white block">{p.name}</span>
                                <span className="text-[11px] text-slate-400">
                                  {p.age ? `${p.age} yrs` : "Age N/A"} • {p.gender || "Male"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="font-mono text-slate-200 block">{p.phone}</span>
                            <span className="text-[11px] text-slate-400">{p.email}</span>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {p.bloodGroup || "O+"}
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                p.source === "WALK_IN"
                                  ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                                  : p.source === "PHONE"
                                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/30"
                                  : p.source === "REFERRAL"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              }`}
                            >
                              {p.source || "WEBSITE"}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 max-w-xs">
                            <div className="space-y-1">
                              {p.allergies && p.allergies !== "None" && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                                  ⚠️ {p.allergies}
                                </span>
                              )}
                              <p className="text-[11px] text-slate-300 truncate">{p.medicalHistory || "None"}</p>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-[11px] text-slate-400">
                            {p.emergencyContact || "N/A"}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setActivePatient(p);
                                  setActiveTab("doctor");
                                }}
                                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition"
                                title="Open Odontogram Chart"
                              >
                                <Stethoscope className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setActivePatient(p);
                                  setIsRxModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition"
                                title="Write E-Prescription"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setActivePatient(p);
                                  setIsBillingModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 transition"
                                title="Generate Invoice"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedPatientForEdit(p);
                                  setIsPatientModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                                title="Edit Profile"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <a
                                href={`https://wa.me/${p.phone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition"
                                title="WhatsApp Patient"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB 4: MASTER APPOINTMENTS LIST ----------------- */}
        {activeTab === "appointments" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by patient name, phone, email, or ref ID..."
                  className="bg-transparent border-none text-xs sm:text-sm text-white focus:outline-none w-full placeholder-slate-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="RESCHEDULED">Rescheduled</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>

                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
                >
                  <option value="ALL">All Dates</option>
                  <option value="TODAY">Today Only</option>
                  <option value="TOMORROW">Tomorrow Only</option>
                </select>
              </div>
            </div>

            {/* Appointments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 space-y-3 transition shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {b.refNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : b.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : b.status === "COMPLETED"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white leading-snug">{b.patientName}</h4>
                      <p className="text-xs text-amber-200/80 font-semibold">{b.serviceName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        <span>{b.appointmentDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{b.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        <span>{b.patientPhone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
                    <a
                      href={`https://wa.me/${b.patientPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                        `Namaste ${b.patientName}, this is Amulyam Dental Studio confirming your appointment for ${b.serviceName} on ${b.appointmentDate} at ${b.timeSlot}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 transition"
                      title="Send WhatsApp Message"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => handleTriggerFollowUp(b, "REMINDER_24H")}
                      className="py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[11px] flex items-center gap-1 transition"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                      <span>Reminder</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedBooking(b);
                        setActionType("STATUS");
                        setNewStatus(b.status);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ----------------- TAB 5: BILLING & INVOICES ----------------- */}
        {activeTab === "billing" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-white">Clinical Invoices &amp; Billing History</h4>
                <p className="text-xs text-slate-400">Total generated invoices and outstanding balances</p>
              </div>
              <button
                onClick={() => setIsBillingModalOpen(true)}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
              >
                + New Invoice
              </button>
            </div>

            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Patient</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Grand Total</th>
                    <th className="py-2.5 px-3">Paid</th>
                    <th className="py-2.5 px-3">Balance</th>
                    <th className="py-2.5 px-3">Payment Mode</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-amber-300">{inv.invoiceNumber}</td>
                      <td className="py-3 px-3 font-bold text-white">{inv.patientName}</td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {new Date(inv.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-white">₹{inv.grandTotal.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-3 font-mono text-emerald-400 font-bold">₹{inv.amountPaid.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-3 font-mono text-rose-400 font-bold">₹{inv.balanceDue.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-3 font-mono text-slate-300">{inv.paymentMethod}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inv.paymentStatus === "PAID"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {inv.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------- TAB 6: TREATMENT PLANS ----------------- */}
        {activeTab === "treatment_plans" && (
          <TreatmentPlanManager plans={treatmentPlans} onRefresh={fetchData} />
        )}

        {/* ----------------- TAB 7: CASH REGISTER RECONCILIATION ----------------- */}
        {activeTab === "cash_register" && (
          <CashRegisterSummary entries={cashEntries} onRefresh={fetchData} />
        )}

        {/* ----------------- TAB 8: ANALYTICS & KPIS ----------------- */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-400">Total Registered Patients</span>
              <p className="text-3xl font-black text-white font-mono">{patients.length}</p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-400">Today's Appointments</span>
              <p className="text-3xl font-black text-amber-300 font-mono">
                {bookings.filter((b) => b.appointmentDate === todayStr).length}
              </p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-400">Confirmed Patients</span>
              <p className="text-3xl font-black text-emerald-400 font-mono">
                {bookings.filter((b) => b.status === "CONFIRMED").length}
              </p>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-1">
              <span className="text-xs text-slate-400">Website Inquiries</span>
              <p className="text-3xl font-black text-sky-400 font-mono">{inquiries.length}</p>
            </div>
          </div>
        )}

        {/* ----------------- TAB 9: WEB INQUIRIES ----------------- */}
        {activeTab === "inquiries" && (
          <div className="space-y-3">
            {inquiries.map((inq) => (
              <div
                key={inq.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">
                    {inq.firstName} {inq.lastName}
                  </h4>
                  <span className="text-xs text-slate-400">
                    {new Date(inq.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <p className="text-xs text-amber-300 font-semibold">{inq.serviceOfInterest || inq.subject}</p>
                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl">"{inq.message}"</p>
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
                  <span>📞 {inq.phone}</span>
                  <span>✉️ {inq.email}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Patient Profile Modal (Create offline & Admin Edit) */}
      <PatientProfileModal
        isOpen={isPatientModalOpen}
        onClose={() => {
          setIsPatientModalOpen(false);
          setSelectedPatientForEdit(null);
        }}
        patient={selectedPatientForEdit}
        onSaved={(savedPat) => {
          setIsPatientModalOpen(false);
          setSelectedPatientForEdit(null);
          fetchData();
        }}
      />

      {/* Prescription Generator Modal */}
      <PrescriptionGeneratorModal
        isOpen={isRxModalOpen}
        onClose={() => setIsRxModalOpen(false)}
        booking={selectedBookingForModal}
        patient={activePatient}
        onSaved={() => {
          setIsRxModalOpen(false);
          fetchData();
        }}
      />

      {/* Billing POS Modal */}
      <BillingPOSModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        booking={selectedBookingForModal}
        token={selectedTokenForModal}
        patient={activePatient}
        onSaved={() => {
          setIsBillingModalOpen(false);
          fetchData();
        }}
      />

      {/* Manage Status / Action Modal */}
      {selectedBooking && actionType && (
        <div
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overscroll-contain"
        >
          <div
            data-lenis-prevent
            className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 overscroll-contain"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white">Manage: {selectedBooking.refNumber}</h4>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as BookingStatus)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {newStatus === "CANCELLED" && (
                <div>
                  <label className="block text-xs text-slate-300 font-semibold mb-1">Reason for Cancellation</label>
                  <input
                    type="text"
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="e.g. Patient rescheduled via phone"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                  />
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition"
                >
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
