"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { CLINIC_INFO, CLINIC_SERVICES } from "@/lib/constants";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    serviceOfInterest: "Root Canal Treatment (RCT)",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit inquiry.");
      }

      setSuccess(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        serviceOfInterest: "Root Canal Treatment (RCT)",
        subject: "",
        message: "",
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 md:py-12">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-gradient-to-r from-[#1C1A17] via-[#2D2821] to-[#1C1A17] text-white p-8 sm:p-14 rounded-3xl border border-[#C9A227]/30 text-center relative overflow-hidden shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#DDB83C] text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>We are here to help</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Contact <span className="gold-text-gradient">Amulyam Dental Studio</span>
          </h1>
          <p className="text-sm sm:text-base text-[#D1C7B7] max-w-2xl mx-auto leading-relaxed">
            Reach out to our dental team for appointments, treatment quotes, second opinions, or emergency care in Bhopal.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7 bg-white dark:bg-[#181715] p-6 sm:p-10 rounded-3xl border border-[#C9A227]/25 shadow-xl">
            <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-2">
              Send us a Message
            </h2>
            <p className="text-xs sm:text-sm text-[#7A7265] dark:text-[#A39E93] mb-6">
              Fill in your contact information below and our team will get back to you promptly.
            </p>

            {success ? (
              <div className="p-8 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800/40 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto" />
                <h3 className="text-lg font-bold text-green-800 dark:text-green-300">
                  Message Sent Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-green-700 dark:text-green-400">
                  Thank you for reaching out. Dr. Shreya Nidhi and our team have received your message and will respond within 2-4 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="mt-4 text-xs font-bold text-[#C9A227] underline"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#A39E93] mb-1.5">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#1C1A17] text-sm focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#A39E93] mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sharma"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#1C1A17] text-sm focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#A39E93] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#1C1A17] text-sm focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#A39E93] mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#1C1A17] text-sm focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#A39E93] mb-1.5">
                      Service of Interest
                    </label>
                    <select
                      value={formData.serviceOfInterest}
                      onChange={(e) =>
                        setFormData({ ...formData, serviceOfInterest: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#1C1A17] text-sm focus:outline-none focus:border-[#C9A227]"
                    >
                      {CLINIC_SERVICES.map((s) => (
                        <option key={s.id} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                      <option value="Other Inquiry">Other Dental Question</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#A39E93] mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="How can we help you?"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#1C1A17] text-sm focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#A39E93] mb-1.5">
                    Your Message / Dental Symptoms *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your query, tooth pain, or requirement in detail..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#E5DFD5] dark:border-[#332F28] bg-[#FAF8F5] dark:bg-[#1C1A17] text-sm focus:outline-none focus:border-[#C9A227]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#C9A227] to-[#DDB83C] hover:from-[#DDB83C] hover:to-[#C9A227] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? "Sending..." : "Send Message to Clinic"}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Direct Info Cards & Timings */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-[#181715] p-6 rounded-3xl border border-[#C9A227]/25 shadow-xl space-y-5">
              <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white border-b border-[#FAF8F5] dark:border-[#332F28] pb-3">
                Get in Touch Directly
              </h3>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#C9A227]/15 text-[#C9A227] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#8A8175] block font-semibold">
                    Call Us
                  </span>
                  <a
                    href={`tel:${CLINIC_INFO.rawPhone}`}
                    className="text-sm font-bold text-[#1A1A1A] dark:text-white hover:text-[#C9A227]"
                  >
                    {CLINIC_INFO.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#C9A227]/15 text-[#C9A227] flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#8A8175] block font-semibold">
                    Email
                  </span>
                  <a
                    href={`mailto:${CLINIC_INFO.email}`}
                    className="text-sm font-bold text-[#1A1A1A] dark:text-white hover:text-[#C9A227]"
                  >
                    {CLINIC_INFO.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#C9A227]/15 text-[#C9A227] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#8A8175] block font-semibold">
                    Clinic Address
                  </span>
                  <p className="text-xs text-[#6B6B6B] dark:text-[#A8A29E] leading-relaxed">
                    {CLINIC_INFO.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#C9A227]/15 text-[#C9A227] flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#8A8175] block font-semibold">
                    Working Hours
                  </span>
                  <p className="text-xs text-[#6B6B6B] dark:text-[#A8A29E]">
                    {CLINIC_INFO.hours}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={CLINIC_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp Directly</span>
                </a>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div className="rounded-3xl overflow-hidden border border-[#C9A227]/30 shadow-xl h-64 bg-gray-200">
              <iframe
                title="Amulyam Dental Studio Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3665.8!2d77.48!3d23.23!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDEzJzQ4LjAiTiA3N8KwMjgnNDguMCJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
