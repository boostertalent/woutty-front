'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2, AlertCircle, Mail, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  // Utilisation d'un state pour le client afin d'éviter les re-créations inutiles
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Connexion via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.identifier.trim(),
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const userId = authData.user.id;

        // 2. On cherche dans la table 'createur' (Utilisation de id_w)
        const { data: creatorData } = await supabase
          .from('createur')
          .select('id_w') 
          .eq('id_w', userId)
          .maybeSingle(); 

        if (creatorData) {
          router.push('/creators/dashboard');
          router.refresh();
          return;
        }

        // 3. On cherche dans la table 'marque' (Utilisation de id_w)
        const { data: brandData } = await supabase
          .from('marque')
          .select('id_w')
          .eq('id_w', userId)
          .maybeSingle();

        if (brandData) {
          router.push('/brands/dashboard');
          router.refresh();
          return;
        }

        // 4. Si l'utilisateur est authentifié mais absent des tables métiers
        setErrorMsg("Votre profil est en cours de configuration ou introuvable.");
      }
    } catch (error: any) {
      console.error("Erreur login:", error);
      setErrorMsg("Identifiants incorrects ou compte non validé.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
          },
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setErrorMsg("Erreur lors de la connexion avec Google.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      
      <Link href="/" className="fixed top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-black transition-colors font-bold">
        <ChevronLeft size={20} /> Accueil
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[500px] bg-white border border-gray-100 rounded-[40px] p-8 md:p-12 shadow-sm"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black mb-2 text-black tracking-tighter">
            Woutty <span className="text-[#ceaf4a]">!</span>
          </h1>
          <p className="text-gray-500 text-lg font-medium">Bon retour parmi nous</p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all mb-8 shadow-sm active:scale-95 text-gray-700"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuer avec Google
        </button>

        <div className="relative mb-8 text-center">
          <hr className="border-gray-100" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">OU</span>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest ml-1 text-gray-400">Email Professionnel</label>
            <div className="relative">
              <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email" 
                required
                className="w-full rounded-2xl border border-transparent bg-gray-50 pl-12 pr-5 py-4 focus:bg-white focus:border-[#ceaf4a] focus:ring-4 focus:ring-[#ceaf4a]/5 outline-none transition-all text-black font-bold"
                placeholder="nom@exemple.com"
                value={formData.identifier}
                onChange={(e) => setFormData({...formData, identifier: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400">Mot de passe</label>
              <Link href="/auth/forgot-password" size="sm" className="text-xs font-bold text-[#ceaf4a] hover:text-black transition-colors">
                Oublié ?
              </Link>
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full rounded-2xl border border-transparent bg-gray-50 px-6 py-4 focus:bg-white focus:border-[#ceaf4a] focus:ring-4 focus:ring-[#ceaf4a]/5 outline-none transition-all text-black font-bold"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ceaf4a]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 bg-red-50 p-4 rounded-2xl text-red-600 text-sm font-bold border border-red-100"
            >
              <AlertCircle size={18} /> {errorMsg}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ceaf4a] text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-[#ceaf4a]/20 hover:bg-[#b8962f] disabled:bg-gray-200 disabled:text-gray-400 active:scale-[0.98] flex items-center justify-center gap-2 transition-all"
          >
            {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Accéder à mon espace"}
          </button>
        </form>

        <p className="text-center mt-8 text-sm font-medium text-gray-500">
          Nouveau sur Woutty ?{' '}
          <Link href="/auth" className="text-[#ceaf4a] font-black hover:underline underline-offset-4">
            Créer un compte
          </Link>
        </p>
      </motion.div>
    </div>
  );
}