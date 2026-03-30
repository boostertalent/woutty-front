"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Process() {
  const [activeTab, setActiveTab] = useState<"brands" | "creators">("brands");

  const brandSteps = [
    { id: "1", title: "Postez votre brief", desc: "Décrivez votre besoin : objectifs, type de contenu, budget, délais." },
    { id: "2", title: "Matching IA", desc: "Notre algorithme sélectionne les créateurs les plus pertinents pour votre marque." },
    { id: "3", title: "Validez et lancez", desc: "Choisissez vos créateurs. Le paiement est sécurisé en escrow." },
    { id: "4", title: "Recevez vos contenus", desc: "Téléchargez vos UGC avec tous les droits d'utilisation." }
  ];

  const creatorSteps = [
    { id: "1", title: "Créez votre profil", desc: "Présentez vos réalisations, vos tarifs et votre univers." },
    { id: "2", title: "Recevez des offres", desc: "Les marques vous contactent pour des projets adaptés à votre profil." },
    { id: "3", title: "Produisez & livrez", desc: "Créez votre contenu et livrez-le via la plateforme." },
    { id: "4", title: "Paiement rapide", desc: "Vos fonds sont libérés dès validation, sans délai inutile." }
  ];

  const currentSteps = activeTab === "brands" ? brandSteps : creatorSteps;

  return (
    <section className="py-12 px-6 bg-background text-foreground">
      <div className="max-w-5xl mx-auto flex flex-col items-center">

        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[10px] uppercase tracking-[0.25em] border border-border px-3 py-1 rounded-full text-muted-foreground mb-4"
        >
          Processus
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-center mb-3"
        >
          Comment ça marche ?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-muted-foreground text-center mb-8 max-w-lg"
        >
          Un processus simple, fluide et sécurisé, pensé pour les marques et les créateurs.
        </motion.p>

        <div className="relative flex bg-muted p-1 rounded-full border border-border mb-10">
          <motion.div
            layout
            className="absolute top-1 bottom-1 w-1/2 bg-booster-yellow rounded-full"
            initial={false}
            animate={{ x: activeTab === "brands" ? 0 : "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          {["brands", "creators"].map((tab) => (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab as any)}
              className={`relative z-10 px-6 py-2 text-sm font-medium rounded-full transition-colors ${
                activeTab === tab ? "text-black" : "text-muted-foreground"
              }`}
            >
              {tab === "brands" ? "Pour les marques" : "Pour les créateurs"}
            </motion.button>
          ))}
        </div>

        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8"
            >
              {currentSteps.map((step, i) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="flex gap-5 p-4 rounded-2xl hover:bg-muted/50 transition"
                >
                  <span className="text-xl font-bold text-booster-yellow shrink-0">{step.id}.</span>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}