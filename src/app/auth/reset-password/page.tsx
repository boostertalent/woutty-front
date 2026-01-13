"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr"; // Utilisation du client SSR pour plus de fiabilité
import { useRouter } from "next/navigation";
import { Lock, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Initialisation du client Supabase avec les clés de ton ami
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkSession = async () => {
      // Vérifie si l'utilisateur a un ticket de récupération valide
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setReady(true);
      }
    };

    checkSession();

    // Écoute les changements d'état (PASSWORD_RECOVERY est déclenché par le lien d'email)
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Mise à jour du mot de passe dans la base AUTH
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Succès : on déconnecte et on redirige vers le login
      await supabase.auth.signOut();
      router.replace("/auth/login?reset=success");
    }
  };

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-400 gap-4">
        <Loader2 className="animate-spin" size={24} />
        <p className="text-sm font-medium">Vérification de la session sécurisée...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] bg-white p-8 rounded-[32px] shadow-2xl shadow-gray-200/50"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-[#ceaf4a]/10 rounded-2xl flex items-center justify-center text-[#ceaf4a] mb-4">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nouveau mot de passe</h1>
          <p className="text-xs text-gray-400 mt-2 font-medium uppercase tracking-widest">Sécurisez votre compte</p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                required
                minLength={8}
                placeholder="Minimum 8 caractères"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-100 px-12 py-4 rounded-2xl text-black font-semibold outline-none focus:bg-white focus:ring-4 focus:ring-[#ceaf4a]/5 transition-all placeholder:text-gray-300 placeholder:font-normal"
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-[#ceaf4a] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:bg-gray-100 disabled:text-gray-400"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                Confirmer le changement
                <CheckCircle2 size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
            Woutty Security Protocol
          </p>
        </div>
      </motion.div>
    </div>
  );
}