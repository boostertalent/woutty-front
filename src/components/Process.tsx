"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Process() {
  const [activeTab, setActiveTab] = useState<"brands" | "creators">("brands");

  const brandSteps = [
    { id: "1", title: "Postez votre brief", desc: "Décrivez votre besoin : objectifs, type de contenu, budget, délais." },
    { id: "2", title: "Matching IA", desc: "Notre algo identifie les meilleurs créateurs pour votre marque selon vos critères." },
    { id: "3", title: "Validez et lancez", desc: "Choisissez vos créateurs. Le paiement est bloqué en escrow pour sécuriser tout le monde." },
    { id: "4", title: "Recevez vos contenus", desc: "Téléchargez vos UGC avec tous les droits d'usage. Utilisez-les où vous voulez !" }
  ];

  const creatorSteps = [
    { id: "1", title: "Créez votre profil", desc: "Mettez en avant vos meilleures réalisations et vos tarifs." },
    { id: "2", title: "Recevez des offres", desc: "Les marques vous contactent directement pour des projets qui vous correspondent." },
    { id: "3", title: "Produisez et livrez", desc: "Créez votre contenu et envoyez-le via la plateforme en toute sécurité." },
    { id: "4", title: "Paiement rapide", desc: "Une fois validé, recevez vos fonds sans attendre des semaines de relance." }
  ];

  const currentSteps = activeTab === "brands" ? brandSteps : creatorSteps;

  return (
    /* ✅ bg-background et text-foreground pour l'adaptation automatique */
    <section className="py-24 px-6 bg-background text-foreground transition-colors duration-500">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Badge supérieur - ✅ border-border et text-muted-foreground */}
        <span className="text-[10px] uppercase tracking-[0.2em] border border-border px-3 py-1 rounded-full text-muted-foreground mb-6">
          Processus
        </span>

        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 tracking-tight">
          Comment ça marche ?
        </h2>
        
        <p className="text-muted-foreground text-center mb-10 max-w-lg">
          De la première prise de contact aux résultats, nous vous guidons à chaque étape.
        </p>

        {/* Navigation par Onglets - ✅ bg-muted pour le fond de la barre */}
        <div className="flex bg-muted p-1 rounded-full mb-16 border border-border">
          <button
            onClick={() => setActiveTab("brands")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === "brands" 
              ? "bg-booster-yellow text-black shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pour les marques
          </button>
          <button
            onClick={() => setActiveTab("creators")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === "creators" 
              ? "bg-booster-yellow text-black shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pour les créateurs
          </button>
        </div>

        {/* Grille de contenu */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12"
            >
              {currentSteps.map((step) => (
                <div key={step.id} className="flex gap-4">
                  {/* ✅ Numéro en booster-yellow pour garder l'identité */}
                  <span className="text-xl font-bold text-booster-yellow shrink-0">
                    {step.id}.
                  </span>
                  <div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}