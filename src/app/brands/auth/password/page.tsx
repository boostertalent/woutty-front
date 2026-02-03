"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2, AlertCircle, Eye, EyeOff, ChevronLeft, CheckCircle2 } from 'lucide-react';

export default function BrandFinalStep() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  // Validation simple
  const isMatch = password === confirmPassword && password !== '';
  const isLongEnough = password.length >= 6;
  const isFormValid = isMatch && isLongEnough;

  // Fonction utilitaire pour convertir proprement en nombre pour la table SQL
  const parseToDouble = (value: string | null) => {
    if (!value) return null;
    const cleaned = value.replace(/\s/g, ''); // Enlève les espaces
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  };

  const handleFinalSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    setLoading(true);
    setError(null);

    try {
      // RÉCUPÉRATION DES DONNÉES DEPUIS LE LOCALSTORAGE
      const email = localStorage.getItem('brand_company_email');
      const companyName = localStorage.getItem('brand_company_name');

      if (!email || !companyName) throw new Error("Informations manquantes, recommencez.");

      // 1️⃣ Création utilisateur Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role: 'brand', display_name: companyName } }
      });
      if (authError) throw authError;

      if (authData.user) {
        // --- LE FIX FRONTEND ---
        // On supprime immédiatement l'entrée créée par le trigger SQL dans 'createur'
        // car le trigger actuel ne sait pas faire la différence entre une marque et un créateur.
        await supabase
          .from('createur')
          .delete()
          .eq('id_w', authData.user.id);

        // 2. Insertion manuelle dans la table 'marque' avec toutes les infos
        const { error: dbError } = await supabase
          .from('marque') 
          .insert({
            id_w: authData.user.id,
            nom_marque: companyName,
            email_marque: email,
            telephone_marque: localStorage.getItem('brand_company_phone'),
            domaine: localStorage.getItem('brand_domain'),
            site_web: localStorage.getItem('brand_website'),
            nom_contact: localStorage.getItem('brand_contact_fullname'),
            fonction_contact: localStorage.getItem('brand_contact_function'),
            email_professionnel: localStorage.getItem('brand_contact_professional_email'),
            telephone_contact: localStorage.getItem('brand_contact_phone'),
            role: 'brand'
          });

        if (dbError) {
          console.error("Erreur DB Marque:", dbError);
          throw new Error("Erreur lors de la création du profil marque : " + dbError.message);
        }
      }

      // 3. Succès et nettoyage
      localStorage.clear();
      router.push('/brands/auth/success');

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err) || "Une erreur est survenue.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f3f3] flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      <div className="bg-white rounded-[40px] shadow-sm w-full max-w-2xl p-8 md:p-14 border border-gray-100">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">
            Woutty <span className="text-[#ceaf4a]">Business</span>
          </h1>
          <p className="text-gray-500 font-medium text-lg">Sécurisez l'accès à votre espace marque</p>
        </div>

        <form onSubmit={handleFinalSignup} className="space-y-5 max-w-lg mx-auto">
          
          {/* Affichage erreurs */}
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {/* Mot de passe */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider">Mot de passe</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Créez un mot de passe sécurisé"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-[#ceaf4a] focus:ring-4 focus:ring-[#ceaf4a]/5 outline-none transition-all pr-14 text-black font-semibold"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ceaf4a]">
                {showPass ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          {/* Confirmation */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider">Confirmer le mot de passe</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Répétez le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border outline-none transition-all pr-14 font-semibold text-black ${
                  isMatch && password !== '' ? "border-green-500 bg-white" : "border-transparent focus:border-[#ceaf4a]"
                }`}
              />
              {isMatch && password !== '' && (
                <CheckCircle2 className="absolute right-5 top-1/2 -translate-y-1/2 text-green-500" size={22} />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-12 pt-6 border-t border-gray-50">
            <Link href="/brands/auth/contact" className="text-gray-400 font-bold flex items-center gap-2 hover:text-black transition-colors">
              <ChevronLeft size={20} /> Retour
            </Link>
            
            <button type="submit"
              disabled={loading || !isFormValid}
              className={`px-10 py-4 rounded-2xl font-bold transition-all shadow-xl flex items-center gap-3 active:scale-95 ${
                loading || !isFormValid
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : "bg-[#ceaf4a] text-white hover:bg-[#b8962f] shadow-[#ceaf4a]/20"
              }`}
            >
              {loading ? <Loader2 className="animate-spin" size={22} /> : "Créer mon compte"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
