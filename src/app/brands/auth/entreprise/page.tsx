"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Loader2, AlertCircle, ChevronRight } from 'lucide-react';

// Liste des domaines possibles pour la sélection
const DOMAINES = [
  "Mode & Beauté",
  "Technologie & SaaS",
  "Sport & Bien-être",
  "Voyage & Lifestyle",
  "Alimentation & Food",
  "Éducation & Formation",
  "Immobilier",
  "Autre"
];

export default function EntrepriseDetails() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // État du formulaire
  const [formData, setFormData] = useState({
    companyName: '',
    phone: '',
    email: '',
    domain: '',
    customDomain: '',
    website: ''
  });

  // Charger les données si l'utilisateur revient en arrière
  useEffect(() => {
    const savedName = localStorage.getItem('brand_company_name');
    if (savedName) {
      setFormData(prev => ({
        ...prev,
        companyName: savedName,
        phone: localStorage.getItem('brand_company_phone') || '',
        email: localStorage.getItem('brand_company_email') || '',
        domain: localStorage.getItem('brand_domain') || '',
        website: localStorage.getItem('brand_website') || '',
      }));
    }
  }, []);

  // Validation simple du formulaire
  const isFormValid =
    formData.companyName.trim() !== '' &&
    formData.phone.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.domain !== '' &&
    (formData.domain !== "Autre" || formData.customDomain.trim() !== '');

  // Gestion du changement de champ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Gestion du bouton Continuer
  const handleContinue = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();

    if (!isFormValid || loading) return;

    setLoading(true);
    try {
      const finalDomain = formData.domain === "Autre" ? formData.customDomain : formData.domain;

      // Persistance locale pour le tunnel d'inscription
      localStorage.setItem('brand_company_name', formData.companyName);
      localStorage.setItem('brand_company_phone', formData.phone);
      localStorage.setItem('brand_company_email', formData.email);
      localStorage.setItem('brand_domain', finalDomain);
      localStorage.setItem('brand_website', formData.website);

      router.push('/brands/auth/contact'); // Passage à l'étape suivante
    } catch (err) {
      setError("Erreur lors de la préparation des données.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f3f3] flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      <div className="bg-white rounded-[40px] shadow-sm w-full max-w-2xl p-8 md:p-12 border border-gray-100 relative">

        {/* En-tête */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-medium mb-2">Votre entreprise/Marque</h1>
          <p className="text-gray-500 font-medium">Présentez votre marque/Entreprise</p>
        </div>

        {/* Icône */}
        <div className="flex justify-center mb-12">
          <div className="w-28 h-28 bg-[#fdf2d0] rounded-full flex items-center justify-center border-4 border-white shadow-sm">
            <Building2 size={48} className="text-[#ceaf4a]" />
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleContinue} className="space-y-6 max-w-lg mx-auto">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-2 text-sm font-bold border border-red-100 animate-in fade-in">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {/* Nom de l'entreprise */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Nom Marque/Entreprise*</label>
            <input
              type="text"
              name="companyName"
              placeholder="Ex: My Brand Agency"
              required
              value={formData.companyName}
              onChange={handleChange}
              className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-[#ceaf4a] focus:ring-2 focus:ring-[#ceaf4a]/10 outline-none transition-all"
            />
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Tel *</label>
              <input
                type="tel"
                name="phone"
                placeholder="+221..."
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-[#ceaf4a] focus:ring-2 focus:ring-[#ceaf4a]/10 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Marque/Entreprise*</label>
              <input
                type="email"
                name="email"
                placeholder="contact@brand.com"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-[#ceaf4a] focus:ring-2 focus:ring-[#ceaf4a]/10 outline-none transition-all"
              />
            </div>
          </div>

          {/* Domaine et site web */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Domaine *</label>
              <div className="relative">
                <select
                  name="domain"
                  required
                  value={formData.domain}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-[#ceaf4a] focus:ring-2 focus:ring-[#ceaf4a]/10 outline-none transition-all bg-white appearance-none cursor-pointer"
                >
                  <option value="" disabled>Sélectionner</option>
                  {DOMAINES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <ChevronRight size={16} className="rotate-90" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Site web*</label>
              <input
                type="url"
                name="website"
                placeholder="https://www.monsite.com"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-[#ceaf4a] focus:ring-2 focus:ring-[#ceaf4a]/10 outline-none transition-all"
              />
            </div>
          </div>

          {/* Domaine personnalisé si "Autre" */}
          {formData.domain === "Autre" && (
            <div className="animate-in slide-in-from-top-2 duration-300 fade-in">
              <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Précisez votre domaine *</label>
              <input
                type="text"
                name="customDomain"
                placeholder="Ex: Art & Culture"
                value={formData.customDomain}
                onChange={handleChange}
                className="w-full px-5 py-3.5 rounded-2xl border border-[#ceaf4a] focus:ring-2 focus:ring-[#ceaf4a]/20 outline-none transition-all"
              />
            </div>
          )}

          {/* Boutons */}
          <div className="flex justify-between items-center mt-12 pt-4">
            <Link 
              href="/auth" 
              className="bg-black text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-95 text-center min-w-[120px]"
            >
              Retour
            </Link>

            <button 
              type="submit"
              disabled={!isFormValid || loading}
              className={`px-10 py-3.5 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-md ${
                isFormValid && !loading
                ? "bg-[#ceaf4a] hover:bg-[#b8962f] text-white shadow-[#ceaf4a]/20 active:scale-95" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Continuer
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
