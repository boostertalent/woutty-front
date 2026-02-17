"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, ChevronLeft, Target } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateCampaign() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    objectives: [] as string[],
    customObjective: '',
    startDate: '',
    endDate: ''
  });

  const objectivesList = ['Notoriété', 'Engagement', 'Conversion', 'Ventes', 'Autre'];

  useEffect(() => {
    const saved = localStorage.getItem('campaign_step_1');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setFormData({
          title: data.title || '',
          objectives: data.objectives || [],
          customObjective: data.customObjective || '',
          startDate: data.startDate || '',
          endDate: data.endDate || ''
        });
      } catch (error) {
        console.error('Error parsing saved data:', error);
      }
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && (formData.title || formData.objectives.length > 0)) {
      localStorage.setItem('campaign_step_1', JSON.stringify(formData));
    }
  }, [formData, isMounted]);

  const handleObjectiveChange = (obj: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.includes(obj)
        ? prev.objectives.filter(i => i !== obj)
        : [...prev.objectives, obj]
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
      {/* CSS Injecté pour colorer l'icône native du calendrier */}
      <style jsx global>{`
        input[type="date"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: invert(62%) sepia(82%) saturate(395%) hue-rotate(11deg) brightness(94%) contrast(91%);
          /* Ce filtre transforme le noir par défaut en la couleur #D4A017 */
        }
      `}</style>

      <div className="max-w-3xl mx-auto mb-8">
        <Link href="/brands/dashboard" className="flex items-center text-sm text-gray-400 hover:text-gray-600 mb-4 group w-fit">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Retour au dashboard</span>
        </Link>
        <h1 className="text-3xl font-serif font-bold mb-2">Créer une campagne</h1>
        
      </div>

      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm">
        <div className="space-y-8">
          {/* Champ Titre */}
          <div>
            <label className="block text-[15px] font-bold text-gray-700 mb-3">Nom de la campagne *</label>
            <input
              className="w-full px-5 py-4 rounded-xl border border-gray-200 outline-none focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/5 transition-all"
              placeholder="Ex: Lancement Collection Été 2024"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Objectifs */}
          <div>
            <label className="block text-[15px] font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Target size={18} className="text-[#D4A017]" />
              Objectifs de la campagne *
            </label>
            <div className="flex flex-wrap gap-3">
              {objectivesList.map(obj => {
                const isSelected = formData.objectives.includes(obj);
                return (
                  <button
                    key={obj}
                    type="button"
                    onClick={() => handleObjectiveChange(obj)}
                    className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition-all border ${
                      isSelected 
                        ? "bg-[#D4A017] text-white border-[#D4A017] shadow-md" 
                        : "bg-white text-gray-600 border-gray-100 hover:border-[#D4A017]/30"
                    }`}
                  >
                    {obj}
                  </button>
                );
              })}
            </div>
            {formData.objectives.includes('Autre') && (
              <input
                className="w-full mt-4 px-5 py-3 rounded-xl border border-gray-200 outline-none italic text-sm"
                placeholder="Précisez votre objectif..."
                value={formData.customObjective}
                onChange={e => setFormData({...formData, customObjective: e.target.value})}
              />
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[15px] font-bold text-gray-700 mb-3">Date de début</label>
              <input
                type="date"
                className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/5 transition-all text-gray-600"
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[15px] font-bold text-gray-700 mb-3">Date de fin</label>
              <input
                type="date"
                className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/5 transition-all text-gray-600"
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>

          <div className="flex justify-end pt-8">
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