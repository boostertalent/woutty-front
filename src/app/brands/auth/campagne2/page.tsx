"use client";

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, AlertCircle, Shirt, Monitor, Heart, Utensils, Trophy, Sparkles, Plane, Plus, X, ChevronDown, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const steps = [1, 2, 3, 4];

const interestsConfig = [
  { name: "Mode",    icon: Shirt },
  { name: "Tech",    icon: Monitor },
  { name: "Lifestyle", icon: Heart },
  { name: "Food",    icon: Utensils },
  { name: "Sport",   icon: Trophy },
  { name: "Beauté",  icon: Sparkles },
  { name: "Voyage",  icon: Plane },
  { name: "Autre",   icon: Plus },
];

const countriesList = [
  "Bénin", "Burkina Faso", "Cameroun", "Congo-Brazzaville", "Congo-Kinshasa",
  "Côte d'Ivoire", "Gabon", "Guinée", "Mali", "Mauritanie", "Niger",
  "Nigeria", "Sénégal", "Tchad", "Togo",
  "Afrique du Sud", "Algérie", "Maroc", "Tunisie",
  "France", "Belgique", "Suisse", "Canada",
  "États-Unis", "Brésil", "Allemagne", "Espagne", "Italie",
  "Arabie Saoudite", "Chine", "Australie", "Autre",
];

