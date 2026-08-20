"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Play, Eye, X, Calendar, ArrowRight } from "lucide-react";
import { GALLERY_ITEMS } from "@/lib/constants";
import MotionReveal, { StaggerContainer, StaggerItem } from "@/components/ui/MotionReveal";
import BeforeAfterSmileStudio from "@/components/clinical/BeforeAfterSmileStudio";

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [activeLightbox, setActiveLightbox] = useState<any | null>(null);

  const additionalPhotos = [
    { id: "photo-1", title: "Rotary Endodontics & Apex Locator Setup", category: "Equipment", image: "/images/s3.jpg" },
    { id: "photo-2", title: "Aesthetic Dental Restorations & Veneers", category: "Treatments", image: "/images/s14.jpg" },
    { id: "photo-3", title: "Ultrasonic Scaler & Polishing Unit", category: "Equipment", image: "/images/s8.jpg" },
    { id: "photo-4", title: "In-Office Laser Whitening Studio", category: "Treatments", image: "/images/s9.jpg" },
    { id: "photo-5", title: "Digital RVG Radiography Sensor", category: "Technology", image: "/images/4.jpeg" },
    { id: "photo-6", title: "CAD/CAM Zirconia Crowns & Bridges", category: "Treatments", image: "/images/s10.jpg" },
  ];

  const allItems = [...GALLERY_ITEMS, ...additionalPhotos];

  const filtered =
    activeTab === "ALL" ? allItems : allItems.filter((i) => i.category === activeTab);

  const tabs = ["ALL", "Clinic", "Equipment", "Technology", "Treatments"];

  return (
    <div className="py-8 md:py-12 overflow-hidden">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <MotionReveal direction="up">
          <div className="bg-gradient-to-r from-[#1C1A17] via-[#2D2821] to-[#1C1A17] text-white p-8 sm:p-14 rounded-3xl border border-[#C9A227]/30 text-center relative overflow-hidden shadow-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#DDB83C] text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Virtual Clinic Tour</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Glimpses of Our <span className="gold-text-gradient">Premium Clinic</span>
            </h1>
            <p className="text-sm sm:text-base text-[#D1C7B7] max-w-2xl mx-auto leading-relaxed">
              Take a visual tour around our state-of-the-art dental studio designed for your highest comfort, relaxation, and safety.
            </p>
          </div>
        </MotionReveal>
      </div>

      {/* Video Reels Tour Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14">
        <MotionReveal direction="up" className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#1A1A1A] dark:text-white">
            Clinic Video Shorts
          </h2>
          <p className="text-xs text-[#8A8175] mt-1">Live walkthrough of our Bhopal studio</p>
        </MotionReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <MotionReveal direction="right" delay={0.1}>
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-[#C9A227]/30 bg-black aspect-[9/16] max-h-[500px] mx-auto relative group">
              <video
                src="/images/v1.mp4"
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </MotionReveal>

          <MotionReveal direction="left" delay={0.2}>
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-[#C9A227]/30 bg-black aspect-[9/16] max-h-[500px] mx-auto relative group">
              <video
                src="/images/v2.mp4"
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </MotionReveal>
        </div>
      </div>

      {/* Interactive Before & After Smile Studio */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <MotionReveal direction="up" className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#DDB83C] text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real Patient Results</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] dark:text-white">
            Before &amp; After <span className="gold-text-gradient">Smile Makeovers</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8A8175] mt-1 max-w-xl mx-auto">
            Interact with our split slider to see real cosmetic smile transformations crafted by Dr. Shreya Nidhi.
          </p>
        </MotionReveal>

        <BeforeAfterSmileStudio
          cases={[
            {
              id: "smile-01",
              title: "Upper Arch E-Max Veneers Makeover",
              category: "Cosmetic Veneers",
              patientInitials: "R.S.",
              patientAge: 28,
              beforeImage: "/images/s10.jpg",
              afterImage: "/images/s14.jpg",
              doctorNotes: "Corrected fluorosis discoloration & midline diastema with 6 minimal-prep E-max lithium disilicate veneers (Shade BL2).",
              treatmentDuration: "2 Visits (5 Days)",
              consentGranted: true,
              featured: true,
              createdAt: "2026-08-01T10:00:00Z",
            },
            {
              id: "smile-02",
              title: "Single-Visit Laser Teeth Whitening",
              category: "Teeth Whitening",
              patientInitials: "A.K.",
              patientAge: 34,
              beforeImage: "/images/s11.jpg",
              afterImage: "/images/s12.jpg",
              doctorNotes: "Hydrogen peroxide 37.5% light-activated in-office bleaching. Improved from Shade A3.5 to A1 in 45 minutes.",
              treatmentDuration: "1 Visit (45 Mins)",
              consentGranted: true,
              featured: true,
              createdAt: "2026-08-10T11:30:00Z",
            },
            {
              id: "smile-03",
              title: "Clear Aligner Crowding Correction",
              category: "Clear Aligners",
              patientInitials: "P.T.",
              patientAge: 24,
              beforeImage: "/images/s13.jpg",
              afterImage: "/images/s14.jpg",
              doctorNotes: "Resolved anterior crowding with 14 transparent aligner trays over 7 months without wire braces.",
              treatmentDuration: "7 Months",
              consentGranted: true,
              featured: true,
              createdAt: "2026-07-15T09:00:00Z",
            },
          ]}
        />
      </div>

      {/* Photo Gallery with Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionReveal direction="up" delay={0.1}>
          <div className="flex justify-center gap-2 mb-10 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#C9A227] text-white shadow-md"
                    : "bg-white dark:bg-[#1C1A17] text-[#666] dark:text-[#AAA] border border-[#C9A227]/25 hover:border-[#C9A227]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </MotionReveal>

        {/* Gallery Grid */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <StaggerItem key={item.id}>
              <div
                onClick={() => setActiveLightbox(item)}
                className="bg-white dark:bg-[#181715] rounded-3xl border border-[#C9A227]/25 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2 font-semibold text-sm backdrop-blur-[2px]">
                    <Eye className="w-5 h-5" />
                    <span>View Full Photo</span>
                  </div>
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-[#DDB83C] border border-[#C9A227]/30">
                    {item.category}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-sm text-[#1A1A1A] dark:text-[#F8F6F2]">
                    {item.title}
                  </h3>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>

      {/* Lightbox Modal */}
      {activeLightbox && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div data-lenis-prevent className="relative max-w-4xl w-full bg-[#181715] rounded-3xl border border-[#C9A227]/40 overflow-hidden shadow-2xl p-4 animate-scaleUp">
            <button
              onClick={() => setActiveLightbox(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-[#C9A227] hover:text-black transition-all cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black mb-4">
              <Image
                src={activeLightbox.image}
                alt={activeLightbox.title}
                fill
                className="object-contain"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
              <div>
                <span className="text-xs font-bold text-[#C9A227] uppercase tracking-wider">
                  {activeLightbox.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {activeLightbox.title}
                </h3>
              </div>

              <Link
                href="/book"
                onClick={() => setActiveLightbox(null)}
                className="bg-[#C9A227] hover:bg-[#DDB83C] text-black font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
