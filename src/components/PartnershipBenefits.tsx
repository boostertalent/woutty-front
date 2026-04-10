"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { X, Play } from "lucide-react";
import Link from 'next/link';

const campagnes = [
  { type: "image", src: "/campagnes-réalisées/Corniche-visual.jpg",         title: "Corniche Visual",      span: "col-span-2 row-span-1", fit: "cover" },
  { type: "image", src: "/campagnes-réalisées/8 Mars.avec couleur.jpg",     title: "8 Mars",               span: "col-span-1 row-span-2", fit: "cover" },
  { type: "image", src: "/campagnes-réalisées/3.png",                        title: "Loxea Rent",           span: "col-span-1 row-span-1", fit: "cover" },
  { type: "image", src: "/campagnes-réalisées/g8fw3nnnaqmsvtmfc8bh.avif",   title: "Campagne",             span: "col-span-1 row-span-1", fit: "cover" },
  { type: "image", src: "/campagnes-réalisées/Booster Academy 2.jpg",        title: "Booster Academy",      span: "col-span-1 row-span-2", fit: "cover" },
  { type: "image", src: "/campagnes-réalisées/VISUEL JEU CONCOURS.jpg.jpeg", title: "Jeu Concours",         span: "col-span-1 row-span-2", fit: "cover" },
  { type: "video", src: "/campagnes-réalisées/Publicité Yango Can MAroc 2025.mp4", title: "Yango CAN Maroc 2025", span: "col-span-1 row-span-1", fit: "cover" },
  { type: "video", src: "/campagnes-réalisées/New face Gandour.MP4",         title: "New Face Gandour",     span: "col-span-1 row-span-2", fit: "cover" },
  { type: "video", src: "/campagnes-réalisées/Video Gandour Fah.MP4",        title: "Gandour x Fah",        span: "col-span-1 row-span-2", fit: "cover" },
  { type: "video", src: "/campagnes-réalisées/VID-20250722-WA0004.mp4",      title: "Campagne 8",           span: "col-span-1 row-span-2", fit: "cover" },
  { type: "video", src: "/campagnes-réalisées/VID-20250722-WA0006.mp4",      title: "Campagne 9",           span: "col-span-1 row-span-1", fit: "cover" },
];

type Campagne = {
  type: string;
  src: string;
  title: string;
  span: string;
  fit: string;
};

function MediaModal({ item, onClose }: { item: Campagne; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-4xl w-full"
        >
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 z-10 w-10 h-10 rounded-full bg-booster-yellow flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
          >
            <X className="w-5 h-5 text-black" />
          </button>

          {item.type === "video" ? (
            <video
              key={item.src}
              src={item.src}
              controls
              autoPlay
              playsInline
              className="w-full max-h-[80vh] object-contain rounded-3xl bg-black"
            />
          ) : (
            <img
              src={item.src}
              alt={item.title}
              className="w-full max-h-[80vh] object-contain rounded-3xl bg-black"
            />
          )}
          <p className="text-center text-white text-sm mt-4 font-medium">{item.title}</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function MediaCard({ item, onClick }: { item: Campagne; onClick: () => void }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      className={`${item.span} relative overflow-hidden cursor-pointer group bg-black`}
    >
      {item.type === "video" ? (
        <>
          <video
            src={item.src}
            muted
            loop
            playsInline
            autoPlay
            className={`w-full h-full object-${item.fit}`}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-booster-yellow transition-colors duration-300">
              <Play className="w-5 h-5 text-white group-hover:text-black transition-colors duration-300" />
            </div>
          </div>
        </>
      ) : (
        <img
          src={item.src}
          alt={item.title}
          className={`w-full h-full object-${item.fit}`}
        />
      )}

      <div className="absolute inset-0 border-2 border-transparent group-hover:border-booster-yellow transition-colors duration-300 pointer-events-none" />
    </motion.div>
  );
}

export default function PartnershipBenefits() {
  const [selected, setSelected] = useState<Campagne | null>(null);

  return (
    <section className="bg-background text-foreground py-12 px-6 overflow-hidden transition-colors duration-500">
      <div className="max-w-5xl mx-auto text-center">

        {selected && (
          <MediaModal item={selected} onClose={() => setSelected(null)} />
        )}

        {/* Badge */}
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-[10px] uppercase tracking-[0.2em] border border-border px-4 py-1.5 rounded-full text-muted-foreground mb-8 inline-block"
        >
          Nos campagnes réalisées
        </motion.span>

        {/* Titre */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold mb-6 leading-[1.1] tracking-tight"
        >
          Ensemble, redéfinissons les standards de l'influence
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-muted-foreground mb-16 max-w-2xl mx-auto text-lg leading-relaxed"
        >
          Un aperçu de contenus et campagnes menés avec des marques et des créateurs sur Woutty.
        </motion.p>

        {/* Grille masonry */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-3 gap-0 auto-rows-[200px]"
        >
          {campagnes.map((item, i) => (
            <MediaCard
              key={i}
              item={item}
              onClick={() => setSelected(item)}
            />
          ))}
        </motion.div>

        {/* Bouton */}
        <div className="mt-16 flex justify-center">
          <Link href="/auth/login" className="w-full sm:w-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-booster-yellow text-black px-10 py-4 rounded-full font-bold text-center shadow-xl shadow-yellow-500/10 cursor-pointer"
            >
              Lancer une campagne
            </motion.div>
          </Link>
        </div>

      </div>
    </section>
  );
}