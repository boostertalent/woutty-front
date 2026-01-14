"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Step2() {
  const router = useRouter();
  const steps = [1, 2, 3, 4];
  const interestsList = ["Mode", "Tech", "Lifestyle", "Food", "Sport", "Beauté", "Voyage", "Autre"];
  
  const countries = [
    "Afghanistan", "Afrique du Sud", "Albanie", "Algérie", "Allemagne", "Andorre", "Angola", "Antigua-et-Barbuda", "Arabie Saoudite", "Argentine", "Arménie", "Australie", "Autriche", "Azerbaïdjan",
    "Bahamas", "Bahreïn", "Bangladesh", "Barbade", "Belgique", "Belize", "Bénin", "Bhoutan", "Biélorussie", "Birmanie", "Bolivie", "Bosnie-Herzégovine", "Botswana", "Brésil", "Brunei", "Bulgarie", "Burkina Faso", "Burundi",
    "Cambodge", "Cameroun", "Canada", "Cap-Vert", "Chili", "Chine", "Chypre", "Colombie", "Comores", "Congo-Brazzaville", "Congo-Kinshasa", "Corée du Nord", "Corée du Sud", "Costa Rica", "Côte d’Ivoire", "Croatie", "Cuba",
    "Danemark", "Djibouti", "Dominique", "Égypte", "Émirats Arabes Unis", "Équateur", "Érythrée", "Espagne", "Estonie", "Eswatini", "États-Unis", "Éthiopie",
    "Fidji", "Finlande", "France", "Gabon", "Gambie", "Géorgie", "Ghana", "Grèce", "Grenade", "Guatemala", "Guinée", "Guinée équatoriale", "Guinée-Bissau", "Guyana",
    "Haïti", "Honduras", "Hongrie", "Inde", "Indonésie", "Irak", "Iran", "Irlande", "Islande", "Israël", "Italie", "Jamaïque", "Japon", "Jordanie",
    "Kazakhstan", "Kenya", "Kirghizistan", "Kiribati", "Koweït", "Laos", "Lesotho", "Lettonie", "Liban", "Liberia", "Libye", "Liechtenstein", "Lituanie", "Luxembourg",
    "Macédoine du Nord", "Madagascar", "Malaisie", "Malawi", "Maldives", "Mali", "Malte", "Maroc", "Marshall", "Maurice", "Mauritanie", "Mexique", "Micronésie", "Moldavie", "Monaco", "Mongolie", "Monténégro", "Mozambique",
    "Namibie", "Nauru", "Népal", "Nicaragua", "Niger", "Nigeria", "Norvège", "Nouvelle-Zélande", "Oman", "Ouganda", "Ouzbékistan",
    "Pakistan", "Palaos", "Palestine", "Panama", "Papouasie-Nouvelle-Guinée", "Paraguay", "Pays-Bas", "Pérou", "Philippines", "Pologne", "Portugal",
    "Qatar", "République Centrafricaine", "République Dominicaine", "République Tchèque", "Roumanie", "Royaume-Uni", "Russie", "Rwanda",
    "Saint-Christophe-et-Niévès", "Sainte-Lucie", "Saint-Marin", "Saint-Vincent-et-les-Grenadines", "Salomon", "Salvador", "Samoa", "Sao Tomé-et-Principe", "Sénégal", "Serbie", "Seychelles", "Sierra Leone", "Singapour", "Slovaquie", "Slovénie", "Somalie", "Soudan", "Soudan du Sud", "Sri Lanka", "Suède", "Suisse", "Suriname", "Syrie",
    "Tadjikistan", "Tanzanie", "Tchad", "Thaïlande", "Timor oriental", "Togo", "Tonga", "Trinité-et-Tobago", "Tunisie", "Turkménistan", "Turquie", "Tuvalu",
    "Ukraine", "Uruguay", "Vanuatu", "Vatican", "Venezuela", "Vietnam", "Yémen", "Zambie", "Zimbabwe", "Autre"
  ];

  // États
  const [ageRange, setAgeRange] = useState({ min: 13, max: 80 });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [customCountry, setCustomCountry] = useState("");
  const [showError, setShowError] = useState(false);

  // Validation
  const isFormValid = () => {
    const hasCountry = selectedCountry !== "" && (selectedCountry !== "Autre" || customCountry.trim() !== "");
    const hasInterests = selectedInterests.length > 0;
    const hasCustomInterest = !selectedInterests.includes("Autre") || customInterest.trim() !== "";
    
    return hasCountry && hasInterests && hasCustomInterest;
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

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
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
        <p className="text-gray-500 text-sm">Définissez vos critères pour un matching IA optimal</p>
      </div>

      <div className="max-w-xl mx-auto mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-10 -translate-y-1/2"></div>
        <div className="flex justify-between items-center">
          {steps.map((s) => (
            <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${s <= 2 ? "bg-[#D4A017] text-white ring-8 ring-[#D4A017]/10" : "bg-white border border-gray-100 text-gray-400 shadow-sm"}`}>
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
            {/* Age Slider */}
            <div>
              <label className="block text-[15px] font-bold text-gray-700 mb-6">
                Tranche d&apos;âge : <span className="text-[#D4A017] font-extrabold">{ageRange.min} – {ageRange.max} ans</span>
              </label>
              <div className="relative h-2 bg-gray-100 rounded-full mt-4">
                <div className="absolute h-full bg-[#D4A017] transition-all duration-150 rounded-full" style={getSelectionStyle()} />
                <input type="range" min="13" max="80" value={ageRange.min} onChange={(e) => setAgeRange({ ...ageRange, min: Math.min(parseInt(e.target.value), ageRange.max - 1) })} className="absolute w-full h-full appearance-none bg-transparent pointer-events-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#D4A017] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md" />
                <input type="range" min="13" max="80" value={ageRange.max} onChange={(e) => setAgeRange({ ...ageRange, max: Math.max(parseInt(e.target.value), ageRange.min + 1) })} className="absolute w-full h-full appearance-none bg-transparent pointer-events-none z-30 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#D4A017] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md" />
              </div>
            </div>

            {/* Localisation */}
            <div className="space-y-4">
              <label className="block text-[15px] font-bold text-gray-700">Localisation *</label>
              <div className="relative">
                <select 
                  value={selectedCountry}
                  onChange={(e) => { setSelectedCountry(e.target.value); setShowError(false); }}
                  className={`w-full appearance-none px-5 py-4 rounded-xl border outline-none bg-white transition-all cursor-pointer ${showError && selectedCountry === "" ? "border-red-300 ring-4 ring-red-50" : "border-gray-200 focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/5"}`}
                >
                  <option value="">Sélectionner un pays</option>
                  {countries.map(country => <option key={country} value={country}>{country}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>

              {selectedCountry === "Autre" && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <input
                    type="text"
                    value={customCountry}
                    onChange={(e) => { setCustomCountry(e.target.value); setShowError(false); }}
                    placeholder="Saisissez une localisation précise..."
                    className={`w-full px-5 py-3 rounded-xl border outline-none transition-all text-sm bg-gray-50/50 italic ${showError && customCountry === "" ? "border-red-300" : "border-gray-200 focus:border-[#D4A017]"}`}
                  />
                </div>
              )}
            </div>

            {/* Centres d'intérêt */}
            <div className="space-y-4">
              <label className="block text-[15px] font-bold text-gray-700">Centres d&apos;intérêt *</label>
              <div className="flex flex-wrap gap-2">
                {interestsList.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => { toggleInterest(interest); setShowError(false); }}
                    className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${selectedInterests.includes(interest) ? "bg-[#D4A017] text-white shadow-md shadow-[#D4A017]/20" : showError && selectedInterests.length === 0 ? "bg-red-50 text-red-600 border border-red-100" : "bg-gray-50 text-gray-600 hover:bg-gray-100"}`}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              {selectedInterests.includes("Autre") && (
                <div className="animate-in slide-in-from-top-2 duration-300 pt-2">
                  <input
                    type="text"
                    value={customInterest}
                    onChange={(e) => { setCustomInterest(e.target.value); setShowError(false); }}
                    placeholder="Précisez votre centre d'intérêt..."
                    className={`w-full px-5 py-3 rounded-xl border outline-none transition-all text-sm bg-gray-50/50 italic ${showError && customInterest === "" ? "border-red-300" : "border-gray-200 focus:border-[#D4A017]"}`}
                  />
                </div>
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