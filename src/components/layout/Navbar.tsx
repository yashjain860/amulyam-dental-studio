"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Phone,
  Calendar,
  Search,
  User,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import { useSearch } from "../ui/GlobalSearch";
import { CLINIC_INFO } from "@/lib/constants";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openSearch } = useSearch();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About" },
    { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      {/* Main Single-Row Sticky Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "glass-nav shadow-lg border-b border-[#C9A227]/25 py-2.5"
            : "bg-[#FAF8F5]/95 dark:bg-[#0F0E0D]/95 border-b border-[#C9A227]/15 py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* 1. Left: Brand Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-2 group">
                <Image
                  src="/images/amulyamlogo.png"
                  alt="Amulyam Dental Studio Logo"
                  width={180}
                  height={50}
                  className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
                  priority
                />
              </Link>
            </div>

            {/* 2. Center: Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium tracking-wide transition-all relative py-1 ${
                      isActive
                        ? "text-[#C9A227] font-bold"
                        : "text-[#3D3A35] dark:text-[#E8E4DC] hover:text-[#C9A227]"
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C9A227] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* 3. Right: Search + Theme + Patient Login + Book CTA */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Global Search Trigger */}
              <button
                type="button"
                onClick={openSearch}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full border border-[#C9A227]/30 hover:border-[#C9A227] text-[#7A7265] dark:text-[#A8A29E] hover:text-[#C9A227] text-xs bg-white/60 dark:bg-[#1C1A17]/60 transition-all cursor-pointer"
                title="Search treatments & booking ID (Cmd+K)"
                aria-label="Search dental treatments"
              >
                <Search className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-[#C9A227]" />
                <span className="hidden md:inline">Search...</span>
                <kbd className="hidden md:inline text-[10px] bg-[#FAF8F5] dark:bg-[#2A2621] px-1.5 py-0.5 rounded border border-[#DDD] dark:border-[#444] font-mono">
                  ⌘K
                </kbd>
              </button>

              {/* Theme Switcher (Hidden in Admin panel) */}
              {!pathname?.startsWith("/admin") && <ThemeToggle />}              {/* Track Appointment / Care Pass */}
              <Link
                href="/patient-portal"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#C9A227]/40 text-xs font-semibold text-[#1A1A1A] dark:text-white hover:bg-[#C9A227]/10 transition-all cursor-pointer"
                title="Track your appointment & digital pass"
              >
                <User className="w-3.5 h-3.5 text-[#C9A227]" />
                <span className="hidden md:inline">Track Appointment</span>
              </Link>

              {/* Admin / Doctor Login */}
              <Link
                href="/admin"
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/40 text-xs font-bold text-amber-500 hover:bg-amber-500/10 transition-all cursor-pointer"
                title="Doctor & Clinic Staff Login"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Login</span>
              </Link>

              {/* Book Appointment CTA */}
              <Link
                href="/book"
                className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-[#C9A227] to-[#DDB83C] hover:from-[#DDB83C] hover:to-[#C9A227] text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Book Now</span>
              </Link>

              {/* Mobile Menu Hamburger */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation"
                className="lg:hidden p-2 rounded-xl text-[#C9A227] hover:bg-[#C9A227]/10 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div data-lenis-prevent className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-md">
          <div data-lenis-prevent className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#FAF8F5] dark:bg-[#1C1A17] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#C9A227]/20">
                <div className="flex items-center gap-2">
                  <Image
                    src="/images/amulyamlogo.png"
                    alt="Amulyam Dental Studio Logo"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span className="font-bold text-sm text-[#1A1A1A] dark:text-white">
                    Amulyam Dental Studio
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-[#C9A227] hover:bg-[#C9A227]/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="py-6 flex flex-col gap-3">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-base font-semibold py-2 px-3 rounded-xl transition-colors ${
                        isActive
                          ? "bg-[#C9A227]/15 text-[#C9A227] font-bold"
                          : "text-[#1A1A1A] dark:text-white hover:bg-[#C9A227]/10"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                <div className="pt-2 border-t border-[#C9A227]/20 flex flex-col gap-2">
                  <Link
                    href="/patient-portal"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-semibold text-[#1A1A1A] dark:text-white hover:text-[#C9A227] flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-[#C9A227]/10"
                  >
                    <User className="w-4 h-4 text-[#C9A227]" />
                    <span>Track My Appointment &amp; Pass</span>
                  </Link>

                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-amber-500/10"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Doctor &amp; Admin ERP Login</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[#C9A227]/20 flex flex-col gap-3">
              <Link
                href="/book"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center bg-[#C9A227] hover:bg-[#DDB83C] text-white font-bold py-3 rounded-xl shadow-md text-sm flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </Link>

              <a
                href={`tel:${CLINIC_INFO.rawPhone}`}
                className="w-full text-center border border-[#C9A227] text-[#C9A227] font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call {CLINIC_INFO.phone}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
