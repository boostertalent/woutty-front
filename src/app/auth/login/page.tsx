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

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.identifier,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          router.push('/auth'); 
          return;
        }

        if (profile.role === 'brand') router.push('/brands/dashboard');
        else if (profile.role === 'creator') router.push('/creators/dashboard');
        else if (profile.role === 'admin') router.push('/admin/dashboard');
        else router.push('/auth'); 

        router.refresh(); 
      }
    } catch (error: any) {
      setErrorMsg("Identifiants invalides ou problème de connexion.");
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
    redirectTo: `${window.location.origin}/auth/callback?role=creator`, 
  },
});
      if (error) throw error;
    } catch (error: any) {
      setErrorMsg("Erreur lors de la connexion avec Google.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      
      <Link href="/" className="fixed top-8 left-8 flex items-center gap-2 text-gray-500 hover:text-[#ceaf4a] transition-colors font-medium">
        <ChevronLeft size={20} /> Accueil
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[500px] bg-white border border-gray-200 rounded-[40px] p-8 md:p-12 shadow-sm"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-[#ceaf4a]">Woutty !</span>
          </h1>
          <p className="text-gray-500 text-sm font-medium">Connectez-vous à votre compte</p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 py-3.5 rounded-2xl font-bold hover:bg-gray-50 transition-colors mb-8 shadow-sm active:scale-95 text-gray-700"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuer avec Google
        </button>

        <div className="relative mb-8 text-center">
          <hr className="border-gray-100" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300">OU</span>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold ml-1 text-gray-700">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              {/* Animation focus supprimée */}
              <input
                type="email" 
                required
                className="w-full rounded-2xl border border-gray-200 bg-gray-50/30 pl-12 pr-5 py-3.5 "
                placeholder="nom@exemple.com"
                value={formData.identifier}
                onChange={(e) => setFormData({...formData, identifier: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-bold text-gray-700">Mot de passe</label>
              <Link href="/auth/forgot-password" className="text-xs font-bold text-[#ceaf4a] hover:underline">
                Oublié ?
              </Link>
            </div>
            
            <div className="relative">
              {/* Animation focus supprimée */}
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full rounded-2xl border border-gray-200 bg-gray-50/30 px-5 py-3.5 outline-none"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ceaf4a] focus:outline-none"
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
            className="w-full bg-[#ceaf4a] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-[#ceaf4a]/20 hover:bg-[#b8962f] disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2 transition-transform"
          >
            {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Se connecter"}
          </button>
        </form>

        <p className="text-center mt-8 text-sm font-medium text-gray-500">
          Pas encore de compte ?{' '}
          <Link href="/auth" className="text-[#ceaf4a] font-bold hover:underline">
            S'inscrire
          </Link>
        </p>
      </motion.div>
    </div>
  );
}