"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Calendar,
  Clock,
  Phone,
  Search,
  CheckCircle2,
  AlertCircle,
  Download,
  Sparkles,
  ArrowRight,
  LogOut,
  ShieldCheck,
  RefreshCw,
  Lock,
  Mail,
  KeyRound,
  FileText,
  Edit3,
  HeartPulse,
} from "lucide-react";
import PatientEditProfileModal from "@/components/portal/PatientEditProfileModal";
import { Booking } from "@/lib/types";
import { CLINIC_INFO } from "@/lib/constants";
import {
  PATIENT_COOKIE_NAME,
  setClientCookie,
  getClientCookie,
  removeClientCookie,
  SessionUser,
} from "@/lib/auth";
import MotionReveal from "@/components/ui/MotionReveal";

export default function PatientCarePassPage() {
  // Auth Modes: "LOGIN" | "REGISTER" | "REF_LOOKUP"
  const [authMode, setAuthMode] = useState<"LOGIN" | "REGISTER" | "REF_LOOKUP">("LOGIN");

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [lookupRef, setLookupRef] = useState("");
  const [lookupPhone, setLookupPhone] = useState("");

  // Session & Data
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageInitializing, setPageInitializing] = useState(true);
  const [error, setError] = useState("");
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Check existing session on page mount
  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/session");
      const data = await res.json();

      let activePatient: SessionUser | null = data.patient;

      if (!activePatient) {
        const local = localStorage.getItem("amulyam_patient_session");
        if (local) {
          try {
            activePatient = JSON.parse(local);
          } catch (e) {}
        }
      }

      if (activePatient) {
        setCurrentUser(activePatient);
        setIsLoggedIn(true);
        await loadBookings();
      }
    } catch (e) {
      console.error("Session check error:", e);
    } finally {
      setPageInitializing(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (data.success) {
        setUserBookings(data.bookings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Handle Email & Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid credentials.");
      }

      setCurrentUser(data.user);
      setIsLoggedIn(true);
      localStorage.setItem("amulyam_patient_session", JSON.stringify(data.user));
      setClientCookie(PATIENT_COOKIE_NAME, JSON.stringify(data.user), 30);
      await loadBookings();
    } catch (err: any) {
      setError(err.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Patient Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create account.");
      }

      setCurrentUser(data.user);
      setIsLoggedIn(true);
      localStorage.setItem("amulyam_patient_session", JSON.stringify(data.user));
      setClientCookie(PATIENT_COOKIE_NAME, JSON.stringify(data.user), 30);
      await loadBookings();
    } catch (err: any) {
      setError(err.message || "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Secure Reference + Phone Lookup
  const handleRefLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!lookupRef.trim() || !lookupPhone.trim()) {
      setError("Please provide both your Booking Reference Number and registered phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/bookings?ref=${encodeURIComponent(lookupRef.trim())}&phone=${encodeURIComponent(lookupPhone.trim())}`
      );
      const data = await res.json();

      if (!data.success || data.bookings.length === 0) {
        setError(
          "No matching appointment found. Please ensure both the Booking Reference ID (e.g. ADS-2026-...) and registered mobile number match."
        );
        return;
      }

      const match = data.bookings[0];
      const guestSession: SessionUser = {
        name: match.patientName,
        email: match.patientEmail,
        phone: match.patientPhone,
        role: "patient",
      };

      setUserBookings([match]);
      setCurrentUser(guestSession);
      setIsLoggedIn(true);
      localStorage.setItem("amulyam_patient_session", JSON.stringify(guestSession));
      setClientCookie(PATIENT_COOKIE_NAME, JSON.stringify(guestSession), 7);
    } catch (err: any) {
      setError(err.message || "Unable to lookup appointment.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google?role=patient&redirectUrl=/patient-portal";
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "patient" }),
      });
    } catch (e) {}

    removeClientCookie(PATIENT_COOKIE_NAME);
    localStorage.removeItem("amulyam_patient_session");
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserBookings([]);
  };

  if (pageInitializing) {
    return (
      <div className="py-24 text-center text-sm text-[#888] flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-[#C9A227]" />
        <span>Verifying secure care session...</span>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20 min-h-[85vh] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isLoggedIn ? (
          /* AUTHENTICATION & ACCESS SUITE */
          <MotionReveal direction="up">
            {/* Doctor & Staff Quick Switcher Banner */}
            <div className="max-w-lg mx-auto mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-300 shadow-md">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Doctor or Clinic Receptionist?</span>
              </div>
              <Link
                href="/admin/login"
                className="font-bold underline text-white hover:text-amber-300"
              >
                Admin ERP Login ➔
              </Link>
            </div>

            <div className="max-w-lg mx-auto bg-white dark:bg-[#181715] rounded-3xl border-2 border-[#C9A227]/30 shadow-2xl p-6 sm:p-10 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#C9A227]/15 text-[#C9A227] flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] dark:text-white">
                  Patient Care Portal
                </h1>
                <p className="text-xs sm:text-sm text-[#6B6B6B] dark:text-[#A8A29E]">
                  Secure authenticated access to your clinical records, digital care pass, and appointments.
                </p>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-[#FAF8F5] dark:bg-[#121110] rounded-2xl border border-[#E5DFD5] dark:border-[#332F28] text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("LOGIN");
                    setError("");
                  }}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    authMode === "LOGIN"
                      ? "bg-[#C9A227] text-white shadow"
                      : "text-[#777] hover:text-[#C9A227]"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("REGISTER");
                    setError("");
                  }}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    authMode === "REGISTER"
                      ? "bg-[#C9A227] text-white shadow"
                      : "text-[#777] hover:text-[#C9A227]"
                  }`}
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("REF_LOOKUP");
                    setError("");
                  }}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    authMode === "REF_LOOKUP"
                      ? "bg-[#C9A227] text-white shadow"
                      : "text-[#777] hover:text-[#C9A227]"
                  }`}
                >
                  Ref ID
                </button>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-700 dark:text-red-300 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* 1-Click Google OAuth */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3.5 px-4 rounded-2xl border border-[#E5DFD5] dark:border-[#332F28] bg-white dark:bg-[#1C1A17] hover:bg-[#FAF8F5] dark:hover:bg-[#26231E] font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-sm transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#E8E0D2] dark:border-[#332F28]" />
                <span className="flex-shrink mx-4 text-[11px] text-[#888] uppercase tracking-wider font-semibold">
                  Or use email &amp; password
                </span>
                <div className="flex-grow border-t border-[#E8E0D2] dark:border-[#332F28]" />
              </div>

              {/* 1. SIGN IN FORM */}
              {authMode === "LOGIN" && (
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#A39E93] mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#888] absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        inputMode="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => {
                          setError("");
                          setLoginEmail(e.target.value);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#121110] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#A39E93] mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-[#888] absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => {
                          setError("");
                          setLoginPassword(e.target.value);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#121110] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-[#C9A227] hover:bg-[#DDB83C] text-black font-bold text-sm shadow-lg transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>{loading ? "Signing In..." : "Sign In to Care Portal"}</span>
                  </button>
                </form>
              )}

              {/* 2. REGISTER FORM */}
              {authMode === "REGISTER" && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#A39E93] mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#888] absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="Rahul Sharma"
                        value={regName}
                        onChange={(e) => {
                          setError("");
                          setRegName(e.target.value);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#121110] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#A39E93] mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        inputMode="email"
                        placeholder="you@example.com"
                        value={regEmail}
                        onChange={(e) => {
                          setError("");
                          setRegEmail(e.target.value);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#121110] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#A39E93] mb-1.5">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        autoComplete="tel"
                        inputMode="tel"
                        placeholder="+91 98XXX XXXXX"
                        value={regPhone}
                        onChange={(e) => {
                          setError("");
                          setRegPhone(e.target.value);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#121110] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#A39E93] mb-1.5">
                      Create Password (min 6 characters) *
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => {
                        setError("");
                        setRegPassword(e.target.value);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#121110] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-[#C9A227] hover:bg-[#DDB83C] text-black font-bold text-sm shadow-lg transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>{loading ? "Creating Account..." : "Create Free Patient Account"}</span>
                  </button>
                </form>
              )}

              {/* 3. DUAL-FACTOR REF ID & PHONE LOOKUP */}
              {authMode === "REF_LOOKUP" && (
                <form onSubmit={handleRefLookup} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#A39E93] mb-1.5">
                      Booking Reference Number *
                    </label>
                    <div className="relative">
                      <FileText className="w-4 h-4 text-[#888] absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. ADS-2026-8941"
                        value={lookupRef}
                        onChange={(e) => {
                          setError("");
                          setLookupRef(e.target.value);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#121110] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#A39E93] mb-1.5">
                      Registered Mobile Number (For Verification) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#888] absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        required
                        inputMode="tel"
                        placeholder="+91 98XXX XXXXX"
                        value={lookupPhone}
                        onChange={(e) => {
                          setError("");
                          setLookupPhone(e.target.value);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#121110] text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A227]/30 focus:border-[#C9A227] transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-[#C9A227] hover:bg-[#DDB83C] text-black font-bold text-sm shadow-lg transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>{loading ? "Searching Records..." : "Access Verified Booking"}</span>
                  </button>
                </form>
              )}

              <div className="text-center pt-2">
                <Link
                  href="/book"
                  className="text-xs font-semibold text-[#C9A227] hover:underline inline-flex items-center gap-1"
                >
                  <span>Need a new dental appointment? Book Online</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </MotionReveal>
        ) : (
          /* ACTIVE AUTHENTICATED PATIENT CARE DASHBOARD */
          <div className="space-y-6 animate-fadeIn">
            {/* Header User Profile Bar */}
            <div className="bg-white dark:bg-[#181715] p-6 sm:p-8 rounded-3xl border border-[#C9A227]/30 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#C9A227]/20 text-[#C9A227] flex items-center justify-center font-black text-xl">
                  {currentUser?.name ? currentUser.name.charAt(0) : "P"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] dark:text-white">
                      {currentUser?.name}
                    </h1>
                    <span className="text-[10px] font-bold bg-green-500/15 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                      Verified Patient Account
                    </span>
                  </div>
                  <p className="text-xs text-[#888] mt-0.5">
                    {currentUser?.phone ? `${currentUser.phone} • ` : ""}
                    {currentUser?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl border border-[#C9A227]/40 bg-[#FAF8F5] dark:bg-[#22201C] hover:bg-[#C9A227]/15 text-xs font-bold text-[#1A1A1A] dark:text-white flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Edit Profile</span>
                </button>
                <Link
                  href="/book"
                  className="px-4 py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#DDB83C] text-black font-bold text-xs shadow-md"
                >
                  Schedule New Visit
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] text-xs font-semibold text-gray-500 hover:text-red-500 flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>

            {/* Appointments List */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C9A227]" />
                <span>Scheduled Treatment Sessions &amp; History</span>
              </h2>

              {userBookings.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-[#181715] rounded-3xl border border-[#C9A227]/20 space-y-3">
                  <p className="text-sm text-[#888]">No appointments found for this account.</p>
                  <Link
                    href="/book"
                    className="inline-block bg-[#C9A227] hover:bg-[#DDB83C] text-black text-xs font-bold px-5 py-2.5 rounded-xl shadow transition-all"
                  >
                    Schedule Your First Appointment →
                  </Link>
                </div>
              ) : (
                userBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white dark:bg-[#181715] p-6 sm:p-8 rounded-3xl border border-[#C9A227]/25 shadow-lg space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#FAF8F5] dark:border-[#26231E] pb-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#C9A227] tracking-wider block">
                          Booking Reference: {b.refNumber}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-[#1A1A1A] dark:text-white mt-0.5">
                          {b.serviceName}
                        </h3>
                      </div>

                      <span
                        className={`text-xs font-black uppercase px-3.5 py-1 rounded-full ${
                          b.status === "CONFIRMED"
                            ? "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300 border border-green-300 dark:border-green-800"
                            : b.status === "COMPLETED"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800"
                            : b.status === "CANCELLED"
                            ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-800"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-800"
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-[#888] block">Date</span>
                        <span className="font-bold text-[#1A1A1A] dark:text-white mt-0.5 block text-sm">
                          {b.appointmentDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#888] block">Time Slot</span>
                        <span className="font-bold text-green-700 dark:text-green-400 mt-0.5 block text-sm">
                          {b.timeSlot}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#888] block">Attending Doctor</span>
                        <span className="font-bold text-[#1A1A1A] dark:text-white mt-0.5 block text-sm">
                          {b.preferredDoctor}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#888] block">Studio Location</span>
                        <span className="text-[#555] dark:text-[#AAA] mt-0.5 block truncate">
                          Awadhpuri, Bhopal
                        </span>
                      </div>
                    </div>

                    {/* Doctor Findings */}
                    {b.doctorNotes && (
                      <div className="p-4 bg-[#FAF8F5] dark:bg-[#121110] rounded-2xl border border-[#C9A227]/20 text-xs space-y-1">
                        <span className="font-bold text-[#C9A227] block">
                          👨‍⚕️ Clinical Notes from Doctor:
                        </span>
                        <p className="text-[#444] dark:text-[#CCC]">{b.doctorNotes}</p>
                      </div>
                    )}

                    {/* Prescriptions */}
                    {b.prescription && (
                      <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-2xl border border-green-200 dark:border-green-800/40 text-xs space-y-1">
                        <span className="font-bold text-green-700 dark:text-green-400 block">
                          💊 Prescription &amp; Post-Care Regimen:
                        </span>
                        <p className="text-green-900 dark:text-green-200">{b.prescription}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 flex flex-wrap gap-2.5 justify-end">
                      <Link
                        href={`/booking-confirmation/${b.refNumber}`}
                        className="px-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#22201C] hover:bg-[#C9A227]/15 border border-[#C9A227]/30 text-xs font-semibold text-[#1A1A1A] dark:text-white flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>Digital Pass &amp; Calendar Sync</span>
                      </Link>

                      <a
                        href={`https://wa.me/919203604211?text=${encodeURIComponent(
                          `Hello Dr. Shreya, I would like to inquire about my appointment ${b.refNumber}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold flex items-center gap-1.5"
                      >
                        <span>WhatsApp Care Desk</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Health Profile Modal */}
      {currentUser && (
        <PatientEditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          patient={currentUser}
          onUpdated={(updated) => {
            setCurrentUser(updated);
          }}
        />
      )}
    </div>
  );
}
