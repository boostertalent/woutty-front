'use client';

import { motion } from 'framer-motion';
import { 
  Sparkles, Check, ArrowRight, Star, 
  Layers, Zap, Shield, Globe 
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { FcGoogle } from 'react-icons/fc';

export default function CreatorLandingPage() {

  // Fonction pour se connecter avec Google
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/creators/dashboard`
      },
    });
    if (error) console.error('Erreur Google login:', error.message);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-black font-sans selection:bg-black selection:text-white overflow-x-hidden">
      
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-zinc-50 to-transparent pointer-events-none -z-10" />

      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-8 max-w-7xl mx-auto relative z-50">
        <div className="text-4xl font-black italic tracking-tighter">W.</div>
        
        <div className="flex items-center gap-4">
          <Link href="/creators/auth/login" className="text-sm font-black bg-black text-white px-8 py-3 rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all">
            Connexion
          </Link>
          <Link href="/creators/auth/register" className="text-sm font-black bg-black text-white px-8 py-3 rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all">
            S'inscrire
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="flex flex-col items-center text-center space-y-12">
          
          {/* Badge Animé */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 bg-black/[0.03] border border-black/[0.05] px-5 py-2 rounded-full">
            <Sparkles size={14} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">L'ère des créateurs d'élite</span>
          </motion.div>

          {/* Hero Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="max-w-4xl space-y-8">
            <h1 className="text-7xl md:text-[110px] font-black tracking-tighter leading-[0.85]">
              Propulsez votre <br />
              <span className="italic text-transparent bg-clip-text bg-gradient-to-tr from-gray-400 to-gray-200">influence.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
              La plateforme tout-en-un pour les créateurs qui veulent transformer leur passion en un empire digital.
            </p>
          </motion.div>

          {/* Boutons d'action principaux */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row gap-6 w-full max-w-lg justify-center pt-8">
            
            {/* Inscription classique */}
            <Link href="/creators/auth/register" className="group flex-1 bg-black text-white h-20 rounded-[2rem] flex items-center justify-center gap-4 text-xl font-black hover:scale-[1.02] transition-all shadow-2xl shadow-black/20">
              Commencer <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </Link>

            {/* Connexion Google */}
            <button onClick={handleGoogleLogin} className="flex items-center justify-center gap-2 flex-1 bg-white border border-gray-200 text-black h-20 rounded-[2rem] font-bold hover:shadow-md transition-all">
              <FcGoogle size={24} /> Connexion avec Google
            </button>

          </motion.div>

          {/* Grille fonctionnalités */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-20">
            {[{ icon: <Check />, title: "Vérifié", desc: "Rejoignez une communauté exclusive de créateurs certifiés." },
              { icon: <Star />, title: "Opportunités", desc: "Accédez à des campagnes premium avec des marques de renom." },
              { icon: <Layers />, title: "Tout-en-un", desc: "Gérez vos collaborations, paiements et analyses en un seul endroit." },
              { icon: <Zap />, title: "Boostez", desc: "Augmentez votre visibilité grâce à nos outils de promotion intégrés." },
              { icon: <Shield />, title: "Sécurité", desc: "Protégez votre contenu et vos revenus avec nos fonctionnalités avancées." },
              { icon: <Globe />, title: "Global", desc: "Connectez-vous au monde." }].map((feat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i*0.1 }} className="p-10 rounded-[3rem] bg-zinc-50 border border-zinc-100 text-left hover:bg-white hover:shadow-xl transition-all group">
                <div className="mb-6 p-4 bg-white rounded-2xl w-fit shadow-sm group-hover:scale-110 transition-transform">{feat.icon}</div>
                <h3 className="text-xl font-black mb-2">{feat.title}</h3>
                <p className="text-gray-500 font-medium">{feat.desc}</p>
              </motion.div>
          ))}
          </section>

          {/* Social Proof */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="pt-20 flex flex-col items-center gap-4">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-12 w-12 rounded-full border-4 border-white bg-zinc-200 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                </div>
              ))}
            </div>
            <p className="text-sm font-bold text-gray-400 tracking-tight">
              Rejoint par plus de <span className="text-black">+500 créateurs</span> ce mois-ci
            </p>
          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-100 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">
          © 2025 Woutty — Built for the bold
        </p>
      </footer>
    </div>
  );
}
