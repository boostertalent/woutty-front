"use client";

import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MatchingAnalysis() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Analyse des profils...");
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 40); // Environ 4 secondes au total

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress === 30) setStatus("Scan de l'audience cible...");
    if (progress === 60) setStatus("Calcul du ROI prédictif...");
    if (progress === 90) setStatus("Finalisation de la sélection...");
    if (progress === 100) {
      // Redirection finale après l'animation
      setTimeout(() => router.push('/brands/dashboard'), 1000);
    }
  }, [progress, router]);

  return (
    <main className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-[#D4A017]/10 rounded-full flex items-center justify-center mx-auto">
            {progress < 100 ? (
              <Loader2 className="text-[#D4A017] animate-spin" size={40} />
            ) : (
              <CheckCircle2 className="text-green-500 animate-bounce" size={40} />
            )}
          </div>
          <Sparkles className="absolute -top-2 -right-2 text-[#D4A017] animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-serif font-bold text-[#111827]">
            {progress < 100 ? "IA en pleine action" : "Matching Terminé !"}
          </h2>
          <p className="text-gray-500 text-sm">{status}</p>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-[#D4A017] h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-gray-400 italic">
          Cette opération prend généralement moins de 5 secondes...
        </p>
      </div>
    </main>
  );
}