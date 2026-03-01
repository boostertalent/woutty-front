"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Mail, Sparkles, PartyPopper } from 'lucide-react';

export default function RegistrationSuccess() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem('signup_email');
    setUserEmail(email);
  }, []);

  // Fonction pour nettoyer et naviguer
  const handleFinalize = (destination: 'login' | 'home') => {
    const keys = [
      'signup_email',
      'signup_name',
      'signup_phone',
      'signup_niche',
      'signup_avatar',
      'signup_avatar_file',
      'signup_password',
      'signup_role',
      'selectedNiches'
    ];
    
    keys.forEach(k => localStorage.removeItem(k));

    // Naviguer
    if (destination === 'login') {
      router.push('/auth/login');
    } else {
      router.push('/');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white border border-gray-200 rounded-[40px] p-8 md:p-12 w-full max-w-2xl shadow-xl text-center relative overflow-hidden"
      >
        {/* Barre supérieure dorée */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#ceaf4a] via-[#d4a017] to-[#ceaf4a]" />
        
        {/* Icône décorative */}
        <Sparkles className="absolute top-10 right-10 text-[#ceaf4a]/20" size={40} />

        {/* Icône de succès */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25" />
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-6 rounded-full relative shadow-lg">
              <CheckCircle2 size={60} className="text-green-600" strokeWidth={2} />
            </div>
          </div>
        </motion.div>

        {/* Titre */}
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          Inscription <span className="text-[#ceaf4a]">réussie !</span>
        </h1>

        <p className="text-xl text-gray-600 mb-8 font-medium">
          Bienvenue dans la communauté <span className="font-bold text-[#ceaf4a]">Woutty</span> 🎉
        </p>

        {/* Info email */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 rounded-3xl p-6 mb-10 flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#ceaf4a]/10 to-[#d4a017]/10 rounded-2xl flex items-center justify-center mb-4">
            <Mail className="text-[#ceaf4a]" size={32} />
          </div>
          <h3 className="font-black text-gray-800 mb-2 text-lg">Vérifiez votre boîte mail</h3>
          <p className="text-gray-500 text-sm text-center max-w-md">
            Un lien de confirmation a été envoyé à :<br/>
            <span className="font-bold text-gray-900 text-base mt-2 block">{userEmail || "votre adresse email"}</span>
          </p>
        </motion.div>

        {/* Instructions */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8">
          <p className="text-amber-800 text-sm font-medium">
            💡 <strong>Conseil :</strong> Pensez à regarder dans vos courriers indésirables (spams).
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => handleFinalize('login')}
              className="px-10 py-4 bg-gradient-to-r from-[#ceaf4a] to-[#d4a017] text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-[#ceaf4a]/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <Mail size={20} />
              Aller à la connexion
            </button>

            <button 
              onClick={() => handleFinalize('home')}
              className="px-10 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
            >
              Retour à l'accueil
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            Vous ne trouvez pas l'email ? Contactez-nous à <a href="mailto:support@woutty.com" className="text-[#ceaf4a] font-bold hover:underline">support@woutty.com</a>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-center gap-2 text-[#ceaf4a] font-black text-sm uppercase tracking-widest">
          <PartyPopper size={18} />
          C'est le début de l'aventure
        </div>
      </motion.div>

      {/* Animation de confettis */}
      <style jsx global>{`
        @keyframes confetti {
          0% { transform: translateY(-100vh) rotate(0deg); }
          100% { transform: translateY(100vh) rotate(720deg); }
        }
      `}</style>
    </main>
  );
}
