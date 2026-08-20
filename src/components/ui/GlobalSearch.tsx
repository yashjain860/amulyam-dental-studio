"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Sparkles,
  User,
  ArrowRight,
  ShieldCheck,
  Phone,
} from "lucide-react";
import { CLINIC_SERVICES } from "@/lib/constants";

interface SearchContextType {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
}

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openSearch = () => setIsOpen(true);
  const closeSearch = () => setIsOpen(false);
  const toggleSearch = () => setIsOpen((prev) => !prev);

  // Global Keyboard Listener for Cmd+K and Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  return (
    <SearchContext.Provider value={{ isOpen, openSearch, closeSearch, toggleSearch }}>
      {children}
      <CommandPaletteModal isOpen={isOpen} onClose={closeSearch} />
    </SearchContext.Provider>
  );
}

function CommandPaletteModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingServices = q
    ? CLINIC_SERVICES.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.benefits.some((b) => b.toLowerCase().includes(q))
      )
    : CLINIC_SERVICES.slice(0, 5);

  const isBookingRef = q.toUpperCase().startsWith("ADS-") || /^\d{4}$/.test(q);

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative bg-white dark:bg-[#181715] rounded-3xl border-2 border-[#C9A227]/40 shadow-2xl max-w-2xl w-full overflow-hidden z-10">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E8E0D2] dark:border-[#2A2621] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#C9A227] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search treatments, symptoms, doctor, booking ID (e.g. ADS-2026-8941)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-[#1A1A1A] dark:text-[#F8F6F2] text-sm sm:text-base focus:outline-none placeholder:text-[#888]"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-full text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs bg-[#FAF8F5] dark:bg-[#222] px-2 py-1 rounded-md text-[#888] font-mono border border-[#DDD] dark:border-[#333] cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          {/* Quick Booking Ref Jump */}
          {isBookingRef && (
            <div
              onClick={() =>
                handleSelect(
                  `/booking-confirmation/${
                    q.toUpperCase().startsWith("ADS-")
                      ? q.toUpperCase()
                      : `ADS-2026-${q}`
                  }`
                )
              }
              className="p-3.5 rounded-2xl bg-[#C9A227]/15 border border-[#C9A227] flex items-center justify-between cursor-pointer hover:bg-[#C9A227]/25 transition-all"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#C9A227]" />
                <div>
                  <span className="text-xs font-bold text-[#C9A227] uppercase tracking-wider block">
                    Lookup Appointment Pass
                  </span>
                  <span className="text-sm font-mono font-bold text-[#1A1A1A] dark:text-white">
                    {q.toUpperCase().startsWith("ADS-")
                      ? q.toUpperCase()
                      : `ADS-2026-${q}`}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#C9A227]" />
            </div>
          )}

          {/* Treatments / Services */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A39E93] block px-2 mb-2">
              Dental Treatments &amp; Procedures
            </span>
            <div className="space-y-1.5">
              {matchingServices.length === 0 ? (
                <p className="text-xs text-[#888] px-2 py-2">No matching treatments found.</p>
              ) : (
                matchingServices.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleSelect(`/book?service=${s.id}`)}
                    className="p-3 rounded-2xl hover:bg-[#FAF8F5] dark:hover:bg-[#22201C] flex items-center justify-between cursor-pointer border border-transparent hover:border-[#C9A227]/30 transition-all group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1A1A1A] dark:text-[#F8F6F2] group-hover:text-[#C9A227] transition-colors">
                          {s.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-[#C9A227] bg-[#C9A227]/10 px-2 py-0.5 rounded-full">
                          {s.category}
                        </span>
                      </div>
                      <p className="text-xs text-[#6B6B6B] dark:text-[#A8A29E] line-clamp-1 mt-0.5">
                        {s.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-semibold text-[#C9A227] hidden sm:inline">
                        {s.priceEstimate}
                      </span>
                      <span className="text-xs bg-[#C9A227] text-white font-bold px-3 py-1 rounded-xl group-hover:bg-[#DDB83C]">
                        Book
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A39E93] block px-2 mb-2">
              Quick Shortcuts
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleSelect("/services")}
                className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#22201C] hover:bg-[#C9A227]/15 text-left text-xs font-semibold text-[#333] dark:text-[#DDD] flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>All Services</span>
              </button>
              <button
                onClick={() => handleSelect("/about")}
                className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#22201C] hover:bg-[#C9A227]/15 text-left text-xs font-semibold text-[#333] dark:text-[#DDD] flex items-center gap-2 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Dr. Shreya</span>
              </button>
              <button
                onClick={() => handleSelect("/patient-portal")}
                className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#22201C] hover:bg-[#C9A227]/15 text-left text-xs font-semibold text-[#333] dark:text-[#DDD] flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Patient Login</span>
              </button>
              <button
                onClick={() => handleSelect("/contact")}
                className="p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-[#22201C] hover:bg-[#C9A227]/15 text-left text-xs font-semibold text-[#333] dark:text-[#DDD] flex items-center gap-2 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Contact Us</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#FAF8F5] dark:bg-[#121110] border-t border-[#E8E0D2] dark:border-[#2A2621] text-center text-[11px] text-[#888] flex justify-between px-4">
          <span>Press <strong>ESC</strong> or click outside to dismiss</span>
          <span>Amulyam Dental Studio Command Center</span>
        </div>
      </div>
    </div>
  );
}
