"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Calendar, User, Search } from "lucide-react";
import { useSearch } from "../ui/GlobalSearch";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { openSearch } = useSearch();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 dark:bg-[#121110]/95 backdrop-blur-xl border-t border-[#C9A227]/25 px-2 py-2 shadow-2xl">
      <div className="flex items-center justify-around">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
            pathname === "/"
              ? "text-[#C9A227]"
              : "text-[#7A7265] dark:text-[#A8A29E] hover:text-[#C9A227]"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className={`text-[10px] mt-0.5 ${pathname === "/" ? "font-bold" : "font-medium"}`}>
            Home
          </span>
        </Link>

        {/* Services */}
        <Link
          href="/services"
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
            pathname === "/services"
              ? "text-[#C9A227]"
              : "text-[#7A7265] dark:text-[#A8A29E] hover:text-[#C9A227]"
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className={`text-[10px] mt-0.5 ${pathname === "/services" ? "font-bold" : "font-medium"}`}>
            Services
          </span>
        </Link>

        {/* Book Slot (Center Floating Button) */}
        <Link
          href="/book"
          className="flex flex-col items-center -mt-6 group"
        >
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#C9A227] to-[#DDB83C] text-white flex items-center justify-center shadow-xl border-4 border-[#FAF8F5] dark:border-[#121110] transform group-hover:scale-105 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-[#C9A227] mt-0.5">
            Book Slot
          </span>
        </Link>

        {/* Search Modal Trigger */}
        <button
          type="button"
          onClick={openSearch}
          className="flex flex-col items-center py-1 px-2 rounded-xl text-[#7A7265] dark:text-[#A8A29E] hover:text-[#C9A227] transition-colors cursor-pointer"
          aria-label="Search treatments & doctors"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Search</span>
        </button>

        {/* Patient Portal / My Pass */}
        <Link
          href="/patient-portal"
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-colors ${
            pathname === "/patient-portal"
              ? "text-[#C9A227]"
              : "text-[#7A7265] dark:text-[#A8A29E] hover:text-[#C9A227]"
          }`}
        >
          <User className="w-5 h-5" />
          <span className={`text-[10px] mt-0.5 ${pathname === "/patient-portal" ? "font-bold" : "font-medium"}`}>
            My Pass
          </span>
        </Link>
      </div>
    </div>
  );
}
