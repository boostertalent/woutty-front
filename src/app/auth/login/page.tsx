'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2, AlertCircle, Mail, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { BRANDS } from '@/data/brands';

function BrandMarquee() {
  const items = [...BRANDS, ...BRANDS].slice(0, 18);
  return (
    <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-white">
      <div className="flex gap-4 py-4 px-4">
        <div className="flex gap-4 w-max animate-[authMarquee_26s_linear_infinite]">
          {items.map((b, i) => (
            <div
              key={`${b.name}-${i}`}
              className="h-12 w-28 rounded-2xl border border-black/5 bg-white flex items-center justify-center overflow-hidden"
              title={b.name}
            >
              <img src={b.img} alt={b.name} className="max-h-9 max-w-[92px] object-contain opacity-90" draggable={false} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({ identifier: '', password: '' });

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.identifier.trim(),
        password: formData.password,
      });
      if (authError) throw authError;
      if (authData.user) {
        const userId = authData.user.id;

        // 1. Vérifier admin secondaire
        const { data: adminData } = await supabase
          .from('admin')
          .select('id_w, role')
          .eq('id_w', userId)
          .maybeSingle();
        if (adminData) {
          router.push('/admin/dashboard');
          router.refresh();
          return;
        }

        // 2. Vérifier créateur
        const { data: creatorData } = await supabase
          .from('createur')
          .select('id_w, role')
          .eq('id_w', userId)
          .maybeSingle();
        if (creatorData) {
          if (creatorData.role === 'admin') {
            router.push('/admin/dashboard');
          } else {
            router.push('/creators/dashboard');
          }
          router.refresh();
          return;
        }

        // 3. Vérifier marque
        const { data: brandData } = await supabase
          .from('marque')
          .select('id_w')
          .eq('id_w', userId)
          .maybeSingle();
        if (brandData) {
          router.push('/brands/auth/dashboard');
          router.refresh();
          return;
        }

        setErrorMsg("Votre profil est introuvable. Veuillez contacter le support.");
      }
    } catch {
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
          queryParams: { prompt: 'select_account', access_type: 'offline' },
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch {
      setErrorMsg("Erreur lors de la connexion avec Google.");
    }
  };

  // Affiche un message clair si l'utilisateur arrive après OAuth
  // (ex: callback redirect sur `/auth/login?error=profile_not_found`)
  useEffect(() => {
    const err = searchParams.get('error');
    if (!err) return;
    // Ne pas écraser une erreur déjà générée par la connexion manuelle
    setErrorMsg((prev) => {
      if (prev) return prev;
      if (err === 'profile_not_found') {
        return "Connexion Google réussie, mais aucun profil n'existe encore. Veuillez créer votre profil (créateur ou marque).";
      }
      if (err === 'auth_failed') {
        return "Erreur lors de la connexion Google. Réessayez.";
      }
      return "Une erreur est survenue pendant la connexion. Réessayez.";
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-2 text-sm font-black hover:bg-black/10 transition-colors"
          >
            <ChevronLeft size={18} />
            Accueil
          </Link>
        </div>

        <div className="mt-10 grid lg:grid-cols-2 gap-10 items-center">
          {/* Colonne inspiration */}
          <div className="hidden lg:block">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-xl"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-booster-yellow animate-pulse" />
                <span className="text-[11px] font-black tracking-[0.24em] uppercase text-black/70">
                  Connexion sécurisée
                </span>
              </div>

              <h1 className="mt-6 text-[44px] xl:text-[56px] font-black leading-[0.96] tracking-tight text-black">
                Connecte.
                <span className="block text-black">Collabore.</span>
                <span className="block text-black">
                  Mesure. <span className="text-black underline decoration-booster-yellow decoration-4 underline-offset-[0.18em]">Optimise.</span>
                </span>
              </h1>

              <p className="mt-5 text-black text-lg leading-relaxed max-w-lg">
                Un espace de travail pensé comme un studio : briefs, créateurs, livrables, KPIs. Tout au même endroit.
              </p>

              <div className="mt-7 max-w-lg space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-black text-black">Workflow en 3 temps</div>
                      <div className="mt-1 text-xs font-semibold text-black/70">
                        Simple, fluide, sécurisé.
                      </div>
                    </div>
                    <div className="text-xs font-black text-black/70">2 min</div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {[
                      { n: "01", t: "Brief", d: "Définis l’objectif & le style." },
                      { n: "02", t: "Matching", d: "Choisis des profils pertinents." },
                      { n: "03", t: "Résultats", d: "Valide & mesure la performance." },
                    ].map((s) => (
                      <div key={s.n} className="flex items-start gap-3">
                        <div className="text-[11px] font-black text-black/60 min-w-[2.5rem]">
                          {s.n}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-black text-black">{s.t}</div>
                          <div className="text-xs text-black/70">{s.d}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-black tracking-[0.24em] uppercase text-black/60">Preuve sociale</div>
                  <div className="mt-2 flex items-end justify-between gap-4">
                    <div className="text-black">
                      <div className="text-lg font-black">+30 créateurs</div>
                      <div className="text-xs text-black/70">et des marques qui reviennent.</div>
                    </div>
                    <div className="text-2xl font-black text-black">98%</div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <div className="text-xs font-black tracking-[0.24em] uppercase text-black/60 mb-3">
                  Marques & partenaires
                </div>
                <BrandMarquee />
              </div>
            </motion.div>
          </div>

          {/* Carte connexion */}
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="mx-auto w-full max-w-[520px]"
          >
            <div className="relative overflow-hidden rounded-[40px] border border-black/10 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
              <div className="relative p-8 md:p-10 text-black">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="text-[11px] font-black tracking-[0.28em] uppercase text-black/60">Woutty</div>
                    <h2 className="mt-2 text-3xl md:text-4xl font-black tracking-tight">
                      Se connecter
                    </h2>
                    <p className="mt-2 text-sm text-black/70">
                      Accès rapide. Design net. Sécurité maximale.
                    </p>
                  </div>
                  <div className="hidden sm:flex flex-col items-end">
                    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[10px] font-black tracking-[0.24em] uppercase text-black/80">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      En ligne
                    </div>
                  </div>
                </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mt-7 w-full flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 py-4 font-black transition-all shadow-sm active:scale-95"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </button>

            <div className="relative my-7 text-center">
              <hr className="border-black/10" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] font-black uppercase tracking-[0.28em] text-black/60">
                OU
              </span>
            </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.24em] ml-1 text-black/80">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-black/60" />
                <input
                  type="email" required
                  className="w-full rounded-2xl border border-black/15 bg-white pl-12 pr-5 py-4 outline-none transition-all font-black text-black placeholder:text-black/40 focus:border-black focus:ring-2 focus:ring-black/20"
                  placeholder="nom@exemple.com"
                  value={formData.identifier}
                  onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black uppercase tracking-[0.24em] text-black/80">Mot de passe</label>
                <Link href="/auth/forgot-password" className="text-xs font-black text-black hover:text-black/70 transition-colors">Oublié ?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"} required
                  className="w-full rounded-2xl border border-black/15 bg-white px-6 py-4 outline-none transition-all font-black text-black placeholder:text-black/40 focus:border-black focus:ring-2 focus:ring-black/20"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-black/60 hover:text-black">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 bg-red-100 p-4 rounded-2xl text-red-700 text-sm font-black border border-red-300">
                <AlertCircle size={18} /> {errorMsg}
              </motion.div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-black text-white py-4 rounded-2xl font-black text-base md:text-lg shadow-xl shadow-black/25 hover:bg-black/90 disabled:bg-slate-200 disabled:text-slate-400 active:scale-[0.98] flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "Accéder à mon espace"}
            </button>
          </form>

          <p className="text-center mt-8 text-sm font-semibold text-black/80">
            Nouveau sur Woutty ?{' '}
            <Link href="/auth" className="text-black font-black hover:underline underline-offset-4">Créer un compte</Link>
          </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes authMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}