"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface MotionRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
}

export default function MotionReveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: MotionRevealProps) {
  const getVariants = (): Variants => {
    let initialX = 0;
    let initialY = 0;

    if (direction === "up") initialY = 40;
    if (direction === "down") initialY = -40;
    if (direction === "left") initialX = 40;
    if (direction === "right") initialX = -40;

    return {
      hidden: {
        opacity: 0,
        x: initialX,
        y: initialY,
      },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          duration: 0.7,
          delay: delay,
          ease: "easeOut",
        },
      },
    };
  };

  return (
    <motion.div
      variants={getVariants()}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.1,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: "easeOut" },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
