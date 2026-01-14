"use client";

import React, { useState } from 'react';
import { Calendar, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateCampaign() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    objective: '',
    customObjective: '',
    startDate: '',
    endDate: ''
  });

  const steps = [1, 2, 3, 4];
  const objectivesList = ['Notoriété', 'Engagement', 'Autre','Ventes', 'Conversion'];

  // Validation : Titre rempli + Objectif 
  const isStep1Valid = 
    formData.title.trim() !== '' && 
    formData.objective !== '' && 
    (formData.objective === 'Autre' ? formData.customObjective.trim() !== '' : true);

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-8 font-sans text-[#111827]">
      {/* Header / Retour */}
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8">
        <Link href="/brands/dashboard" className="flex items-center text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4 group w-fit">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>retour au tableau de bord</span>
        </Link>
        <h1 className="text-3xl font-serif font-bold mb-2">Créer une campagne</h1>
        <p className="text-gray-500 text-sm">Définissez vos critères pour un matching IA optimal</p>
      </div>

      {/* Stepper Dynamique */}
      <div className="max-w-xl mx-auto mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-10 -translate-y-1/2"></div>
        <div className="flex justify-between items-center">
          {steps.map((s) => (
            <div
              key={s}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                s === 1 
                  ? "bg-[#D4A017] text-white ring-8 ring-[#D4A017]/10" 
                  : "bg-white border border-gray-100 text-gray-400 shadow-sm"
              }`}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* Card Principale */}
      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm min-h-[500px] transition-all">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-serif font-bold mb-8">Brief de campagne</h2>
          
          <form className="space-y-8">
            {/* Titre */}
            <div className="space-y-2">
              <label className="text-[15px] font-bold text-gray-700">
                Titre de la campagne <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Ex: Lancement campagne collection été 2026"
                className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/5 outline-none transition-all placeholder:text-gray-300 italic"
              />
            </div>

            {/* Objectifs */}
            <div className="space-y-4">
              <label className="text-[15px] font-bold text-gray-700">
                Objectifs <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                 
                {objectivesList.map((obj) => (
                  <label key={obj} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="objective"
                        checked={formData.objective === obj}
                        onChange={() => setFormData({...formData, objective: obj})}
                        className="peer appearance-none w-5 h-5 rounded-full border border-gray-300 checked:border-[#D4A017] transition-all"
                      />
                      <div className="absolute w-2.5 h-2.5 rounded-full bg-[#D4A017] opacity-0 peer-checked:opacity-100 transition-all"></div>
                    </div>
                    <span className="text-[15px] text-gray-600 font-medium">{obj}</span>
                  </label>
                ))}
              </div>

              {/* Champ "Autre" dynamique */}
              {formData.objective === 'Autre' && (
                <div className="animate-in zoom-in-95 duration-300 pt-2">
                  <input
                    type="text"
                    value={formData.customObjective}
                    onChange={(e) => setFormData({...formData, customObjective: e.target.value})}
                    placeholder="Précisez votre objectif..."
                    className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-[#D4A017] outline-none transition-all text-sm bg-gray-50/50"
                  />
                </div>
              )}
            </div>

            {/* Dates avec icônes à droite */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[15px] font-bold text-gray-700">Date début</label>
                <div className="relative group">
                  <input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-5 py-4 pr-12 rounded-xl border border-gray-200 focus:border-[#D4A017] outline-none text-gray-700 transition-all cursor-pointer"
                  />
                  <div 
                    onClick={() => (document.getElementById('startDate') as any).showPicker()}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4A017] cursor-pointer transition-colors"
                  >
                    <Calendar size={20} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[15px] font-bold text-gray-700">Date fin</label>
                <div className="relative group">
                  <input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-5 py-4 pr-12 rounded-xl border border-gray-200 focus:border-[#D4A017] outline-none text-gray-700 transition-all cursor-pointer"
                  />
                  <div 
                    onClick={() => (document.getElementById('endDate') as any).showPicker()}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#D4A017] cursor-pointer transition-colors"
                  >
                    <Calendar size={20} />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Bouton Suivant (Lien) */}
        <div className="flex justify-end pt-12">
          <Link
            href={isStep1Valid ? "/brands/auth/campagne2" : "#"}
            onClick={(e) => {
              if (!isStep1Valid || loading) {
                e.preventDefault();
              } else {
                setLoading(true);
              }
            }}
            className={`
              flex items-center justify-center min-w-[160px] px-12 py-3.5 rounded-xl font-bold transition-all shadow-lg
              ${isStep1Valid && !loading
                ? "bg-[#D4A017] text-white shadow-[#D4A017]/20 hover:bg-[#B88A14] cursor-pointer" 
                : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none pointer-events-none"}
            `}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "continnuer"}
          </Link>
        </div>
      </div>
    </main>
  );
}