"use client"; 
// Indique à Next.js que ce composant s’exécute côté client

import { useEffect, useState } from "react"; 
// Hooks React pour gérer l’état et les effets

import { createBrowserClient } from "@supabase/ssr"; 
// Client Supabase compatible Next.js (évite les erreurs SSR/Jest)

import { useRouter } from "next/navigation"; 
// Router Next.js (App Router)

import { Lock, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react"; 
// Icônes (à mocker en test)

import { motion, AnimatePresence } from "framer-motion"; 
// Animations (à mocker en test)

export default function ResetPasswordPage() {
  const router = useRouter(); // Gestion de la navigation

  const [password, setPassword] = useState(""); // Mot de passe saisi
  const [loading, setLoading] = useState(false); // État de chargement
  const [error, setError] = useState<string | null>(null); // Message d’erreur
  const [ready, setReady] = useState(false); // Indique si la session est valide

  // Initialisation du client Supabase avec les variables d’environnement
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "test-key"
  );

  useEffect(() => {
    // Vérifie la présence d’une session valide
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setReady(true);
      }
    };

    checkSession();

    // Écoute les changements d’état d’authentification
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setReady(true);
        }
      }
    );

    // Nettoyage du listener
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [supabase]);

  // Soumission du formulaire de reset
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message); // Affiche l’erreur
      setLoading(false);
    } else {
      // Déconnexion + redirection vers login
      await supabase.auth.signOut();
      router.replace("/auth/login?reset=success");
    }
  };

  // État intermédiaire tant que la session n’est pas prête
  if (!ready) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" />
        <p>Vérification de la session sécurisée…</p>
      </div>
    );
  }

  // UI principale
  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }} // Animation d’entrée
        animate={{ opacity: 1, y: 0 }}
      >
        <form onSubmit={handleReset}>
          <Lock />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />

          <AnimatePresence>
            {error && (
              <motion.div>
                <AlertCircle />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button disabled={loading} type="submit">
            {loading ? <Loader2 className="animate-spin" /> : "Confirmer"}
            <CheckCircle2 />
          </button>
        </form>

        <ShieldCheck />
      </motion.div>
    </div>
  );
}
