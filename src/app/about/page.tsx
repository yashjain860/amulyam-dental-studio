import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Award,
  CheckCircle2,
  Calendar,
  Heart,
  Eye,
  Target,
  Play,
  ArrowRight,
} from "lucide-react";
import { LEAD_DOCTOR, CLINIC_INFO } from "@/lib/constants";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import MotionReveal, { StaggerContainer, StaggerItem } from "@/components/ui/MotionReveal";

export const metadata = {
  title: "About Us | Amulyam Dental Studio & Dr. Shreya Nidhi",
  description:
    "Learn about Amulyam Dental Studio's philosophy, world-class sterilization protocols, and lead dentist Dr. Shreya Nidhi (BDS, MDS) in Awadhpuri, Bhopal.",
};

export default function AboutPage() {
  return (
    <div className="py-8 md:py-12 overflow-hidden">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <MotionReveal direction="up">
          <div className="bg-gradient-to-r from-[#1C1A17] via-[#2D2821] to-[#1C1A17] text-white p-8 sm:p-14 rounded-3xl border border-[#C9A227]/30 text-center relative overflow-hidden shadow-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#DDB83C] text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Our Story &amp; Philosophy</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Expert Care for a <span className="gold-text-gradient">Confident Smile</span>
            </h1>
            <p className="text-sm sm:text-base text-[#D1C7B7] max-w-2xl mx-auto leading-relaxed">
              Discover our commitment to exceptional dental care in a comfortable, modern, and stress-free environment.
            </p>
          </div>
        </MotionReveal>
      </div>

      {/* Main Story & Philosophy Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Media Reel Gallery */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <MotionReveal direction="right" delay={0.1}>
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#C9A227]/30 aspect-[3/4] bg-black">
                <video
                  src="/images/v2.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md p-2 rounded-lg text-white text-[10px] text-center">
                  Modern Operatory Setup
                </div>
              </div>
            </MotionReveal>

            <MotionReveal direction="left" delay={0.2}>
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-[#C9A227]/30 aspect-[3/4] bg-[#1C1A17] mt-6">
                <Image
                  src="/images/dr_shreya_.jpg"
                  alt={LEAD_DOCTOR.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md p-2 rounded-lg text-white text-[10px] text-center">
                  Dr. Shreya Nidhi
                </div>
              </div>
            </MotionReveal>
          </div>

          {/* Story Copy */}
          <div className="lg:col-span-7 space-y-6">
            <MotionReveal direction="up" delay={0.15}>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C9A227] bg-[#C9A227]/10 px-3 py-1 rounded-full">
                Excellence with Compassion
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-[#F8F6F2] leading-tight mt-3 mb-4">
                A Warm, Modern Dental Sanctuary in Bhopal
              </h2>
              <p className="text-sm sm:text-base text-[#6B6B6B] dark:text-[#A8A29E] leading-relaxed mb-4">
                At Amulyam Dental Studio, we are committed to delivering exceptional dental care that combines advanced medical technology with a gentle, compassionate approach. Our focus is on providing comfortable, precise, and personalized treatments tailored to every patient's unique needs.
              </p>
              <p className="text-sm sm:text-base text-[#6B6B6B] dark:text-[#A8A29E] leading-relaxed">
                From routine checkups and pediatric tooth care to complete smile transformations and complex implantology, we ensure every visit is smooth, stress-free, and designed to keep your smile healthy and bright for life.
              </p>
            </MotionReveal>

            <StaggerContainer className="grid grid-cols-2 gap-4 pt-2">
              <StaggerItem>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#333] dark:text-[#DDD]">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A227]" />
                  <span>Personalized Treatment Plans</span>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#333] dark:text-[#DDD]">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A227]" />
                  <span>Zero-Anxiety Environment</span>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#333] dark:text-[#DDD]">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A227]" />
                  <span>Advanced Low-Dose RVG</span>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#333] dark:text-[#DDD]">
                  <CheckCircle2 className="w-4 h-4 text-[#C9A227]" />
                  <span>Strict Sterilization</span>
                </div>
              </StaggerItem>
            </StaggerContainer>

            <MotionReveal direction="up" delay={0.3} className="pt-4">
              <Link
                href="/book"
                className="inline-flex items-center gap-2 bg-[#C9A227] hover:bg-[#DDB83C] text-white font-semibold text-sm px-7 py-3.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Your Visit Today</span>
              </Link>
            </MotionReveal>
          </div>
        </div>
      </section>

      {/* Mission & Vision Cards */}
      <section className="py-16 bg-[#FAF8F5] dark:bg-[#151412] border-y border-[#C9A227]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission */}
            <StaggerItem>
              <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#181715] border border-[#C9A227]/30 shadow-lg h-full">
                <div className="w-12 h-12 rounded-2xl bg-[#C9A227]/15 text-[#C9A227] flex items-center justify-center mb-6">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-3">
                  Our Mission
                </h3>
                <p className="text-sm text-[#6B6B6B] dark:text-[#A8A29E] leading-relaxed">
                  Our mission is to provide world-class dental care with an unwavering focus on patient comfort, state-of-the-art dental technology, and personalized treatment for every patient, ensuring they achieve and maintain optimal oral health for life.
                </p>
              </div>
            </StaggerItem>

            {/* Vision */}
            <StaggerItem>
              <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#181715] border border-[#C9A227]/30 shadow-lg h-full">
                <div className="w-12 h-12 rounded-2xl bg-[#C9A227]/15 text-[#C9A227] flex items-center justify-center mb-6">
                  <Eye className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] dark:text-white mb-3">
                  Our Vision
                </h3>
                <p className="text-sm text-[#6B6B6B] dark:text-[#A8A29E] leading-relaxed">
                  Our vision is to become the most trusted dental center in Central India, renowned for clinical excellence, artistic smile redesigns, and setting benchmark standards for patient hygiene and transparent clinical care.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />
    </div>
  );
}
