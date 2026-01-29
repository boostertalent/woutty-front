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



//dashboard createur
"use client";

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Briefcase, 
  Send, 
  User, 
  Instagram, 
  MessageCircle,
  Heart,
  Eye,
  Share2,
  Twitter,
  Ghost,
  Layers
} from 'lucide-react';

export default function CreatorDashboard() {
  // État pour la plateforme sélectionnée (null = tout afficher)
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // Données des plateformes
  const [selectedPlatforms] = useState([
    { id: 'insta', name: 'Instagram', icon: <Instagram size={14} />, followers: '1 M', follows: '3M', posts: '8M', engagement: '2%' },
    { id: 'tt', name: 'Tik tok', icon: <span className="text-[10px]">🎵</span>, followers: '1.2 M', follows: '300', posts: '20', engagement: '20%' },
    { id: 'snap', name: 'Snapchat', icon: <Ghost size={14} />, followers: '800 K', follows: '150', posts: '150', engagement: '15%' },
    { id: 'x', name: 'X', icon: <Twitter size={14} />, followers: '10 K', follows: '200', posts: '1.2K', engagement: '5%' },
  ]);

  const menuItems = [
    { name: 'Ma performance', icon: <BarChart3 size={20} />, active: true },
    { name: 'Opportunités', icon: <Briefcase size={20} />, active: false },
    { name: 'Mes campagnes', icon: <Send size={20} />, active: false },
    { name: 'Mon profil', icon: <User size={20} />, active: false },
  ];

  // Données des posts
  const allPosts = [
    { id: 1, platform: 'Instagram', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop', likes: '12K', views: '45K' },
    { id: 2, platform: 'Tik tok', image: 'https://images.unsplash.com/photo-1596558450268-9c27524baaf7?w=400&h=300&fit=crop', likes: '85K', views: '1.2M' },
    { id: 3, platform: 'Snapchat', image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop', likes: '5K', views: '20K' },
    { id: 4, platform: 'Instagram', image: 'https://images.unsplash.com/photo-1611162147679-51f263fca1ac?w=400&h=300&fit=crop', likes: '18K', views: '60K' },
    { id: 5, platform: 'X', image: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=400&h=300&fit=crop', likes: '2K', views: '15K' },
  ];

  // Filtrage dynamique des posts
  const filteredPosts = useMemo(() => {
    if (!activeFilter) return allPosts;
    return allPosts.filter(post => post.platform.toLowerCase() === activeFilter.toLowerCase());
  }, [activeFilter]);

  return (
    <div className="flex min-h-screen bg-[#F9FAFB] font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-full border-2 border-[#D4A017] flex items-center justify-center p-0.5">
            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
               <User className="text-gray-400" size={20} />
            </div>
          </div>
          <span className="font-serif font-bold text-lg text-[#111827]">Créateur</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                item.active 
                ? 'bg-[#EBD8A3] text-[#D4A017]' 
                : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#111827]">Dashboard Créateur</h1>
            <p className="text-gray-400 text-sm mt-1 font-medium">Cliquez sur une carte pour filtrer vos contenus.</p>
          </div>
          <button 
            onClick={() => setActiveFilter(null)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              !activeFilter ? 'bg-[#D4A017] text-white border-[#D4A017]' : 'bg-white text-gray-400 border-gray-100 hover:border-[#D4A017]'
            }`}
          >
            <Layers size={14} /> Voir tout
          </button>
        </header>

        {/* HORIZONTAL SOCIAL STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {selectedPlatforms.map((platform) => (
            <div 
              key={platform.id}
              onClick={() => setActiveFilter(platform.name)}
              className={`p-5 rounded-[24px] border cursor-pointer transition-all hover:scale-[1.02] shadow-sm ${
                activeFilter === platform.name 
                ? 'bg-white border-[#D4A017] ring-2 ring-[#D4A017]/10' 
                : 'bg-white border-gray-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-4 text-[#D4A017]">
                <div className="p-1 border border-[#D4A017] rounded-md">
                  {platform.icon}
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest">{platform.name}</span>
              </div>
              
              <div className="flex items-center justify-between gap-1 overflow-hidden">
                <div className="text-center">
                  <p className="text-sm font-black text-[#111827] leading-none">{platform.followers}</p>
                  <p className="text-[7px] font-bold text-gray-300 uppercase tracking-tighter mt-1">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-[#111827] leading-none">{platform.engagement}</p>
                  <p className="text-[7px] font-bold text-gray-300 uppercase tracking-tighter mt-1">Engage.</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-[#111827] leading-none">{platform.posts}</p>
                  <p className="text-[7px] font-bold text-gray-300 uppercase tracking-tighter mt-1">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-[#111827] leading-none">{platform.follows}</p>
                  <p className="text-[7px] font-bold text-gray-300 uppercase tracking-tighter mt-1">Follows</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* POSTS SECTION */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif font-bold text-[#111827]">
              {activeFilter ? `Posts ${activeFilter}` : 'Mes derniers posts'}
            </h2>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              {filteredPosts.length} résultats
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <div key={post.id} className="relative group rounded-[24px] overflow-hidden aspect-[4/3] bg-gray-200 border-4 border-white shadow-md transition-all hover:shadow-lg">
                <img 
                  src={post.image} 
                  alt={`Post ${post.platform}`} 
                  className="w-full h-full object-cover"
                />
                
                {/* Platform Badge */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-gray-100">
                  <span className="text-[9px] font-black uppercase tracking-tighter text-[#D4A017]">
                    {post.platform}
                  </span>
                </div>

                {/* Stats Overlay */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] bg-black/50 backdrop-blur-md rounded-full px-4 py-2 flex justify-around items-center border border-white/20">
                  <div className="flex items-center gap-1 text-white text-[10px] font-bold italic">
                    <Heart size={12} className="text-[#D4A017] fill-[#D4A017]" /> {post.likes}
                  </div>
                  <div className="flex items-center gap-1 text-white text-[10px] font-bold italic">
                    <Eye size={12} className="text-[#D4A017]" /> {post.views}
                  </div>
                  <div className="flex items-center gap-1 text-white text-[10px] font-bold italic">
                    <MessageCircle size={12} className="text-[#D4A017] fill-[#D4A017]" /> 2
                  </div>
                  <div className="flex items-center gap-1 text-white text-[10px] font-bold italic">
                    <Share2 size={12} className="text-[#D4A017]" /> 5
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-100">
              <p className="text-gray-400 font-medium">Aucun post trouvé pour cette plateforme.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}