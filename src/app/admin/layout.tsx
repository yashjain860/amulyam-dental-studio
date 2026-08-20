import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F0E0D] text-[#1C1A17] dark:text-[#F8F6F2] transition-colors duration-200">
      {children}
    </div>
  );
}
