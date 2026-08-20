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
} from "lucide-react";
import { Booking, ContactInquiry, ClinicStats, BookingStatus } from "@/lib/types";
import { TIME_SLOTS, CLINIC_INFO } from "@/lib/constants";
import {
  ADMIN_COOKIE_NAME,
  getClientCookie,
  removeClientCookie,
  SessionUser,
} from "@/lib/auth";

export default function AdminPage() {
  const router = useRouter();

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [adminUser, setAdminUser] = useState<SessionUser | null>(null);

  // Data states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [stats, setStats] = useState<ClinicStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [followupSuccess, setFollowupSuccess] = useState<string>("");

  // Filters & Tabs
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"appointments" | "analytics" | "followups" | "inquiries">(
    "appointments"
  );

  // Modal State
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

        // Unauthenticated -> redirect to login
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
      const resB = await fetch("/api/bookings");
      const dataB = await resB.json();
      if (dataB.success) setBookings(dataB.bookings);

      const resI = await fetch("/api/contact");
      const dataI = await resI.json();
      if (dataI.success) setInquiries(dataI.inquiries);

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
          `Follow-up email (${type === "REMINDER_24H" ? "24h Reminder" : "Post-Care"}) dispatched to ${booking.patientEmail} via info@thewebvale.com!`
        );
        setTimeout(() => setFollowupSuccess(""), 6000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
    if (dateFilter === "TODAY" && b.appointmentDate !== todayStr) return false;
    if (dateFilter === "TOMORROW" && b.appointmentDate !== tomorrowStr) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.patientName.toLowerCase().includes(q) ||
        b.patientPhone.includes(q) ||
        b.patientEmail.toLowerCase().includes(q) ||
        b.refNumber.toLowerCase().includes(q) ||
        b.serviceName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleQuickStatusChange = async (booking: Booking, status: BookingStatus) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
        setSelectedBooking(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveModalAction = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);

    try {
      let body: any = {};
      if (actionType === "STATUS") {
        body = {
          status: newStatus,
          doctorNotes: doctorNotes || selectedBooking.doctorNotes,
          prescription: prescription || selectedBooking.prescription,
          cancellationReason: newStatus === "CANCELLED" ? cancellationReason : undefined,
        };
      } else if (actionType === "NOTES") {
        body = { doctorNotes, prescription };
      } else if (actionType === "RESCHEDULE") {
        body = {
          appointmentDate: rescheduleDate,
          timeSlot: rescheduleSlot,
          status: "RESCHEDULED",
        };
      }

      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        fetchData();
        setSelectedBooking(null);
        setActionType(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const exportToCsv = () => {
    const headers = [
      "Ref Number",
      "Patient Name",
      "Phone",
      "Email",
      "Age",
      "Gender",
      "Service",
      "Category",
      "Date",
      "Time Slot",
      "Status",
      "Doctor Notes",
      "Prescription",
      "Created At",
    ];

    const rows = bookings.map((b) => [
      b.refNumber,
      `"${b.patientName}"`,
      `"${b.patientPhone}"`,
      `"${b.patientEmail}"`,
      b.age || "",
      b.gender || "",
      `"${b.serviceName}"`,
      `"${b.category}"`,
      b.appointmentDate,
      `"${b.timeSlot}"`,
      b.status,
      `"${(b.doctorNotes || "").replace(/"/g, '""')}"`,
      `"${(b.prescription || "").replace(/"/g, '""')}"`,
      b.createdAt,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Amulyam_Bookings_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (authChecking) {
    return (
      <div className="py-24 text-center text-sm text-[#888] flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-[#C9A227]" />
        <span>Authenticating admin access...</span>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-12 bg-[#FAF8F5] dark:bg-[#0F0E0D] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Profile Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C9A227] bg-[#C9A227]/10 px-3 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Clinic Control Suite
              </span>
              <span className="text-xs text-[#888]">{adminUser?.name} ({adminUser?.email})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] dark:text-[#F8F6F2] mt-1">
              Amulyam Dental Studio Admin Management
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#1C1A17] border border-[#C9A227]/30 text-xs font-semibold text-[#1A1A1A] dark:text-white flex items-center gap-1.5 hover:bg-[#FAF8F5] shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#C9A227] ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={exportToCsv}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#1C1A17] border border-[#C9A227]/30 text-xs font-semibold text-[#1A1A1A] dark:text-white flex items-center gap-1.5 hover:bg-[#FAF8F5] shadow-sm transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl border border-red-200 text-red-600 dark:border-red-900/50 hover:bg-red-50 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {followupSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 text-green-800 dark:text-green-300 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{followupSuccess}</span>
          </div>
        )}

        {/* KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#181715] border border-[#C9A227]/20 shadow-sm">
            <span className="text-[11px] uppercase tracking-wider text-[#8A8175] block font-semibold">
              Total Appointments
            </span>
            <div className="text-2xl font-black text-[#1A1A1A] dark:text-white mt-1">
              {stats?.totalBookings || bookings.length}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#181715] border border-[#C9A227]/20 shadow-sm">
            <span className="text-[11px] uppercase tracking-wider text-[#8A8175] block font-semibold">
              Today's Volume
            </span>
            <div className="text-2xl font-black text-[#C9A227] mt-1">
              {stats?.todayBookings || 0}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#181715] border border-[#C9A227]/20 shadow-sm">
            <span className="text-[11px] uppercase tracking-wider text-amber-600 block font-semibold">
              Pending Actions
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {stats?.pendingBookings || 0}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#181715] border border-[#C9A227]/20 shadow-sm">
            <span className="text-[11px] uppercase tracking-wider text-green-600 block font-semibold">
              Confirmed Visits
            </span>
            <div className="text-2xl font-black text-green-600 mt-1">
              {stats?.confirmedBookings || 0}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#181715] border border-[#C9A227]/20 shadow-sm col-span-2 sm:col-span-1">
            <span className="text-[11px] uppercase tracking-wider text-blue-600 block font-semibold">
              Completed Care
            </span>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {stats?.completedBookings || 0}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-[#C9A227]/20 pb-3 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("appointments")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "appointments"
                ? "bg-[#C9A227] text-white shadow-md"
                : "bg-white dark:bg-[#1C1A17] text-[#666] dark:text-[#AAA] border border-[#C9A227]/20"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Appointments Board ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "analytics"
                ? "bg-[#C9A227] text-white shadow-md"
                : "bg-white dark:bg-[#1C1A17] text-[#666] dark:text-[#AAA] border border-[#C9A227]/20"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics &amp; Revenue</span>
          </button>

          <button
            onClick={() => setActiveTab("followups")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "followups"
                ? "bg-[#C9A227] text-white shadow-md"
                : "bg-white dark:bg-[#1C1A17] text-[#666] dark:text-[#AAA] border border-[#C9A227]/20"
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Email Follow-ups (SMTP: info@thewebvale.com)</span>
          </button>

          <button
            onClick={() => setActiveTab("inquiries")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === "inquiries"
                ? "bg-[#C9A227] text-white shadow-md"
                : "bg-white dark:bg-[#1C1A17] text-[#666] dark:text-[#AAA] border border-[#C9A227]/20"
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Inquiries ({inquiries.length})</span>
          </button>
        </div>

        {/* 1. APPOINTMENTS TAB */}
        {activeTab === "appointments" && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white dark:bg-[#181715] p-4 sm:p-5 rounded-2xl border border-[#C9A227]/20 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {["ALL", "PENDING", "CONFIRMED", "RESCHEDULED", "COMPLETED", "CANCELLED"].map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        statusFilter === st
                          ? "bg-[#C9A227] text-white shadow"
                          : "bg-[#FAF8F5] dark:bg-[#26231E] text-[#666] dark:text-[#AAA] hover:text-[#C9A227]"
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#1C1A17] text-xs font-medium focus:outline-none focus:border-[#C9A227]"
                >
                  <option value="ALL">All Dates</option>
                  <option value="TODAY">Today's Appointments</option>
                  <option value="TOMORROW">Tomorrow's Appointments</option>
                </select>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#888] absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search patient, phone, ref..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-56 pl-8 pr-3 py-2 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#1C1A17] text-xs focus:outline-none focus:border-[#C9A227]"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#181715] rounded-3xl border border-[#C9A227]/25 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F5] dark:bg-[#121110] border-b border-[#E8E0D2] dark:border-[#26231E] text-[11px] font-extrabold uppercase tracking-wider text-[#8A8175]">
                      <th className="py-3.5 px-4">Ref &amp; Status</th>
                      <th className="py-3.5 px-4">Patient Details</th>
                      <th className="py-3.5 px-4">Treatment</th>
                      <th className="py-3.5 px-4">Date &amp; Slot</th>
                      <th className="py-3.5 px-4">Notes &amp; Rx</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FAF8F5] dark:divide-[#26231E] text-xs sm:text-sm">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[#888]">
                          No appointments found matching the current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => {
                        const whatsappLink = `https://wa.me/${b.patientPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Hello ${b.patientName}, this is Amulyam Dental Studio regarding your appointment for ${b.serviceName} on ${b.appointmentDate} at ${b.timeSlot}.`
                        )}`;

                        return (
                          <tr
                            key={b.id}
                            className="hover:bg-[#FAF8F5]/80 dark:hover:bg-[#1F1D1A]/80 transition-colors"
                          >
                            <td className="py-4 px-4 align-top">
                              <Link
                                href={`/booking-confirmation/${b.refNumber}`}
                                target="_blank"
                                className="font-mono font-bold text-[#C9A227] hover:underline block"
                              >
                                {b.refNumber}
                              </Link>
                              <div className="mt-1">
                                <span
                                  className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                    b.status === "CONFIRMED"
                                      ? "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300"
                                      : b.status === "COMPLETED"
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                                      : b.status === "CANCELLED"
                                      ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300"
                                  }`}
                                >
                                  {b.status}
                                </span>
                              </div>
                            </td>

                            <td className="py-4 px-4 align-top">
                              <div className="font-bold text-[#1A1A1A] dark:text-white">
                                {b.patientName} {b.age ? `(${b.age}y, ${b.gender || ""})` : ""}
                              </div>
                              <div className="text-xs text-[#666] dark:text-[#AAA] mt-0.5 space-y-0.5">
                                <a
                                  href={`tel:${b.patientPhone}`}
                                  className="text-blue-600 dark:text-blue-400 hover:underline block font-medium"
                                >
                                  {b.patientPhone}
                                </a>
                                <span className="block truncate max-w-[150px]">{b.patientEmail}</span>
                              </div>
                            </td>

                            <td className="py-4 px-4 align-top">
                              <div className="font-semibold text-[#1A1A1A] dark:text-white">
                                {b.serviceName}
                              </div>
                              <span className="text-[11px] text-[#C9A227]">{b.category}</span>
                            </td>

                            <td className="py-4 px-4 align-top whitespace-nowrap">
                              <div className="font-bold text-[#1A1A1A] dark:text-white">
                                {b.appointmentDate}
                              </div>
                              <span className="text-xs text-green-700 dark:text-green-400 font-semibold block">
                                {b.timeSlot}
                              </span>
                            </td>

                            <td className="py-4 px-4 align-top max-w-xs">
                              {b.notes && (
                                <p className="text-[11px] text-[#666] dark:text-[#AAA] line-clamp-2 italic mb-1">
                                  "{b.notes}"
                                </p>
                              )}
                              {b.doctorNotes && (
                                <span className="text-[10px] text-[#C9A227] block font-semibold">
                                  👨‍⚕️ {b.doctorNotes}
                                </span>
                              )}
                            </td>

                            <td className="py-4 px-4 align-top text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {b.status === "PENDING" && (
                                  <button
                                    type="button"
                                    onClick={() => handleQuickStatusChange(b, "CONFIRMED")}
                                    className="p-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white shadow text-xs"
                                    title="Confirm Booking"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                <a
                                  href={whatsappLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-[#25D366] hover:bg-[#20BA5A] text-white shadow text-xs"
                                  title="Send WhatsApp Message"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedBooking(b);
                                    setActionType("STATUS");
                                    setNewStatus(b.status);
                                    setDoctorNotes(b.doctorNotes || "");
                                    setPrescription(b.prescription || "");
                                    setRescheduleDate(b.appointmentDate);
                                    setRescheduleSlot(b.timeSlot);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#C9A227] hover:bg-[#DDB83C] text-black font-bold text-xs transition-all shadow cursor-pointer"
                                >
                                  Manage
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. ANALYTICS & DASHBOARDS TAB */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-[#181715] p-6 rounded-3xl border border-[#C9A227]/25 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-[#888]">Monthly Revenue Estimate</span>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-3xl font-black text-[#C9A227]">
                  ₹{(bookings.length * 3200).toLocaleString("en-IN")}
                </div>
                <p className="text-xs text-[#888] leading-relaxed">
                  Based on average treatment value (RCT, Implants &amp; Aligners mix).
                </p>
              </div>

              <div className="bg-white dark:bg-[#181715] p-6 rounded-3xl border border-[#C9A227]/25 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-[#888]">Patient Retention Rate</span>
                  <Activity className="w-4 h-4 text-[#C9A227]" />
                </div>
                <div className="text-3xl font-black text-[#1A1A1A] dark:text-white">
                  94.8%
                </div>
                <p className="text-xs text-[#888] leading-relaxed">
                  High patient satisfaction and return visits for regular scaling &amp; preventive care.
                </p>
              </div>

              <div className="bg-white dark:bg-[#181715] p-6 rounded-3xl border border-[#C9A227]/25 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-[#888]">Google Review Average</span>
                  <Sparkles className="w-4 h-4 text-[#C9A227]" />
                </div>
                <div className="text-3xl font-black text-green-600 dark:text-green-400">
                  5.0 ★
                </div>
                <p className="text-xs text-[#888] leading-relaxed">
                  140+ 5-star patient reviews in Awadhpuri, Bhopal.
                </p>
              </div>
            </div>

            {/* Treatment Distribution Visual */}
            <div className="bg-white dark:bg-[#181715] p-6 rounded-3xl border border-[#C9A227]/25 shadow-lg space-y-4">
              <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white">
                Treatment Demand Distribution
              </h3>
              <div className="space-y-3">
                {[
                  { name: "Root Canal Treatment (Endodontics)", pct: 35, count: "35%", color: "bg-[#C9A227]" },
                  { name: "Dental Implants & Prosthetics", pct: 25, count: "25%", color: "bg-[#DDB83C]" },
                  { name: "Teeth Whitening & Smile Design", pct: 20, count: "20%", color: "bg-amber-500" },
                  { name: "Clear Aligners & Orthodontics", pct: 12, count: "12%", color: "bg-blue-500" },
                  { name: "Ultrasonic Scaling & Preventive", pct: 8, count: "8%", color: "bg-green-500" },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#1A1A1A] dark:text-[#DDD]">{item.name}</span>
                      <span className="text-[#C9A227]">{item.count}</span>
                    </div>
                    <div className="h-2.5 w-full bg-[#FAF8F5] dark:bg-[#26231E] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-500`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. EMAIL FOLLOW-UPS TAB */}
        {activeTab === "followups" && (
          <div className="bg-white dark:bg-[#181715] p-6 rounded-3xl border border-[#C9A227]/25 shadow-lg space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-white">
                Automated &amp; 1-Click Patient Follow-ups
              </h2>
              <p className="text-xs text-[#888]">
                Sender: <strong>info@thewebvale.com</strong> over secured SMTP (smtpout.secureserver.net).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E0D2] dark:border-[#332F28] space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-sm text-[#1A1A1A] dark:text-white block">
                        {b.patientName}
                      </span>
                      <span className="text-xs text-[#888]">
                        {b.serviceName} • {b.appointmentDate} ({b.timeSlot})
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#C9A227]/20 text-[#C9A227]">
                      {b.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E8E0D2] dark:border-[#26231E]">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleTriggerFollowUp(b, "REMINDER_24H")}
                      className="px-3 py-1.5 rounded-xl bg-[#C9A227] hover:bg-[#DDB83C] text-black font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send 24h Reminder Email</span>
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleTriggerFollowUp(b, "POST_TREATMENT_CARE")}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1C1A17] border border-[#C9A227]/40 text-xs font-semibold text-[#1A1A1A] dark:text-white flex items-center gap-1.5 hover:bg-[#FAF8F5] cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      <span>Send Post-Care Email</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. INQUIRIES TAB */}
        {activeTab === "inquiries" && (
          <div className="bg-white dark:bg-[#181715] rounded-3xl border border-[#C9A227]/25 shadow-xl p-6">
            <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-4">
              Website Contact Inquiries
            </h2>

            <div className="space-y-4">
              {inquiries.length === 0 ? (
                <p className="text-center py-12 text-sm text-[#888]">No inquiries received yet.</p>
              ) : (
                inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E0D2] dark:border-[#332F28] space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <span className="font-bold text-sm text-[#1A1A1A] dark:text-white">
                          {inq.firstName} {inq.lastName}
                        </span>
                        <span className="text-xs text-[#C9A227] ml-2">
                          ({inq.serviceOfInterest || "General"})
                        </span>
                      </div>
                      <span className="text-[11px] text-[#888]">
                        {new Date(inq.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#444] dark:text-[#CCC] bg-white dark:bg-[#181715] p-3 rounded-xl border border-[#E5DFD5] dark:border-[#26231E]">
                      {inq.message}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-[#888] pt-1">
                      <a href={`tel:${inq.phone}`} className="text-blue-600 dark:text-blue-400 font-medium">
                        📞 {inq.phone}
                      </a>
                      <a href={`mailto:${inq.email}`} className="hover:underline">
                        ✉️ {inq.email}
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Actions */}
      {selectedBooking && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#181715] rounded-3xl border-2 border-[#C9A227]/40 shadow-2xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#FAF8F5] dark:border-[#26231E]">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-[#C9A227]">
                  Booking Action
                </span>
                <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white">
                  {selectedBooking.patientName} ({selectedBooking.refNumber})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActionType("STATUS")}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  actionType === "STATUS"
                    ? "bg-[#C9A227] text-white shadow"
                    : "bg-[#FAF8F5] dark:bg-[#121110] text-[#777]"
                }`}
              >
                Update Status
              </button>
              <button
                type="button"
                onClick={() => setActionType("RESCHEDULE")}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  actionType === "RESCHEDULE"
                    ? "bg-[#C9A227] text-white shadow"
                    : "bg-[#FAF8F5] dark:bg-[#121110] text-[#777]"
                }`}
              >
                Reschedule
              </button>
              <button
                type="button"
                onClick={() => setActionType("NOTES")}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  actionType === "NOTES"
                    ? "bg-[#C9A227] text-white shadow"
                    : "bg-[#FAF8F5] dark:bg-[#121110] text-[#777]"
                }`}
              >
                Doctor Notes
              </button>
            </div>

            {actionType === "STATUS" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#A39E93] mb-1.5">
                    Transition Status To:
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as BookingStatus)}
                    className="w-full p-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#121110] text-sm font-semibold"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED (Approve &amp; Send Email)</option>
                    <option value="COMPLETED">COMPLETED (Treatment Finished)</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                {newStatus === "CANCELLED" && (
                  <div>
                    <label className="block text-xs font-bold text-[#A39E93] mb-1">
                      Cancellation Reason
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Patient requested cancellation"
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] text-xs"
                    />
                  </div>
                )}
              </div>
            )}

            {actionType === "RESCHEDULE" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#A39E93] mb-1">
                    New Appointment Date
                  </label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#121110] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A39E93] mb-1">
                    New Time Slot
                  </label>
                  <select
                    value={rescheduleSlot}
                    onChange={(e) => setRescheduleSlot(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#121110] text-sm"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {(actionType === "NOTES" || newStatus === "COMPLETED") && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#A39E93] mb-1">
                    Clinical Notes &amp; Findings
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Tooth #36 obturated successfully. No pain reported."
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#A39E93] mb-1">
                    Prescription / Care Instructions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tab Zerodol-SP BD x 3 days"
                    value={prescription}
                    onChange={(e) => setPrescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] text-xs"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-[#FAF8F5] dark:border-[#26231E]">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={handleSaveModalAction}
                className="px-6 py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#DDB83C] text-black font-bold text-xs shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? "Updating..." : "Save & Dispatch Email Notification"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
