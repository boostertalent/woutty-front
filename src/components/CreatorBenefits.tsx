"use client";
import React from 'react';
import Link from 'next/link'; 
import { motion } from 'framer-motion';
import CreatorCarousel from '@/components/CreatorCarousel';

export default function CreatorBenefits() {
  return (
    <section className="bg-background text-foreground py-12 px-6 overflow-hidden transition-colors duration-500">
      <div className="max-w-5xl mx-auto text-center">
        
        {/* Badge */}
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="inline-block text-[10px] uppercase tracking-[0.2em] border border-border px-4 py-1.5 rounded-full text-muted-foreground mb-8"
        >
          Nos Créateurs
        </motion.span>

        <h2 className="max-md:text-left max-md:text-2xl text-4xl md:text-5xl font-bold max-md:mb-3 mb-6 max-w-2xl mx-auto leading-[1.1] tracking-tight max-md:mx-0">
          Un aperçu de nos créateurs !
        </h2>

        <p className="text-muted-foreground max-md:text-left max-md:text-sm text-lg leading-relaxed max-md:mb-8 mb-16 max-w-3xl mx-auto max-md:mx-0">
          Vous créez du contenu qui engage ? Nous vous accompagnons pour décrocher les meilleurs contrats et faire grandir votre communauté.
        </p>

        {/* Carrousel créateurs */}
        <CreatorCarousel />

        {/* Lien */}
        <div className="mt-16 flex justify-center">
          <Link href="/auth" className="w-full sm:w-auto">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-booster-yellow text-black px-10 py-4 rounded-full font-bold text-center shadow-xl shadow-yellow-500/10 cursor-pointer"
            >
              Rejoindre Woutty
            </motion.div>
          </Link>
        </div>
        
      </div>
    </section>
  );
}