"use client";

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Package, Crown, Star, TrendingUp, Calendar, Building2, Mail, Phone, Loader2, AlertCircle } from 'lucide-react';

interface BrandPackData {
  brand_id: string;
  brand_name: string;
  brand_email: string;
  brand_phone: string | null;
  pack_id: string;
  pack_name: string;
  budget: number;
  duration_days: number;
  expected_posts: number;
  expected_creators: number;
  created_at: string;
  status: string;
}

const PACK_ICONS: Record<string, JSX.Element> = {
  'local-starter': <Package size={20} className="text-green-600" />,
  'regional-business': <Star size={20} className="text-[#D4A017]" fill="currentColor" />,
  'national-scale': <Crown size={20} className="text-purple-600" />
};

const PACK_COLORS: Record<string, string> = {
  'local-starter': 'from-green-50 to-emerald-50 border-green-200',
  'regional-business': 'from-yellow-50 to-amber-50 border-[#D4A017]/30',
  'national-scale': 'from-purple-50 to-violet-50 border-purple-200'
};

export default function AdminPacksView() {
  const [loading, setLoading] = useState(true);
  const [brandsWithPacks, setBrandsWithPacks] = useState<BrandPackData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchBrandPacks();
  }, []);

  const fetchBrandPacks = async () => {
    setLoading(true);
    setError(null);

    try {
      // Récupérer tous les brouillons avec les infos marque
      const { data: drafts, error: draftsError } = await supabase
        .from('campaign_drafts')
        .select(`
          *,
          marque:brand_id (
            nom_marque,
            email_marque,
            telephone_contact
          )
        `)
        .order('created_at', { ascending: false });

      if (draftsError) throw draftsError;

      const formattedData: BrandPackData[] = (drafts || []).map(draft => ({
        brand_id: draft.brand_id,
        brand_name: draft.marque?.nom_marque || 'Marque inconnue',
        brand_email: draft.marque?.email_marque || 'N/A',
        brand_phone: draft.marque?.telephone_contact || null,
        pack_id: draft.pack_id,
        pack_name: draft.pack_name,
        budget: draft.budget,
        duration_days: draft.duration_days,
        expected_posts: draft.expected_posts,
        expected_creators: draft.expected_creators,
        created_at: draft.created_at,
        status: draft.status
      }));

      setBrandsWithPacks(formattedData);
      console.log('✅ Packs chargés:', formattedData.length);

    } catch (err: any) {
      console.error('❌ Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredBrands = brandsWithPacks.filter(brand => {
    if (filter === 'all') return true;
    return brand.pack_id === filter;
  });

  const stats = {
    total: brandsWithPacks.length,
    localStarter: brandsWithPacks.filter(b => b.pack_id === 'local-starter').length,
    regionalBusiness: brandsWithPacks.filter(b => b.pack_id === 'regional-business').length,
    nationalScale: brandsWithPacks.filter(b => b.pack_id === 'national-scale').length,
    totalRevenue: brandsWithPacks.reduce((sum, b) => sum + b.budget, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 text-[#D4A017] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📦 Packs Sélectionnés par les Marques
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble des choix de packs et revenus potentiels
        </p>
      </div>

      {/* STATISTIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl border-2 border-gray-100">
          <p className="text-sm text-gray-500 font-bold mb-1">TOTAL MARQUES</p>
          <p className="text-3xl font-black text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200">
          <p className="text-sm text-green-600 font-bold mb-1">LOCAL STARTER</p>
          <p className="text-3xl font-black text-green-700">{stats.localStarter}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-2xl border-2 border-[#D4A017]/30">
          <p className="text-sm text-[#D4A017] font-bold mb-1">REGIONAL BUSINESS</p>
          <p className="text-3xl font-black text-[#D4A017]">{stats.regionalBusiness}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-2xl border-2 border-purple-200">
          <p className="text-sm text-purple-600 font-bold mb-1">NATIONAL SCALE</p>
          <p className="text-3xl font-black text-purple-700">{stats.nationalScale}</p>
        </div>
      </div>

      {/* REVENU TOTAL */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 rounded-2xl mb-8 ">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold mb-1 text-blue-100">REVENU POTENTIEL TOTAL</p>
            <p className="text-4xl font-black  text-gray-600">{stats.totalRevenue.toLocaleString('fr-FR')} FCFA</p>
          </div>
          <TrendingUp size={48} className="opacity-50" />
        </div>
      </div>

      {/* FILTRES */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
            filter === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tous ({stats.total})
        </button>
        <button
          onClick={() => setFilter('local-starter')}
          className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
            filter === 'local-starter'
              ? 'bg-green-600 text-white'
              : 'bg-green-50 text-green-700 hover:bg-green-100'
          }`}
        >
          Local Starter ({stats.localStarter})
        </button>
        <button
          onClick={() => setFilter('regional-business')}
          className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
            filter === 'regional-business'
              ? 'bg-[#D4A017] text-white'
              : 'bg-yellow-50 text-[#D4A017] hover:bg-yellow-100'
          }`}
        >
          Regional Business ({stats.regionalBusiness})
        </button>
        <button
          onClick={() => setFilter('national-scale')}
          className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
            filter === 'national-scale'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
          }`}
        >
          National Scale ({stats.nationalScale})
        </button>
      </div>

      {/* ERREUR */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="text-red-600 shrink-0" size={20} />
          <div>
            <p className="font-bold text-red-800">Erreur</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* LISTE DES MARQUES */}
      {filteredBrands.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-12 text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">
            {filter === 'all' 
              ? 'Aucune marque n\'a sélectionné de pack pour le moment'
              : `Aucune marque n'a sélectionné le pack ${filter}`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBrands.map((brand) => (
            <div
              key={brand.brand_id}
              className={`bg-gradient-to-r ${PACK_COLORS[brand.pack_id]} rounded-2xl p-6 border-2 transition-all hover:shadow-lg`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* INFOS MARQUE */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0">
                    {PACK_ICONS[brand.pack_id]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{brand.brand_name}</h3>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail size={14} />
                        <span className="truncate">{brand.brand_email}</span>
                      </div>
                      {brand.brand_phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={14} />
                          <span>{brand.brand_phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar size={14} />
                        <span>
                          {new Date(brand.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DÉTAILS DU PACK */}
                <div className="bg-white rounded-xl p-4 min-w-[280px]">
                  <div className="flex items-center gap-2 mb-3">
                    {PACK_ICONS[brand.pack_id]}
                    <p className="font-bold text-gray-900">{brand.pack_name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500 font-bold mb-1">Budget</p>
                      <p className="text-sm font-black text-gray-900">
                        {brand.budget.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500 font-bold mb-1">Durée</p>
                      <p className="text-sm font-black text-gray-900">
                        {brand.duration_days} jours
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500 font-bold mb-1">Posts</p>
                      <p className="text-sm font-black text-gray-900">
                        {brand.expected_posts}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-500 font-bold mb-1">Créateurs</p>
                      <p className="text-sm font-black text-gray-900">
                        {brand.expected_creators}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      brand.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {brand.status === 'draft' ? '📝 Brouillon' : '✅ Confirmé'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