export default function Step2() {
  const router = useRouter();

  const [ageRange, setAgeRange]                 = useState({ min: 13, max: 80 });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest]     = useState("");
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [customCountry, setCustomCountry]       = useState("");
  const [showError, setShowError]               = useState(false);
  const [countrySearch, setCountrySearch]       = useState("");
  const [dropdownOpen, setDropdownOpen]         = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('campaign_step_2');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.ageRange)          setAgeRange(data.ageRange);
        if (data.selectedInterests) setSelectedInterests(data.selectedInterests);
        if (data.customInterest)    setCustomInterest(data.customInterest);
        if (data.selectedCountries) setSelectedCountries(data.selectedCountries);
        else if (data.selectedCountry) setSelectedCountries([data.selectedCountry]);
        if (data.customCountry)     setCustomCountry(data.customCountry);
      } catch (e) {
        console.error("Erreur localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedInterests.length > 0 || selectedCountries.length > 0) {
      localStorage.setItem('campaign_step_2', JSON.stringify({
        ageRange, selectedInterests, customInterest, selectedCountries, customCountry
      }));
    }
  }, [ageRange, selectedInterests, customInterest, selectedCountries, customCountry]);

  // Fermer dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = countriesList.filter(c =>
    c.toLowerCase().includes(countrySearch.toLowerCase()) &&
    !selectedCountries.includes(c)
  );

  const selectCountry = (country: string) => {
    setSelectedCountries(prev => [...prev, country]);
    setCountrySearch('');
    setDropdownOpen(false);
    setShowError(false);
  };

  const removeCountry = (country: string) => {
    setSelectedCountries(prev => prev.filter(c => c !== country));
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const isFormValid = () => {
    const hasCountry = selectedCountries.length > 0 &&
      (!selectedCountries.includes("Autre") || customCountry.trim() !== "");
    const hasInterests = selectedInterests.length > 0 &&
      (!selectedInterests.includes("Autre") || customInterest.trim() !== "");
    return hasCountry && hasInterests;
  };

  const handleContinue = () => {
    if (isFormValid()) {
      setShowError(false);
      router.push('/brands/auth/campagne3');
    } else {
      setShowError(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getSelectionStyle = () => {
    const minPercent = ((ageRange.min - 13) / (80 - 13)) * 100;
    const maxPercent = ((ageRange.max - 13) / (80 - 13)) * 100;
    return { left: `${minPercent}%`, width: `${maxPercent - minPercent}%` };
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] p-8 font-sans text-[#111827]">
      <div className="max-w-3xl mx-auto mb-8">
        <Link href="/brands/auth/campagne" className="flex items-center text-sm text-gray-400 hover:text-gray-600 transition-colors mb-4 group w-fit">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Étape précédente</span>
        </Link>
        <h1 className="text-3xl font-serif font-bold mb-2">Créer une campagne</h1>
        <p className="text-gray-500 text-sm">Définissez votre audience cible</p>
      </div>

      {/* Stepper */}
      <div className="max-w-xl mx-auto mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-10 -translate-y-1/2" />
        <div className="flex justify-between items-center">
          {steps.map((s) => (
            <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
              s <= 2 ? "bg-[#D4A017] text-white ring-8 ring-[#D4A017]/10" : "bg-white border border-gray-100 text-gray-400 shadow-sm"
            }`}>
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-white border border-gray-100 rounded-[32px] p-10 shadow-sm min-h-[500px] relative">
        {showError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-4">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">Veuillez remplir tous les champs obligatoires (*)</p>
          </div>
        )}

        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <h2 className="text-2xl font-serif font-bold mb-8">Audience cible</h2>

          <div className="space-y-12">

            {/* Tranche d'âge */}
            <div>
              <label className="block text-[15px] font-bold text-gray-700 mb-6">
                Tranche d&apos;âge : <span className="text-[#D4A017] font-extrabold">{ageRange.min} – {ageRange.max} ans</span>
              </label>
              <div className="relative h-2 bg-gray-100 rounded-full mt-4">
                <div className="absolute h-full bg-[#D4A017] transition-all duration-150 rounded-full" style={getSelectionStyle()} />
                <input type="range" min="13" max="80" value={ageRange.min}
                  onChange={(e) => setAgeRange({ ...ageRange, min: Math.min(parseInt(e.target.value), ageRange.max - 1) })}
                  className="absolute w-full h-full appearance-none bg-transparent pointer-events-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#D4A017] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md" />
                <input type="range" min="13" max="80" value={ageRange.max}
                  onChange={(e) => setAgeRange({ ...ageRange, max: Math.max(parseInt(e.target.value), ageRange.min + 1) })}
                  className="absolute w-full h-full appearance-none bg-transparent pointer-events-none z-30 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#D4A017] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md" />
              </div>
            </div>

            {/* Localisation multi-pays — dropdown */}
            <div className="space-y-4">
              <label className="block text-[15px] font-bold text-gray-700">
                Pays cibles * <span className="text-xs font-normal text-gray-400">(sélection multiple)</span>
              </label>

              {/* Tags pays sélectionnés */}
              {selectedCountries.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-[#D4A017]/5 rounded-2xl border border-[#D4A017]/20">
                  {selectedCountries.map(c => (
                    <span key={c} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4A017] text-white text-xs font-bold rounded-full">
                      {c}
                      <button type="button" onClick={() => removeCountry(c)} className="hover:opacity-70 transition-opacity">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Dropdown avec recherche */}
              <div ref={dropdownRef} className="relative">
                <div
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border bg-white cursor-text transition-all ${
                    dropdownOpen ? 'border-[#D4A017] ring-4 ring-[#D4A017]/5' : 'border-gray-200'
                  }`}
                  onClick={() => setDropdownOpen(true)}
                >
                  <Search size={16} className="text-gray-400 shrink-0" />
                  <input
                    type="text"
                    value={countrySearch}
                    onChange={(e) => { setCountrySearch(e.target.value); setDropdownOpen(true); }}
                    onFocus={() => setDropdownOpen(true)}
                    placeholder="Rechercher un pays..."
                    className="flex-1 outline-none text-sm bg-transparent text-gray-700 placeholder:text-gray-400"
                  />
                  <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {dropdownOpen && filteredCountries.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-52 overflow-y-auto">
                    {filteredCountries.map(country => (
                      <button
                        key={country}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectCountry(country)}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[#D4A017]/5 hover:text-[#D4A017] transition-colors first:rounded-t-2xl last:rounded-b-2xl font-medium"
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                )}

                {dropdownOpen && filteredCountries.length === 0 && countrySearch.trim() !== '' && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl">
                    <p className="px-4 py-3 text-sm text-gray-400 text-center">Aucun pays trouvé</p>
                  </div>
                )}
              </div>

              {selectedCountries.includes("Autre") && (
                <input
                  type="text"
                  value={customCountry}
                  onChange={(e) => { setCustomCountry(e.target.value); setShowError(false); }}
                  placeholder="Saisissez un pays ou une région..."
                  className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#D4A017] transition-all text-sm italic bg-gray-50/50"
                />
              )}
            </div>

            {/* Centres d'intérêt */}
            <div className="space-y-4">
              <label className="block text-[15px] font-bold text-gray-700">Centres d&apos;intérêt *</label>
              <div className="flex flex-wrap gap-3">
                {interestsConfig.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedInterests.includes(item.name);
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => { toggleInterest(item.name); setShowError(false); }}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 border ${
                        isSelected
                          ? "bg-[#D4A017] text-white border-[#D4A017] shadow-lg shadow-[#D4A017]/20"
                          : "bg-white text-gray-600 border-gray-100 hover:border-[#D4A017]/30 hover:bg-gray-50"
                      }`}
                    >
                      <Icon size={18} className={isSelected ? "text-white" : "text-[#D4A017]"} />
                      {item.name}
                    </button>
                  );
                })}
              </div>

              {selectedInterests.includes("Autre") && (
                <input
                  type="text"
                  value={customInterest}
                  onChange={(e) => { setCustomInterest(e.target.value); setShowError(false); }}
                  placeholder="Précisez votre centre d'intérêt..."
                  className="w-full px-5 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#D4A017] transition-all text-sm italic bg-gray-50/50"
                />
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-12">
            <Link href="/brands/auth/campagne" className="px-8 py-3.5 bg-[#111827] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg">
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
