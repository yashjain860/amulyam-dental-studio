"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Calendar, User, Phone } from "lucide-react";
import { CLINIC_INFO } from "@/lib/constants";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/services", label: "Services", icon: Sparkles },
    { href: "/book", label: "Book", icon: Calendar, isCenter: true },
    { href: "/patient-portal", label: "My Pass", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 dark:bg-[#121110]/95 backdrop-blur-xl border-t border-[#C9A227]/25 px-4 py-2 shadow-2xl">
      <div className="flex items-center justify-around">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          if (link.isCenter) {
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center -mt-6 group"
              >
                <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#C9A227] to-[#DDB83C] text-white flex items-center justify-center shadow-xl border-4 border-[#FAF8F5] dark:border-[#121110] transform group-hover:scale-105 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-[#C9A227] mt-0.5">
                  Book Slot
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
                isActive
                  ? "text-[#C9A227]"
                  : "text-[#7A7265] dark:text-[#A8A29E] hover:text-[#C9A227]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className={`text-[10px] mt-0.5 ${isActive ? "font-bold" : "font-medium"}`}>
                {link.label}
              </span>
            </Link>
          );
        })}

        {/* Quick Call */}
        <a
          href={`tel:${CLINIC_INFO.rawPhone}`}
          className="flex flex-col items-center py-1 px-2 text-[#7A7265] dark:text-[#A8A29E] hover:text-[#C9A227]"
        >
          <Phone className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Call</span>
        </a>
      </div>
    </div>
  );
}
