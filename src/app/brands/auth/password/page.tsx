"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { User, Loader2, AlertCircle, Eye, EyeOff, ChevronLeft, CheckCircle2 } from 'lucide-react';

export default function DerniereEtape() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Validation des critères
  const isMatch = password === confirmPassword && password !== '';
  const isLongEnough = password.length >= 6;
  const isFormValid = isMatch && isLongEnough;

  const handleFinalSignup = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page
    if (!isFormValid || loading) return;

    setLoading(true);
    setError(null);

    try {
      const email = localStorage.getItem('brand_company_email');
      if (!email) {
        throw new Error("Données d'inscription manquantes. Veuillez recommencer.");
      }

      // 1. Création du compte Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: { 
            data: { 
                role: 'brand',
                full_name: localStorage.getItem('brand_company_name') || 'Entreprise'
            } 
        }
      });

      if (authError) throw authError;

      // 2. Enregistrement massif dans 'profiles' avec UPSERT
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            role: 'brand',
            email: email,
            company_name: localStorage.getItem('brand_company_name'),
            company_phone: localStorage.getItem('brand_company_phone'),
            company_email: localStorage.getItem('brand_company_email'),
            domain: localStorage.getItem('brand_domain'),
            company_website: localStorage.getItem('brand_website'),
            full_name: localStorage.getItem('brand_contact_fullname'),
            contact_function: localStorage.getItem('brand_contact_function'),
            professional_email: localStorage.getItem('brand_contact_professional_email'),
            phone_number: localStorage.getItem('brand_contact_phone'),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id'
          });

        if (profileError) throw profileError;
      }

      // 3. Nettoyage et redirection
      localStorage.clear();
      router.push('/brands/dashboard');

    } catch (err: any) {
      console.error("Erreur signup:", err);
      setError(err.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f3f3] flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      
      <div className="bg-white rounded-[40px] shadow-sm w-full max-w-2xl p-8 md:p-14 relative border border-gray-100">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-semibold tracking-tight mb-3">Dernière étape !</h1>
          <p className="text-gray-500 font-medium text-lg">Sécurisez votre compte entreprise</p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="w-24 h-24 bg-[#fdf2d0] rounded-3xl flex items-center justify-center shadow-inner transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <User size={40} className="text-[#ceaf4a]" />
          </div>
        </div>

        <form onSubmit={handleFinalSignup} className="space-y-5 max-w-lg mx-auto">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-in fade-in">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Mot de passe (6 caractères min.)</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#ceaf4a] focus:ring-4 focus:ring-[#ceaf4a]/5 outline-none transition-all pr-14"
              />
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ceaf4a] transition-colors"
              >
                {showPass ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Confirmation</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Répétez votre mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border outline-none transition-all pr-14 ${
                  isMatch && password !== ''
                  ? "border-green-500 bg-white focus:ring-4 focus:ring-green-500/5" 
                  : "border-transparent focus:bg-white focus:border-[#ceaf4a] focus:ring-4 focus:ring-[#ceaf4a]/5"
                }`}
              />
              {isMatch && password !== '' && (
                <CheckCircle2 className="absolute right-5 top-1/2 -translate-y-1/2 text-green-500" size={22} />
              )}
            </div>
            {isMatch && password !== '' && (
              <p className="text-green-600 text-xs font-bold mt-2 ml-1 flex items-center gap-1">
                Les mots de passe correspondent !
              </p>
            )}
          </div>

          <div className="flex justify-between items-center mt-12 pt-6">
            <Link 
              href="/brands/auth/contact" 
              className="text-gray-400 font-bold px-4 py-2 hover:text-gray-900 transition-colors flex items-center gap-2"
            >
              <ChevronLeft size={20} /> Retour
            </Link>
            
            <button 
              type="submit"
              disabled={loading || !isFormValid}
              className={`px-12 py-4 rounded-2xl font-bold transition-all shadow-xl flex items-center gap-3 active:scale-95 ${
                loading || !isFormValid
                ? "bg-gray-100 text-gray-300 cursor-not-allowed shadow-none"
                : "bg-[#ceaf4a] text-white hover:bg-[#b8962f] shadow-[#ceaf4a]/20"
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                "Terminer l'inscription"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}