"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, ChevronLeft, Target, FileText, ChevronDown, Info, MessageCircle, Headphones } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const objectivesList = [
  { value: 'Notoriété',    label: 'Faire connaître ma marque à de nouvelles personnes' },
  { value: 'Engagement',   label: 'Générer des likes, commentaires et partages' },
  { value: 'Conversion',   label: 'Pousser à l\'achat ou à l\'inscription' },
  { value: 'Trafic',       label: 'Ramener du trafic vers mon site ou mon application' },
  { value: 'Fidélisation', label: 'Renforcer la relation avec mes clients existants' },
  { value: 'Autre',        label: 'Autre objectif (préciser)' },
];

const steps = [1, 2, 3, 4];

export default function CreateCampaign() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objectives: [] as string[],
    customObjective: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('campaign_step_1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData({
          title: parsed.title || '',
          description: parsed.description || '',
          objectives: Array.isArray(parsed.objectives) ? parsed.objectives : [],
          customObjective: parsed.customObjective || '',
          startDate: parsed.startDate || '',
          endDate: parsed.endDate || '',
        });
      } catch (e) {
        console.error("Erreur localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted && (formData.title || formData.objectives.length > 0)) {
      localStorage.setItem('campaign_step_1', JSON.stringify(formData));
    }
  }, [formData, isMounted]);

  const handleObjectiveChange = (val: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.includes(val)
        ? prev.objectives.filter(i => i !== val)
        : [...prev.objectives, val]
    }));
  };

  const isStep1Valid =
    formData.title.trim() !== '' &&
    formData.objectives.length > 0 &&
    formData.startDate !== '' &&
    formData.endDate !== '' &&
    (formData.objectives.includes('Autre') ? formData.customObjective.trim() !== '' : true);

  if (!isMounted) return <div className="min-h-screen bg-[#F9FAFB]" />;

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-8 font-sans text-[#111827]">
      <style jsx global>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: invert(62%) sepia(82%) saturate(395%) hue-rotate(11deg) brightness(94%) contrast(91%);
        }
      `}</style>

      <div className="max-w-3xl mx-auto mb-8">
        <Link href="/brands/dashboard" className="flex items-center text-sm text-gray-400 hover:text-gray-600 mb-4 group w-fit">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Retour au dashboard</span>
        </Link>
        <h1 className="text-3xl font-serif font-bold mb-2">Créer une campagne</h1>
        <p className="text-gray-500 text-sm">Définissez les informations générales de votre campagne</p>

        {/* Guide accordéon */}
        <div className="mt-5 border border-[#D4A017]/30 rounded-2xl overflow-hidden bg-[#FFFBF0]">
          <button
            type="button"
            onClick={() => setGuideOpen(v => !v)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-[#B88A14] hover:bg-[#D4A017]/5 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Info size={15} />
              Comment ça marche ?
            </span>
            <ChevronDown size={15} className={`transition-transform duration-300 ${guideOpen ? 'rotate-180' : ''}`} />
          </button>

          {guideOpen && (
            <div className="px-5 pb-5 pt-1 border-t border-[#D4A017]/20">
              <p className="text-xs text-gray-500 mb-3">Suivez ces étapes pour créer votre campagne :</p>
              <ol className="space-y-2">
                {[
                  "Renseignez le nom, la description et les objectifs de votre campagne.",
                  "Définissez votre audience cible : pays, tranche d'âge, centres d'intérêt.",
                  "Précisez les plateformes (Instagram, TikTok…), les formats et le nombre de publications.",
                  "Définissez votre budget — un récapitulatif détaillé vous sera présenté.",
                  "Lancez le matching : Woutty sélectionne les créateurs les plus adaptés.",
                  "Choisissez vos créateurs et validez la campagne.",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-gray-600">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#D4A017] text-white flex items-center justify-center font-bold text-[10px]">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>

              <p className="mt-4 text-xs text-[#B88A14] bg-[#D4A017]/10 rounded-xl px-4 py-2.5">
                📩 Une fois validée, vous recevrez une notification. Vous aurez <strong>24h</strong> pour apporter des modifications.
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#B88A14] border border-gray-200 rounded-lg px-3 py-1.5 transition-colors">
                  <MessageCircle size={12} /> Chat IA
                </button>
                <button type="button" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#B88A14] border border-gray-200 rounded-lg px-3 py-1.5 transition-colors">
                  <Headphones size={12} /> Contacter l&apos;assistance
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stepper */}
      <div className="max-w-xl mx-auto mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-10 -translate-y-1/2" />
        <div className="flex justify-between items-center">
          {steps.map((s) => (
            <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
              s <= 1 ? "bg-[#D4A017] text-white ring-8 ring-[#D4A017]/10" : "bg-white border border-gray-100 text-gray-400 shadow-sm"
            }`}>
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm">
        <div className="space-y-8">

          {/* Titre */}
          <div>
            <label className="block text-[15px] font-bold text-gray-700 mb-3">Nom de la campagne *</label>
            <input
              className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/5 transition-all"
              placeholder="Ex: Lancement Collection Été 2025"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[15px] font-bold text-gray-700 mb-3 flex items-center gap-2">
              <FileText size={16} className="text-[#D4A017]" />
              Description de la campagne
            </label>
            <textarea
              rows={3}
              className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/5 transition-all resize-none text-sm"
              placeholder="Décrivez votre campagne : contexte, message clé, attentes vis-à-vis des créateurs..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Objectifs */}
          <div>
            <label className="block text-[15px] font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Target size={16} className="text-[#D4A017]" />
              Objectifs de la campagne *
            </label>
            <div className="space-y-2">
              {objectivesList.map(obj => {
                const isSelected = formData.objectives.includes(obj.value);
                return (
                  <button
                    key={obj.value}
                    type="button"
                    onClick={() => handleObjectiveChange(obj.value)}
                    className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-medium transition-all border ${
                      isSelected
                        ? "bg-[#D4A017] text-white border-[#D4A017] shadow-md"
                        : "bg-white text-gray-600 border-gray-100 hover:border-[#D4A017]/30 hover:bg-gray-50"
                    }`}
                  >
                    {obj.label}
                  </button>
                );
              })}
            </div>
            {formData.objectives.includes('Autre') && (
              <input
                className="w-full mt-3 px-5 py-3 rounded-xl border border-gray-200 outline-none italic text-sm focus:border-[#D4A017] transition-all"
                placeholder="Précisez votre objectif..."
                value={formData.customObjective}
                onChange={e => setFormData({ ...formData, customObjective: e.target.value })}
              />
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[15px] font-bold text-gray-700 mb-3">Date de début *</label>
              <input
                type="date"
                className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/5 transition-all text-gray-600"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[15px] font-bold text-gray-700 mb-3">Date de fin *</label>
              <input
                type="date"
                className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/5 transition-all text-gray-600"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => {
                if (isStep1Valid) {
                  setLoading(true);
                  router.push('/brands/auth/campagne2');
                }
              }}
              disabled={!isStep1Valid || loading}
              className={`flex items-center justify-center min-w-[160px] px-12 py-3.5 bg-[#D4A017] text-white rounded-xl font-bold text-sm transition-all shadow-lg ${
                !isStep1Valid ? "opacity-50 cursor-not-allowed" : "hover:bg-[#B88A14] shadow-[#D4A017]/20"
              }`}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Continuer'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
