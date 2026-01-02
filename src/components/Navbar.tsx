"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ModeToggle } from "@/components/ModeToggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

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
          className="flex items-center gap-2 bg-card/80 backdrop-blur-md px-4 py-2 rounded-full border border-border shadow-sm"
        >
          <span className="text-booster-yellow font-bold text-sm">Woutty</span>
          
        </Link>
      </motion.div>

      {/* NAVBAR DESKTOP */}
      <motion.nav
        style={{ scale: dockScale, y: dockY }}
        className="hidden md:flex pointer-events-auto items-center gap-2 px-2 py-2 bg-card/80 backdrop-blur-xl border border-border rounded-full shadow-2xl transition-colors duration-500"
      >
        <Link href="/" className="flex items-center px-4 py-2 rounded-full hover:bg-foreground/5 transition">
          <span className="text-booster-yellow font-bold text-sm">Woutty</span>
          
        </Link>

        <div className="w-px h-4 bg-border mx-1" />

        <div className="flex items-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onMouseEnter={() => setHoveredPath(link.href)}
              onMouseLeave={() => setHoveredPath(null)}
              className="relative px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="relative z-10">{link.name}</span>
              {hoveredPath === link.href && (
                <motion.span
                  layoutId="navbar-hover"
                  className="absolute inset-0 bg-foreground/5 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                />
              )}
            </Link>
          ))}
        </div>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Actions Desktop */}
        <div className="flex items-center gap-1 pl-2">
          <Link href="/login" className="flex items-center px-4 py-2 rounded-full hover:bg-foreground/5 transition">
            Connexion
          </Link>
          <Link href="/register" className="flex items-center px-4 py-2 rounded-full hover:bg-foreground/5 transition">
            S'inscrire
          </Link>
          <div className="w-px h-4 bg-border mx-1" />
          <ModeToggle />
        </div>
      </motion.nav>

      {/* HAMBURGER MOBILE */}
      <div className="md:hidden flex gap-2 absolute right-4 top-4 pointer-events-auto">
        <ModeToggle />
        <motion.button
            onClick={() => setIsOpen((v) => !v)}
            whileTap={{ scale: 0.9 }}
            className="p-3 bg-card/80 backdrop-blur-md rounded-full border border-border text-foreground z-50 shadow-sm"
        >
            <div className="w-5 h-5 flex flex-col gap-1.5">
              <motion.span animate={isOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }} className="h-0.5 bg-current w-full" />
              <motion.span animate={isOpen ? { opacity: 0 } : { opacity: 1 }} className="h-0.5 bg-current w-full" />
              <motion.span animate={isOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }} className="h-0.5 bg-current w-full" />
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
            transition={{ type: "spring", duration: 0.5 }}
            className="absolute top-20 left-4 right-4 md:hidden pointer-events-auto bg-card/95 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl flex flex-col items-stretch gap-6"
          >
            <nav className="flex flex-col gap-1 text-center font-medium">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="block text-xl text-muted-foreground hover:text-foreground py-3 rounded-xl active:bg-foreground/5 transition"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              <div className="h-px bg-border my-4 w-full" />

              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="text-xl text-muted-foreground py-3 mb-2 transition"
              >
                Connexion
              </Link>
              
              <Link
                href="/register"
                onClick={() => setIsOpen(false)}
                className="text-xl text-muted-foreground py-3 mb-2 transition"
              >
                S'inscrire
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}