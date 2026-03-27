"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, AlertCircle, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const steps = [1, 2, 3, 4];

// Réseaux disponibles avec leurs formats
const NETWORKS: Record<string, { label: string; formats: string[] }> = {
  Instagram: {
    label: 'Instagram',
    formats: ['Post image', 'Reels', 'Story', 'Carrousel'],
  },
  TikTok: {
    label: 'TikTok',
    formats: ['Vidéo courte', 'Live'],
  },
  YouTube: {
    label: 'YouTube',
    formats: ['Vidéo longue', 'Short', 'Live'],
  },
  Facebook: {
    label: 'Facebook',
    formats: ['Post image', 'Vidéo', 'Story', 'Reels'],
  },
  X: {
    label: 'X (Twitter)',
    formats: ['Tweet', 'Vidéo', 'Thread'],
  },
  Snapchat: {
    label: 'Snapchat',
    formats: ['Snap', 'Story'],
  },
};

interface NetworkEntry {
  network: string;
  formats: string[];
  nbPublications: number;
}

export default function Step3() {
  const router = useRouter();

  const [entries, setEntries] = useState<NetworkEntry[]>([]);
  const [showError, setShowError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('campaign_step_3');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (Array.isArray(data.entries) && data.entries.length > 0) {
          setEntries(data.entries);
        } else {
          setEntries([{ network: '', formats: [], nbPublications: 1 }]);
        }
      } catch (e) {
        console.error("Erreur localStorage", e);
        setEntries([{ network: '', formats: [], nbPublications: 1 }]);
      }
    } else {
      setEntries([{ network: '', formats: [], nbPublications: 1 }]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('campaign_step_3', JSON.stringify({ entries }));
    }
  }, [entries, isLoaded]);

  const addNetwork = () => {
    setEntries(prev => [...prev, { network: '', formats: [], nbPublications: 1 }]);
  };

  const removeNetwork = (index: number) => {
    setEntries(prev => prev.filter((_, i) => i !== index));
  };

  const updateNetwork = (index: number, network: string) => {
    setEntries(prev => prev.map((e, i) =>
      i === index ? { ...e, network, formats: [] } : e
    ));
    setShowError(false);
  };

  const toggleFormat = (index: number, format: string) => {
    setEntries(prev => prev.map((e, i) => {
      if (i !== index) return e;
      const formats = e.formats.includes(format)
        ? e.formats.filter(f => f !== format)
        : [...e.formats, format];
      return { ...e, formats };
    }));
    setShowError(false);
  };

  const updateNbPubs = (index: number, value: number) => {
    const n = Math.max(1, Math.min(20, value));
    setEntries(prev => prev.map((e, i) => i === index ? { ...e, nbPublications: n } : e));
  };

  const usedNetworks = entries.map(e => e.network).filter(Boolean);

  const isFormValid = () =>
    entries.length > 0 &&
    entries.every(e => e.network !== '' && e.formats.length > 0 && e.nbPublications >= 1);

  const handleContinue = () => {
    if (isFormValid()) {
      router.push('/brands/auth/campagne4');
    } else {
      setShowError(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalPublications = entries.reduce((sum, e) => sum + e.nbPublications, 0);

  if (!isLoaded) return null;

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-8 font-sans text-[#111827]">
      <div className="max-w-3xl mx-auto mb-8">
        <Link href="/brands/auth/campagne2" className="flex items-center text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4 group w-fit">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Étape précédente</span>
        </Link>
        <h1 className="text-3xl font-serif font-bold mb-2">Créer une campagne</h1>
        <p className="text-gray-500 text-sm">Choisissez les réseaux et types de contenu souhaités</p>
      </div>

      {/* Stepper */}
      <div className="max-w-xl mx-auto mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-10 -translate-y-1/2" />
        <div className="flex justify-between items-center">
          {steps.map((s) => (
            <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
              s <= 3 ? "bg-[#D4A017] text-white ring-8 ring-[#D4A017]/10" : "bg-white border border-gray-100 text-gray-400 shadow-sm"
            }`}>
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm min-h-[500px]">
        {showError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-4">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">Veuillez configurer chaque réseau : choisir au moins un format et indiquer le nombre de publications.</p>
          </div>
        )}

        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif font-bold">Contenu de la campagne</h2>
            {totalPublications > 0 && (
              <span className="px-4 py-1.5 bg-[#D4A017]/10 text-[#D4A017] text-sm font-bold rounded-full">
                {totalPublications} publication{totalPublications > 1 ? 's' : ''} au total
              </span>
            )}
          </div>

          <div className="space-y-6">
            {entries.map((entry, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">

                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-gray-400 tracking-widest">Réseau {index + 1}</span>
                  {entries.length > 1 && (
                    <button onClick={() => removeNetwork(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Choix du réseau */}
                <div className="flex flex-wrap gap-2">
                  {Object.keys(NETWORKS).map(net => {
                    const isSelected = entry.network === net;
                    const isUsedElsewhere = usedNetworks.includes(net) && !isSelected;
                    return (
                      <button
                        key={net}
                        type="button"
                        disabled={isUsedElsewhere}
                        onClick={() => updateNetwork(index, net)}
                        className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all border ${
                          isSelected
                            ? "bg-[#D4A017] text-white border-[#D4A017] shadow-md"
                            : isUsedElsewhere
                              ? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed"
                              : "bg-white text-gray-600 border-gray-200 hover:border-[#D4A017]/40"
                        }`}
                      >
                        {NETWORKS[net].label}
                      </button>
                    );
                  })}
                </div>

                {/* Formats */}
                {entry.network && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Formats de contenu *</p>
                    <div className="flex flex-wrap gap-2">
                      {NETWORKS[entry.network].formats.map(fmt => {
                        const isSelected = entry.formats.includes(fmt);
                        return (
                          <button
                            key={fmt}
                            type="button"
                            onClick={() => toggleFormat(index, fmt)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                              isSelected
                                ? "bg-[#111827] text-white border-[#111827]"
                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                            }`}
                          >
                            {fmt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Nombre de publications */}
                {entry.network && (
                  <div className="flex items-center gap-4 animate-in fade-in duration-200">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">Nombre de publications *</p>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updateNbPubs(index, entry.nbPublications - 1)}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#D4A017] hover:text-[#D4A017] transition-all font-bold"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-black text-lg text-[#D4A017]">{entry.nbPublications}</span>
                      <button
                        type="button"
                        onClick={() => updateNbPubs(index, entry.nbPublications + 1)}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#D4A017] hover:text-[#D4A017] transition-all font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Ajouter un réseau */}
            {entries.length < Object.keys(NETWORKS).length && (
              <button
                type="button"
                onClick={addNetwork}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-[#D4A017] hover:text-[#D4A017] transition-all flex items-center justify-center gap-2 font-medium text-sm"
              >
                <Plus size={18} />
                Ajouter un autre réseau social
              </button>
            )}
          </div>

          <div className="flex justify-between items-center pt-10">
            <Link href="/brands/auth/campagne2" className="px-8 py-3.5 bg-[#111827] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg">
              Retour
            </Link>
            <button
              onClick={handleContinue}
              className="flex items-center justify-center min-w-[160px] px-12 py-3.5 bg-[#D4A017] text-white rounded-xl font-bold text-sm hover:bg-[#B88A14] transition-all shadow-lg shadow-[#D4A017]/20"
            >
              Continuer
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
