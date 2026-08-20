import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import { CLINIC_INFO, CLINIC_SERVICES } from "@/lib/constants";

export default function Footer() {
  return (
    <>
      <footer className="bg-[#121110] text-[#D1C7B7] border-t border-[#C9A227]/25 pt-16 pb-8 relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C9A227]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#C9A227]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#332F28]">
            {/* Col 1: Clinic Info & Logo */}
            <div className="space-y-4">
              <Link href="/" className="inline-block">
                <Image
                  src="/images/amulyamlogo.png"
                  alt="Amulyam Dental Studio"
                  width={200}
                  height={60}
                  className="h-14 w-auto object-contain brightness-110"
                />
              </Link>
              <p className="text-xs sm:text-sm text-[#A39E93] leading-relaxed">
                Welcome to Amulyam Dental Studio. We combine modern painless dentistry, advanced CAD/CAM technology, and compassionate care for you and your family in Bhopal.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={CLINIC_INFO.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-full border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227] hover:bg-[#C9A227] hover:text-black transition-all"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href={CLINIC_INFO.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-full border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227] hover:bg-[#C9A227] hover:text-black transition-all"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.688 5H18V0h-3.808C10.597 0 9 1.582 9 4.615V8z" />
                  </svg>
                </a>
                <a
                  href={CLINIC_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-9 h-9 rounded-full border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227] hover:bg-[#C9A227] hover:text-black transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h3 className="text-white text-sm font-semibold tracking-wider uppercase mb-4 border-l-2 border-[#C9A227] pl-2.5">
                Quick Links
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/" className="hover:text-[#DDB83C] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-[#DDB83C] transition-colors">
                    About Dr. Shreya & Clinic
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="hover:text-[#DDB83C] transition-colors">
                    All Dental Treatments
                  </Link>
                </li>
                <li>
                  <Link href="/gallery" className="hover:text-[#DDB83C] transition-colors">
                    Clinic Photo & Video Tour
                  </Link>
                </li>
                <li>
                  <Link href="/book" className="text-[#C9A227] font-medium hover:text-[#DDB83C] transition-colors">
                    Book an Appointment
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-[#DDB83C] transition-colors">
                    Contact Us & Directions
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="text-xs text-[#8A8175] hover:text-[#C9A227] flex items-center gap-1.5 pt-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Clinic Admin Portal</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Popular Treatments */}
            <div>
              <h3 className="text-white text-sm font-semibold tracking-wider uppercase mb-4 border-l-2 border-[#C9A227] pl-2.5">
                Popular Services
              </h3>
              <ul className="space-y-2.5 text-sm text-[#A39E93]">
                {CLINIC_SERVICES.slice(0, 6).map((service) => (
                  <li key={service.id}>
                    <Link
                      href={`/services#${service.id}`}
                      className="hover:text-[#DDB83C] transition-colors flex items-center justify-between group"
                    >
                      <span>{service.title}</span>
                      <span className="text-xs text-[#C9A227] opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Contact & Timings */}
            <div className="space-y-3.5 text-sm">
              <h3 className="text-white font-semibold tracking-wider uppercase mb-4 border-l-2 border-[#C9A227] pl-2.5">
                Visit & Contact
              </h3>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C9A227] flex-shrink-0 mt-1" />
                <p className="text-xs sm:text-sm text-[#A39E93] leading-relaxed">
                  {CLINIC_INFO.address}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#C9A227] flex-shrink-0" />
                <span className="text-xs sm:text-sm text-[#A39E93]">{CLINIC_INFO.hours}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#C9A227] flex-shrink-0" />
                <a
                  href={`tel:${CLINIC_INFO.rawPhone}`}
                  className="text-xs sm:text-sm text-white font-medium hover:text-[#DDB83C]"
                >
                  {CLINIC_INFO.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#C9A227] flex-shrink-0" />
                <a
                  href={`mailto:${CLINIC_INFO.email}`}
                  className="text-xs sm:text-sm text-[#A39E93] hover:text-[#DDB83C]"
                >
                  {CLINIC_INFO.email}
                </a>
              </div>
              <div className="pt-2">
                <a
                  href={CLINIC_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#C9A227] hover:underline"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright & TheWebVale Attribution */}
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#8A8175]">
            <p>© {new Date().getFullYear()} {CLINIC_INFO.name}. All Rights Reserved.</p>
            
            <div className="flex items-center gap-1.5 text-xs text-[#A39E93]">
              <span>Made with</span>
              <span className="text-red-500 animate-pulse">❤️</span>
              <span>by</span>
              <a
                href="https://www.thewebvale.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#C9A227] hover:text-[#DDB83C] hover:underline transition-colors"
              >
                TheWebVale
              </a>
            </div>

            <div className="flex items-center gap-2">
              <HeartHandshake className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Dedicated to Gentle &amp; Pain-Free Dental Health in Bhopal</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Floating Instant WhatsApp Button */}
      <a
        href={CLINIC_INFO.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20BA5A] text-white p-3.5 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-2 group-hover:pr-1 transition-all duration-300 font-medium text-xs">
          Chat on WhatsApp
        </span>
      </a>
    </>
  );
}
