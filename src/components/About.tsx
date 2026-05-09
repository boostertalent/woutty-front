"use client";
import { motion } from "framer-motion";

export default function About() {
  const features = [
    { 
      title: "Matching IA", 
      description: "Notre algorithme analyse l'ADN de votre marque pour trouver le créateur idéal en un clic." 
    },
    { 
      title: "Gagnez en créant", 
      description: "Monétisez votre contenu authentique. Pas besoin d'être une star, soyez juste vous-même." 
    },
    { 
      title: "Zéro barrière", 
      description: "Aucun minimum d'abonnés requis. Votre talent est la seule monnaie d'échange." 
    }
  ];

  return (
    /* ✅ bg-background pour changer de noir à blanc */
    <section className="py-14 sm:py-24 px-4 sm:px-6 flex flex-col items-center text-center bg-background transition-colors duration-500">
      <motion.p 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] mb-4"
      >
        À propos
      </motion.p>

      {/* ✅ text-foreground pour changer de blanc à noir */}
      <motion.h2 
        className="text-3xl sm:text-4xl md:text-6xl font-bold mb-10 sm:mb-16 text-foreground tracking-tight"
      >
        C&apos;est quoi Woutty ?
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {features.map((feature, index) => (
          <FeatureCard 
            key={index} 
            title={feature.title} 
            description={feature.description} 
            index={index} 
          />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ title, description, index }: { title: string; description: string; index: number }) {
  return (
    <motion.div 
      initial="initial"
      whileHover="active"
      whileTap="active"
      className="relative h-[210px] sm:h-[250px] flex items-center justify-center rounded-[2.5rem] bg-card border border-border overflow-hidden p-6 sm:p-8 cursor-pointer shadow-2xl transition-colors duration-300"
      variants={{
        initial: { borderColor: "var(--border)" },
        active: { borderColor: "#F5C200" } 
      }}
    >
      {/* TEXTE CACHÉ - */}
      <motion.div
        variants={{
          initial: { opacity: 0, scale: 0.9, filter: "blur(10px)" },
          active: { opacity: 1, scale: 1, filter: "blur(0px)" }
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="absolute inset-0 flex items-center justify-center p-6 sm:p-8 text-foreground text-center text-sm md:text-base leading-relaxed z-20"
      >
        {description}
      </motion.div>

      {/* TITRE JAUNE*/}
      <motion.span 
        variants={{
          initial: { opacity: 1, y: 0 },
          active: { opacity: 0, y: -20 } 
        }}
        animate={{
          scale: [1, 1.05, 1], 
        }}
        transition={{
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
          default: { duration: 0.3 }
        }}
        className="font-bold text-xl md:text-2xl z-10 text-booster-yellow"
      >
        {title}
      </motion.span>

      {/* EFFET DE LUMIÈRE (GLOW) JAUNE */}
      <motion.div 
        variants={{
          initial: { opacity: 0, scale: 0.5 },
          active: { opacity: 0.15, scale: 1.3 }
        }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 z-0 bg-booster-yellow rounded-full blur-[60px]"
      />

      {/* FOND INTERNE - */}
      <motion.div 
        variants={{
          initial: { opacity: 1 },
          active: { opacity: 0.8 }
        }}
        className="absolute inset-0 z-0 bg-card transition-colors duration-500"
      />
    </motion.div>
  );
}