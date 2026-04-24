"use client";

import React, { useState, ChangeEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Upload, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export default function CreateCreatorProfile() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    age: ''
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  // 1. CHARGEMENT DES DONNÉES 
  useEffect(() => {
    const savedEmail = localStorage.getItem('onboarding_email');
    const savedName = localStorage.getItem('user_full_name');
    const savedPhone = localStorage.getItem('signup_phone');
    const savedAge = localStorage.getItem('signup_age');
    const savedAvatar = localStorage.getItem('signup_avatar_file');

    if (savedEmail || savedName) {
      setFormData({
        email: savedEmail || '',
        fullName: savedName || '',
        phone: savedPhone || '',
        age: savedAge || ''
      });
      if (savedAvatar) setImagePreview(savedAvatar);
    }
  }, []);

  const isFormValid = 
    formData.fullName.trim().length >= 2 && 
    formData.email.includes('@') && 
    formData.phone.trim().length >= 8 && 
    formData.age !== '' &&
    parseInt(formData.age) > 0;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'age' && value !== '' && parseInt(value) < 0) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("L'image est trop lourde (max 2Mo)");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        
        // Sauvegarder l'image pour la prévisualisation ET pour l'upload
        setImagePreview(base64String);
        
        try {
          localStorage.setItem('signup_avatar_file', base64String);
          console.log("✅ Avatar sauvegardé dans localStorage");
        } catch (error) {
          console.warn("❌ LocalStorage plein, l'image ne sera pas sauvegardée");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. SAUVEGARDE ET NAVIGATION
  const handleContinue = () => {
    if (!isFormValid) {
      setShowErrors(true);
      return;
    }

    // Sauvegarder les données du formulaire
    localStorage.setItem('onboarding_email', formData.email.trim().toLowerCase());
    localStorage.setItem('user_full_name', formData.fullName.trim());
    localStorage.setItem('signup_phone', formData.phone.trim());
    localStorage.setItem('signup_age', formData.age);
    
    
    console.log("📦 Données sauvegardées:", {
      email: formData.email,
      name: formData.fullName,
      hasAvatar: !!localStorage.getItem('signup_avatar_file')
    });
    
    router.push("/creators/auth/formulaire/etape2");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center md:justify-center max-md:justify-start max-md:pt-16 p-4 font-sans text-gray-900">
      <Link
        href="/auth"
        className="fixed top-3 left-3 z-50 flex items-center gap-2 rounded-full border border-gray-200 bg-white/85 backdrop-blur px-3 py-2 text-xs font-bold text-gray-700 shadow-sm hover:text-black transition-colors"
      >
        <ChevronLeft size={20} /> Retour
      </Link>

      <h1 className="max-md:text-2xl text-4xl md:text-5xl font-bold max-md:mb-6 mb-12 text-center">
        Créer votre profil <span className="text-[#ceaf4a]">créateur !</span>
      </h1>

      <div className="bg-white border border-gray-200 rounded-[40px] p-8 md:p-12 w-full max-w-2xl shadow-sm">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Ton identité</h2>
          <p className="text-gray-500 text-sm">Présente-toi aux marques</p>
        </div>

        {/* Photo */}
        <div className="flex justify-center mb-10">
          <label className="relative cursor-pointer group">
            <div className={`w-28 h-28 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed transition-all overflow-hidden relative ${showErrors && !imagePreview ? 'border-red-400' : 'border-gray-300 group-hover:border-[#ceaf4a]'}`}>
              {imagePreview ? (
                <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
              ) : (
                <Upload size={32} className="text-[#ceaf4a]" strokeWidth={1.5} />
              )}
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full border border-gray-200 shadow-sm text-[#ceaf4a]">
              <Upload size={14} />
            </div>
          </label>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold ml-1 text-gray-700 uppercase tracking-wider">Nom complet</label>
            <input 
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              type="text" 
              placeholder="exemple: Fall Thiam" 
              className={`w-full px-5 py-3.5 rounded-2xl border outline-none transition-all ${showErrors && !formData.fullName ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#ceaf4a] focus:ring-4 focus:ring-[#ceaf4a]/5'}`}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1 text-gray-700 uppercase tracking-wider">Email professionnel</label>
            <input 
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email" 
              placeholder="exemple:fallthiam@gmail.com" 
              className={`w-full px-5 py-3.5 rounded-2xl border outline-none transition-all ${showErrors && !formData.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#ceaf4a] focus:ring-4 focus:ring-[#ceaf4a]/5'}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold ml-1 text-gray-700 uppercase tracking-wider">Téléphone</label>
              <input 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                type="tel" 
                placeholder="+221..." 
                className={`w-full px-5 py-3.5 rounded-2xl border outline-none transition-all ${showErrors && !formData.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#ceaf4a] focus:ring-4 focus:ring-[#ceaf4a]/5'}`}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold ml-1 text-gray-700 uppercase tracking-wider">Âge</label>
              <input 
                name="age"
                value={formData.age}
                onChange={handleChange}
                type="number" 
                placeholder="25" 
                className={`w-full px-5 py-3.5 rounded-2xl border outline-none transition-all ${showErrors && (!formData.age || parseInt(formData.age) <= 0) ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#ceaf4a] focus:ring-4 focus:ring-[#ceaf4a]/5'}`}
              />
            </div>
          </div>

          {showErrors && !isFormValid && (
            <div className="flex items-center gap-2 text-red-500 text-sm font-bold justify-center bg-red-50 py-3 rounded-xl border border-red-100">
              <AlertCircle size={16} />
              Vérifiez vos informations
            </div>
          )}

          <div className="flex justify-end mt-10">
            <button 
              onClick={handleContinue}
              className={`px-10 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg ${
                isFormValid 
                ? "bg-[#ceaf4a] hover:bg-[#b8962f] text-white shadow-[#ceaf4a]/30 active:scale-95" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
              }`}
            >
              Continuer
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
