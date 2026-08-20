import { Shield, Sparkles, HeartPulse, Clock, Smile, Users } from "lucide-react";
import MotionReveal, { StaggerContainer, StaggerItem } from "../ui/MotionReveal";

export default function ClinicFeatures() {
  const features = [
    {
      icon: HeartPulse,
      title: "100% Painless Dentistry",
      description: "Modern computerized local anesthesia and gentle rotary techniques ensure anxiety-free procedures.",
    },
    {
      icon: Shield,
      title: "5-Tier Sterilization Protocol",
      description: "Class-B vacuum autoclaves, sealed pouch packaging, and hospital-grade sanitization for every patient.",
    },
    {
      icon: Sparkles,
      title: "Advanced Dental Technology",
      description: "Digital intraoral sensors (RVG), panoramic imaging, and CAD/CAM precision prosthetics.",
    },
    {
      icon: Smile,
      title: "Customized Smile Design",
      description: "Bespoke smile transformations tailored to your facial contours, skin tone, and aesthetic goals.",
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Open 6 days a week from 10:00 AM to 8:00 PM with zero waiting time and emergency appointments.",
    },
    {
      icon: Users,
      title: "Family-Friendly Atmosphere",
      description: "A warm, tranquil environment designed to make kids, adults, and seniors feel completely at ease.",
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MotionReveal direction="up">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#A88214] dark:text-[#E5C76B] text-xs font-semibold uppercase tracking-wider mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>Why Choose Amulyam Dental Studio</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-[#F8F6F2]">
              Exceptional Service with a <span className="gold-text-gradient">Personal Touch</span>
            </h2>
            <p className="text-sm sm:text-base text-[#6B6B6B] dark:text-[#A8A29E] mt-3">
              Choosing the right dental provider matters. We combine expert care, advanced technology, and a warm atmosphere to ensure every visit is comfortable and efficient.
            </p>
          </div>
        </MotionReveal>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <StaggerItem key={idx}>
                <div className="p-8 rounded-3xl bg-white dark:bg-[#181715] border border-[#C9A227]/20 hover:border-[#C9A227]/60 shadow-sm hover:shadow-xl transition-all duration-300 group h-full hover:-translate-y-1">
                  <div className="w-14 h-14 rounded-2xl bg-[#C9A227]/15 group-hover:bg-[#C9A227] text-[#C9A227] group-hover:text-white flex items-center justify-center mb-6 transition-colors duration-300">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-[#F8F6F2] mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B6B6B] dark:text-[#A8A29E] leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
