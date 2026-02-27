"use client";

import React, { useState, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation'; 
import Link from 'next/link';
import { Sparkles, X, Plus, ChevronRight } from 'lucide-react';

const MAIN_NICHES = [
  "Mode", "Beauté", "Lifestyle",
  "Tech", "Food", "Sport",
  "Voyage", "Gaming", "Musique",
  "Art", "Business", "Éducation"
];

export default function NicheSelection() {
  const router = useRouter(); // Initialisé
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");

  const toggleNiche = (niche: string) => {
    setSelectedNiches(prev => 
      prev.includes(niche) ? prev.filter(n => n !== niche) : [...prev, niche]
    );
  };

  const addCustomNiche = () => {
    const trimmedValue = customInput.trim();
    if (trimmedValue && !selectedNiches.includes(trimmedValue)) {
      setSelectedNiches([...selectedNiches, trimmedValue]);
      setCustomInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomNiche();
    }
  };

  const removeNiche = (nicheToRemove: string) => {
    setSelectedNiches(selectedNiches.filter(n => n !== nicheToRemove));
  };

  // --- FONCTION DE SAUVEGARDE ET NAVIGATION ---
  const handleContinue = (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (selectedNiches.length > 0) {
      // Sauvegarde propre en JSON
      localStorage.setItem('signup_niche', JSON.stringify(selectedNiches));
      router.push("/creators/auth/formulaire/etape3");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      
      <div className="bg-white border border-gray-200 rounded-[40px] p-8 md:p-12 w-full max-w-3xl shadow-sm">
        
        <h2 className="text-3xl font-bold text-center mb-8 font-sans">Tes thèmes</h2>

        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-[#ceaf4a]/10 rounded-full flex items-center justify-center animate-pulse">
            <Sparkles size={40} className="text-[#ceaf4a]" strokeWidth={1.5} />
          </div>
        </div>

        <p className="text-center text-gray-600 mb-8 font-medium">
          Sélectionnez vos thématiques
        </p>

        {/* Grille des thématiques */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {MAIN_NICHES.map((niche) => (
            <button
              key={niche}
              onClick={() => toggleNiche(niche)}
              type="button"
              className={`py-4 px-6 rounded-full border-2 transition-all font-semibold active:scale-95 ${
                selectedNiches.includes(niche)
                  ? "border-[#ceaf4a] bg-[#ceaf4a] text-white shadow-md shadow-[#ceaf4a]/20"
                  : "border-gray-200 text-gray-700 hover:border-gray-400 bg-white"
              }`}
            >
              {niche}
            </button>
          ))}
        </div>

        {/* Saisie libre */}
        <div className="max-w-md mx-auto mb-6">
          <label className="block text-sm font-bold mb-2 ml-1 text-gray-700 uppercase tracking-wide">Autre thématique</label>
          <div className="relative flex items-center">
            <input 
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: Jardinage, Yoga..."
              className="w-full px-6 py-4 rounded-full border-2 border-gray-200 focus:border-[#ceaf4a] outline-none bg-white transition-all pr-14 shadow-sm"
            />
            {customInput.trim() && (
               <button 
                onClick={addCustomNiche}
                className="absolute right-4 p-2 bg-[#ceaf4a] text-white rounded-full hover:bg-[#b8962f] transition-colors"
               >
                 <Plus size={18} />
               </button>
            )}
          </div>
        </div>

        {/* Tags affichés */}
        <div className="flex flex-wrap justify-center gap-2 mb-10 min-h-[40px]">
          {selectedNiches.map((niche) => (
            <span 
              key={niche} 
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                MAIN_NICHES.includes(niche) 
                  ? "bg-[#ceaf4a]/10 border-[#ceaf4a]/20 text-[#ceaf4a]" 
                  : "bg-gray-100 border-gray-200 text-gray-800"
              }`}
            >
              {niche}
              <button 
                onClick={() => removeNiche(niche)} 
                className="hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>

        <div className="text-center text-sm text-gray-400 mb-8 font-bold uppercase tracking-widest">
          {selectedNiches.length} thématique(s) sélectionnée(s)
        </div>

        {/* Barre d'action */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-100">
          <Link 
            href="/creators/auth/formulaire/etape1" 
            className="text-gray-500 font-bold hover:text-black transition-colors"
          >
            Retour
          </Link>
          
          <button 
            onClick={handleContinue} 
            disabled={selectedNiches.length === 0}
            className={`px-10 py-4 rounded-2xl font-bold transition-all shadow-md flex items-center gap-2 active:scale-95 ${
              selectedNiches.length > 0 
                ? "bg-[#ceaf4a] text-white shadow-[#ceaf4a]/30" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Continuer
            <ChevronRight size={18} />
          </button>
        </div>

      </div>
    </main>
  );
}