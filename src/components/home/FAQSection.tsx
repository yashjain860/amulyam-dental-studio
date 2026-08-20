"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "How do I book an appointment at Amulyam Dental Studio?",
      a: "You can easily book online through our website booking portal by selecting your desired service, date, and preferred time slot. You will receive an instant digital confirmation pass and email notification. You can also call us directly or chat on WhatsApp.",
    },
    {
      q: "Is root canal treatment (RCT) painful at Amulyam?",
      a: "No! We use modern computerized local anesthesia, gentle rotary endodontics, and digital apex locators to ensure your RCT is virtually pain-free, comfortable, and often completed in just 1-2 visits.",
    },
    {
      q: "What safety and sterilization standards do you follow?",
      a: "Patient safety is our highest priority. We follow a strict 5-tier hospital-grade sterilization protocol using Class-B vacuum autoclaves, sealed single-use pouches, and ultraviolet disinfection.",
    },
    {
      q: "Do you offer emergency dental appointments in Bhopal?",
      a: "Yes! If you are experiencing severe toothache, dental trauma, a knocked-out tooth, or broken restoration, please call our emergency hotline immediately at +91 92036 04211.",
    },
    {
      q: "What payment and EMI options are available for major treatments?",
      a: "We accept all major payment methods including UPI (Google Pay, PhonePe, Paytm), Debit/Credit cards, and Net Banking. Flexible 0% interest EMI options are available for Clear Aligners, Implants, and Smile Makeovers.",
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#A88214] dark:text-[#E5C76B] text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-[#F8F6F2]">
            Got Questions? <span className="gold-text-gradient">We Have Answers</span>
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#181715] rounded-2xl border border-[#C9A227]/20 overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex justify-between items-center gap-4 focus:outline-none"
                >
                  <span className="font-bold text-sm sm:text-base text-[#1A1A1A] dark:text-[#F8F6F2]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#C9A227] flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-xs sm:text-sm text-[#6B6B6B] dark:text-[#A8A29E] leading-relaxed border-t border-[#FAF8F5] dark:border-[#26231E] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
