import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { SearchProvider } from "@/components/ui/GlobalSearch";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { CLINIC_INFO } from "@/lib/constants";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F5" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0E0D" },
  ],
};

export const metadata: Metadata = {
  title: "Amulyam Dental Studio | Painless Dental Care & Smile Makeovers in Bhopal",
  description:
    "Amulyam Dental Studio in Awadhpuri, Bhopal offers advanced, pain-free dental treatments, implants, rotary root canals, cosmetic smile design, and clear aligners by Dr. Shreya Nidhi.",
  keywords: [
    "Amulyam Dental Studio",
    "Dentist in Bhopal",
    "Dental Clinic Awadhpuri Bhopal",
    "Dr Shreya Nidhi",
    "Dental Implants Bhopal",
    "Root Canal Treatment Bhopal",
    "Teeth Whitening",
    "Clear Aligners",
  ],
  icons: {
    icon: "/images/amulyamlogo.png",
  },
  openGraph: {
    title: "Amulyam Dental Studio | Precision Care for Beautiful Smiles",
    description: "Book appointments online for painless dental care in Bhopal.",
    url: "https://www.amulyamdentalstudio.com",
    siteName: "Amulyam Dental Studio",
    images: [
      {
        url: "/images/s14.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

import ChatWidget from "@/components/chat/ChatWidget";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`${font.variable} font-sans antialiased bg-[#FAF8F5] dark:bg-[#0F0E0D] text-[#1A1A1A] dark:text-[#F8F6F2] min-h-screen flex flex-col pb-16 md:pb-0`}>
        <SmoothScroll>
          <SearchProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <MobileBottomNav />
            <ChatWidget />
          </SearchProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
