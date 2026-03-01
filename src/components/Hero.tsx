"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="pt-40 pb-20 px-6 flex flex-col items-center text-center bg-background text-foreground transition-colors duration-500">
      
      {/* Badge avec thème dynamique */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-[10px] text-green-500 mb-8"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
        Lancement Woutty - 2026 
      </motion.div>

      {/* Titre avec Jaune Booster constant et texte adaptatif */}
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl leading-[1.1] mb-8">
        Transformez votre <span className="text-booster-yellow italic">créativité</span> <br /> 
        en <span className="text-booster-yellow italic">revenu</span>. 
      </h1>
      <p className="text-muted-foreground text-lg max-w-2xl mb-10 leading-relaxed">
        La première plateforme africaine où TOUT LE MONDE peut devenir créateur de contenu UGC et collaborer avec des marques. 
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        {/* Bouton Principal - Adaptatif (Noir sur blanc en light, Blanc sur noir en dark) */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link 
            href="/auth" 
            className="bg-foreground text-background px-8 py-3.5 rounded-full font-bold transition-transform duration-200 shadow-lg flex items-center justify-center"
          >
            Commencer maintenant
          </Link>
        </motion.div>

        {/* Bouton Secondaire - Outline adaptatif */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link 
            href="#process" 
            className="border border-border text-foreground px-8 py-3.5 rounded-full font-medium hover:bg-muted transition-colors duration-200 flex items-center justify-center"
          >
            Comment ça marche ?
          </Link>
        </motion.div>
      </div>
      
    </section>
  );
}