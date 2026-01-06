"use client";
import React from 'react';
import { motion } from "framer-motion";
import { Heart, Target, Clock, Scale, ArrowRight } from "lucide-react";
import Link from 'next/link';
const benefits = [
  {
    icon: <Heart className="w-8 h-8" />,
    title: "Authenticité maximale",
    desc: "L'argent est bloqué en escrow dès que vous êtes sélectionné. Vous créez en toute confiance sans risque d'impayé."
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: "Matching Automatique",
    desc: "Notre algorithme intelligent connecte votre marque avec les créateurs les plus pertinents pour votre niche."
  },
  {
    icon: <Clock className="w-8 h-8" />,
    title: "Gain de temps",
    desc: "Simplifiez vos processus : de la recherche à la livraison, tout est centralisé pour accélérer vos lancements."
  },
  {
    icon: <Scale className="w-8 h-8" />,
    title: "Droits inclus",
    desc: "Bénéficiez d'une cession totale des droits sur vos contenus UGC pour une utilisation multicanale sans limites."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  },
};

export default function BrandBenefits() {
  return (
    <section className="bg-background text-foreground py-24 px-6 overflow-hidden transition-colors duration-500">
      <div className="max-w-4xl mx-auto text-center">
        
        {/* Badge animé */}
        <motion.span 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-[10px] uppercase tracking-[0.2em] border border-border px-4 py-1.5 rounded-full text-muted-foreground mb-8 inline-block"
        >
          Marques & Entreprises
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

        {/* Grille de cartes dynamiques */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left"
        >
          {benefits.map((item, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              whileHover={{ 
                y: -8,
                backgroundColor: "var(--card)",
                borderColor: "var(--color-booster-yellow)" 
              }}
              className="bg-muted/30 border border-border p-8 rounded-[2rem] transition-all duration-300 group cursor-default shadow-sm"
            >
              <motion.div 
                className="mb-6 text-booster-yellow"
                whileHover={{ rotate: 5, scale: 1.1 }}
              >
                {item.icon}
              </motion.div>
              <h3 className="text-booster-yellow font-bold text-sm uppercase tracking-widest mb-3 transition-colors group-hover:text-foreground">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed group-hover:text-foreground transition-colors">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* lien */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-12">
          
          {/* LIEN PRINCIPAL : INSCRIPTION */}
          <Link href="/auth" className="w-full sm:w-auto">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-booster-yellow text-black px-10 py-4 rounded-full font-bold text-center shadow-xl shadow-yellow-500/10 cursor-pointer"
            >
              Lancer ma campagne
            </motion.div>
          </Link>

          {/* LIEN SECONDAIRE : DÉCOUVRIR LES TALENTS */}
          <Link 
            href="/" 
            className="text-foreground flex items-center gap-3 font-semibold group transition-all"
          >
            Voir nos marques
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ArrowRight className="w-5 h-5 text-booster-yellow group-hover:translate-x-2 transition-transform" />
            </motion.span>
          </Link>
          
        </div>
        
      </div>
    </section>
  );
}