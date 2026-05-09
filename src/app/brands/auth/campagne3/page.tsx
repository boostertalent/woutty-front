"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, AlertCircle, Plus, Trash2, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const steps = [1, 2, 3, 4];

const NETWORKS: Record<string, { label: string; formats: string[] }> = {
  Instagram: { label: 'Instagram', formats: ['Post image', 'Reels', 'Story', 'Carrousel'] },
  TikTok:    { label: 'TikTok',    formats: ['Vidéo courte', 'Live'] },
  YouTube:   { label: 'YouTube',   formats: ['Vidéo longue', 'Short', 'Live'] },
  Facebook:  { label: 'Facebook',  formats: ['Post image', 'Vidéo', 'Story', 'Reels'] },
  X:         { label: 'X (Twitter)', formats: ['Tweet', 'Vidéo', 'Thread'] },
  Snapchat:  { label: 'Snapchat',  formats: ['Snap', 'Story'] },
};

const FORMAT_PRICES: Record<string, Record<string, number>> = {
  Instagram: { 'Post image': 15000, 'Reels': 25000, 'Story': 8000, 'Carrousel': 20000 },
  TikTok:    { 'Vidéo courte': 20000, 'Live': 35000 },
  YouTube:   { 'Vidéo longue': 60000, 'Short': 25000, 'Live': 45000 },
  Facebook:  { 'Post image': 10000, 'Vidéo': 18000, 'Story': 6000, 'Reels': 15000 },
  X:         { 'Tweet': 8000, 'Vidéo': 15000, 'Thread': 10000 },
  Snapchat:  { 'Snap': 8000, 'Story': 10000 },
};

function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' FCFA';
}

interface FormatEntry {
  name: string;
  nbPublications: number;
}

interface NetworkEntry {
  network: string;
  formats: FormatEntry[];
}

function getEntryEstimate(entry: NetworkEntry): number {
  if (!entry.network || entry.formats.length === 0) return 0;
  const prices = FORMAT_PRICES[entry.network] || {};
  return entry.formats.reduce((sum, f) => sum + (prices[f.name] || 0) * f.nbPublications, 0);
}

