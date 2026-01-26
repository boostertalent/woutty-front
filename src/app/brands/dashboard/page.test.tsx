// app/brands/dashboard/page.tsx
"use client";
import Link from 'next/link';
import { Users, Target, Zap, BarChart3, Search } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';

export default function BrandDashboard() {
  return (
    <div className="max-w-7xl mx-auto p-8 bg-[#F9FAFB] min-h-screen">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#111827]">Dashboard Marque</h1>
          <p className="text-gray-500">Gérez vos campagnes et découvrez des talents.</p>
        </div>
      <Link href="/brands/auth/campagne" className="block">
  <button className="bg-[#D4A017] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#B88A14] transition-all shadow-lg shadow-[#D4A017]/20 w-full md:w-auto">
    <Zap size={18} fill="currentColor" /> 
    Créer une campagne
  </button>
</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Budget Total" value="1,250,000 CFA" icon={<Target size={24} />} />
        <StatCard title="Collaborations" value="12" icon={<Users size={24} />} trend="+2" />
        <StatCard title="Vues Totales" value="850K" icon={<BarChart3 size={24} />} />
        <StatCard title="Score IA Moyen" value="88%" icon={<Zap size={24} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Campagnes en cours */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold mb-4">Campagnes Actives</h2>
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-6 rounded-[24px] border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#D4A017]/10 rounded-full flex items-center justify-center text-[#D4A017] font-bold">C{i}</div>
                <div>
                  <h3 className="font-bold">Campagne Été 2026 #{i}</h3>
                  <p className="text-xs text-gray-400">Objectif: Notoriété • Budget: 250k CFA</p>
                </div>
              </div>
              <button className="text-sm font-bold text-[#D4A017] hover:underline">Détails</button>
            </div>
          ))}
        </div>

        {/* Suggestions basées sur info_profile */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100">
          <h2 className="text-xl font-bold mb-6">Matchs suggérés (IA)</h2>
          <div className="space-y-6">
            {/* Ici vous bouclerez sur vos données info_profile */}
            {[1, 2, 3].map((u) => (
              <div key={u} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div>
                    <p className="font-bold text-sm">Influenceur {u}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Instagram • 150K</p>
                  </div>
                </div>
                <div className="bg-green-50 text-green-600 text-[10px] font-black px-2 py-1 rounded-md">9{u}% MATCH</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}