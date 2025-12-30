'use client';

import { useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          router.push('/partenariat');
          return;
        }

        if (profiles.role === 'admin') router.push('/admin/dashboard');
        else router.push('/creators/dashboard');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#FDFDFD] px-4 py-12 overflow-hidden">
      
      {/* Éléments de design en arrière-plan  */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-[120px]" />

      <div className="relative w-full max-w-[460px] space-y-8 bg-white/80 backdrop-blur-xl p-8 sm:p-12 rounded-[2.8rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white">
        
        <div className="text-center space-y-2">
          {/* Logo Minimaliste */}
          <Link href="/" className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white text-3xl font-black shadow-2xl shadow-black/20 hover:rotate-3 transition-transform">
            W
          </Link>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">
            Bon retour.
          </h2>
          <p className="text-black font-bold  hover:text-black transition-colors">
            Heureux de vous revoir parmi nous.
          </p>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-black font-bold  hover:text-black transition-colors">
                Adresse Email
              </label>
              <input
                type="email"
                required
                className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-5 py-4 text-gray-900 transition-all placeholder:text-gray-300 focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5 focus:outline-none"
                placeholder="thiam.alioune@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-black font-bold  hover:text-black transition-colors">
                  Mot de passe
                </label>
                <Link href="/auth/forgot-password" className="text-xs font-bold text-gray-400 hover:text-black transition-colors">
                  Oublié ?
                </Link>
              </div>
              <input
                type="password"
                required
                className="block w-full rounded-2xl border border-gray-100 bg-gray-50/30 px-5 py-4 text-gray-900 transition-all focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5 focus:outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-3 rounded-2xl bg-red-50/50 backdrop-blur-sm p-4 text-sm font-semibold text-red-600 border border-red-100 animate-in slide-in-from-bottom-2">
              <AlertCircle size={18} className="shrink-0" />
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-2xl bg-black px-6 py-4.5 text-sm font-bold text-white shadow-2xl shadow-black/10 transition-all hover:bg-[#1a1a1a] active:scale-[0.98] disabled:opacity-50"
          >
            <div className="flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Vérification...</span>
                </>
              ) : (
                <>
                  <span>se connecter</span>
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </div>
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-sm text-gray-500 font-medium">
            Nouveau sur la plateforme ?{' '}
            <Link href="/auth/register" className="text-black font-bold hover:underline underline-offset-4 decoration-2">
              Créer un profil
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}