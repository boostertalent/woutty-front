"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronDown, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Step3() {
  const router = useRouter();
  const steps = [1, 2, 3, 4];
  
  const [nbPublications, setNbPublications] = useState<number | "">(1);
  const [formats, setFormats] = useState<string[]>([""]);
  const [ton, setTon] = useState<string>("");
  const [customTon, setCustomTon] = useState<string>(""); // État pour le ton personnalisé
  const [showError, setShowError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const tones = ["Professionnel", "Amical / Décontracté", "Humoristique", "Inspirant", "Informatif", "Autre"];
  const contentFormats = ["Post Image", "Vidéo courte (Reel/TikTok)", "Story", "Carrousel", "Vidéo longue"];

  useEffect(() => {
    const saved = localStorage.getItem('campaign_step_3');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setNbPublications(data.nbPublications ?? 1);
        setFormats(data.formats ?? [""]);
        setTon(data.ton ?? "");
        setCustomTon(data.customTon ?? "");
      } catch (e) {
        console.error("Erreur localStorage", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const dataToSave = { nbPublications, formats, ton, customTon };
      localStorage.setItem('campaign_step_3', JSON.stringify(dataToSave));
    }
  }, [nbPublications, formats, ton, customTon, isLoaded]);

  const handleFormatChange = (index: number, value: string) => {
    const updated = [...formats];
    updated[index] = value;
    setFormats(updated);
    setShowError(false);
  };

  const handleNbPublicationsChange = (value: number | "") => {
    const n = value === "" ? "" : Math.min(Math.max(Number(value), 0), 10);
    setNbPublications(n);
    
    if (n !== "") {
      setFormats(prev => {
        if (n > prev.length) {
          return [...prev, ...Array(n - prev.length).fill("")];
        } else {
          return prev.slice(0, n);
        }
      });
    }
  };

  const isFormValid = () => {
    const n = Number(nbPublications);
    const hasNbPubs = n > 0;
    const allFormatsSelected = formats.length === n && formats.every(f => f !== "");
    const hasTon = ton !== "" && (ton !== "Autre" || customTon.trim() !== "");
    
    return hasNbPubs && allFormatsSelected && hasTon;
  };

  const handleContinue = () => {
    if (isFormValid()) {
      router.push('/brands/auth/campagne4');
    } else {
      setShowError(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-8 font-sans text-[#111827]">
      <div className="max-w-3xl mx-auto mb-8">
        <Link href="/brands/auth/campagne2" className="flex items-center text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4 group w-fit">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Étape précédente</span>
        </Link>
        <h1 className="text-3xl font-serif font-bold mb-2">Créer une campagne</h1>
        <p className="text-gray-500 text-sm">Définissez vos critères pour un matching IA optimal</p>
      </div>

      <div className="max-w-xl mx-auto mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-10 -translate-y-1/2"></div>
        <div className="flex justify-between items-center">
          {steps.map((s) => (
            <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${s <= 3 ? "bg-[#D4A017] text-white ring-8 ring-[#D4A017]/10" : "bg-white border border-gray-100 text-gray-400 shadow-sm"}`}>
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm min-h-[500px]">
        {showError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-4">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">Veuillez configurer tous les paramètres de contenu (*)</p>
          </div>
        )}

        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <h2 className="text-2xl font-serif font-bold mb-8">Type de contenu</h2>
          
          <div className="space-y-10">
            {/* Nombre de publications */}
            <div className="space-y-2">
              <label className="block text-[15px] font-bold text-gray-700">Nombre de publications *</label>
              <input
                type="number"
                min="1"
                max="10"
                value={nbPublications}
                onChange={(e) => handleNbPublicationsChange(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-[#D4A017] outline-none transition-all"
                placeholder="Ex: 3"
              />
            </div>

            {/* Formats par publication */}
            <div className="space-y-4">
              <label className="block text-[15px] font-bold text-gray-700">Format par publication *</label>
              <div className="space-y-3">
                {formats.map((format, index) => (
                  <div key={index} className="flex items-center gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                    <span className="text-sm text-gray-400 min-w-[100px]">Publication {index + 1}</span>
                    <div className="relative flex-1">
                      <select
                        value={format}
                        onChange={(e) => handleFormatChange(index, e.target.value)}
                        className="w-full appearance-none px-5 py-3 rounded-xl border border-gray-100 text-gray-700 outline-none bg-[#F9FAFB] focus:border-[#D4A017] transition-all cursor-pointer text-sm"
                      >
                        <option value="">Choisir un format</option>
                        {contentFormats.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ton de la campagne */}
            <div className="space-y-4">
              <label className="block text-[15px] font-bold text-gray-700">Ton de la campagne *</label>
              <div className="relative">
                <select
                  value={ton}
                  onChange={(e) => { setTon(e.target.value); setShowError(false); }}
                  className={`w-full appearance-none px-5 py-4 rounded-xl border outline-none bg-white transition-all cursor-pointer ${showError && ton === "" ? "border-red-300 ring-4 ring-red-50" : "border-gray-200 focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/5"}`}
                >
                  <option value="">Choisissez un ton</option>
                  {tones.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>

              {ton === "Autre" && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <input
                    type="text"
                    value={customTon}
                    onChange={(e) => { setCustomTon(e.target.value); setShowError(false); }}
                    placeholder="Précisez le ton souhaité (ex: Rebelle, Luxueux, Éducatif...)"
                    className={`w-full px-5 py-3 rounded-xl border outline-none transition-all text-sm bg-gray-50/50 italic ${showError && customTon === "" ? "border-red-300" : "border-gray-200 focus:border-[#D4A017]"}`}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-12">
            <Link href="/brands/auth/campagne2" className="px-8 py-3.5 bg-[#111827] text-white rounded-xl font-bold text-sm">
              Retour
            </Link>
            <button 
              onClick={handleContinue}
              className="px-12 py-3.5 bg-[#D4A017] text-white rounded-xl font-bold text-sm hover:bg-[#B88A14] transition-all shadow-lg"
            >
              Continuer
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}