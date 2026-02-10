"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Lock, Loader2, CheckCircle2, AlertCircle, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // État pour l'œil
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setReady(true);
      }
    };
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady(true);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [supabase]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      await supabase.auth.signOut();
      router.replace("/auth/login?reset=success");
    }
  };

  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="text-[#ceaf4a]" size={40} />
        </motion.div>
        <p className="mt-4 text-gray-400 font-medium animate-pulse">Sécurisation de la session...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-sans">
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] bg-white border border-gray-100 p-10 rounded-[45px] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.1)] text-center"
      >
        <div className="inline-flex p-5 rounded-3xl bg-gray-50 text-[#ceaf4a] mb-6">
          <ShieldCheck size={40} strokeWidth={1.5} />
        </div>

        <h1 className="text-3xl font-black text-black mb-2">Nouveau mot de passe</h1>
        <p className="text-gray-400 text-sm font-medium mb-10">
          Choisissez un mot de passe robuste pour protéger votre compte Woutty.
        </p>

        <form onSubmit={handleReset} className="space-y-6 text-left">
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            
            <input
              type={showPassword ? "text" : "password"} // Bascule le type ici
              placeholder="Minimum 8 caractères"
              className="w-full pl-14 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-[#ceaf4a] focus:ring-4 focus:ring-[#ceaf4a]/5 outline-none transition-all text-black font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />

            {/* Bouton de l'œil */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ceaf4a] transition-colors p-1"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-black text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-[#ceaf4a] disabled:bg-gray-200 disabled:text-gray-400 active:scale-95 shadow-lg shadow-gray-100"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Confirmer le changement
                <CheckCircle2 size={18} />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-[11px] text-gray-300 uppercase tracking-widest font-bold">
          Connexion sécurisée par Woutty Protocol
        </p>
      </motion.div>
    </main>
  );
}