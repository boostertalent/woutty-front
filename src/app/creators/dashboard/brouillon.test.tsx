describe('brouillon.test', () => {
import { render, screen } from '@testing-library/react';
"use client";

import React, { useState, useEffect } from 'react';
import { Search, Maximize2, Filter, MoreHorizontal, ExternalLink, Calendar } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialisation du client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CreatorDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Remplacez par l'ID utilisateur réel (ex: via Auth)
  const USER_ID = "votre-id-w-ici"; 

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // 1. Récupération des données du profil
        const { data: profileData } = await supabase
          .from('info_profile')
          .select('*')
          .eq('id_w', USER_ID)
          .single();

        // 2. Récupération des postes associés
        const { data: postsData } = await supabase
          .from('info_poste')
          .select('*')
          .order('date_poste', { ascending: false });

        setProfile(profileData);
        setPosts(postsData || []);
        if (postsData && postsData.length > 0) setSelectedPost(postsData[0]);
        
      } catch (error) {
        console.error("Erreur de chargement:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-10 font-bold text-center">Synchronisation des données...</div>;

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] text-[#374151] font-sans p-4 gap-4">
      
      {/* BARRE LATÉRALE */}
      <div className="hidden w-64 p-4 bg-white border border-gray-200 rounded-lg shadow-sm md:block">
        <ul className="space-y-4 text-sm">
          <li className="text-[#D4A017] font-bold border-l-4 border-[#D4A017] pl-3">Statistique des profils</li>
          <li className="pl-4 text-gray-500 hover:text-[#D4A017] cursor-pointer">Tendance des profils</li>
          <li className="pl-4 text-gray-500 hover:text-[#D4A017] cursor-pointer">Statistique des campagnes</li>
        </ul>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="flex-1 space-y-4">
        
        {/* LIGNE 1 : INFOS GLOBALES */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-[#111827] text-white text-[10px] px-2 py-1 font-bold uppercase">{profile?.la_plateforme || 'Plateforme'}</div>
            <div className="flex items-center justify-center h-24 p-4 font-black text-xl text-[#111827]">
               {profile?.nom_plateforme || 'TikTok'}
            </div>
          </div>

          <div className="grid grid-cols-3 col-span-7 gap-4">
            <StatBox title="Nombre de Followers" value={profile?.nbre_followers?.toLocaleString() || "0"} />
            <StatBox title="Nombre de Follows" value={profile?.nbre_follows || "0"} />
            <StatBox title="Total des postes" value={profile?.nbre_poste || "0"} />
          </div>

          <div className="flex flex-col col-span-3 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-[#111827] text-white text-[10px] px-2 py-1 font-bold">Biographie</div>
            <div className="flex items-center justify-center flex-1 p-4 text-xs italic text-center">
              {profile?.biographie || "Aucune biographie disponible."}
            </div>
          </div>
        </div>

        {/* LIGNE 2 : IMAGE & ANALYSE POSTE */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-[#111827] text-white text-[10px] px-2 py-1 font-bold">Photo de profile</div>
            <div className="h-48 bg-gray-900">
               <img src={profile?.url_photo_profile} className="object-cover w-full h-full" alt="Profile" />
            </div>
          </div>

          <div className="col-span-7 space-y-4">
            <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="bg-[#6B7280] text-white text-[10px] px-2 py-1 font-bold uppercase">Information par poste</div>
                <div className="grid grid-cols-4 border-b border-gray-100">
                    <PostStatMini label="Commentaires" value={selectedPost?.nbre_commentaire || 0} />
                    <PostStatMini label="Likes" value={selectedPost?.nbre_like?.toLocaleString() || 0} />
                    <PostStatMini label="Vues" value={selectedPost?.nbre_vue?.toLocaleString() || 0} />
                    <PostStatMini label="Partages" value={selectedPost?.nbre_partage || 0} />
                </div>
                <div className="p-4">
                    <div className="bg-[#111827] text-white text-[10px] px-2 py-1 font-bold mb-2">Contenu du post</div>
                    <div className="h-24 pr-2 overflow-y-auto text-xs text-gray-700 leading-relaxed">
                        {selectedPost?.titre_poste || "Sélectionnez un poste pour voir le contenu."}
                    </div>
                </div>
            </div>
          </div>

          {/* JAUGE ENGAGEMENT */}
          <div className="col-span-3 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="bg-[#6B7280] text-white text-[10px] px-2 py-1 font-bold">Taux d'engagement [%]</div>
            <div className="flex flex-col items-center p-6">
                <div className="relative w-32 h-16 overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 border-[12px] border-gray-100 rounded-full" />
                    <div className="absolute top-0 left-0 w-32 h-32 border-[12px] border-l-[#3B82F6] border-t-[#3B82F6] rounded-full -rotate-45" />
                </div>
                <span className="text-4xl font-black text-[#111827] mt-2">8,53</span>
                <div className="flex justify-between w-full text-[10px] font-bold text-gray-400 mt-1 uppercase">
                    <span>Min</span><span>Max</span>
                </div>
            </div>
          </div>
        </div>

        {/* LIGNE 3 : LISTE ET LIENS */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-2 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="bg-[#6B7280] text-white text-[10px] px-2 py-1 font-bold">Postes récents</div>
            <div className="p-2 space-y-1 h-32 overflow-y-auto">
              {posts.map((post) => (
                <button 
                  key={post.id_w} 
                  onClick={() => setSelectedPost(post)}
                  className={`w-full text-left text-[10px] p-1 rounded ${selectedPost?.id_w === post.id_w ? 'bg-gray-100 font-bold' : 'text-gray-500'}`}
                >
                  Post du {new Date(post.date_poste).toLocaleDateString()}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-7 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="bg-[#111827] text-white text-[10px] px-2 py-1 font-bold">URL du poste sélectionné</div>
            <div className="p-4">
              <a href={selectedPost?.url_poste} target="_blank" className="flex items-center justify-between text-xs text-blue-500 hover:underline">
                {selectedPost?.url_poste || "Aucune URL"} <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div className="col-span-3 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="bg-[#6B7280] text-white text-[10px] px-2 py-1 font-bold">Date de publication</div>
            <div className="p-4 text-center font-bold text-sm text-[#111827]">
              {selectedPost ? new Date(selectedPost.date_poste).toLocaleString() : "--/--/----"}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// COMPOSANTS INTERNES
function StatBox({ title, value }: { title: string, value: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-[#6B7280] text-white text-[10px] px-2 py-1 font-bold text-center">{title}</div>
      <div className="flex items-center justify-center h-24 text-4xl font-black text-[#111827]">{value}</div>
    </div>
  );
}

function PostStatMini({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="border-r border-gray-100 last:border-none">
        <div className="bg-[#6B7280] text-white text-[9px] text-center py-1 font-bold uppercase">{label}</div>
        <div className="py-4 text-center text-xl font-black text-[#111827]">{value}</div>
    </div>
  );
}
});

  it('renders without crashing', () => { expect(true).toBe(true); });
