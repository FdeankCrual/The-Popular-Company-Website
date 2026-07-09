"use client";
import { useRef } from "react";
import { motion } from "framer-motion";

interface MontageCoverProps {
  onEnterGallery: (origin: { x: number; y: number }) => void;
}

export default function MontageCover({ onEnterGallery }: MontageCoverProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      onEnterGallery({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    }
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ height: "100vh" }}>
      {/* Background video */}
      <video
        src="/reels/dplus1.mp4"
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Performance optimized darkening overlay (replaces heavy CSS video filters) */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      {/* Gradient overlays */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(105deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.15) 100%)" }} />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)" }} />

      {/* Orange accent line — left edge */}
      <div className="absolute top-0 bottom-0 left-0" style={{ width: "3px", background: "linear-gradient(to bottom, transparent, #FF6B35, transparent)" }} />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between" style={{ padding: "clamp(32px,5vw,64px)" }}>

        {/* TOP: Brand tag */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex items-center gap-4"
        >
          <span style={{ fontSize: "11px", fontWeight: 900, letterSpacing: "0.45em", color: "#FF6B35", fontFamily: "monospace" }}>TPC</span>
          <span style={{ width: "1px", height: "14px", background: "rgba(255,107,53,0.35)" }} />
          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.3em", textTransform: "uppercase" }}>
            The Popular Company
          </span>
        </motion.div>

        {/* BOTTOM: Headline + CTA */}
        <div className="flex flex-col gap-10">

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="flex gap-12"
          >
            {[
              { num: "200+", label: "Works" },
              { num: "50+", label: "Brands" },
              { num: "2+", label: "Years Exp." },
            ].map(({ num, label }) => (
              <div key={label}>
                <div style={{ fontSize: "clamp(1.8rem,3.5vw,3rem)", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.03em" }}>
                  {num}
                </div>
                <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", fontFamily: "monospace", letterSpacing: "0.3em", textTransform: "uppercase", marginTop: "6px" }}>
                  {label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Headline */}
          <div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              style={{ fontSize: "11px", color: "#FF6B35", fontFamily: "monospace", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: "18px" }}
            >
              Selected Works · 2024–2026
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: "clamp(3.5rem,9.5vw,9rem)",
                fontWeight: 900,
                lineHeight: 0.87,
                letterSpacing: "-0.04em",
                color: "#fff",
                textTransform: "uppercase",
              }}
            >
              OUR<br />
              <span style={{
                color: "transparent",
                WebkitTextStroke: "2px #FF6B35",
              }}>
                GALLERY
              </span>
            </motion.h2>
          </div>

          {/* CTA Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            className="flex items-center gap-8 flex-wrap"
          >
            <motion.button
              ref={btnRef}
              onClick={handleClick}
              whileHover={{ scale: 1.04, boxShadow: "0 0 80px rgba(255,255,255,0.25), 0 20px 40px rgba(0,0,0,0.4)" }}
              whileTap={{ scale: 0.96 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "16px 24px 16px 32px",
                borderRadius: "100px",
                background: "#ffffff",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 0 40px rgba(255,255,255,0.12)",
              }}
            >
              <span style={{ fontSize: "11px", fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: "#0a0a0a" }}>
                Enter Gallery
              </span>
              <span style={{
                width: "38px", height: "38px", borderRadius: "50%",
                background: "#FF6B35",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", color: "#fff",
                flexShrink: 0,
              }}>
                →
              </span>
            </motion.button>

            <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.22)", fontFamily: "monospace", letterSpacing: "0.22em", textTransform: "uppercase" }}>
              4 Categories · Premium Works
            </p>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator — right side */}
      <div style={{
        position: "absolute", bottom: "clamp(32px,5vw,56px)", right: "clamp(32px,5vw,56px)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
      }}>
        <div style={{ width: "1px", height: "48px", background: "linear-gradient(to bottom, transparent, rgba(255,107,53,0.5))" }} />
        <span style={{
          fontSize: "9px", color: "rgba(255,255,255,0.18)", fontFamily: "monospace",
          letterSpacing: "0.3em", textTransform: "uppercase", writingMode: "vertical-rl"
        }}>
          scroll
        </span>
      </div>
    </div>
  );
}
