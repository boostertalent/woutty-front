"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link';
import { BRANDS } from "@/data/brands";

const CARDS_PER_GROUP = 3;
const totalGroups = Math.ceil(BRANDS.length / CARDS_PER_GROUP);

function getGroup(index: number) {
  const start = (index % totalGroups) * CARDS_PER_GROUP;
  return BRANDS.slice(start, start + CARDS_PER_GROUP);
}

export default function BrandBenefits() {
  const [groupIndex, setGroupIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setDirection(1);
      setGroupIndex((prev) => (prev + 1) % totalGroups);
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const goNext = () => {
    setDirection(1);
    setGroupIndex((prev) => (prev + 1) % totalGroups);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000);
  };

  const goPrev = () => {
    setDirection(-1);
    setGroupIndex((prev) => (prev - 1 + totalGroups) % totalGroups);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 5000);
  };

  const currentGroup = getGroup(groupIndex);

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
      scale: 0.9,
      filter: "blur(6px)",
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -120 : 120,
      opacity: 0,
      scale: 0.9,
      filter: "blur(6px)",
    }),
  };

  return (
    <section className="bg-background text-foreground py-12 px-6 overflow-hidden transition-colors duration-500">
      <div className="max-w-4xl mx-auto text-center">

        {/* Badge */}
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-[10px] uppercase tracking-[0.2em] border border-border px-4 py-1.5 rounded-full text-muted-foreground mb-8 inline-block"
        >
          Nos marques & partenaires
        </motion.span>

        {/* Titre */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold mb-6 leading-[1.1] tracking-tight"
        >
          Boostez votre visibilité avec les talents qui résonnent avec votre audience
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-muted-foreground mb-16 max-w-2xl mx-auto text-lg leading-relaxed"
        >
          Que vous lanciez un produit, renforciez votre notoriété ou engagiez une communauté, nous créons des campagnes sur-mesure.
        </motion.p>

        {/* Carrousel */}
        <div className="relative">

          {/* Bouton gauche */}
          <button
            onClick={goPrev}
            className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-booster-yellow hover:text-booster-yellow transition-all shadow-md text-lg"
          >
            ‹
          </button>

          {/* Bouton droite */}
          <button
            onClick={goNext}
            className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-booster-yellow hover:text-booster-yellow transition-all shadow-md text-lg"
          >
            ›
          </button>

          {/* Cartes */}
          <div className="overflow-hidden px-2">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={groupIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="grid grid-cols-3 gap-6"
              >
                {currentGroup.map((brand, i) => (
                  <motion.div
                    key={brand.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 0 30px rgba(245, 194, 0, 0.15)",
                      borderColor: "#F5C200",
                    }}
                    className="flex items-center justify-center bg-card border border-border rounded-3xl px-8 py-8 h-[140px] transition-colors cursor-default"
                  >
                    <img
                      src={brand.img}
                      alt={brand.name}
                      className="max-w-full max-h-[80px] object-contain select-none pointer-events-none"
                      draggable={false}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Indicateurs */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalGroups }).map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > groupIndex ? 1 : -1);
                  setGroupIndex(i);
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 5000);
                }}
                className={`transition-all duration-300 rounded-full ${
                  i === groupIndex
                    ? "w-6 h-2 bg-booster-yellow"
                    : "w-2 h-2 bg-border hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Lien */}
        <div className="mt-16 flex justify-center">
          <Link href="/auth" className="w-full sm:w-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-booster-yellow text-black px-10 py-4 rounded-full font-bold text-center shadow-xl shadow-yellow-500/10 cursor-pointer"
            >
              Lancer ma campagne
            </motion.div>
          </Link>
        </div>

      </div>
    </section>
  );
}