import HeroSection from "@/components/home/HeroSection";
import DoctorSection from "@/components/home/DoctorSection";
import RecommendationModel from "@/components/home/RecommendationModel";
import ServicesGrid from "@/components/home/ServicesGrid";
import BeforeAfterSlider from "@/components/home/BeforeAfterSlider";
import ClinicFeatures from "@/components/home/ClinicFeatures";
import CostEstimator from "@/components/home/CostEstimator";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FAQSection from "@/components/home/FAQSection";
import Link from "next/link";
import { Calendar, Phone, MapPin, Clock, ArrowRight } from "lucide-react";
import { CLINIC_INFO } from "@/lib/constants";

export default function HomePage() {
  return (
    <>
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Quick Contact & Info Bar */}
      <section className="bg-[#FAF8F5] dark:bg-[#151412] border-y border-[#C9A227]/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-[#1C1A17] border border-[#C9A227]/20 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#C9A227]/15 flex items-center justify-center text-[#C9A227] flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-[#8A8175] block font-medium">
                  Need Dental Consultation?
                </span>
                <a
                  href={`tel:${CLINIC_INFO.rawPhone}`}
                  className="font-bold text-sm sm:text-base text-[#1A1A1A] dark:text-white hover:text-[#C9A227]"
                >
                  {CLINIC_INFO.phone}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-[#1C1A17] border border-[#C9A227]/20 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#C9A227]/15 flex items-center justify-center text-[#C9A227] flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-[#8A8175] block font-medium">
                  Opening Hours
                </span>
                <span className="font-bold text-sm sm:text-base text-[#1A1A1A] dark:text-white block">
                  {CLINIC_INFO.hours}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-[#1C1A17] border border-[#C9A227]/20 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[#C9A227]/15 flex items-center justify-center text-[#C9A227] flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-[#8A8175] block font-medium">
                  Studio Location
                </span>
                <span className="font-bold text-sm text-[#1A1A1A] dark:text-white block truncate max-w-[200px]">
                  {CLINIC_INFO.shortAddress}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Meet Your Doctor Section */}
      <DoctorSection />

      {/* 4. AI Dental Treatment Recommendation Model */}
      <RecommendationModel />

      {/* 5. Featured Services Grid (Top 6) */}
      <ServicesGrid limit={6} />

      {/* 5. Before & After Transformation Slider */}
      <BeforeAfterSlider />

      {/* 6. Why Choose Us (Clinical Features & Safety) */}
      <ClinicFeatures />

      {/* 7. Interactive Treatment Budget Estimator */}
      <CostEstimator />

      {/* 8. Patient Testimonials */}
      <TestimonialsSection />

      {/* 9. FAQs */}
      <FAQSection />

      {/* 10. Direct Booking CTA Banner */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-[#1A1815] via-[#2A2621] to-[#1A1815] text-white border-t border-[#C9A227]/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#C9A227_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10 space-y-6">
          <span className="text-xs uppercase tracking-widest text-[#DDB83C] font-bold">
            Start Your Smile Journey Today
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready for a Healthier, Confident Smile?
          </h2>
          <p className="text-sm sm:text-base text-[#D1C7B7] max-w-2xl mx-auto leading-relaxed">
            Schedule your appointment online in less than 2 minutes. Receive an instant booking pass, preparation guidelines, and calendar reminder.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 bg-[#C9A227] hover:bg-[#DDB83C] text-black font-bold text-sm sm:text-base px-8 py-4 rounded-2xl shadow-xl transition-all"
            >
              <Calendar className="w-5 h-5" />
              <span>Book Appointment Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={`tel:${CLINIC_INFO.rawPhone}`}
              className="inline-flex items-center justify-center gap-2 border border-white/30 hover:border-white text-white font-semibold text-sm sm:text-base px-6 py-4 rounded-2xl transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Emergency Hotline: {CLINIC_INFO.phone}</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
