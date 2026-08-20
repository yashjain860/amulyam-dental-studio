"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Download,
  Share2,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { CLINIC_INFO } from "@/lib/constants";
import { Booking } from "@/lib/types";

export default function BookingConfirmationPage() {
  const params = useParams();
  const id = params?.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/${id}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Booking not found.");
        }
        setBooking(data.booking);
      } catch (err: any) {
        setError(err.message || "Failed to load booking pass.");
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-12 h-12 border-4 border-[#C9A227] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#888]">Generating Digital Appointment Pass...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="py-20 max-w-lg mx-auto px-4 text-center">
        <div className="p-8 rounded-3xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-red-800 dark:text-red-200">
            Booking Pass Not Found
          </h2>
          <p className="text-xs text-red-700 dark:text-red-300">
            {error || "The requested reference ID does not exist or may have been removed."}
          </p>
          <Link
            href="/book"
            className="inline-block bg-[#C9A227] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow"
          >
            Schedule a New Appointment
          </Link>
        </div>
      </div>
    );
  }

  // Google Calendar URL Generator
  const generateGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`${booking.serviceName} at Amulyam Dental Studio`);
    const details = encodeURIComponent(
      `Appointment Reference: ${booking.refNumber}\nDoctor: ${booking.preferredDoctor}\nClinic Address: ${CLINIC_INFO.address}\nPhone: ${CLINIC_INFO.phone}`
    );
    const location = encodeURIComponent(CLINIC_INFO.address);
    const dateFormatted = booking.appointmentDate.replace(/-/g, "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dateFormatted}T053000Z/${dateFormatted}T063000Z`;
  };

  // ICS File Generator
  const downloadIcsFile = () => {
    const dateFormatted = booking.appointmentDate.replace(/-/g, "");
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Amulyam Dental Studio//Booking Pass//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:${booking.serviceName} - Amulyam Dental Studio
DESCRIPTION:Appointment Reference: ${booking.refNumber}\\nDoctor: ${booking.preferredDoctor}\\nPhone: ${CLINIC_INFO.phone}
LOCATION:${CLINIC_INFO.address}
DTSTART:${dateFormatted}T100000Z
DTEND:${dateFormatted}T110000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Amulyam_Appointment_${booking.refNumber}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const whatsappMsg = encodeURIComponent(
    `Hello Dr. Shreya / Amulyam Dental Studio, I have a question regarding my appointment (Ref: ${booking.refNumber}) on ${booking.appointmentDate}.`
  );

  return (
    <div className="py-10 md:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Success Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider mb-3">
            <CheckCircle2 className="w-4 h-4" />
            <span>Appointment Request Registered</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-[#F8F6F2]">
            Your Digital <span className="gold-text-gradient">Appointment Pass</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7265] dark:text-[#A39E93] mt-1">
            Keep this digital pass for quick check-in at Amulyam Dental Studio reception.
          </p>
        </div>

        {/* Boarding Pass Style Card */}
        <div className="bg-white dark:bg-[#181715] rounded-3xl border-2 border-[#C9A227]/40 shadow-2xl overflow-hidden relative mb-8">
          {/* Card Top Gold Strip */}
          <div className="bg-gradient-to-r from-[#1C1A17] via-[#2D2821] to-[#1C1A17] text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-[#C9A227]">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#DDB83C] font-bold block">
                Amulyam Dental Studio
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {booking.serviceName}
              </h2>
              <span className="text-xs text-[#AAA]">{booking.category}</span>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase tracking-wider text-[#A39E93] block">
                Booking Reference
              </span>
              <span className="text-lg sm:text-xl font-mono font-bold text-[#DDB83C]">
                {booking.refNumber}
              </span>
              <div className="mt-1">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    booking.status === "CONFIRMED"
                      ? "bg-green-500 text-white"
                      : booking.status === "COMPLETED"
                      ? "bg-blue-600 text-white"
                      : booking.status === "CANCELLED"
                      ? "bg-red-600 text-white"
                      : "bg-[#C9A227] text-black"
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            </div>
          </div>

          {/* Card Body with QR Code & Details */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Details Column */}
            <div className="md:col-span-8 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-[#FAF8F5] dark:border-[#26231E]">
                <div>
                  <span className="text-xs text-[#8A8175] block">Date</span>
                  <span className="font-bold text-[#1A1A1A] dark:text-white flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-4 h-4 text-[#C9A227]" />
                    {booking.appointmentDate}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#8A8175] block">Time Slot</span>
                  <span className="font-bold text-[#1A1A1A] dark:text-white flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-4 h-4 text-[#C9A227]" />
                    {booking.timeSlot}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-[#FAF8F5] dark:border-[#26231E]">
                <div>
                  <span className="text-xs text-[#8A8175] block">Patient Name</span>
                  <span className="font-bold text-[#1A1A1A] dark:text-white flex items-center gap-1.5 mt-0.5">
                    <User className="w-4 h-4 text-[#C9A227]" />
                    {booking.patientName} {booking.age ? `(${booking.age} yrs)` : ""}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#8A8175] block">Attending Doctor</span>
                  <span className="font-bold text-[#1A1A1A] dark:text-white mt-0.5 block">
                    {booking.preferredDoctor}
                  </span>
                </div>
              </div>

              <div className="pb-3 border-b border-[#FAF8F5] dark:border-[#26231E]">
                <span className="text-xs text-[#8A8175] block">Studio Location</span>
                <p className="text-xs text-[#444] dark:text-[#DDD] flex items-start gap-1.5 mt-1 leading-relaxed">
                  <MapPin className="w-4 h-4 text-[#C9A227] flex-shrink-0 mt-0.5" />
                  <span>{CLINIC_INFO.address}</span>
                </p>
              </div>

              {booking.doctorNotes && (
                <div className="p-3 bg-[#FAF8F5] dark:bg-[#121110] rounded-xl border border-[#C9A227]/30">
                  <span className="text-[11px] font-bold text-[#C9A227] uppercase tracking-wider block">
                    Clinical Notes from Doctor:
                  </span>
                  <p className="text-xs text-[#333] dark:text-[#CCC] mt-0.5">
                    {booking.doctorNotes}
                  </p>
                </div>
              )}
            </div>

            {/* QR Code Column */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-[#FAF8F5] dark:bg-[#121110] rounded-2xl border border-[#C9A227]/20 text-center">
              <div className="bg-white p-3 rounded-xl shadow-md border border-[#E5DFD5]">
                <QRCodeSVG
                  value={`AMULYAM_PASS:${booking.refNumber}|${booking.patientName}|${booking.appointmentDate}|${booking.timeSlot}`}
                  size={120}
                  level="H"
                  fgColor="#1C1A17"
                />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8175] mt-3">
                Scan for Express Check-in
              </span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="p-6 bg-[#FAF8F5] dark:bg-[#121110] border-t border-[#E8E0D2] dark:border-[#26231E] flex flex-wrap items-center justify-center sm:justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <a
                href={generateGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white dark:bg-[#1C1A17] hover:bg-[#FAF8F5] border border-[#C9A227]/40 text-[#1A1A1A] dark:text-white font-semibold text-xs py-2 px-3.5 rounded-xl shadow-sm transition-all"
              >
                <Calendar className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Google Calendar</span>
              </a>

              <button
                type="button"
                onClick={downloadIcsFile}
                className="inline-flex items-center gap-1.5 bg-white dark:bg-[#1C1A17] hover:bg-[#FAF8F5] border border-[#C9A227]/40 text-[#1A1A1A] dark:text-white font-semibold text-xs py-2 px-3.5 rounded-xl shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Download .ICS</span>
              </button>

              <a
                href={CLINIC_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-white dark:bg-[#1C1A17] hover:bg-[#FAF8F5] border border-[#C9A227]/40 text-[#1A1A1A] dark:text-white font-semibold text-xs py-2 px-3.5 rounded-xl shadow-sm transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Get Directions</span>
              </a>
            </div>

            <a
              href={`https://wa.me/919203604211?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-xs py-2 px-4 rounded-xl shadow transition-all"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>

        {/* Preparation Guidelines */}
        <div className="bg-white dark:bg-[#181715] p-6 rounded-2xl border border-[#C9A227]/20 shadow-sm text-xs space-y-2">
          <h3 className="font-bold text-sm text-[#1A1A1A] dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
            <span>Important Visit Guidelines:</span>
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-[#666] dark:text-[#AAA]">
            <li>Please arrive 10 minutes prior to your time slot for preliminary registration.</li>
            <li>Carry any previous dental records, X-rays, or current medication prescriptions.</li>
            <li>If you need to reschedule, call us at <strong>{CLINIC_INFO.phone}</strong> or tap WhatsApp support above.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
