'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2, AlertCircle, Mail, Globe, Eye, EyeOff } from 'lucide-react';
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

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.identifier,
        password: formData.password,
      });

      if (error) throw error;
      
      router.push('/creators/dashboard');
      router.refresh(); 
    } catch (error: any) {
      setErrorMsg("Identifiants invalides. Vérifiez votre email ou mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          
          redirectTo: `${window.location.origin}/creators/auth/callback?next=/creators/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      setErrorMsg("Erreur lors de la connexion avec Google.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center px-4 py-12 font-sans text-black">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[500px] bg-white border border-gray-100 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-black/5"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-block bg-black text-white px-4 py-2 rounded-xl font-black text-xl mb-4 transition-transform hover:scale-110">
            W
          </Link>
          <h2 className="text-3xl font-black tracking-tight">Bon retour</h2>
          <p className="text-gray-400 font-bold italic">Accédez à votre espace créateur</p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-50 py-3.5 rounded-2xl font-bold hover:bg-gray-50 transition-all mb-6"
        >
          <Globe size={20} className="text-blue-500" />
          Continuer avec Google
        </button>

        <div className="relative mb-8 text-center">
          <hr className="border-gray-100" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs font-black uppercase tracking-[0.2em] text-gray-300">OU</span>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest ml-1">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="email" 
                required
                className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 pl-12 pr-5 py-3.5 focus:border-black focus:bg-white outline-none transition-all"
                placeholder="nom@exemple.com"
                value={formData.identifier}
                onChange={(e) => setFormData({...formData, identifier: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-black uppercase tracking-widest ml-1">Mot de passe</label>
              <Link href="/creators/auth/forgot-password"  className="text-[10px] font-bold uppercase text-gray-400 hover:text-black">
                Oublié ?
              </Link>
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full rounded-2xl border-2 border-gray-50 bg-gray-50/50 px-5 py-3.5 focus:border-black focus:bg-white outline-none transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-50 p-4 rounded-2xl text-red-600 text-sm font-bold border border-red-100">
              <AlertCircle size={18} /> {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:shadow-black/10 hover:-translate-y-0.5 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin mx-auto h-6 w-6" /> : "Se connecter"}
          </button>
        </form>

        <p className="text-center mt-8 text-sm font-medium text-gray-500">
          Pas encore de compte ?{' '}
          <Link href="/creators/auth/register" className="text-black font-black hover:underline">
            S'inscrire
          </Link>
        </p>
      </motion.div>
    </div>
  );
}