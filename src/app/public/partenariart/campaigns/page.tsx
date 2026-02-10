"use client";

import React, { useState, useEffect } from 'react';
import { Search, Calendar, Building2, DollarSign, Users, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PublicCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Toutes');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('campaigns')
        .select(`
          *,
          marque:marque(nom_marque, domaine)
        `)
        .eq('status', 'active')
        .not('assigned_creator_id', 'is', null);

      if (filter !== 'Toutes') {
        query = query.eq('domaine', filter);
      }

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);

    } catch (err) {
      console.error("Erreur campagnes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCampaigns();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [filter, searchTerm]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 bg-[#FAFBFC] min-h-screen">
      
      {/* HEADER */}
      <div className="mb-12 space-y-6">
        <div>
          <h1 className="text-4xl font-serif font-black text-[#111827]">Campagnes Actives</h1>
          <p className="text-gray-500 mt-2">
            Découvrez les campagnes de collaboration en cours entre marques et créateurs.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher une campagne..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-[#D4A017] outline-none shadow-sm transition-all text-[#111827]"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['Toutes', 'Mode', 'Tech', 'Beauté', 'Sport', 'Cuisine'].map((domain) => (
              <button
                key={domain}
                onClick={() => setFilter(domain)}
                className={`px-6 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  filter === domain ? 'bg-[#111827] text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GRILLE DES CAMPAGNES */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 bg-gray-200 rounded-[32px]"></div>
          ))}
        </div>
      ) : campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id_t_campagne} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
          <Building2 className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-400 font-bold">Aucune campagne active ne correspond à votre recherche.</p>
        </div>
      )}
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: any }) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="group bg-white rounded-[32px] border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative flex flex-col h-full">
      <div className="h-48 bg-gradient-to-br from-[#D4A017]/20 to-[#FFD700]/20 relative overflow-hidden">
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
          Actif
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 className="text-[#D4A017]" size={48} />
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={16} className="text-[#D4A017]" />
          <span className="text-sm font-bold text-gray-600">
            {campaign.marque?.nom_marque || 'Marque'}
          </span>
        </div>

        <h3 className="text-xl font-black text-[#111827] mb-4 line-clamp-2">
          {campaign.title || 'Campagne sans titre'}
        </h3>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Budget</span>
            <span className="font-bold text-[#D4A017]">
              {formatNumber(parseFloat(campaign.budget || 0))} CFA
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Période</span>
            <span className="font-medium text-gray-700">
              {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
            </span>
          </div>
        </div>

        <div className="mt-auto">
          <Link href={`/brands/dashboard/details/${campaign.id_t_campagne}`}>
            <button className="w-full py-4 bg-[#F9FAFB] text-[#111827] rounded-2xl font-black text-sm group-hover:bg-[#D4A017] group-hover:text-white transition-all flex items-center justify-center gap-2">
              Voir les détails <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}