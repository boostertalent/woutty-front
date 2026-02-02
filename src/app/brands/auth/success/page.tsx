"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Mail, Sparkles, PartyPopper } from 'lucide-react';

export default function RegistrationSuccess() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const email = localStorage.getItem('signup_email');
    setUserEmail(email);
  }, []);

  // Fonction exportable pour tests
  const handleFinalize = () => {
    const keys = ['signup_email','signup_name','signup_phone','signup_niche','signup_avatar'];
    keys.forEach(k => localStorage.removeItem(k));
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white border border-gray-200 rounded-[40px] p-8 md:p-12 w-full max-w-2xl shadow-xl text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-[#ceaf4a]" />
        <Sparkles className="absolute top-10 right-10 text-[#ceaf4a]/20" size={40} />

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25" />
            <div className="bg-green-100 p-6 rounded-full relative">
              <CheckCircle2 size={60} className="text-green-600" strokeWidth={1.5} />
            </div>
          </div>
        </motion.div>

        <h1 className="text-4xl font-bold mb-4">
          Inscription <span className="text-[#ceaf4a]">réussie !</span>
        </h1>

        <p className="text-xl text-gray-600 mb-8 font-medium">
          Bienvenue dans la communauté <span className="font-bold">Woutty</span>.
        </p>

        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-50 border border-gray-100 rounded-3xl p-6 mb-10 flex flex-col items-center"
        >
          <Mail className="text-[#ceaf4a] mb-3" size={30} />
          <h3 className="font-bold text-gray-800 mb-2">Vérifiez votre boîte mail</h3>
          <p className="text-gray-500 text-sm">
            Un lien de confirmation a été envoyé à :<br/>
            <span className="font-bold text-gray-900">{userEmail || "votre adresse email"}</span>
          </p>
        </motion.div>

        <div className="space-y-4">
          <p className="text-gray-400 text-sm italic">
            Pensez à regarder dans vos courriers indésirables (spams).
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {/* Utilisation d'un bouton pour les tests */}
            <button 
              onClick={handleFinalize}
              className="px-10 py-4 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Aller à la connexion
            </button>

            <button 
              onClick={handleFinalize}
              className="px-10 py-4 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-center gap-2 text-[#ceaf4a] font-bold text-sm uppercase tracking-widest">
          <PartyPopper size={18} />
          C'est le début de l'aventure
        </div>
      </motion.div>
    </main>
  );
}
