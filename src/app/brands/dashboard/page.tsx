"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Instagram, Youtube, Music2 as TikTokIcon, 
  Star, MapPin, Sparkles, X
} from 'lucide-react';

// Simulation de données provenant de la table 'createur'
// Note : id_w sera l'UUID de Supabase Auth
const CREATORS = [
  { id_w: "uuid-1", name: "Léna Situations", category: "Mode", location: "Paris, FR", followers: "4.2M", eng: "8.5%", platforms: ['ig', 'yt'], img: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&q=80" },
  { id_w: "uuid-2", name: "Julien Fontani", category: "Sport", location: "Lyon, FR", followers: "850K", eng: "4.2%", platforms: ['ig', 'tk'], img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80" },
  { id_w: "uuid-3", name: "Emma Green", category: "Écologie", location: "Bordeaux, FR", followers: "120K", eng: "12.1%", platforms: ['ig'], img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80" },
  { id_w: "uuid-4", name: "Tech Master", category: "Tech", location: "Bruxelles, BE", followers: "2.5M", eng: "3.8%", platforms: ['yt', 'tk'], img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" },
  { id_w: "uuid-5", name: "Sophie Food", category: "Gastronomie", location: "Genève, CH", followers: "45K", eng: "15.0%", platforms: ['ig', 'tk'], img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80" },
  { id_w: "uuid-6", name: "Lucas Voyage", category: "Lifestyle", location: "Nice, FR", followers: "310K", eng: "6.2%", platforms: ['ig', 'yt'], img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80" },
];

const CATEGORIES = ["Toutes", "Mode", "Sport", "Tech", "Gastronomie", "Lifestyle", "Écologie"];

export default function DiscoveryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Toutes');

  const filteredCreators = useMemo(() => {
    return CREATORS.filter(creator => {
      const matchesSearch = creator.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'Toutes' || creator.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6 px-4">
      
      {/* --- HEADER --- */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-2 text-[#ceaf4a] mb-2 font-bold text-sm tracking-widest uppercase">
            <Sparkles size={16} /> IA Matching activé
          </div>
          <h1 className="text-4xl font-black text-black tracking-tight">Découvrir des talents</h1>
          <p className="text-gray-500 font-medium text-lg">Trouvez le partenaire idéal pour votre marque.</p>
        </div>
      </motion.div>

      {/* --- RECHERCHE ET FILTRES --- */}
      <div className="sticky top-4 z-30 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 bg-white/90 backdrop-blur-xl p-4 rounded-[32px] shadow-2xl shadow-gray-200/50 border border-white">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Rechercher un créateur..." 
              className="w-full pl-14 pr-12 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#ceaf4a]/10 outline-none transition-all font-semibold text-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            )}
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat 
                  ? "bg-[#ceaf4a] text-white shadow-lg shadow-[#ceaf4a]/30 scale-105" 
                  : "bg-white border border-gray-100 text-gray-500 hover:text-black hover:border-[#ceaf4a]/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- RÉSULTATS --- */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredCreators.length > 0 ? (
            filteredCreators.map((creator) => (
              <CreatorCard key={creator.id_w} creator={creator} />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center bg-white rounded-[40px] border border-dashed border-gray-200"
            >
              <div className="text-6xl mb-4">🔎</div>
              <h3 className="text-xl font-bold text-black">Aucun talent trouvé</h3>
              <p className="text-gray-400">Essayez de modifier vos mots-clés ou filtres.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function CreatorCard({ creator }: { creator: any }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-[#ceaf4a]/10 transition-all group"
    >
      {/* Image de profil */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={creator.img} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          alt={creator.name} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        
        {/* Badges Réseaux */}
        <div className="absolute top-5 right-5 flex gap-2">
          {creator.platforms.map((p: string) => (
            <div key={p} className="bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-lg transform group-hover:rotate-6 transition-transform">
              {p === 'ig' && <Instagram size={18} className="text-pink-600" />}
              {p === 'yt' && <Youtube size={18} className="text-red-600" />}
              {p === 'tk' && <TikTokIcon size={18} className="text-black" />}
            </div>
          ))}
        </div>

        <div className="absolute bottom-6 left-6 text-white">
          <p className="text-xs font-bold flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full w-fit">
            <MapPin size={14} /> {creator.location}
          </p>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ceaf4a] mb-2 inline-block bg-[#ceaf4a]/5 px-2 py-1 rounded">
              {creator.category}
            </span>
            <h3 className="text-2xl font-black text-black leading-tight group-hover:text-[#ceaf4a] transition-colors">
              {creator.name}
            </h3>
          </div>
          <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center text-[#ceaf4a]">
            <Star size={20} fill="currentColor" />
          </div>
        </div>

        {/* Statistiques clés */}
        <div className="flex justify-between items-center py-5 border-y border-gray-50">
          <div className="text-center">
            <p className="text-xl font-black text-black">{creator.followers}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Abonnés</p>
          </div>
          <div className="h-8 w-px bg-gray-100" />
          <div className="text-center">
            <p className="text-xl font-black text-[#ceaf4a]">{creator.eng}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Engagement</p>
          </div>
        </div>

        <button className="w-full py-4 bg-black text-white rounded-2xl font-bold hover:bg-[#ceaf4a] transition-all transform active:scale-95 shadow-lg shadow-black/5 hover:shadow-[#ceaf4a]/20">
          Voir le profil complet
        </button>
      </div>
    </motion.div>
  );
}