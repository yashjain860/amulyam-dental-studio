import { Suspense } from "react";
import BookingWizard from "@/components/booking/BookingWizard";
import { Sparkles, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
import { CLINIC_INFO } from "@/lib/constants";
import MotionReveal, { StaggerContainer, StaggerItem } from "@/components/ui/MotionReveal";

export const metadata = {
  title: "Book Dental Appointment Online | Amulyam Dental Studio",
  description:
    "Schedule your dental consultation with Dr. Shreya Nidhi in Awadhpuri, Bhopal. Instant digital pass, calendar sync, and zero waiting time.",
};

export default function BookAppointmentPage() {
  return (
    <div className="py-8 md:py-12 overflow-hidden">
      {/* Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <MotionReveal direction="up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#A88214] dark:text-[#E5C76B] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Real-Time Online Booking Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-[#F8F6F2]">
            Schedule Your <span className="gold-text-gradient">Dental Appointment</span>
          </h1>
          <p className="text-sm text-[#6B6B6B] dark:text-[#A8A29E] mt-2 max-w-xl mx-auto">
            Reserve your preferred time slot with Dr. Shreya Nidhi in 4 easy steps. Instant confirmation pass generated upon submission.
          </p>
        </MotionReveal>
      </div>

      {/* Booking Wizard Container with Suspense */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <MotionReveal direction="up" delay={0.15}>
          <Suspense
            fallback={
              <div className="p-12 text-center text-sm text-[#888]">
                Loading appointment scheduler...
              </div>
            }
          >
            <BookingWizard />
          </Suspense>
        </MotionReveal>
      </div>

      {/* Reassurance Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <StaggerItem>
            <div className="p-5 rounded-2xl bg-white dark:bg-[#181715] border border-[#C9A227]/20 shadow-sm h-full">
              <Clock className="w-6 h-6 text-[#C9A227] mx-auto mb-2" />
              <h3 className="font-bold text-sm text-[#1A1A1A] dark:text-white">Zero Wait Time</h3>
              <p className="text-xs text-[#888] mt-1">Dedicated slots booked exclusively for your dental care.</p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="p-5 rounded-2xl bg-white dark:bg-[#181715] border border-[#C9A227]/20 shadow-sm h-full">
              <ShieldCheck className="w-6 h-6 text-[#C9A227] mx-auto mb-2" />
              <h3 className="font-bold text-sm text-[#1A1A1A] dark:text-white">Free Rescheduling</h3>
              <p className="text-xs text-[#888] mt-1">Easily reschedule online or via WhatsApp anytime.</p>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="p-5 rounded-2xl bg-white dark:bg-[#181715] border border-[#C9A227]/20 shadow-sm h-full">
              <CheckCircle2 className="w-6 h-6 text-[#C9A227] mx-auto mb-2" />
              <h3 className="font-bold text-sm text-[#1A1A1A] dark:text-white">Instant Digital Pass</h3>
              <p className="text-xs text-[#888] mt-1">QR check-in pass &amp; calendar invite sent to your email.</p>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </section>
    </div>
  );
}
