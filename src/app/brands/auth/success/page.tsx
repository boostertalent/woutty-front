"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, partyPopper, ArrowRight, sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Petit effet de confettis à l'arrivée
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#f3f3f3] flex items-center justify-center p-4 font-sans text-gray-900">
      <div className="bg-white rounded-[40px] shadow-sm w-full max-w-xl p-8 md:p-16 border border-gray-100 text-center relative overflow-hidden">
        
        {/* Décoration en arrière-plan */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#ceaf4a]" />
        
        {/* Icône de succès animée */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce duration-[2000ms]">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
              <Check size={40} className="text-white" strokeWidth={3} />
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4 tracking-tight">Félicitations !</h1>
        <p className="text-gray-500 text-lg mb-10 font-medium">
          Votre compte est désormais prêt. Bienvenue dans l'aventure !
        </p>

        <div className="space-y-4 max-w-sm mx-auto">
          <button 
            onClick={() => router.push('/brands/dashboard')}
            className="w-full bg-[#ceaf4a] text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-[#ceaf4a]/20 hover:bg-[#b8962f] hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            Accéder à mon espace <ArrowRight size={22} />
          </button>
          
          <p className="text-sm text-gray-400">
            Vous allez être redirigé vers votre tableau de bord.
          </p>
        </div>

        {/* Petits badges informatifs */}
        <div className="mt-12 pt-8 border-t border-gray-50 flex justify-center gap-6 text-gray-400">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Profil Vérifié
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Accès Illimité
          </div>
        </div>
      </div>
    </main>
  );
}