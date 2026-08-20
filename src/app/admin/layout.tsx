"use client";

import React, { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Permanently enforce dark mode on Admin panel
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <div className="dark bg-[#0F0E0D] text-slate-100 min-h-screen">
      {children}
    </div>
  );
}
