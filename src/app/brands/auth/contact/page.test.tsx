"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Loader2, AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react';

export default function ContactPrincipal() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    function: '',
    email: '',
    phone: ''
  });

  // Récupération des données si l'utilisateur revient sur la page
  useEffect(() => {
    const savedName = localStorage.getItem('brand_contact_fullname');
    if (savedName) {
      setFormData({
        fullName: savedName,
        function: localStorage.getItem('brand_contact_function') || '',
        email: localStorage.getItem('brand_contact_professional_email') || '',
        phone: localStorage.getItem('brand_contact_phone') || '',
      });
    }
  }, []);

  // Validation simple
  const isFormValid = formData.fullName.trim() !== '' && formData.email.trim() !== '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContinue = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    
    if (!isFormValid || loading) return;

    setLoading(true);
    try {
      // Stockage local pour l'étape finale
      localStorage.setItem('brand_contact_fullname', formData.fullName);
      localStorage.setItem('brand_contact_function', formData.function);
      localStorage.setItem('brand_contact_professional_email', formData.email);
      localStorage.setItem('brand_contact_phone', formData.phone);

      router.push('/brands/auth/password');
    } catch (err) {
      setError("Une erreur est survenue lors de la sauvegarde locale.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f3f3] flex items-center justify-center p-4 font-sans text-gray-900">
      <div className="bg-white rounded-[40px] shadow-sm w-full max-w-2xl p-8 md:p-14 border border-gray-100">
        
        {/* En-tête */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-semibold tracking-tight mb-3">Contact principal</h1>
          <p className="text-gray-500 font-medium text-lg">Qui gère les campagnes ?</p>
        </div>

        {/* Icône */}
        <div className="flex justify-center mb-12">
          <div className="w-24 h-24 bg-[#fdf2d0] rounded-3xl flex items-center justify-center shadow-inner transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <User size={40} className="text-[#ceaf4a]" />
          </div>
        </div>

        <form onSubmit={handleContinue} className="space-y-5 max-w-lg mx-auto">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-in fade-in">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Nom complet *</label>
            <input 
              type="text" 
              name="fullName" 
              required
              placeholder="Ex: Jean Dupont" 
              value={formData.fullName} 
              onChange={handleChange} 
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#ceaf4a] focus:ring-4 focus:ring-[#ceaf4a]/5 outline-none transition-all" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Fonction</label>
            <input 
              type="text" 
              name="function" 
              placeholder="Ex: Responsable Marketing" 
              value={formData.function} 
              onChange={handleChange} 
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#ceaf4a] focus:ring-4 focus:ring-[#ceaf4a]/5 outline-none transition-all" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Email professionnel *</label>
            <input 
              type="email" 
              name="email" 
              required
              placeholder="jean@entreprise.com" 
              value={formData.email} 
              onChange={handleChange} 
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#ceaf4a] focus:ring-4 focus:ring-[#ceaf4a]/5 outline-none transition-all" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Téléphone</label>
            <input 
              type="tel" 
              name="phone" 
              placeholder="+33 6 00 00 00 00" 
              value={formData.phone} 
              onChange={handleChange} 
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#ceaf4a] focus:ring-4 focus:ring-[#ceaf4a]/5 outline-none transition-all" 
            />
          </div>

          <div className="flex justify-between items-center mt-12 pt-6">
            <Link 
              href="/brands/auth/entreprise" 
              className="text-gray-400 font-bold px-4 py-2 hover:text-gray-900 transition-colors flex items-center gap-2"
            >
              <ChevronLeft size={20} /> Retour
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