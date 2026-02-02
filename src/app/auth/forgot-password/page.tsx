'use client'; 
// Indique à Next.js que ce composant s’exécute côté client

import { useState } from 'react'; 
// Hook React pour gérer l’état local

import {
  Mail,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2
} from "lucide-react"; 
// Icônes (elles seront mockées côté Jest)

import { motion, AnimatePresence } from 'framer-motion'; 
// Animations (également mockées en test)

import { createBrowserClient } from '@supabase/ssr'; 
// Client Supabase (source fréquente d’erreurs en test)

import Link from 'next/link'; 
// Composant Link de Next.js (mocké en test)

export default function ForgotPasswordPro() {
  // État pour l’email saisi
  const [email, setEmail] = useState('');

  // État de chargement du bouton
  const [loading, setLoading] = useState(false);

  // État du message (succès ou erreur)
  const [status, setStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Initialisation du client Supabase
  // Les variables d’environnement seront mockées en test
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Handler du formulaire
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de page
    setLoading(true);   // Active le loader
    setStatus(null);    // Reset du statut

    // Appel Supabase pour la réinitialisation
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    // Gestion de l’erreur
    if (error) {
      setStatus({ type: 'error', message: error.message });
    } else {
      // Cas succès
      setStatus({
        type: 'success',
        message: 'Un lien sécurisé a été envoyé. Vérifiez votre boîte mail.'
      });
    }

    setLoading(false); // Fin du chargement
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[420px] mx-auto min-h-screen p-4">
      {/* Carte principale animée */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} // Animation d’entrée
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white border border-gray-200 p-8 rounded-[40px] shadow-xl"
      >
        {/* En-tête */}
        <div className="flex justify-between items-start mb-8">
          <h3 className="text-2xl font-black text-black">
            {status?.type === 'success' ? "Lien envoyé !" : "Récupération"}
          </h3>

          {/* Lien retour login */}
          <Link href="/auth/login">
            <X size={20} />
          </Link>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleReset} className="space-y-6">
          <p className="text-sm text-gray-500 font-medium">
            {status?.type === 'success'
              ? "Nous avons envoyé un lien de réinitialisation."
              : "Entrez votre adresse email."}
          </p>

          {/* Champ email */}
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2" size={20} />
            <input
              required
              type="email"
              value={email}
              disabled={status?.type === 'success'}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Message animé */}
          <AnimatePresence>
            {status && (
              <motion.div>
                {status.type === 'success'
                  ? <CheckCircle2 size={18} />
                  : <AlertCircle size={18} />}
                {status.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bouton submit */}
          <button type="submit" disabled={loading}>
            {loading ? <Loader2 /> : "Envoyer"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
