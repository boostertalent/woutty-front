'use client';
// Indique que le composant s’exécute côté client (hooks, router, window…)

import { useState } from 'react';
// Hook d’état React

import { useRouter } from 'next/navigation';
// Router App Router (mocké en test)

import Link from 'next/link';
// Lien Next.js (mocké en test)

import { createBrowserClient } from '@supabase/ssr';
// Client Supabase (mocké en test)

import {
  Loader2,
  AlertCircle,
  Mail,
  Eye,
  EyeOff,
  ChevronLeft
} from 'lucide-react';
// Icônes (mockées en test)

import { motion } from 'framer-motion';
// Animation (mockée en test)

export default function LoginPage() {
  const router = useRouter(); // Navigation
  const [loading, setLoading] = useState(false); // État du bouton
  const [showPassword, setShowPassword] = useState(false); // Affichage mdp
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // Message erreur

  // Données du formulaire
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  // Client Supabase mémorisé une seule fois
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  // Soumission du formulaire
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();        // Empêche reload
    setLoading(true);          // Active loader
    setErrorMsg(null);         // Reset erreur

    try {
      // Connexion Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.identifier.trim(),
        password: formData.password,
      });

      if (error || !data.user) throw error;

      const userId = data.user.id;

      // Synchronisation session
      router.refresh();

      // Vérifie créateur
      const { data: creator } = await supabase
        .from('createur')
        .select('id_w')
        .eq('id_w', userId)
        .maybeSingle();

      if (creator) {
        setTimeout(() => router.push('/creators/dashboard'), 100);
        return;
      }

      // Vérifie marque
      const { data: brand } = await supabase
        .from('marque')
        .select('id_w')
        .eq('id_w', userId)
        .maybeSingle();

      if (brand) {
        setTimeout(() => router.push('/brands/dashboard'), 100);
        return;
      }

      // Aucun profil métier trouvé
      setErrorMsg("Votre profil est en cours de configuration ou introuvable.");
    } catch {
      // Erreur globale
      setErrorMsg("Identifiants incorrects ou compte non validé.");
    } finally {
      setLoading(false); // Stop loader
    }
  };

  // Connexion Google
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch {
      setErrorMsg("Erreur lors de la connexion avec Google.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Lien retour accueil */}
      <Link href="/">
        <ChevronLeft /> Accueil
      </Link>

      {/* Carte animée */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1>Woutty</h1>

        {/* Bouton Google */}
        <button type="button" onClick={handleGoogleLogin}>
          Continuer avec Google
        </button>

        {/* Formulaire */}
        <form onSubmit={handleLogin}>
          <Mail />
          <input
            type="email"
            value={formData.identifier}
            onChange={(e) =>
              setFormData({ ...formData, identifier: e.target.value })
            }
          />

          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>

          {/* Message d’erreur */}
          {errorMsg && (
            <div>
              <AlertCircle /> {errorMsg}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}>
            {loading ? <Loader2 /> : 'Accéder à mon espace'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
