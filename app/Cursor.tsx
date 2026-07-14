"use client";
import { useEffect, useState } from "react";
import { motion, useMotionValue } from "framer-motion";

export default function Cursor() {
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      // Update motion values directly without triggering React re-renders
      mouseX.set(e.clientX - 16);
      mouseY.set(e.clientY - 16);

      // Check if hovering over clickable elements
      const target = e.target as HTMLElement;
      if (target.tagName === "BUTTON" || target.tagName === "A" || target.closest("button") || target.closest("a") || target.closest(".hover-trigger")) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", mouseMove);
    return () => window.removeEventListener("mousemove", mouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 border border-white rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:block"
      style={{
        x: mouseX,
        y: mouseY
      }}
      animate={{
        scale: isHovering ? 2.5 : 1,
        backgroundColor: isHovering ? "#F25F33" : "transparent", // TPC Orange fill on hover
        borderWidth: isHovering ? "0px" : "1px",
      }}
      transition={{
        scale: { type: "spring", stiffness: 300, damping: 20 },
        backgroundColor: { duration: 0.2 },
        borderWidth: { duration: 0.2 }
      }}
    />
  );
}
