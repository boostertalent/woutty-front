"use client";

import React, { useState, useEffect } from 'react';
import { Search, Globe, ArrowUpRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TalentCatalogue() {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. FONCTION DE RÉCUPÉRATION SÉCURISÉE
  async function fetchCreators() {
    try {
      setLoading(true);
      
      // Construction de la requête
      let query = supabase
        .from('info_profile')
        .select('*');

      // Filtre par plateforme
      if (filter !== 'Tous') {
        query = query.eq('la_plateforme', filter);
      }

      // Recherche par nom (si l'utilisateur tape quelque chose)
      if (searchTerm) {
        query = query.ilike('nom_complet', `%${searchTerm}%`);
      }

      const { data, error } = await query.order('nbre_followers', { ascending: false });

      if (error) throw error;
      setCreators(data || []);

    } catch (err) {
      console.error("Erreur Catalogue:", err);
    } finally {
      setLoading(false);
    }
  }

  // 2. DÉCLENCHEUR (Refresh quand le filtre ou la recherche change)
  useEffect(() => {
    // Petit délai pour la recherche pour éviter trop de requêtes (Debounce)
    const delayDebounce = setTimeout(() => {
      fetchCreators();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [filter, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 bg-[#FAFBFC] min-h-screen">
      
      {/* HEADER & RECHERCHE */}
      <div className="mb-12 space-y-6">
        <div>
          <h1 className="text-4xl font-serif font-black text-[#111827]">Catalogue Talents</h1>
          <p className="text-gray-500 mt-2">
            Explorez nos {creators.length} créateurs disponibles pour vos campagnes.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher un créateur par son nom..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-[#D4A017] outline-none shadow-sm transition-all text-[#111827]"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['Tous', 'Instagram', 'TikTok', 'YouTube'].map((plat) => (
              <button
                key={plat}
                onClick={() => setFilter(plat)}
                className={`px-6 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  filter === plat ? 'bg-[#111827] text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                }`}
              >
                {plat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GRILLE DE RÉSULTATS */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 bg-gray-200 rounded-[32px]"></div>
          ))}
        </div>
      ) : creators.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {creators.map((creator) => (
            <TalentCard key={creator.id_w} creator={creator} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
           <p className="text-gray-400 font-bold">Aucun créateur ne correspond à votre recherche.</p>
        </div>
      )}
    </div>
  );
}

// COMPOSANT CARTE (Isolé pour la clarté)
function TalentCard({ creator }: { creator: any }) {
  return (
    <div className="group bg-white rounded-[32px] border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative flex flex-col h-full">
      <div className="h-56 bg-gray-100 relative overflow-hidden">
        <img 
          src={creator.url_photo_profile || "https://via.placeholder.com/400x400?text=Profil"} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          alt={creator.nom_complet}
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5">
          <Globe size={12} className="text-[#D4A017]" /> {creator.la_plateforme || 'Social'}
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1">
        <h3 className="text-xl font-black text-[#111827] mb-1">{creator.nom_complet}</h3>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Influencer • {creator.la_plateforme}</p>

        <div className="flex justify-between items-center py-4 border-y border-gray-50 mb-6 mt-auto">
          <div className="text-center">
            <p className="text-[10px] font-black text-gray-300 uppercase">Audience</p>
            <p className="font-black text-[#111827]">
                {creator.nbre_followers ? creator.nbre_followers.toLocaleString() : '0'}
            </p>
          </div>
          <div className="h-8 w-[1px] bg-gray-100"></div>
          <div className="text-center">
            <p className="text-[10px] font-black text-gray-300 uppercase">Engagement</p>
            <p className="font-black text-[#D4A017]">4.2%</p>
          </div>
        </div>

        <Link href={`/brands/catalogue/${creator.id_w}`} className="block">
          <button className="w-full py-4 bg-[#F9FAFB] text-[#111827] rounded-2xl font-black text-sm group-hover:bg-[#D4A017] group-hover:text-white transition-all flex items-center justify-center gap-2">
            Voir le profil complet <ArrowUpRight size={18} />
          </button>
        </Link>
      </div>
    </div>
  );
}