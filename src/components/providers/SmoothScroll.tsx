"use client";

import { useEffect, ReactNode } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
      prevent: (node: any) => {
        if (!node) return false;
        return (
          node.hasAttribute?.("data-lenis-prevent") ||
          Boolean(node.closest?.("[data-lenis-prevent]")) ||
          Boolean(node.closest?.('[role="dialog"]')) ||
          Boolean(node.closest?.(".fixed")) ||
          Boolean(node.closest?.(".overflow-y-auto")) ||
          Boolean(node.closest?.(".overflow-auto"))
        );
      },
    });

    // Expose lenis globally for modal scroll control
    if (typeof window !== "undefined") {
      (window as any).__lenis = lenis;
    }

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      if (typeof window !== "undefined") {
        delete (window as any).__lenis;
      }
    };
  }, []);

  return <>{children}</>;
}
