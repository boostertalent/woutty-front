"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, AlertCircle, Sparkles, Loader2, Coins } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function Step4() {
  const router = useRouter();
  const steps = [1, 2, 3, 4];
  const MIN_BUDGET_CFA = 15000;

  // Initialisation du client Supabase
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [budget, setBudget] = useState<string>(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Récupération du budget depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('campaign_step_4');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.budget) setBudget(data.budget);
      } catch (e) { console.error(e); }
    }
  }, []);

  // Sauvegarde automatique
  useEffect(() => {
    localStorage.setItem('campaign_step_4', JSON.stringify({ budget, currency: "CFA" }));
  }, [budget]);

  // Gestion de la saisie numérique
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^[0-9]*$/.test(val)) { // seulement chiffres
      setBudget(val);
      setShowError(false);
      setServerError(null);
    }
  };

  // Soumission finale
  const handleFinalSubmit = async () => {
    const valInCFA = Number(budget);

    if (!budget || isNaN(valInCFA) || valInCFA < MIN_BUDGET_CFA) {
      setShowError(true);
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Votre session a expiré. Veuillez vous reconnecter.");

      // Récupération des étapes précédentes
      const s1 = JSON.parse(localStorage.getItem('campaign_step_1') || '{}');
      const s2 = JSON.parse(localStorage.getItem('campaign_step_2') || '{}');
      const s3 = JSON.parse(localStorage.getItem('campaign_step_3') || '{}');

      // Conversion "Autre" en valeur personnalisée
      const finalObjectives = s1.objectives?.map((obj: string) => obj === "Autre" ? s1.customObjective : obj) || [];
      const finalInterests = s2.selectedInterests?.map((int: string) => int === "Autre" ? s2.customInterest : int) || [];
      const finalCountry = s2.selectedCountry === "Autre" ? s2.customCountry : (s2.selectedCountry || "Non défini");
      const finalTone = s3.ton === "Autre" ? s3.customTone : (s3.ton || "Inspirant");

      // DÉTERMINATION AUTOMATIQUE DU STATUT BASÉ SUR LES DATES
      const today = new Date();
      const startDate = s1.startDate ? new Date(s1.startDate) : null;
      const endDate = s1.endDate ? new Date(s1.endDate) : null;
      
      let status = 'pending'; // Valeur par défaut
      
      if (startDate && endDate) {
        if (today < startDate) {
          status = 'planned'; // La campagne est planifiée pour plus tard
        } else if (today >= startDate && today <= endDate) {
          status = 'active'; // La campagne est en cours
        } else if (today > endDate) {
          status = 'completed'; // La campagne est terminée
        }
      } else if (startDate && today >= startDate) {
        // Si seulement la date de début est définie et qu'on est après
        status = 'active';
      } else if (startDate && today < startDate) {
        // Si seulement la date de début est définie et qu'on est avant
        status = 'planned';
      }

      // Payload final pour insertion dans Supabase
      const finalPayload = {
        title: s1.title || "Sans titre",
        objectives: finalObjectives,
        start_date: s1.startDate,
        end_date: s1.endDate,
        age_min_cible: Number(s2.ageRange?.min) || 13,
        age_max_cible: Number(s2.ageRange?.max) || 80,
        country: finalCountry,
        interests: finalInterests,
        nb_publications: Number(s3.nbPublications) || 0,
        formats: s3.formats || [],
        tone: finalTone,
        budget: Number(valInCFA),
        currency: "CFA",
        status: 'active',
        id_w: session.user.id 
      };

      console.log("Envoi à Supabase - Statut:", status);
      console.log("Données de la campagne:", finalPayload);

      const { error } = await supabase.from('campaigns').insert([finalPayload]);
      if (error) throw error;

      // Nettoyage LocalStorage
      ['campaign_step_1','campaign_step_2','campaign_step_3','campaign_step_4'].forEach(key => localStorage.removeItem(key));

      router.push('/brands/dashboard/success');
    } catch (err: any) {
      console.error("Erreur technique:", err);
      setServerError(err.message || "Une erreur est survenue lors de la création.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-8 font-sans text-[#111827]">
      <div className="max-w-3xl mx-auto mb-8">
        <Link href="/brands/auth/campagne3" className="flex items-center text-sm text-gray-400 hover:text-black transition-colors mb-4 font-bold">
          <ChevronLeft size={16} /> Étape précédente
        </Link>
        <h1 className="text-3xl font-black mb-2 tracking-tight">Créer une campagne</h1>
        <p className="text-gray-400 text-sm font-medium">Définissez votre enveloppe budgétaire</p>
      </div>

      {/* Stepper */}
      <div className="max-w-xl mx-auto mb-12 flex justify-between items-center relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-10"></div>
        {steps.map((s) => (
          <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${s <= 4 ? "bg-[#D4A017] text-white ring-8 ring-[#D4A017]/10" : "bg-white border border-gray-100 text-gray-300 shadow-sm"}`}>
            {s}
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm min-h-[450px] flex flex-col justify-between">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#D4A017]/10 rounded-2xl flex items-center justify-center">
                <Coins className="text-[#D4A017]" size={24} />
            </div>
            <h2 className="text-xl font-bold">Budget de la campagne</h2>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-gray-400">
              Montant de l'investissement (FCFA) *
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={budget}
                onChange={handleInputChange}
                placeholder="Ex: 50000"
                className={`w-full px-6 py-5 rounded-2xl border bg-white shadow-sm outline-none transition-all text-2xl font-bold text-black placeholder:text-gray-200
                  ${(showError || serverError) ? "border-red-200 ring-4 ring-red-50" : "border-gray-200 focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/5"}`}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-black text-sm uppercase">FCFA</div>
            </div>

            <p className="text-[11px] text-gray-400 font-medium ml-1">
              Minimum requis : <span className="text-black font-bold">15 000 FCFA</span>
            </p>

            {showError && (
              <div className="flex items-center gap-2 text-red-500 text-xs font-bold bg-red-50 p-4 rounded-2xl border border-red-100">
                <AlertCircle size={14} />
                <span>Le budget minimum est de 15 000 FCFA.</span>
              </div>
            )}

            {serverError && (
              <div className="flex items-center gap-2 text-orange-600 text-xs font-bold bg-orange-50 p-4 rounded-2xl border border-orange-100">
                <AlertCircle size={14} />
                <span>{serverError}</span>
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
            <Sparkles className="text-[#D4A017] shrink-0" size={20} />
            <div>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Ce budget sera utilisé pour vous matcher avec les créateurs dont l'audience et les tarifs correspondent à vos objectifs.
              </p>
              <p className="text-[10px] text-gray-400 font-medium mt-2">
                💡 Le statut de votre campagne sera automatiquement déterminé selon les dates que vous avez définies.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-10">
          <Link href="/brands/auth/campagne3" className="text-gray-400 font-bold text-sm hover:text-black transition-all">Retour</Link>
          <button 
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-3 min-w-[220px] px-8 py-4 bg-[#D4A017] text-white rounded-2xl font-bold text-sm hover:bg-[#B88A14] transition-all shadow-xl disabled:bg-gray-100 disabled:text-gray-300"
          >
            {isSubmitting ? <><Loader2 size={18} className="animate-spin" /><span>Enregistrement...</span></> 
            : <><Sparkles size={18} /><span>Lancer le matching IA !</span></>}
          </button>
        </div>
      </div>
    </main>
  );
}
