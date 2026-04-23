"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const faqs = [
  { question: "C'est quoi Booster Talent concrètement ?", answer: "Une plateforme de mise en relation sécurisée entre marques et créateurs d'UGC." },
  { question: "Ai-je besoin d'un grand nombre d'abonnés ?", answer: "Non, la qualité créative et l'authenticité priment sur la taille de votre audience." },
  { question: "Comment sont fixés les tarifs ?", answer: "Les tarifs sont libres mais encadrés par nos recommandations basées sur le marché actuel." },
  { question: "Who are the designers ?", answer: "Nos créateurs sont des experts en contenu digital sélectionnés avec soin." },
  { question: "What if I don't like the design ?", answer: "Nous prévoyons des phases de révision pour nous assurer que le résultat vous convient parfaitement." },
  { question: "Are there any refunds if I don't like the service ?", answer: "Les fonds sont sécurisés et débloqués uniquement après votre validation finale." },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="bg-background text-foreground py-14 sm:py-24 px-4 sm:px-6 transition-colors duration-500">
      <div className="max-w-3xl mx-auto">
        
        {/* En-tête de section */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Questions fréquentes</h2>
          <p className="text-muted-foreground text-sm">Tout ce que vous devez savoir pour commencer.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="border-t border-border"
        >
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <motion.div 
                key={index} 
                variants={itemVariants}
                className="border-b border-border"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full py-5 sm:py-7 flex justify-between items-center text-left group transition-all"
                >
                  <span className={`text-sm md:text-base font-medium transition-colors duration-300 ${
                    isOpen ? 'text-booster-yellow' : 'text-foreground/80 group-hover:text-foreground'
                  }`}>
                    {faq.question}
                  </span>
                  
                  {/* Icône animée */}
                  <div className={`relative flex items-center justify-center w-6 h-6 transition-transform duration-300 ${
                    isOpen ? 'rotate-45' : 'rotate-0'
                  }`}>
                    <Plus className={`w-5 h-5 transition-colors ${
                      isOpen ? 'text-booster-yellow' : 'text-muted-foreground/60'
                    }`} />
                  </div>
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                      <div className="pb-8 pr-12 text-muted-foreground text-sm leading-relaxed antialiased">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}