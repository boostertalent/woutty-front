"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, Users, Award, ArrowRight } from 'lucide-react';

const benefits = [
  {
    icon: <ShieldCheck className="w-8 h-8" />,
    title: "Paiement garanti",
    text: "L'argent est bloqué en escrow dès que vous êtes sélectionné. Vous créez en toute confiance sans risque d'impayé."
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Opportunités illimitées",
    text: "Accédez à des collaborations exclusives avec des marques qui correspondent à votre style et votre audience."
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Communauté bienveillante",
    text: "Rejoignez un réseau de créateurs pour partager vos expériences et progresser ensemble."
  },
  {
    icon: <Award className="w-8 h-8" />,
    title: "Gamification & Badges",
    text: "Gagnez en visibilité et débloquez des avantages exclusifs à mesure que vous complétez des missions."
  }
];

export default function CreatorBenefits() {
  return (
    <section className="bg-background text-foreground py-24 px-6 overflow-hidden transition-colors duration-500">
      <div className="max-w-5xl mx-auto text-center">
        
        {/* Badge */}
        <motion.span 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="inline-block text-[10px] uppercase tracking-[0.2em] border border-border px-4 py-1.5 rounded-full text-muted-foreground mb-8"
        >
          Influenceurs & Créateurs
        </motion.span>

        <h2 className="text-4xl md:text-5xl font-bold mb-6 max-w-2xl mx-auto leading-[1.1] tracking-tight">
          Votre créativité mérite d'être rémunérée
        </h2>

        <p className="text-muted-foreground mb-16 max-w-3xl mx-auto text-lg leading-relaxed">
          Vous créez du contenu qui engage ? Nous vous accompagnons pour décrocher les meilleurs contrats et faire grandir votre communauté.
        </p>

        {/* Grille de cartes avec animation monochrome */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {benefits.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                y: -5,
                borderColor: "var(--booster-yellow, #F5C200)",
                boxShadow: "0px 10px 40px -10px rgba(245, 194, 0, 0.15)"
              }}
              /* ✅ Background reste constant, seule la bordure s'anime en jaune */
              className="bg-card border border-border p-10 rounded-[2rem] transition-colors duration-300 group cursor-default"
            >
              {/* L'icône et le titre utilisent la même couleur unique */}
              <div className="mb-6 text-booster-yellow transform transition-transform duration-300 group-hover:scale-110">
                {item.icon}
              </div>
              
              <h3 className="text-booster-yellow font-bold text-sm uppercase tracking-widest mb-3">
                {item.title}
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed transition-colors group-hover:text-foreground">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Boutons d'action */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-booster-yellow text-black px-10 py-4 rounded-full font-bold w-full sm:w-auto shadow-xl shadow-yellow-500/10"
          >
            Rejoindre Booster Talent
          </motion.button>

          <button className="text-foreground flex items-center gap-3 font-medium group">
            Voir nos talents 
            <ArrowRight className="w-5 h-5 text-booster-yellow group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
        
      </div>
    </section>
  );
}