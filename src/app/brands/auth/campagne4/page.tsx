"use client";

import React, { useState } from 'react';
import { ChevronLeft, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Step4() {
  const router = useRouter();
  const steps = [1, 2, 3, 4];
  
  // États
  const [budget, setBudget] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);

 const handleFinalSubmit = async () => {
  if (!budget || Number(budget) <= 0) {
    setShowError(true);
    return;
  }

  setIsSubmitting(true);
  setShowError(false);

  // Petit délai pour l'effet visuel avant de changer de page
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // On envoie vers la page d'analyse progressive
  router.push('/brands/dashboard/success');
};

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-8 font-sans text-[#111827]">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <Link href="/brands/auth/campagne3" className="flex items-center text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4 group w-fit">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Étape précédente</span>
        </Link>
        <h1 className="text-3xl font-serif font-bold mb-2">Créer une campagne</h1>
        <p className="text-gray-500 text-sm">Définissez vos critères pour un matching IA optimal</p>
      </div>

      {/* Stepper */}
      <div className="max-w-xl mx-auto mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-10 -translate-y-1/2"></div>
        <div className="flex justify-between items-center">
          {steps.map((s) => (
            <div
              key={s}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                s <= 4 
                  ? "bg-[#D4A017] text-white ring-8 ring-[#D4A017]/10" 
                  : "bg-white border border-gray-100 text-gray-400 shadow-sm"
              }`}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* Card Budget */}
      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm min-h-[400px] flex flex-col justify-between">
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <h2 className="text-2xl font-serif font-bold mb-8">Budget</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[15px] font-bold text-gray-700">
                Budget total de la campagne *
              </label>
              
              <div className="relative">
                <input
                  type="number"
                  min="1" // Empêche techniquement les nombres négatifs via les flèches du navigateur
                  value={budget}
                  onChange={(e) => {
                    const val = e.target.value;
                    // On n'accepte la valeur que si elle est vide ou positive
                    if (val === "" || Number(val) >= 0) {
                      setBudget(val === "" ? "" : Number(val));
                      setShowError(false);
                    }
                  }}
                  placeholder="Ex: 1500"
                  className={`w-full px-5 py-4 rounded-xl border outline-none transition-all text-lg font-medium ${
                    showError 
                    ? "border-red-300 bg-red-50/30 ring-4 ring-red-50" 
                    : "border-gray-200 focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/5"
                  }`}
                />
              </div>
              
              {showError && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-2 animate-in fade-in">
                  <AlertCircle size={14} />
                  <span>Veuillez indiquer un nombre positif pour lancer l'IA.</span>
                </div>
              )}
            </div>

            <div className="p-6 bg-[#D4A017]/5 rounded-2xl border border-[#D4A017]/10">
              <p className="text-sm text-gray-600 leading-relaxed">
                <Sparkles className="inline-block mr-2 text-[#D4A017]" size={16} />
                Notre algorithme utilisera ce montant pour vous proposer les profils d'influenceurs ayant le meilleur <strong>ROI</strong> par rapport à votre enveloppe.
              </p>
            </div>
          </div>
        </div>

        {/* Boutons d'Action */}
        <div className="flex justify-between items-center pt-12">
          <Link 
            href="/brands/auth/campagne3" 
            className={`px-8 py-3.5 bg-[#111827] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}
          >
            Retour
          </Link>
          
          <button 
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 min-w-[220px] px-8 py-3.5 bg-[#D4A017] text-white rounded-xl font-bold text-sm hover:bg-[#B88A14] transition-all shadow-lg shadow-[#D4A017]/20 disabled:bg-gray-300 disabled:shadow-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Analyse IA en cours...
              </>
            ) : (
              <>
                Lancer le matching IA !
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}