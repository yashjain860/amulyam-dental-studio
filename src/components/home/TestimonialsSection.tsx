import { Star, Quote, CheckCircle } from "lucide-react";
import { PATIENT_TESTIMONIALS } from "@/lib/constants";

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-[#FAF8F5] dark:bg-[#121110] border-t border-[#C9A227]/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#A88214] dark:text-[#E5C76B] text-xs font-semibold uppercase tracking-wider mb-3">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Verified Patient Experiences</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] dark:text-[#F8F6F2]">
            What Our <span className="gold-text-gradient">Patients Say</span>
          </h2>
          <p className="text-sm sm:text-base text-[#6B6B6B] dark:text-[#A8A29E] mt-3">
            Real stories from our patients who experienced comfortable, painless dental treatments and transformed their smiles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PATIENT_TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#181715] p-6 rounded-3xl border border-[#C9A227]/20 hover:border-[#C9A227]/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-[#C9A227]">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-[#C9A227]/30" />
                </div>

                <p className="text-xs sm:text-sm text-[#4A453C] dark:text-[#D1C7B7] italic leading-relaxed mb-6">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#FAF8F5] dark:border-[#222]">
                <div className="font-bold text-sm text-[#1A1A1A] dark:text-white flex items-center gap-1.5">
                  <span>{t.name}</span>
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                </div>
                <div className="text-[11px] text-[#C9A227] font-medium">{t.tag}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
