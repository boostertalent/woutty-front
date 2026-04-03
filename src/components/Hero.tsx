"use client";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BRANDS } from "@/data/brands";
import { CREATORS } from "@/data/creators";

// Les constantes CREATORS et BRANDS sont conservées uniquement si elles servent ailleurs, 
// sinon elles peuvent être supprimées pour alléger le fichier.

function AppPhone() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-200, 200], [15, -15]), { stiffness: 120, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-200, 200], [-20, 20]), { stiffness: 120, damping: 20 });

  const suggestions = [
    { ...CREATORS[0], platform: "Instagram", score: 92 },
    { ...CREATORS[2], platform: "TikTok", score: 87 },
    { ...CREATORS[3], platform: "Instagram", score: 84 },
    { ...CREATORS[5], platform: "TikTok", score: 83 },
    { ...CREATORS[6], platform: "Instagram", score: 81 },
    { ...CREATORS[11], platform: "TikTok", score: 79 },
  ].filter((c) => Boolean(c?.img && c?.name));

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActiveIdx(i => (i + 1) % Math.max(1, suggestions.length)), 1800);
    return () => clearInterval(t);
  }, [suggestions.length]);

  const rowH = 54; // hauteur d'une ligne (px) dans le "feed"
  const visibleRows = 3;
  const looped = suggestions.length > 0 ? [...suggestions, ...suggestions.slice(0, visibleRows)] : [];

  return (
    <div
      onMouseMove={handleMouse}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      style={{ perspective: "1000px", cursor: "pointer" }}
      className="flex justify-center items-center w-full"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative scale-100 md:scale-110"
      >
        <div style={{ position: "absolute", bottom: "-30px", left: "50%", transform: "translateX(-50%)", width: "80%", height: "30px", background: "radial-gradient(ellipse, rgba(0,0,0,0.25) 0%, transparent 70%)", filter: "blur(10px)" }} />
        <div style={{ width: "260px", background: "#111", borderRadius: "36px", border: "3px solid #222", padding: "10px", boxShadow: "0 40px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)", transformStyle: "preserve-3d" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
            <div style={{ width: "60px", height: "6px", background: "#333", borderRadius: "3px" }} />
          </div>
          <div style={{ background: "#F8F8F6", borderRadius: "24px", padding: "14px", minHeight: "340px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#111" }}>✦ IA Woutty Match</span>
              <div style={{ width: "24px", height: "24px", background: "#FFD000", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>W</div>
            </div>
            <div style={{ background: "#FFD000", borderRadius: "10px", padding: "8px 12px", marginBottom: "12px" }}>
              <div style={{ fontSize: "20px", fontWeight: 900, color: "#111" }}>+76%</div>
              <div style={{ fontSize: "9px", color: "#666", fontWeight: 500 }}>Taux d'engagement</div>
            </div>
            <div style={{ fontSize: "9px", fontWeight: 700, color: "#999", letterSpacing: "0.08em", marginBottom: "8px" }}>MATCHS SUGGÉRÉS</div>

            <div
              style={{
                position: "relative",
                height: `${rowH * visibleRows}px`,
                overflow: "hidden",
                borderRadius: "12px",
              }}
            >
              {/* Fade haut/bas pour un effet feed */}
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "18px", background: "linear-gradient(#F8F8F6, rgba(248,248,246,0))" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "18px", background: "linear-gradient(rgba(248,248,246,0), #F8F8F6)" }} />
              </div>

              <motion.div
                animate={{ y: -(activeIdx * rowH) }}
                transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
                style={{ willChange: "transform" }}
              >
                {looped.map((c, idx) => {
                  const isActive = idx % suggestions.length === activeIdx;
                  return (
                    <div
                      key={`${c.name}-${idx}`}
                      style={{
                        height: `${rowH}px`,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 10px",
                        borderRadius: "12px",
                        marginBottom: "6px",
                        background: isActive ? "#FFFBEB" : "#fff",
                        border: isActive ? "1px solid #FFD000" : "1px solid #eee",
                        transform: isActive ? "translateX(6px) scale(1.01)" : "translateX(0) scale(1)",
                        transition: "transform 260ms ease",
                      }}
                    >
                      <div
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "999px",
                          overflow: "hidden",
                          flexShrink: 0,
                          background: "#eee",
                          border: "1px solid rgba(0,0,0,0.06)",
                        }}
                      >
                        <Image
                          src={c.img}
                          alt={c.name}
                          width={26}
                          height={26}
                          quality={90}
                          sizes="26px"
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "10px", fontWeight: 700, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {c.name}
                        </div>
                        <div style={{ fontSize: "8px", color: "#999" }}>{c.platform}</div>
                      </div>

                      <div style={{ background: "#111", color: "#FFD000", fontSize: "9px", fontWeight: 800, padding: "2px 5px", borderRadius: "4px" }}>
                        {c.score}%
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </div>
            <div style={{ background: "#FFD000", borderRadius: "8px", padding: "8px", textAlign: "center", marginTop: "8px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#111" }}>Créer une campagne +</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function IllustrationVideo({ src, label }: { src: string; label: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!failed && (
        <video
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          controls
          preload="metadata"
          onError={() => setFailed(true)}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}

      {failed && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#FFF7CC] via-white to-[#FFE9A3]">
          <div className="text-center px-6">
            <div className="mx-auto mb-3 h-12 w-12 rounded-2xl border border-black/10 bg-white shadow-sm flex items-center justify-center">
              <span className="text-lg font-black">▶</span>
            </div>
            <div className="text-sm font-black tracking-tight text-black">{label}</div>
            <div className="mt-1 text-xs text-black/60">
              Ajoute la vidéo dans <span className="font-semibold">public/videos/</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.5 3c.6 1.8 2 3.3 3.8 3.9V10c-1.6 0-3.1-.5-4.4-1.4v6.2c0 3-2.4 5.2-5.3 5.2S5.3 17.7 5.3 14.8c0-2.9 2.4-5.2 5.3-5.2.4 0 .9.1 1.3.2v3c-.4-.2-.8-.3-1.3-.3-1.2 0-2.1 1-2.1 2.1 0 1.2 1 2.1 2.1 2.1 1.3 0 2.3-1 2.3-2.6V3h3.8Z"
      />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm4.5 4.25a3.75 3.75 0 1 1 0 7.5 3.75 3.75 0 0 1 0-7.5Zm0 2a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5ZM17.9 6.8a.9.9 0 1 1-1.8 0 .9.9 0 0 1 1.8 0Z"
      />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.6 7.2a3.2 3.2 0 0 0-2.25-2.25C17.6 4.5 12 4.5 12 4.5s-5.6 0-7.35.45A3.2 3.2 0 0 0 2.4 7.2 33.2 33.2 0 0 0 2 12c0 1.62.12 3.23.4 4.8a3.2 3.2 0 0 0 2.25 2.25C6.4 19.5 12 19.5 12 19.5s5.6 0 7.35-.45a3.2 3.2 0 0 0 2.25-2.25c.28-1.57.4-3.18.4-4.8 0-1.62-.12-3.23-.4-4.8ZM10.2 14.9V9.1L15.4 12l-5.2 2.9Z"
      />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M13.7 22v-8.2h2.8l.4-3.2h-3.2V8.6c0-.9.3-1.6 1.7-1.6h1.7V4.2c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.2H7.6v3.2h2.8V22h3.3Z"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.9 2H22l-6.8 7.8L22.9 22h-5.6l-4.4-6.2L7.6 22H2.5l7.4-8.6L1 2h5.8l4 5.6L18.9 2Zm-1 18h1.7L6.9 4H5.1l12.8 16Z"
      />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M4.98 3.5A2.48 2.48 0 1 1 5 8.46a2.48 2.48 0 0 1-.02-4.96ZM3 21V9h4v12H3Zm7 0V9h3.8v1.7h.1c.5-.9 1.8-2 3.8-2 4.1 0 4.9 2.7 4.9 6.2V21h-4v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-3.9Z"
      />
    </svg>
  );
}

function SnapchatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2c-3 0-5.2 2.2-5.2 5.4 0 .7.1 1.6.2 2.4.1.8-.4 1.2-1.2 1.5-.7.3-1.4.5-1.7.7-.3.2-.5.4-.5.7 0 .4.3.7.7.9.6.3 1.4.4 2 .6.6.2.9.6 1.1 1.1.2.6.6 1.2 1.1 1.6.7.6 1.7.9 3.5.9s2.8-.3 3.5-.9c.5-.4.9-1 1.1-1.6.2-.5.5-.9 1.1-1.1.6-.2 1.4-.3 2-.6.4-.2.7-.5.7-.9 0-.3-.2-.5-.5-.7-.3-.2-1-.4-1.7-.7-.8-.3-1.3-.7-1.2-1.5.1-.8.2-1.7.2-2.4C17.2 4.2 15 2 12 2Z"
      />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.04 2a9.9 9.9 0 0 0-8.58 14.86L2 22l5.3-1.39A9.93 9.93 0 1 0 12.04 2Zm5.8 14.4c-.25.7-1.3 1.3-2 1.45-.5.1-1.1.18-3.57-.77-3.16-1.24-5.2-4.5-5.36-4.7-.16-.2-1.28-1.7-1.28-3.23 0-1.53.8-2.28 1.08-2.6.28-.32.62-.4.83-.4h.6c.2 0 .47-.08.73.56.25.64.86 2.2.94 2.36.08.16.13.36.02.58-.1.22-.16.36-.32.56-.16.2-.34.45-.48.6-.16.16-.33.33-.14.65.2.32.9 1.5 1.93 2.44 1.33 1.2 2.46 1.57 2.8 1.74.34.16.54.14.74-.08.2-.22.85-.99 1.08-1.33.23-.34.45-.28.76-.16.3.12 1.92.91 2.25 1.08.33.16.54.25.62.39.08.14.08.8-.17 1.5Z"
      />
    </svg>
  );
}

function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.6 2 2.2 6.1 2.2 12.3c0 6 4.1 9.7 9.6 9.7 4.9 0 7.8-2.3 8.7-6.2.6-2.7.1-5.2-1.4-7-1.6-2-4.2-3-7.9-3-.9 0-1.7.1-2.4.2l.4 2.1c.6-.1 1.3-.2 2-.2 2.8 0 4.8.7 5.9 2.1.4.5.7 1.1.8 1.8-1-.7-2.3-1-3.9-1-3 0-5.1 1.6-5.1 4.1 0 2.4 2 4 4.7 4 2 0 3.7-.8 4.7-2.3-.9 2.7-3 4-6.3 4-4.2 0-7.4-2.8-7.4-7.6C4.3 7.3 7.7 4.2 12 4.2c2.9 0 5 .8 6.3 2.5 1 1.3 1.4 3.1 1 5.1-.5 2.6-2.4 4.4-5.2 4.4-1.6 0-2.6-.7-2.6-1.7 0-1.1 1.1-1.9 2.8-1.9 1.3 0 2.3.4 3.1 1.1l1.1-1.7c-1-.9-2.4-1.5-4.3-1.5-3 0-5.1 1.6-5.1 4 0 2.3 2 3.8 4.9 3.8 3.8 0 6.5-2.3 7.2-5.9.5-2.4 0-4.7-1.3-6.3C18 3.1 15.5 2 12 2Z"
      />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.8 4.5 19 20.3c-.2 1.1-.8 1.4-1.6.9l-4.4-3.2-2.1 2c-.2.2-.4.4-.8.4l.3-4.6 8.3-7.5c.4-.3-.1-.5-.6-.2L8 14.4 3.5 13c-1.1-.3-1.1-1.1.2-1.6L20.4 3.8c.9-.3 1.7.2 1.4.7Z"
      />
    </svg>
  );
}

function SocialPop({
  label,
  color,
  icon,
  className,
  delay = 0,
}: {
  label: string;
  color: string;
  icon: React.ReactNode;
  className: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.98 }}
      transition={{ delay, duration: 0.45, ease: "easeOut" }}
      className={[
        "pointer-events-none absolute",
        "rounded-2xl border border-black/10",
        "bg-gradient-to-br from-white/55 via-[#FFF7CC]/45 to-white/35 backdrop-blur-md",
        "shadow-[0_18px_50px_rgba(0,0,0,0.14)]",
        "px-3 py-2",
        className,
      ].join(" ")}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay }}
        className="flex items-center gap-2"
      >
        <span className="h-8 w-8 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ background: color }}>
          {icon}
        </span>
        <div className="leading-tight">
          <div className="text-[11px] font-black text-black">{label}</div>
          <div className="text-[10px] font-semibold text-black/55">Disponible</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const [isCreatorsOpen, setIsCreatorsOpen] = useState(false);
  const [rightPopsStep, setRightPopsStep] = useState(0);
  const [leftPopsStep, setLeftPopsStep] = useState(0);
  const openTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const isAnyOverlayOpen = isBrandsOpen || isCreatorsOpen;

  const cancelTimers = () => {
    if (openTimerRef.current) window.clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    openTimerRef.current = null;
    closeTimerRef.current = null;
  };

  const scheduleOpenBrands = () => {
    cancelTimers();
    setIsCreatorsOpen(false);
    openTimerRef.current = window.setTimeout(() => setIsBrandsOpen(true), 80);
  };

  const scheduleCloseBrands = () => {
    cancelTimers();
    closeTimerRef.current = window.setTimeout(() => setIsBrandsOpen(false), 1400);
  };

  useEffect(() => {
    if (!isAnyOverlayOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsBrandsOpen(false);
        setIsCreatorsOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isAnyOverlayOpen]);

  useEffect(() => {
    const t = window.setInterval(() => setRightPopsStep((s) => (s + 1) % 2), 2200);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setLeftPopsStep((s) => (s + 1) % 2), 2000);
    return () => window.clearInterval(t);
  }, []);

  const scheduleOpenCreators = () => {
    cancelTimers();
    setIsBrandsOpen(false);
    openTimerRef.current = window.setTimeout(() => setIsCreatorsOpen(true), 80);
  };

  const scheduleCloseCreators = () => {
    cancelTimers();
    closeTimerRef.current = window.setTimeout(() => setIsCreatorsOpen(false), 1400);
  };

  return (
    <section className="w-full bg-[#FFD000] text-black overflow-hidden" style={{ marginTop: "40px" }}>
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-6 md:pb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-start gap-4 flex-1 max-w-xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/20 bg-black/10 text-[10px] font-semibold text-black">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            Lancement Woutty · 2026
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontFamily: "'Instrument Serif', 'Georgia', serif" }} className="text-[84px] md:text-[120px] font-normal italic leading-[0.82] tracking-tighter text-black">
            Woutty
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-black/70 text-lg leading-relaxed max-w-md">
            La plateforme qui connecte les marques aux créateurs de contenu authentiques au Sénégal.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex gap-6">
            <button
              type="button"
              onMouseEnter={scheduleOpenCreators}
              onMouseLeave={() => {
                // Ne ferme pas pendant que l’utilisateur va vers la vitrine
                if (!isCreatorsOpen) scheduleCloseCreators();
              }}
              onFocus={scheduleOpenCreators}
              onBlur={() => {
                if (!isCreatorsOpen) scheduleCloseCreators();
              }}
              onClick={() => setIsCreatorsOpen((v) => !v)}
              className="text-left group relative"
              aria-haspopup="dialog"
              aria-expanded={isCreatorsOpen}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-black/5 px-3 py-2 transition-all group-hover:bg-black/10 group-hover:border-black/25 group-active:scale-[0.99] overflow-hidden">
                <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="absolute -left-1/2 top-0 h-full w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/35 to-transparent blur-[1px] animate-[shine_1.4s_ease-in-out_infinite]" />
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black/50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-black" />
                </span>
                <div className="leading-none">
                  <div className="text-xl font-black -mt-[1px]">30+ Créateurs</div>
                  <div className="mt-1 text-[9px] font-extrabold text-black/60 uppercase tracking-[0.22em]">
                    Voir des profils
                    <span className="ml-1 inline-block group-hover:translate-x-[2px] transition-transform">→</span>
                  </div>
                </div>
              </div>

              <span className="pointer-events-none absolute -bottom-5 left-0 text-[10px] font-bold text-black/50 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                Survolez pour découvrir
              </span>
            </button>

            <button
              type="button"
              onMouseEnter={scheduleOpenBrands}
              onMouseLeave={() => {
                if (!isBrandsOpen) scheduleCloseBrands();
              }}
              onFocus={scheduleOpenBrands}
              onBlur={() => {
                if (!isBrandsOpen) scheduleCloseBrands();
              }}
              onClick={() => setIsBrandsOpen((v) => !v)}
              className="text-left group relative"
              aria-haspopup="dialog"
              aria-expanded={isBrandsOpen}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-black/5 px-3 py-2 transition-all group-hover:bg-black/10 group-hover:border-black/25 group-active:scale-[0.99] overflow-hidden">
                <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="absolute -left-1/2 top-0 h-full w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/35 to-transparent blur-[1px] animate-[shine_1.4s_ease-in-out_infinite]" />
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-black/50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-black" />
                </span>
                <div className="leading-none">
                  <div className="text-xl font-black -mt-[1px]">10+ Marques</div>
                  <div className="mt-1 text-[9px] font-extrabold text-black/60 uppercase tracking-[0.22em]">
                    Voir la vitrine
                    <span className="ml-1 inline-block group-hover:translate-x-[2px] transition-transform">→</span>
                  </div>
                </div>
              </div>

              <span className="pointer-events-none absolute -bottom-5 left-0 text-[10px] font-bold text-black/50 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                Cliquez pour voir les marques
              </span>
            </button>

            <div>
              <div className="text-2xl font-black">98%</div>
              <div className="text-[9px] font-semibold text-black/60 uppercase tracking-widest">Satisfaction</div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap gap-3">
            <Link href="/auth" className="bg-black text-white px-6 py-3 rounded-full font-black text-xs hover:bg-gray-900 transition-colors shadow-md">
              Commencer maintenant
            </Link>
            <Link href="#process" className="border-2 border-black/20 text-black px-6 py-3 rounded-full font-bold text-xs hover:bg-black/5 transition-colors">
              Comment ça marche ?
            </Link>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="flex-1 flex justify-center items-center min-h-[480px] relative"
        >
          {/* Pops réseaux sociaux (entre le texte et le téléphone) */}
          <div className="hidden md:block absolute left-0 top-10 w-[220px] pointer-events-none">
            <AnimatePresence mode="wait">
              {leftPopsStep === 0 ? (
                <SocialPop
                  key="instagram-left"
                  label="Instagram"
                  color="#E1306C"
                  icon={<InstagramIcon className="h-4 w-4" />}
                  className="left-2 top-0"
                  delay={0}
                />
              ) : (
                <SocialPop
                  key="tiktok-left"
                  label="TikTok"
                  color="#111111"
                  icon={<TikTokIcon className="h-4 w-4" />}
                  className="left-0 top-0"
                  delay={0}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="hidden md:block absolute left-0 top-[210px] w-[240px] pointer-events-none">
            <AnimatePresence mode="wait">
              {leftPopsStep === 0 ? (
                <SocialPop
                  key="youtube-left"
                  label="YouTube"
                  color="#FF0000"
                  icon={<YouTubeIcon className="h-4 w-4" />}
                  className="left-10 top-0"
                  delay={0}
                />
              ) : (
                <SocialPop
                  key="facebook-left"
                  label="Facebook"
                  color="#1877F2"
                  icon={<FacebookIcon className="h-4 w-4" />}
                  className="left-6 top-0"
                  delay={0}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Pops réseaux sociaux (à droite du téléphone) - apparaissent/disparaissent */}
          <div className="hidden md:block absolute right-2 top-24 w-[220px] pointer-events-none">
            <AnimatePresence mode="wait">
              {rightPopsStep === 0 ? (
                <SocialPop
                  key="x"
                  label="X"
                  color="#0B0B0C"
                  icon={<XIcon className="h-4 w-4" />}
                  className="right-0 top-0"
                  delay={0}
                />
              ) : (
                <SocialPop
                  key="linkedin"
                  label="LinkedIn"
                  color="#0A66C2"
                  icon={<LinkedInIcon className="h-4 w-4" />}
                  className="right-0 top-0"
                  delay={0}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="hidden md:block absolute right-6 top-[360px] w-[240px] pointer-events-none">
            <AnimatePresence mode="wait">
              {rightPopsStep === 0 ? (
                <SocialPop
                  key="threads"
                  label="Threads"
                  color="#111111"
                  icon={<ThreadsIcon className="h-4 w-4" />}
                  className="right-0 top-0"
                  delay={0}
                />
              ) : (
                <SocialPop
                  key="telegram"
                  label="Telegram"
                  color="#229ED9"
                  icon={<TelegramIcon className="h-4 w-4" />}
                  className="right-0 top-0"
                  delay={0}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="hidden md:block absolute right-0 top-52 w-[240px] pointer-events-none">
            <AnimatePresence mode="wait">
              {rightPopsStep === 0 ? (
                <SocialPop
                  key="snapchat"
                  label="Snapchat"
                  color="#FFFC00"
                  icon={<SnapchatIcon className="h-4 w-4 text-black" />}
                  className="right-0 top-0"
                  delay={0}
                />
              ) : (
                <SocialPop
                  key="whatsapp"
                  label="WhatsApp"
                  color="#25D366"
                  icon={<WhatsAppIcon className="h-4 w-4" />}
                  className="right-0 top-0"
                  delay={0}
                />
              )}
            </AnimatePresence>
          </div>

          <AppPhone />
        </motion.div>
      </div>

      <AnimatePresence>
        {isBrandsOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Marques & partenaires"
            onClick={() => setIsBrandsOpen(false)}
            onMouseEnter={() => cancelTimers()}
            onMouseLeave={scheduleCloseBrands}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/45 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal */}
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 16, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 10, scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/15 bg-[#0B0B0C] text-white shadow-2xl"
            >
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#FFD000]/25 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#6366F1]/20 blur-3xl" />

              <div className="relative p-6 md:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold tracking-widest text-white/80">
                      Marques & partenaires
                    </div>
                    <h3 className="mt-3 text-2xl md:text-3xl font-black tracking-tight">
                      Ils boostent leur visibilité avec Woutty
                    </h3>
                    <p className="mt-1 text-white/70 text-sm md:text-base max-w-2xl">
                      Découvrez les marques qui collaborent déjà avec nos créateurs.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsBrandsOpen(false)}
                    className="shrink-0 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-black hover:bg-white/10 transition-colors"
                    aria-label="Fermer"
                  >
                    Fermer ✕
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {BRANDS.map((b, i) => (
                    <motion.div
                      key={b.name}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.03 * i, duration: 0.35 }}
                      whileHover={{ y: -3, scale: 1.03 }}
                      className="group relative rounded-3xl border border-white/10 bg-white/5 p-4 overflow-hidden"
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#FFD000]/20 via-transparent to-[#6366F1]/15" />
                      <div className="relative flex items-center justify-center h-[74px]">
                        <img
                          src={b.img}
                          alt={b.name}
                          className="max-w-full max-h-[64px] object-contain select-none"
                          draggable={false}
                        />
                      </div>
                      <div className="relative mt-2 text-center text-[10px] font-semibold tracking-wide text-white/70">
                        {b.name}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="text-xs text-white/60">
                    Astuce : cliquez en dehors du popup pour fermer.
                  </div>
                  <Link
                    href="#brands"
                    onClick={() => setIsBrandsOpen(false)}
                    className="inline-flex items-center justify-center rounded-full bg-[#FFD000] text-black px-6 py-3 text-xs font-black hover:bg-yellow-400 transition-colors"
                  >
                    Voir la section “Marques” →
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreatorsOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Créateurs"
            onClick={() => setIsCreatorsOpen(false)}
            // Important: ne pas fermer au simple "mouseleave" (sinon impossible de cliquer)
          >
            <motion.div
              className="absolute inset-0 bg-black/45 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 16, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 10, scale: 0.98, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/15 bg-[#0B0B0C] text-white shadow-2xl"
            >
              <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#FFD000]/25 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#10B981]/18 blur-3xl" />

              <div className="relative p-6 md:p-8 max-h-[80vh] overflow-auto">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold tracking-widest text-white/80">
                      Créateurs de contenus
                    </div>
                    <h3 className="mt-3 text-2xl md:text-3xl font-black tracking-tight">
                      Des profils authentiques, prêts à créer
                    </h3>
                    <p className="mt-1 text-white/70 text-sm md:text-base max-w-2xl">
                      Un aperçu de quelques créateurs de la communauté Woutty.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCreatorsOpen(false)}
                    className="shrink-0 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-black hover:bg-white/10 transition-colors"
                    aria-label="Fermer"
                  >
                    Fermer ✕
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {CREATORS.slice(0, 15).map((c, i) => (
                    <motion.div
                      key={c.name}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.02 * i, duration: 0.35 }}
                      whileHover={{ y: -3, scale: 1.03 }}
                      className="group relative rounded-3xl border border-white/10 bg-white/5 p-4 overflow-hidden"
                    >
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-[#FFD000]/18 via-transparent to-[#10B981]/12" />
                      <div className="relative flex items-center justify-center">
                        <div className="relative h-[88px] w-[88px] overflow-hidden rounded-full border border-white/10 bg-white/10">
                          <Image
                            src={c.img}
                            alt={c.name}
                            fill
                            sizes="88px"
                            quality={90}
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      </div>
                      <div className="relative mt-3 text-center text-[11px] font-bold tracking-wide text-white/85">
                        {c.name}
                      </div>
                      <div className="relative mt-1 text-center text-[10px] text-white/55 line-clamp-1">
                        {c.role}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="text-xs text-white/60">
                    Astuce : cliquez en dehors du popup pour fermer.
                  </div>
                  <Link
                    href="#creators"
                    onClick={() => setIsCreatorsOpen(false)}
                    className="inline-flex items-center justify-center rounded-full bg-[#FFD000] text-black px-6 py-3 text-xs font-black hover:bg-yellow-400 transition-colors"
                  >
                    Voir la section “Créateurs” →
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes shine {
          0% {
            transform: translateX(-140%) rotate(12deg);
          }
          60% {
            transform: translateX(280%) rotate(12deg);
          }
          100% {
            transform: translateX(280%) rotate(12deg);
          }
        }
      `}</style>
    </section>
  );
}

export function HeroCreatorPartnerCards() {
  return (
    <section className="w-full bg-white text-black">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-6">
        {/* Ligne 1 : Vous êtes une marque + Vidéo à droite */}
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col justify-between"
          >
            <div className="space-y-5">
              <h2 className="font-black text-2xl md:text-3xl tracking-tighter uppercase">Vous êtes une marque</h2>
              <p className="text-black text-base leading-relaxed">
                Gagnez du temps, réduisez vos coûts et améliorez vos performances marketing avec du contenu qui parle vraiment à votre audience.
              </p>
              <p className="text-black/70 text-sm leading-relaxed italic border-l-2 border-[#FFD000] pl-4">
                Grâce à nos créateurs de contenu, obtenez du contenu engageant, naturel et optimisé pour les réseaux sociaux, sans passer par des productions coûteuses.
              </p>
            </div>
            <Link
              href="/brands/auth/formulaire/etape1"
              className="mt-8 inline-flex items-center justify-center bg-black text-white rounded-full px-8 py-4 font-black text-xs hover:bg-gray-900 transition-colors uppercase tracking-widest w-full sm:w-auto"
            >
              Lancer une campagne →
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-[32px] overflow-hidden border border-black/5 bg-white shadow-sm min-h-[320px] flex"
          >
            <IllustrationVideo src="/videos/brand-demo.mp4" label="Vidéo illustrative (marque)" />
          </motion.div>
        </div>

        {/* Ligne 2 : Vidéo à gauche + Vous aimez créer du contenu à droite (en dessous) */}
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-[32px] overflow-hidden border border-black/5 bg-white shadow-sm min-h-[320px] flex lg:order-1"
          >
            <IllustrationVideo src="/videos/creator-demo.mp4" label="Vidéo illustrative (créateur)" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col justify-between lg:order-2"
          >
            <div className="space-y-5">
              <h2 className="font-black text-2xl md:text-3xl tracking-tighter uppercase">Vous aimez créer du contenu</h2>
              <p className="text-black text-base leading-relaxed">
                Gagnez de l'argent en créant du contenu authentique pour les marques, même sans être influenceur.
              </p>
              <p className="text-black/70 text-sm leading-relaxed italic border-l-2 border-[#FFD000] pl-4">
                Pas besoin d'avoir une grande audience : ce qui compte, c'est votre capacité à créer du contenu naturel et engageant.
              </p>
            </div>
            <Link
              href="/creators/auth/formulaire/etape1"
              className="mt-8 inline-flex items-center justify-center bg-[#FFD000] text-black rounded-full px-8 py-4 font-black text-xs hover:bg-yellow-400 transition-colors uppercase tracking-widest w-full sm:w-auto"
            >
              Rejoindre Woutty →
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}