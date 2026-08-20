import ServicesGrid from "@/components/home/ServicesGrid";
import Link from "next/link";
import { Sparkles, Calendar, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { CLINIC_INFO } from "@/lib/constants";
import MotionReveal, { StaggerContainer, StaggerItem } from "@/components/ui/MotionReveal";

export const metadata = {
  title: "All Dental Treatments & Services | Amulyam Dental Studio",
  description:
    "Explore our complete range of advanced dental treatments in Bhopal: Painless RCT, Dental Implants, Teeth Whitening, Clear Aligners, Crowns & Smile Design.",
};

export default function ServicesPage() {
  return (
    <div className="py-8 md:py-12 overflow-hidden">
      {/* Page Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <MotionReveal direction="up">
          <div className="bg-gradient-to-r from-[#1C1A17] via-[#2D2821] to-[#1C1A17] text-white p-8 sm:p-14 rounded-3xl border border-[#C9A227]/30 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#C9A227]/10 rounded-full blur-3xl" />
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#DDB83C] text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>World-Class Dental Care in Bhopal</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Expert Dental Care for <span className="gold-text-gradient">Every Need</span>
            </h1>
            <p className="text-sm sm:text-base text-[#D1C7B7] max-w-2xl mx-auto leading-relaxed">
              Personalized, advanced treatments designed to keep your smile healthy, beautiful, and pain-free. We use digital 3D imaging, ultrasonic technology, and biocompatible materials.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/book"
                className="bg-[#C9A227] hover:bg-[#DDB83C] text-black font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment Online</span>
              </Link>
            </div>
          </div>
        </MotionReveal>
      </div>

      {/* Full Services Grid with Category Filter */}
      <ServicesGrid />

      {/* Quality Guarantees Banner */}
      <section className="py-16 bg-[#FAF8F5] dark:bg-[#151412] border-t border-[#C9A227]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StaggerItem>
              <div className="p-6 rounded-2xl bg-white dark:bg-[#1C1A17] border border-[#C9A227]/20 h-full shadow-sm hover:shadow-md transition-all">
                <ShieldCheck className="w-8 h-8 text-[#C9A227] mb-3" />
                <h3 className="font-bold text-base text-[#1A1A1A] dark:text-white mb-1">
                  Sterilized &amp; Safe
                </h3>
                <p className="text-xs text-[#6B6B6B] dark:text-[#A8A29E] leading-relaxed">
                  Single-use disposable instruments and 5-stage Class-B autoclaving for zero cross-contamination.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="p-6 rounded-2xl bg-white dark:bg-[#1C1A17] border border-[#C9A227]/20 h-full shadow-sm hover:shadow-md transition-all">
                <Sparkles className="w-8 h-8 text-[#C9A227] mb-3" />
                <h3 className="font-bold text-base text-[#1A1A1A] dark:text-white mb-1">
                  Precision CAD/CAM
                </h3>
                <p className="text-xs text-[#6B6B6B] dark:text-[#A8A29E] leading-relaxed">
                  Computer-designed custom crowns, bridges, and veneers for flawless bite alignment and aesthetic harmony.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="p-6 rounded-2xl bg-white dark:bg-[#1C1A17] border border-[#C9A227]/20 h-full shadow-sm hover:shadow-md transition-all">
                <CheckCircle2 className="w-8 h-8 text-[#C9A227] mb-3" />
                <h3 className="font-bold text-base text-[#1A1A1A] dark:text-white mb-1">
                  Transparent Pricing
                </h3>
                <p className="text-xs text-[#6B6B6B] dark:text-[#A8A29E] leading-relaxed">
                  Honest clinical recommendations with clear upfront pricing and 0% interest EMI options.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>
    </div>
  );
}
