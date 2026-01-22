"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, AlertCircle, Sparkles, Loader2, Coins, ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function Step4() {
  const router = useRouter();
  const steps = [1, 2, 3, 4];
  
  // Paramètres de conversion
  const EURO_RATE = 655.957; 
  const MIN_BUDGET_CFA = 15000;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const [budget, setBudget] = useState<string>(""); 
  const [currency, setCurrency] = useState("CFA");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);

  // Calcul de la contre-valeur en temps réel pour l'affichage
  const getCounterValue = () => {
    if (!budget || isNaN(Number(budget))) return null;
    if (currency === "CFA") {
      return (Number(budget) / EURO_RATE).toFixed(2) + " €";
    } else {
      return Math.round(Number(budget) * EURO_RATE).toLocaleString() + " CFA";
    }
  };

  // Gestion intelligente de la saisie (Interdit négatifs + entiers pour CFA)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // 1. Interdire le signe négatif
    if (val.includes('-')) return;

    // 2. Si CFA : Interdire les points et virgules (que des entiers)
    if (currency === "CFA" && (val.includes('.') || val.includes(','))) {
      return;
    }

    setBudget(val);
    if (showError) setShowError(false);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    if (currency === newCurrency) return;
    
    if (budget && !isNaN(Number(budget))) {
      if (newCurrency === "EUR") {
        // CFA -> EUR : On garde 2 décimales
        setBudget((Number(budget) / EURO_RATE).toFixed(2));
      } else {
        // EUR -> CFA : On arrondit à l'entier strict
        setBudget(Math.round(Number(budget) * EURO_RATE).toString());
      }
    } else {
      // Si le champ est vide, on nettoie juste pour éviter des bugs
      setBudget("");
    }

    setCurrency(newCurrency);
    setShowError(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem('campaign_step_4');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.budget !== undefined) setBudget(data.budget);
      if (data.currency !== undefined) setCurrency(data.currency);
    }
  }, []);

  useEffect(() => {
    const dataToSave = { budget, currency };
    localStorage.setItem('campaign_step_4', JSON.stringify(dataToSave));
  }, [budget, currency]);

  const handleFinalSubmit = async () => {
    // --- VALIDATION ---
    // On convertit tout en CFA virtuellement pour vérifier le seuil exact
    let valInCFA = Number(budget);
    if (currency === "EUR") {
      valInCFA = valInCFA * EURO_RATE;
    }

    // Validation : Pas de négatifs (redondant avec l'input mais sécu) et Min budget
    if (!budget || Number(budget) < 0 || valInCFA < (MIN_BUDGET_CFA - 1)) {
      setShowError(true);
      return;
    }
    // ------------------

    setIsSubmitting(true);
    setShowError(false);

    try {
      const s1 = JSON.parse(localStorage.getItem('campaign_step_1') || '{}');
      const s2 = JSON.parse(localStorage.getItem('campaign_step_2') || '{}');
      const s3 = JSON.parse(localStorage.getItem('campaign_step_3') || '{}');

      const finalObjectives = s1.objectives?.map((obj: string) => 
        obj === "Autre" ? s1.customObjective : obj
      ) || [];

      const finalInterests = s2.selectedInterests?.map((int: string) => 
        int === "Autre" ? s2.customInterest : int
      ) || [];

      const finalCountry = s2.selectedCountry === "Autre" 
        ? s2.customCountry 
        : (s2.selectedCountry || "Non défini");

      // Pour la payload, on s'assure d'envoyer un entier si c'est du CFA
      const finalBudget = currency === "CFA" ? Math.floor(parseFloat(budget)) : parseFloat(budget);

      const finalPayload = {
        title: s1.title || "Sans titre",
        objectives: finalObjectives, 
        start_date: s1.startDate,
        end_date: s1.endDate,
        age_min_ciblé: s2.ageRange?.min_ciblé || 13,
        age_max_ciblé: s2.ageRange?.max_ciblé || 80,
        country: finalCountry, 
        interests: finalInterests,
        nb_publications: s3.nbPublications || 0,
        formats: s3.formats || [],
        tone: s3.ton || "Inspirant",
        budget: finalBudget,
        currency: currency,
        status: 'active'
      };

      const { error } = await supabase.from('campaigns').insert([finalPayload]);
      if (error) throw error;

      localStorage.removeItem('campaign_step_1');
      localStorage.removeItem('campaign_step_2');
      localStorage.removeItem('campaign_step_3');
      localStorage.removeItem('campaign_step_4');

      router.push('/brands/dashboard/success');

    } catch (err: any) {
      console.error("Erreur:", err);
      setShowError(true);
      setIsSubmitting(false);
    }
  };

  // Calcul du texte minimum affiché (purement visuel)
  const minText = currency === "CFA" 
    ? "15 000 FCFA" 
    : `${(MIN_BUDGET_CFA / EURO_RATE).toFixed(2)} €`;

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-8 font-sans text-[#111827]">
      <style jsx global>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

      <div className="max-w-3xl mx-auto mb-8">
        <Link href="/brands/auth/campagne3" className="flex items-center text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4 group w-fit">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Étape précédente</span>
        </Link>
        <h1 className="text-3xl font-serif font-bold mb-2">Créer une campagne</h1>
        <p className="text-gray-500 text-sm">Définissez votre enveloppe budgétaire</p>
      </div>

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

      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm min-h-[450px] flex flex-col justify-between">
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex items-center gap-3 mb-8">
            <Coins className="text-[#D4A017]" size={28} />
            <h2 className="text-2xl font-serif font-bold">Budget de la campagne</h2>
          </div>
          
          <div className="space-y-8">
            {/* Sélecteur de devise */}
            <div className="space-y-3">
              <label className="block text-[15px] font-bold text-gray-700">Choisissez votre devise *</label>
              <div className="flex gap-4">
                {["CFA", "EUR"].map((cur) => (
                  <button
                    key={cur}
                    onClick={() => handleCurrencyChange(cur)}
                    className={`flex-1 py-4 rounded-xl font-bold border-2 transition-all ${
                      currency === cur 
                      ? "border-[#D4A017] bg-[#D4A017]/5 text-[#D4A017]" 
                      : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
                    }`}
                  >
                    {cur === "CFA" ? "FCFA (CFA)" : "Euro (€)"}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Budget avec conversion en direct */}
            <div className="space-y-3">
              <label className="block text-[15px] font-bold text-gray-700">
                Montant de l'investissement * <span className="text-xs font-normal text-gray-400 ml-2">
                  (Min. {minText})
                </span>
              </label>
              <div className="relative group">
                <input
                  type="number"
                  min="0" // Aide le navigateur
                  step={currency === "CFA" ? "1" : "0.01"} // Pas décimal pour CFA
                  value={budget}
                  onChange={handleInputChange} // Utilisation du nouveau handler
                  onKeyDown={(e) => {
                    // Bloquer le signe moins au clavier pour plus de sécurité UX
                    if (e.key === '-' || e.key === 'e') e.preventDefault();
                    // Bloquer le point/virgule si CFA
                    if (currency === "CFA" && (e.key === '.' || e.key === ',')) e.preventDefault();
                  }}
                  placeholder={currency === "CFA" ? "Ex: 50000" : "Ex: 75"}
                  className={`w-full px-6 py-5 rounded-2xl border-2 outline-none transition-all text-2xl font-bold appearance-none ${
                    showError 
                    ? "border-red-200 bg-red-50/30" 
                    : "border-gray-100 focus:border-[#D4A017] bg-gray-50/30"
                  }`}
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">
                  {currency}
                </div>
              </div>

              {/* Affichage de la conversion en temps réel */}
              {budget && !isNaN(Number(budget)) && Number(budget) > 0 && (
                <div className="flex items-center gap-2 px-2 text-[#D4A017] font-medium text-sm animate-in fade-in slide-in-from-left-2">
                  <ArrowLeftRight size={14} />
                  <span>Équivaut environ à <strong className="font-bold">{getCounterValue()}</strong></span>
                </div>
              )}
              
              {showError && (
                <div className="flex items-center gap-2 text-red-500 text-sm mt-2 animate-in slide-in-from-top-1">
                  <AlertCircle size={14} />
                  <span>
                    Le budget minimum est de {minText}.
                  </span>
                </div>
              )}
            </div>

            <div className="p-6 bg-[#D4A017]/5 rounded-2xl border border-[#D4A017]/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#D4A017]/10 flex items-center justify-center shrink-0">
                <Sparkles className="text-[#D4A017]" size={24} />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Le budget définit la portée de votre campagne. Un budget plus élevé permet de collaborer avec des profils <strong>Premium</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-12">
          <Link 
            href="/brands/auth/campagne3" 
            className="px-8 py-3.5 text-gray-500 font-bold text-sm hover:text-gray-800 transition-all"
          >
            Retour
          </Link>
          
          <button 
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 min-w-[240px] px-8 py-4 bg-[#D4A017] text-white rounded-xl font-bold text-sm hover:bg-[#B88A14] transition-all shadow-lg shadow-[#D4A017]/20 disabled:bg-gray-300"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Matching en cours...
              </>
            ) : (
              "Lancer le matching IA !"
            )}
          </button>
        </div>
      </div>
    </main>
  );
}