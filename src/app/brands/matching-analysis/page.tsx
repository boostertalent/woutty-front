"use client";

import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function MatchingAnalysis() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Analyse des profils...");
  const router = useRouter();
  const searchParams = useSearchParams();
  const id_t_campagne = searchParams.get('campaign');

  useEffect(() => {
    // Vérifier qu'on a bien un campaignId
    if (!id_t_campagne) {
      router.push('/brands/dashboard');
      return;
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 40);

    return () => clearInterval(timer);
  }, [id_t_campagne, router]);

  useEffect(() => {
    if (progress === 30) setStatus("Scan de l'audience cible...");
    if (progress === 60) setStatus("Calcul du ROI prédictif...");
    if (progress === 90) setStatus("Finalisation de la sélection...");
    if (progress === 100) {
      setTimeout(() => {
        router.push(`/brands/dashboard/campaign-results?campaign=${id_t_campagne}`);
      }, 1000);
    }
  }, [progress, router,id_t_campagne]);

  return (
    <main
      data-testid="matching-analysis-page"
      className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-8"
    >
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
