'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Loader2, 
  AlertCircle, 
  Mail, 
  Eye, 
  EyeOff, 
  ChevronLeft,
  Lock
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.identifier.trim(),
        password: formData.password,
      });

      if (error || !data.user) throw error;

      const userId = data.user.id;
      
      const [creator, brand] = await Promise.all([
        supabase.from('createur').select('id_w').eq('id_w', userId).maybeSingle(),
        supabase.from('marque').select('id_w').eq('id_w', userId).maybeSingle()
      ]);

      if (creator.data) {
        router.replace('/creators/dashboard');
      } else if (brand.data) {
        router.replace('/brands/dashboard');
      } else {
        setErrorMsg("Profil introuvable.");
      }
    } catch (err: any) {
      setErrorMsg("Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center p-4">
      
      {/* Bouton Retour */}
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors">
        <ChevronLeft size={20} />
        <span className="font-medium">Accueil</span>
      </Link>

      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tighter text-zinc-900">Woutty</h1>
          <p className="text-zinc-500 mt-2 font-medium">Heureux de vous revoir</p>
        </div>

        {/* Bouton Google - Design Flat */}
        <button 
          type="button" 
          className="w-full flex items-center justify-center gap-3 bg-zinc-100 text-zinc-700 font-bold py-3.5 px-4 rounded-xl hover:bg-zinc-200 transition-all"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Continuer avec Google
        </button>

        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 text-zinc-400 font-bold tracking-widest">Ou</span>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type="email"
                placeholder="Email"
                className="w-full bg-zinc-100 border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-yellow-400 outline-none transition-all text-zinc-900 font-medium"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe"
                className="w-full bg-zinc-100 border-none rounded-xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-yellow-400 outline-none transition-all text-zinc-900 font-medium"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="text-red-500 text-sm font-bold px-1 flex items-center gap-2">
              <AlertCircle size={14} />
              {errorMsg}
            </div>
          )}

          {/* Bouton Se connecter en JAUNE */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'SE CONNECTER'}
          </button>
        </form>
      </div>
    </div>
  );
}