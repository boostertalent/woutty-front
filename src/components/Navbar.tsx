"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ModeToggle } from "@/components/ModeToggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<string | null>(null);

  const { scrollY } = useScroll();

  // Animation de réduction au scroll
  const dockScale = useTransform(scrollY, [0, 100], [1, 0.98]);
  const dockY = useTransform(scrollY, [0, 100], [0, 10]);

  const navLinks = [
    { name: "Comment ça marche", href: "#process" },
    { name: "Créateurs", href: "#creators" },
    { name: "Marques", href: "#brands" },
    { name: "Partenariat", href: "#partenariat" },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none p-4">
      
      {/* LOGO MOBILE */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="md:hidden pointer-events-auto absolute left-4 top-4"
      >
        <Link
          href="/"
          onClick={() => setActivePath(null)}
          className="flex items-center gap-2 bg-card/80 backdrop-blur-md px-4 py-2 rounded-full border border-border shadow-sm active:scale-95 transition-transform"
        >
          <span className="text-booster-yellow font-bold text-sm">Woutty</span>
        </Link>
      </motion.div>

      {/* NAVBAR DESKTOP */}
      <motion.nav
        style={{ scale: dockScale, y: dockY }}
        className="hidden md:flex pointer-events-auto items-center gap-2 px-2 py-2 bg-card/80 backdrop-blur-xl border border-border rounded-full shadow-2xl transition-all duration-500"
      >
        <motion.div whileTap={{ scale: 0.95 }}>
          <Link 
            href="/" 
            onClick={() => setActivePath(null)}
            className="flex items-center px-4 py-2 rounded-full hover:bg-foreground/5 transition"
          >
            <span className="text-booster-yellow font-bold text-sm">Woutty</span>
          </Link>
        </motion.div>

        <div className="w-px h-4 bg-border mx-1" />

        {/* LIENS DE NAVIGATION */}
        <div className="flex items-center">
          {navLinks.map((link) => (
            <motion.div key={link.href} whileTap={{ scale: 0.95 }} className="relative">
              <Link
                href={link.href}
                onClick={() => setActivePath(link.href)}
                onMouseEnter={() => setHoveredPath(link.href)}
                onMouseLeave={() => setHoveredPath(null)}
                className={`relative px-4 py-2 text-sm transition-all duration-300 flex items-center justify-center ${
                  activePath === link.href 
                    ? "text-booster-yellow font-bold" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative z-10">{link.name}</span>

                {/* Bulle de survol */}
                {hoveredPath === link.href && activePath !== link.href && (
                  <motion.span
                    layoutId="navbar-hover"
                    className="absolute inset-0 bg-foreground/5 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                  />
                )}

                {/* Soulignement actif */}
                {activePath === link.href && (
                  <motion.span
                    layoutId="navbar-active-line"
                    className="absolute bottom-1 left-4 right-4 h-0.5 bg-booster-yellow rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="w-px h-4 bg-border mx-1" />

        {/* ACTIONS CONNEXION / INSCRIPTION */}
        <div className="flex items-center gap-1 pl-2">
          <motion.div whileTap={{ scale: 0.95 }} className="relative">
            <Link
              href="/auth/login"
              onClick={() => setActivePath("login")}
              className={`px-4 py-2 text-sm rounded-full transition-all duration-300 ${
                activePath === "login" 
                  ? "text-booster-yellow font-bold" 
                  : "text-muted-foreground hover:bg-foreground/5"
              }`}
            >
              Connexion
              {activePath === "login" && (
                <motion.span
                  layoutId="navbar-active-line"
                  className="absolute bottom-1 left-4 right-4 h-0.5 bg-booster-yellow rounded-full"
                />
              )}
            </Link>
          </motion.div>

          <motion.div whileTap={{ scale: 0.95 }} className="relative">
            <Link
              href="/auth"
              onClick={() => setActivePath("register")}
              className={`px-4 py-2 text-sm rounded-full transition-all duration-300 ${
                activePath === "register" 
                  ? "text-booster-yellow font-bold" 
                  : "text-muted-foreground hover:bg-foreground/5"
              }`}
            >
              S&apos;inscrire
              {activePath === "register" && (
                <motion.span
                  layoutId="navbar-active-line"
                  className="absolute bottom-1 left-4 right-4 h-0.5 bg-booster-yellow rounded-full"
                />
              )}
            </Link>
          </motion.div>

          <div className="w-px h-4 bg-border mx-1" />
          <ModeToggle />
        </div>
      </motion.nav>

      {/* MOBILE TRIGGER */}
      <div className="md:hidden flex gap-2 absolute right-4 top-4 pointer-events-auto">
        <ModeToggle />
        <motion.button
          onClick={() => setIsOpen((v) => !v)}
          whileTap={{ scale: 0.9 }}
          className="p-3 bg-card/80 backdrop-blur-md rounded-full border border-border text-foreground z-50 shadow-sm"
        >
          <div className="w-5 h-5 flex flex-col gap-1.5 justify-center">
            <motion.span animate={isOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }} className="h-0.5 bg-current w-full block" />
            <motion.span animate={isOpen ? { opacity: 0 } : { opacity: 1 }} className="h-0.5 bg-current w-full block" />
            <motion.span animate={isOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }} className="h-0.5 bg-current w-full block" />
          </div>
        </motion.button>
      </div>

      {/* MENU MOBILE */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-20 left-4 right-4 md:hidden pointer-events-auto bg-card/95 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl z-40"
          >
            <nav className="flex flex-col gap-2 text-center">
              {navLinks.map((link) => (
                <motion.div key={link.href} whileTap={{ scale: 0.98 }}>
                  <Link
                    href={link.href}
                    onClick={() => {
                      setActivePath(link.href);
                      setIsOpen(false);
                    }}
                    className={`block text-xl py-4 rounded-xl transition-all relative ${
                      activePath === link.href ? "text-booster-yellow font-bold" : "text-muted-foreground"
                    }`}
                  >
                    {link.name}
                    {activePath === link.href && (
                      <motion.span 
                        layoutId="mobile-active-indicator"
                        className="absolute bottom-2 left-1/4 right-1/4 h-0.5 bg-booster-yellow rounded-full"
                      />
                    )}
                  </Link>
                </motion.div>
              ))}

              <div className="h-px bg-border my-4 w-full" />

              <motion.div whileTap={{ scale: 0.98 }}>
                <Link
                  href="/auth/login"
                  onClick={() => { setActivePath("login"); setIsOpen(false); }}
                  className={`block text-xl py-4 rounded-xl ${activePath === "login" ? "text-booster-yellow font-bold" : "text-muted-foreground"}`}
                >
                  Connexion
                </Link>
              </motion.div>

              <motion.div whileTap={{ scale: 0.98 }}>
                <Link
                  href="/auth"
                  onClick={() => { setActivePath("register"); setIsOpen(false); }}
                  className={`block text-xl py-4 rounded-xl ${activePath === "register" ? "text-booster-yellow font-bold" : "text-muted-foreground"}`}
                >
                  S&apos;inscrire
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}