function getEntryTotalPubs(entry: NetworkEntry): number {
  return entry.formats.reduce((sum, f) => sum + f.nbPublications, 0);
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
          // Migration ancienne structure (formats: string[]) → nouvelle
          const migrated = data.entries.map((e: any) => ({
            network: e.network || '',
            formats: Array.isArray(e.formats)
              ? e.formats.map((f: any) =>
                  typeof f === 'string'
                    ? { name: f, nbPublications: e.nbPublications || 1 }
                    : f
                )
              : [],
          }));
          setEntries(migrated);
        } else {
          setEntries([{ network: '', formats: [] }]);
        }
      } catch (e) {
        console.error("Erreur localStorage", e);
        setEntries([{ network: '', formats: [] }]);
      }
    } else {
      setEntries([{ network: '', formats: [] }]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const estimatedCost = entries.reduce((sum, e) => sum + getEntryEstimate(e), 0);
      localStorage.setItem('campaign_step_3', JSON.stringify({ entries, estimatedCost }));
    }
  }, [entries, isLoaded]);

  const addNetwork = () => setEntries(prev => [...prev, { network: '', formats: [] }]);

  const removeNetwork = (index: number) => setEntries(prev => prev.filter((_, i) => i !== index));

  const updateNetwork = (index: number, network: string) => {
    setEntries(prev => prev.map((e, i) => i === index ? { ...e, network, formats: [] } : e));
    setShowError(false);
  };

  const toggleFormat = (entryIndex: number, formatName: string) => {
    setEntries(prev => prev.map((e, i) => {
      if (i !== entryIndex) return e;
      const exists = e.formats.find(f => f.name === formatName);
      const formats = exists
        ? e.formats.filter(f => f.name !== formatName)
        : [...e.formats, { name: formatName, nbPublications: 1 }];
      return { ...e, formats };
    }));
    setShowError(false);
  };

  const updateFormatNbPubs = (entryIndex: number, formatName: string, value: number) => {
    const n = Math.max(1, Math.min(20, value));
    setEntries(prev => prev.map((e, i) => {
      if (i !== entryIndex) return e;
      return { ...e, formats: e.formats.map(f => f.name === formatName ? { ...f, nbPublications: n } : f) };
    }));
  };

  const usedNetworks = entries.map(e => e.network).filter(Boolean);
  const isFormValid = () => entries.length > 0 && entries.every(e => e.network !== '' && e.formats.length > 0);

  const handleContinue = () => {
    if (isFormValid()) {
      router.push('/brands/auth/campagne4');
    } else {
      setShowError(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const totalPublications = entries.reduce((sum, e) => sum + getEntryTotalPubs(e), 0);
  const totalEstimatedCost = entries.reduce((sum, e) => sum + getEntryEstimate(e), 0);

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
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">Veuillez choisir un réseau et au moins un format pour chaque bloc.</p>
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
            {entries.map((entry, entryIndex) => {
              const entryEstimate = getEntryEstimate(entry);
              const entryPubs = getEntryTotalPubs(entry);
              return (
                <div key={entryIndex} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-5">

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-gray-400 tracking-widest">Réseau {entryIndex + 1}</span>
                    {entries.length > 1 && (
                      <button type="button" onClick={() => removeNetwork(entryIndex)} className="text-gray-400 hover:text-red-500 transition-colors">
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
                          onClick={() => updateNetwork(entryIndex, net)}
                          className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all border ${
                            isSelected ? "bg-[#D4A017] text-white border-[#D4A017] shadow-md"
                              : isUsedElsewhere ? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed"
                              : "bg-white text-gray-600 border-gray-200 hover:border-[#D4A017]/40"
                          }`}
                        >
                          {NETWORKS[net].label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Formats avec compteur par format */}
                  {entry.network && (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Formats de contenu *</p>
                      <div className="space-y-2">
                        {NETWORKS[entry.network].formats.map(fmt => {
                          const formatEntry = entry.formats.find(f => f.name === fmt);
                          const isSelected = !!formatEntry;
                          const price = FORMAT_PRICES[entry.network]?.[fmt];
                          return (
                            <div
                              key={fmt}
                              className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                                isSelected ? "bg-[#111827] border-[#111827]" : "bg-white border-gray-200"
                              }`}
                            >
                              {/* Nom + tarif (cliquable pour toggle) */}
                              <button
                                type="button"
                                onClick={() => toggleFormat(entryIndex, fmt)}
                                className="flex flex-col items-start flex-1 text-left"
                              >
                                <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>{fmt}</span>
                                {price && (
                                  <span className={`text-[10px] font-bold mt-0.5 ${isSelected ? 'text-[#D4A017]' : 'text-gray-400'}`}>
                                    {formatFCFA(price)} / pub
                                  </span>
                                )}
                              </button>

                              {/* Compteur (visible si sélectionné) */}
                              {isSelected && formatEntry && (
                                <div className="flex items-center gap-2 ml-4">
                                  <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); updateFormatNbPubs(entryIndex, fmt, formatEntry.nbPublications - 1); }}
                                    className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all font-bold"
                                  >−</button>
                                  <span className="w-6 text-center font-black text-[#D4A017]">{formatEntry.nbPublications}</span>
                                  <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); updateFormatNbPubs(entryIndex, fmt, formatEntry.nbPublications + 1); }}
                                    className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all font-bold"
                                  >+</button>
                                  {price && (
                                    <span className="ml-2 text-xs font-bold text-[#D4A017] w-24 text-right">
                                      {formatFCFA(price * formatEntry.nbPublications)}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Sous-total réseau */}
                  {entryPubs > 0 && entryEstimate > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {entryPubs} pub{entryPubs > 1 ? 's' : ''} — {NETWORKS[entry.network]?.label}
                      </span>
                      <span className="text-sm font-black text-[#111827]">{formatFCFA(entryEstimate)}</span>
                    </div>
                  )}
                </div>
              );
            })}

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

          {/* Récapitulatif global */}
          {totalPublications > 0 && (
            <div className="mt-8 rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <Info size={14} className="text-gray-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Récapitulatif</span>
              </div>
              <div className="divide-y divide-gray-50">
                {entries.filter(e => e.network && e.formats.length > 0).flatMap((e, i) =>
                  e.formats.map((f, j) => (
                    <div key={`${i}-${j}`} className="flex items-center justify-between px-6 py-3">
                      <div>
                        <span className="text-sm font-bold text-gray-700">{NETWORKS[e.network]?.label}</span>
                        <span className="text-xs text-gray-400 ml-2">{f.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-500">{f.nbPublications} pub{f.nbPublications > 1 ? 's' : ''}</span>
                        {FORMAT_PRICES[e.network]?.[f.name] && (
                          <p className="text-xs text-gray-400">{formatFCFA(FORMAT_PRICES[e.network][f.name] * f.nbPublications)}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div className="flex items-center justify-between px-6 py-4 bg-[#D4A017]/5">
                  <span className="text-sm font-black text-[#D4A017]">Total — {totalPublications} publication{totalPublications > 1 ? 's' : ''}</span>
                  {totalEstimatedCost > 0 && (
                    <span className="text-sm font-black text-[#D4A017]">{formatFCFA(totalEstimatedCost)}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {totalEstimatedCost > 0 && (
            <p className="mt-3 text-xs text-gray-400 text-center">
              * Tarifs indicatifs basés sur les prix moyens du marché — le coût réel dépend du profil des créateurs sélectionnés.
            </p>
          )}

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
