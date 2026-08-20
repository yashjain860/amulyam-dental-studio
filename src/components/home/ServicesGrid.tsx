"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Calendar,
  X,
} from "lucide-react";
import { CLINIC_SERVICES } from "@/lib/constants";
import { Service } from "@/lib/types";
import MotionReveal, { StaggerContainer, StaggerItem } from "../ui/MotionReveal";

export default function ServicesGrid({ limit }: { limit?: number }) {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [activeModalService, setActiveModalService] = useState<Service | null>(null);

  const categories = [
    "ALL",
    "Endodontics",
    "Implantology",
    "Cosmetic",
    "Preventive",
    "Orthodontics",
    "Surgery",
    "Prosthodontics",
  ];

  let displayServices =
    activeCategory === "ALL"
      ? CLINIC_SERVICES
      : CLINIC_SERVICES.filter((s) => s.category === activeCategory);

  if (limit) {
    displayServices = displayServices.slice(0, limit);
  }

  return (
    <section id="services" className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Motion */}
        <MotionReveal direction="up">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#A88214] dark:text-[#E5C76B] text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Comprehensive Dental Treatments</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-[#F8F6F2] tracking-tight">
              Your Smile, Our <span className="gold-text-gradient">Complete Care</span>
            </h2>
            <p className="text-sm sm:text-base text-[#6B6B6B] dark:text-[#A8A29E] mt-3">
              Personalized dental care for every smile—from preventive cleanings to advanced dental implants, rotary root canals, and cosmetic smile designs.
            </p>
          </div>
        </MotionReveal>

        {/* Category Filter Tabs */}
        {!limit && (
          <MotionReveal direction="up" delay={0.1}>
            <div className="flex justify-center flex-wrap gap-2 mb-10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-[#C9A227] text-white shadow-md"
                      : "bg-[#FAF8F5] dark:bg-[#1C1A17] text-[#555] dark:text-[#AAA] border border-[#C9A227]/20 hover:border-[#C9A227] hover:text-[#C9A227]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </MotionReveal>
        )}

        {/* Services Cards Grid with Stagger */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
          {displayServices.map((service) => (
            <StaggerItem key={service.id}>
              <div className="bg-white dark:bg-[#181715] rounded-3xl border border-[#C9A227]/20 hover:border-[#C9A227]/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group h-full hover:-translate-y-1">
                <div>
                  {service.image && (
                    <div className="relative h-48 w-full overflow-hidden bg-[#FAF8F5] dark:bg-[#121110]">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#DDB83C] border border-[#C9A227]/30">
                        {service.category}
                      </div>
                      {service.isPopular && (
                        <div className="absolute top-3 right-3 bg-[#C9A227] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                          POPULAR
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-[#F8F6F2] group-hover:text-[#C9A227] transition-colors mb-2">
                      {service.title}
                    </h3>
                    <p className="text-xs text-[#C9A227] font-semibold mb-2">{service.tagline}</p>
                    <p className="text-xs sm:text-sm text-[#6B6B6B] dark:text-[#A8A29E] line-clamp-3 leading-relaxed mb-4">
                      {service.description}
                    </p>

                    <ul className="space-y-1.5 mb-4">
                      {service.benefits.slice(0, 2).map((b, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-[#444] dark:text-[#CCC]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A227] flex-shrink-0" />
                          <span className="truncate">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Meta & Actions */}
                <div className="px-6 pb-6 pt-3 border-t border-[#FAF8F5] dark:border-[#222] flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-[#888] block">Duration</span>
                    <span className="font-semibold text-[#1A1A1A] dark:text-white flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#C9A227]" />
                      {service.duration}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveModalService(service)}
                      className="text-xs font-semibold text-[#888] hover:text-[#C9A227] py-1.5 px-2.5 rounded-lg border border-[#DDD] dark:border-[#333] transition-colors cursor-pointer"
                    >
                      Details
                    </button>

                    <Link
                      href={`/book?service=${service.id}`}
                      className="inline-flex items-center gap-1.5 bg-[#C9A227] hover:bg-[#DDB83C] text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow transition-all"
                    >
                      <span>Book</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* View All CTA if limited */}
        {limit && (
          <MotionReveal direction="up" delay={0.2}>
            <div className="text-center mt-12">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 border border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227] hover:text-white font-semibold text-sm px-8 py-3.5 rounded-full transition-all duration-300 shadow-sm"
              >
                <span>View All 14+ Dental Services</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </MotionReveal>
        )}
      </div>

      {/* Service Detail Modal */}
      {activeModalService && (
        <div data-lenis-prevent className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
            onClick={() => setActiveModalService(null)}
          />
          <div data-lenis-prevent className="relative bg-white dark:bg-[#1C1A17] rounded-3xl border border-[#C9A227]/40 shadow-2xl max-w-lg w-full p-6 z-10 max-h-[90vh] overflow-y-auto animate-scaleUp">
            <button
              onClick={() => setActiveModalService(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-black/20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-xs font-bold text-[#C9A227] uppercase tracking-wider bg-[#C9A227]/10 px-2.5 py-1 rounded-full">
              {activeModalService.category}
            </span>

            <h3 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] dark:text-white mt-3 mb-2">
              {activeModalService.title}
            </h3>

            <p className="text-xs sm:text-sm text-[#6B6B6B] dark:text-[#A8A29E] leading-relaxed mb-4">
              {activeModalService.longDescription || activeModalService.description}
            </p>

            <div className="bg-[#FAF8F5] dark:bg-[#121110] p-4 rounded-2xl border border-[#C9A227]/20 mb-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A227]">
                Key Clinical Benefits:
              </h4>
              <ul className="space-y-1.5 text-xs text-[#444] dark:text-[#CCC]">
                {activeModalService.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A227] flex-shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-between text-xs text-[#888] mb-6">
              <span>⏱ Expected Duration: <strong>{activeModalService.duration}</strong></span>
              <span>💰 Estimate: <strong className="text-[#C9A227]">{activeModalService.priceEstimate}</strong></span>
            </div>

            <Link
              href={`/book?service=${activeModalService.id}`}
              onClick={() => setActiveModalService(null)}
              className="w-full text-center bg-[#C9A227] hover:bg-[#DDB83C] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment for this Treatment</span>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
