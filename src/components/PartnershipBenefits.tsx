"use client";
import React from 'react';
import { motion } from "framer-motion";
import { Handshake, Globe, BarChart3, Rocket, ArrowRight } from "lucide-react";

const partnershipBenefits = [
  {
    icon: <Handshake className="w-8 h-8" />,
    title: "Alliances Stratégiques",
    desc: "Nous bâtissons des ponts entre des marques visionnaires et des écosystèmes créatifs pour des collaborations à long terme."
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: "Visibilité Étendue",
    desc: "Profitez de notre réseau international pour propulser votre message au-delà de vos frontières habituelles."
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Croissance Mesurable",
    desc: "Chaque partenariat est piloté par la donnée pour garantir un retour sur investissement et un impact réel sur votre business."
  },
  {
    icon: <Rocket className="w-8 h-8" />,
    title: "Innovation Co-créative",
    desc: "Accédez à des formats publicitaires exclusifs et inventez avec nous le futur du marketing d'influence."
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

export default function PartnershipBenefits() {
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
          Écosystème & Partenariats
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
          Nous croyons en la force du collectif. Devenez partenaire de Booster Talent et accédez à des opportunités de croissance uniques.
        </motion.p>

        {/* Grille de cartes dynamiques */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left"
        >
          {partnershipBenefits.map((item, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              whileHover={{ 
                y: -8,
                backgroundColor: "var(--card)",
                borderColor: "var(--color-booster-yellow, #F5C200)" 
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

        {/* Boutons d'action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8"
        >
          <motion.button 
            whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(245, 194, 0, 0.2)" }}
            whileTap={{ scale: 0.95 }}
            className="bg-booster-yellow text-black px-10 py-4 rounded-full font-bold text-sm transition-all shadow-lg"
          >
            Devenir partenaire
          </motion.button>
          
          <motion.button 
            whileHover={{ x: 5 }}
            className="flex items-center gap-2 text-sm font-medium text-foreground group transition-colors"
          >
            Découvrir notre réseau 
            <ArrowRight className="w-4 h-4 text-booster-yellow group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}