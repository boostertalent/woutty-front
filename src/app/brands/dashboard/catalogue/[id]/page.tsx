"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Heart, MessageCircle, Instagram, 
  MapPin, Zap, Globe, Award, ExternalLink
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PublicCreatorProfile() {
  const { id } = useParams();
  const [creator, setCreator] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicProfile() {
      try {
        setLoading(true);
        // On récupère les infos essentielles
        const { data: profileData } = await supabase
          .from('info_profile')
          .select('*')
          .eq('id_w', id)
          .single();

        const { data: postsData } = await supabase
          .from('info_poste')
          .select('*')
          .eq('id_w', id)
          .order('date_poste', { ascending: false })
          .limit(9);

        setCreator(profileData);
        setPosts(postsData || []);
      } catch (error) {
        console.error("Erreur chargement profil public:", error);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchPublicProfile();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-gray-100 rounded"></div>
      </div>
    </div>
  );

  if (!creator) return <div className="p-20 text-center">Ce profil n'est pas disponible ou est privé.</div>;

  return (
    <div className="bg-white min-h-screen">
      {/* BANNIÈRE DÉGRADÉE DISCRÈTE */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-[#D4A017]/20 to-[#fdfbf7]"></div>

      <div className="max-w-5xl mx-auto px-6">
        {/* HEADER SECTION */}
        <div className="relative -mt-24 mb-12 text-center md:text-left flex flex-col md:flex-row items-end gap-6">
          <div className="relative inline-block mx-auto md:mx-0">
            <img 
              src={creator.url_photo_profile} 
              className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover border-8 border-white shadow-xl"
              alt={creator.nom_complet}
            />
            <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1.5 rounded-full border-4 border-white">
              <Award size={16} fill="currentColor" />
            </div>
          </div>
          
          <div className="flex-1 pb-2">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-[#111827] tracking-tight">{creator.nom_complet}</h1>
              <div className="flex justify-center gap-2">
                <span className="bg-gray-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase text-gray-500 flex items-center gap-1.5">
                  <Instagram size={12} /> {creator.la_plateforme}
                </span>
              </div>
            </div>
            <p className="text-gray-500 font-medium max-w-xl mb-4">
               Créateur de contenu digital spécialisé en <span className="text-[#111827] font-bold">Lifestyle & Mode</span>. 
               Basé à {creator.ville || 'Dakar'}.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-400 font-bold uppercase tracking-widest">
                <div className="flex flex-col">
                    <span className="text-[#D4A017] text-lg">{creator.nbre_followers?.toLocaleString()}</span>
                    <span className="text-[9px]">Abonnés</span>
                </div>
                <div className="w-px h-8 bg-gray-100 self-center"></div>
                <div className="flex flex-col">
                    <span className="text-[#111827] text-lg">4.2%</span>
                    <span className="text-[9px]">Engagement</span>
                </div>
                <div className="w-px h-8 bg-gray-100 self-center"></div>
                <div className="flex flex-col">
                    <span className="text-[#111827] text-lg">{creator.nbre_poste}</span>
                    <span className="text-[9px]">Publications</span>
                </div>
            </div>
          </div>

          <div className="w-full md:w-auto pb-2">
            <button className="w-full bg-[#D4A017] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-lg shadow-[#D4A017]/30 hover:bg-[#b88a14] transition-all">
               Collaborer avec {creator.nom_complet.split(' ')[0]}
            </button>
          </div>
        </div>

        {/* GRILLE DE CONTENU STYLE PORTFOLIO */}
        <div className="border-t border-gray-100 pt-10 pb-20">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
              <Globe size={14} /> Portfolio Récent
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
            {posts.map((post) => (
              <div key={post.id_poste} className="group relative aspect-square bg-gray-100 rounded-2xl overflow-hidden cursor-pointer">
                {/* Image du post (ou placeholder coloré) */}
                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center">
                   <Instagram size={32} className="text-white opacity-50" />
                </div>
                
                {/* Overlay au hover */}
                <div className="absolute inset-0 bg-[#111827]/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4 text-center">
                   <div className="flex gap-4 mb-3">
                      <span className="flex items-center gap-1 font-bold"><Heart size={18} fill="white" /> {post.nbre_like}</span>
                      <span className="flex items-center gap-1 font-bold"><MessageCircle size={18} fill="white" /> {post.nbre_commentaire}</span>
                   </div>
                   <p className="text-[10px] font-medium line-clamp-2">{post.titre_poste}</p>
                   <ExternalLink size={14} className="mt-3 opacity-50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* FOOTER PUBLIC */}
      <footer className="bg-gray-50 py-10 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Propulsé par <span className="text-[#D4A017]">VotrePlateforme</span> — 2024
          </p>
      </footer>
    </div>
  );
}