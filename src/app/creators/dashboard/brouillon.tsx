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

//

"use client";

import React, { useState } from 'react';
import { 
  BarChart3, 
  Briefcase, 
  Send, 
  User, 
  Instagram, 
  Heart,
  Eye,
  MessageCircle,
  Share2,
  TrendingUp,
  Globe
} from 'lucide-react';

export default function CreatorDashboard() {
  const [activeTab, setActiveTab] = useState('performance');

  const menuItems = [
    { id: 'performance', name: 'Ma performance', icon: <BarChart3 size={18} /> },
    { id: 'opportunites', name: 'Opportunités', icon: <Briefcase size={18} /> },
    { id: 'campagnes', name: 'Mes campagnes', icon: <Send size={18} /> },
    { id: 'profil', name: 'Mon profil', icon: <User size={18} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-sans text-[#111827]">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50">
            <User className="text-[#D4A017]" size={20} />
          </div>
          <span className="font-bold text-lg">Fatou</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === item.id 
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
      <main className="flex-1 p-12 overflow-y-auto">
        
        {activeTab === 'performance' ? (
          <section>
            <header className="mb-12">
              <h1 className="text-3xl font-serif font-bold mb-1">Dashboard Créateur</h1>
              <p className="text-gray-500 text-sm">Gérez votre influence et vos revenus en temps réel.</p>
            </header>

            {/* PLATFORM CARDS */}
            <div className="space-y-6 mb-12">
              {/* Instagram Card */}
              <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-50">
                <div className="flex items-center gap-2 mb-8">
                  <Instagram size={20} className="text-[#D4A017]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Instagram</span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-5xl font-bold">1 M</p>
                    <p className="text-[10px] font-bold text-gray-300 uppercase mt-2 tracking-widest">Followers</p>
                  </div>
                  <div>
                    <p className="text-5xl font-bold text-gray-100">—</p>
                    <p className="text-[10px] font-bold text-gray-300 uppercase mt-2 tracking-widest">Follows</p>
                  </div>
                  <div>
                    <p className="text-5xl font-bold text-gray-100">—</p>
                    <p className="text-[10px] font-bold text-gray-300 uppercase mt-2 tracking-widest">Posts</p>
                  </div>
                  <div>
                    <p className="text-5xl font-bold text-gray-100">—</p>
                    <p className="text-[10px] font-bold text-gray-300 uppercase mt-2 tracking-widest">Engagement</p>
                  </div>
                </div>
              </div>

              {/* TikTok Card */}
              <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-50">
                <div className="flex items-center gap-2 mb-8">
                  <span className="text-lg">🎵</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tik Tok</span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-5xl font-bold">1 M</p>
                    <p className="text-[10px] font-bold text-gray-300 uppercase mt-2 tracking-widest">Followers</p>
                  </div>
                  <div>
                    <p className="text-5xl font-bold text-[#111827]">300</p>
                    <p className="text-[10px] font-bold text-gray-300 uppercase mt-2 tracking-widest">Follows</p>
                  </div>
                  <div>
                    <p className="text-5xl font-bold text-[#111827]">20</p>
                    <p className="text-[10px] font-bold text-gray-300 uppercase mt-2 tracking-widest">Posts</p>
                  </div>
                  <div>
                    <p className="text-5xl font-bold text-[#111827]">20%</p>
                    <p className="text-[10px] font-bold text-gray-300 uppercase mt-2 tracking-widest">Engagement</p>
                  </div>
                </div>
              </div>
            </div>

            {/* POSTS SECTION */}
            <h2 className="text-2xl font-bold mb-8">Mes posts</h2>
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map((post) => (
                <div key={post} className="relative rounded-[32px] overflow-hidden group shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=400&fit=crop" 
                    className="w-full h-full object-cover aspect-[4/3]"
                    alt="Post content"
                  />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] bg-black/60 backdrop-blur-md rounded-full px-4 py-2 flex justify-between items-center border border-white/20">
                    <div className="flex items-center gap-1 text-white text-[10px] font-bold"><Heart size={12} className="text-[#D4A017]" /> 2</div>
                    <div className="flex items-center gap-1 text-white text-[10px] font-bold"><Send size={12} className="text-[#D4A017]" /> 2</div>
                    <div className="flex items-center gap-1 text-white text-[10px] font-bold"><MessageCircle size={12} className="text-[#D4A017]" /> 2</div>
                    <div className="flex items-center gap-1 text-white text-[10px] font-bold"><Eye size={12} className="text-[#D4A017]" /> 2</div>
                    <div className="flex items-center gap-1 text-white text-[10px] font-bold text-[#D4A017] italic">% 2</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : activeTab === 'opportunites' ? (
          <section>
            <header className="mb-12">
              <h1 className="text-3xl font-serif font-bold mb-1">Mes Opportunités</h1>
              <p className="text-gray-500 text-sm">Gérez votre influence et vos revenus en temps réel.</p>
            </header>

            <div className="grid grid-cols-2 gap-8">
              {/* Op 1 */}
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-50 relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                    <Briefcase className="text-[#D4A017]" size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-[#22C55E] bg-[#F0FDF4] px-3 py-1 rounded-full">350,000 FCFA</span>
                </div>
                <h3 className="text-xl font-bold mb-1">Lancement cosmétique bio</h3>
                <p className="text-gray-400 text-xs mb-4 uppercase tracking-tighter">Natural beauty</p>
                <div className="flex gap-2 mb-8">
                  <span className="px-3 py-1 bg-gray-50 rounded-full text-[10px] font-medium text-gray-400">Skincare</span>
                  <span className="px-3 py-1 bg-gray-50 rounded-full text-[10px] font-medium text-gray-400">Beauty</span>
                </div>
                <button className="w-full py-4 bg-[#111827] text-white rounded-full font-bold text-sm hover:bg-black transition-colors">
                  Postuler maintenant
                </button>
              </div>

              {/* Op 2 */}
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-50 relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                    <Briefcase className="text-[#D4A017]" size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-[#22C55E] bg-[#F0FDF4] px-3 py-1 rounded-full">50,000 FCFA</span>
                </div>
                <h3 className="text-xl font-bold mb-1">Lancement App Gaming</h3>
                <p className="text-gray-400 text-xs mb-4 uppercase tracking-tighter">Playzone</p>
                <div className="flex gap-2 mb-8">
                  <span className="px-3 py-1 bg-gray-50 rounded-full text-[10px] font-medium text-gray-400">Tech</span>
                  <span className="px-3 py-1 bg-gray-50 rounded-full text-[10px] font-medium text-gray-400">Live</span>
                </div>
                <button className="w-full py-4 bg-[#111827] text-white rounded-full font-bold text-sm hover:bg-black transition-colors">
                  Postuler maintenant
                </button>
              </div>
            </div>
          </section>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-300 font-bold uppercase tracking-widest">
            En cours de développement
          </div>
        )}
      </main>
    </div>
  );
}

// dash cre
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr'; 
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
  Ghost,
  Camera,
  Settings,
  LogOut,
  Calendar,
  X as CloseIcon,
  Play,
  Menu
} from 'lucide-react';

const XLogo = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.486 3.24H4.298L17.607 20.65z" />
  </svg>
);

export default function CreatorDashboard() {
  // --- INITIALISATION CLIENT SUPABASE SSR ---
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [activeTab, setActiveTab] = useState('Ma performance');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null); 
  const [loading, setLoading] = useState(true);

  // ÉTATS DES DONNÉES TABLES
  const [selectedPlatforms, setSelectedPlatforms] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);

  const menuItems = [
    { name: 'Ma performance', icon: <BarChart3 size={20} /> },
    { name: 'Opportunités', icon: <Briefcase size={20} /> },
    { name: 'Mes campagnes', icon: <Send size={20} /> },
    { name: 'Mon profil', icon: <User size={20} /> },
  ];

  // --- FETCH DATA DEPUIS LES TABLES ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1. Fetch info_profile
      const { data: profileData } = await supabase.from('info_profile').select('*');
      if (profileData) {
        setSelectedPlatforms(profileData.map(p => ({
          id: p.id_w,
          name: p.la_plateforme || 'Inconnu',
          icon: p.la_plateforme?.toLowerCase().includes('insta') ? <Instagram size={14} /> : 
                p.la_plateforme?.toLowerCase().includes('tik') ? <span className="text-[10px]">🎵</span> : 
                p.la_plateforme?.toLowerCase().includes('snap') ? <Ghost size={14} /> : <XLogo size={14} />,
          followers: p.nbre_followers >= 1000 ? `${(p.nbre_followers / 1000).toFixed(0)}K` : p.nbre_followers,
          follows: p.nbre_follows,
          posts: p.nbre_poste,
          engagement: '2.4%' 
        })));
      }

      // 2. Fetch info_poste
      const { data: postData } = await supabase.from('info_poste').select('*').order('date_poste', { ascending: false });
      if (postData) {
        setAllPosts(postData.map(post => ({
          id: post.id_w,
          title: post.titre_poste,
          date: new Date(post.date_poste).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
          platform: post.id_plateforme === 1 ? 'Instagram' : 'TikTok', // Normalisé pour correspondre au filtrage
          type: post.type_poste || 'image',
          icon: post.id_plateforme === 1 ? <Instagram size={10} /> : <span className="text-[10px]">🎵</span>,
          image: post.url_poste,
          videoUrl: post.url_poste,
          likes: post.nbre_like >= 1000 ? `${(post.nbre_like / 1000).toFixed(1)}K` : post.nbre_like,
          views: post.nbre_vue >= 1000000 ? `${(post.nbre_vue / 1000000).toFixed(1)}M` : `${(post.nbre_vue / 1000).toFixed(1)}K`,
          comments: post.nbre_commentaire,
          shares: post.nbre_partage,
          eng: '5%'
        })));
      }

      // 3. Fetch campaigns
      const { data: campData } = await supabase.from('campaigns').select('*').eq('status', 'active');
      if (campData) {
        setOpportunities(campData.map(c => ({
          id: c.id,
          title: c.title,
          brand: "Annonceur vérifié",
          price: `${c.budget.toLocaleString()} ${c.currency}`,
          tags: c.interests || ["Sponsoring"]
        })));
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  // LOGIQUE DE FILTRAGE : Améliorée pour ignorer les espaces et les majuscules
  const filteredPosts = useMemo(() => {
    if (!activeFilter) return allPosts;
    return allPosts.filter(post => {
      const pName = post.platform.toLowerCase().replace(/\s/g, '');
      const fName = activeFilter.toLowerCase().replace(/\s/g, '');
      return pName.includes(fName) || fName.includes(pName);
    });
  }, [activeFilter, allPosts]);

  if (loading) return <div className="h-screen w-full flex items-center justify-center font-bold text-[#D4A017] animate-pulse">Chargement des données...</div>;

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#F9FAFB] font-sans overflow-hidden text-[#111827]">
      
      {/* MODAL DE LECTURE */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 md:p-4 animate-in fade-in duration-200">
          <button onClick={() => setSelectedPost(null)} className="absolute top-4 right-4 z-[110] text-white hover:rotate-90 transition-transform">
            <CloseIcon size={28} />
          </button>
          
          <div className="bg-white rounded-[24px] md:rounded-[40px] overflow-hidden max-w-4xl w-full flex flex-col md:flex-row max-h-[90vh] shadow-2xl overflow-y-auto md:overflow-hidden">
            <div className="w-full md:flex-[1.5] bg-black flex items-center justify-center relative aspect-video md:aspect-auto">
              {selectedPost.type === 'video' ? (
                <video src={selectedPost.videoUrl} controls autoPlay className="w-full h-full object-contain" />
              ) : (
                <img src={selectedPost.image} className="w-full h-full object-cover" alt="" />
              )}
            </div>
            
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between bg-white">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[#D4A017]">{selectedPost.icon}</span>
                  <span className="text-xs font-black uppercase tracking-widest">{selectedPost.platform}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-serif font-bold mb-2">{selectedPost.title}</h2>
                <p className="text-gray-400 text-sm flex items-center gap-2 mb-6">
                  <Calendar size={14} /> Posté le {selectedPost.date}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">likes</p>
                    <div className="flex items-center gap-2 font-black text-sm md:text-base"><Heart size={16} className="text-[#D4A017] fill-[#D4A017]" /> {selectedPost.likes}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Vues</p>
                    <div className="flex items-center gap-2 font-black text-sm md:text-base"><Eye size={16} className="text-[#D4A017]" /> {selectedPost.views}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Commentaires</p>
                    <div className="flex items-center gap-2 font-black text-sm md:text-base"> <MessageCircle size={11} className="text-[#D4A017]" /> {selectedPost.comments || '0'} </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Partages</p>
                    <div className="flex items-center gap-2 font-black text-sm md:text-base"> <Share2 size={11} className="text-[#D4A017]" /> {selectedPost.shares || '0'} </div>
                  </div>
                   <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Engagement</p>
                    <div className="flex items-center gap-2 font-black text-sm md:text-base">{selectedPost.eng || '5%'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col p-6 h-full flex-shrink-0">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-full border-2 border-[#D4A017] flex items-center justify-center p-0.5">
            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
               <User className="text-gray-400" size={20} />
            </div>
          </div>
          <span className="font-serif font-bold text-lg">créateur</span>
        </div>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button key={item.name} onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === item.name ? 'bg-[#EBD8A3] text-[#D4A017]' : 'text-gray-500 hover:bg-gray-50'
              }`}>
              {item.icon} {item.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-3 z-50">
        {menuItems.map((item) => (
          <button key={item.name} onClick={() => setActiveTab(item.name)}
            className={`flex flex-col items-center gap-1 ${activeTab === item.name ? 'text-[#D4A017]' : 'text-gray-400'}`}>
            {item.icon}
            <span className="text-[10px] font-bold">{item.name.split(' ')[0]}</span>
          </button>
        ))}
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col p-4 md:p-10 h-full overflow-hidden pb-20 md:pb-10">
        <header className="mb-6 md:mb-8 flex-shrink-0">
          <h1 className="text-2xl md:text-3xl font-serif font-bold">
            {activeTab === 'Mes campagnes' ? 'Suivi contrats' : activeTab}
          </h1>
          <p className="text-gray-400 text-xs md:text-sm mt-1 font-medium italic uppercase tracking-wider">Gérez votre influence en temps réel.</p>
        </header>

        <div className="flex-1 overflow-y-auto pr-1 md:pr-0">
          {activeTab === 'Ma performance' ? (
            <div className="flex flex-col space-y-6 md:space-y-8">
              
              {/* PLATFORM CARDS */}
              <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto md:overflow-x-visible pb-4 md:pb-0 scrollbar-hide">
                {selectedPlatforms.map((platform) => (
                  <div key={platform.id} onClick={() => setActiveFilter(activeFilter === platform.name ? null : platform.name)}
                    className={`min-w-[280px] md:min-w-0 p-4 rounded-[24px] border cursor-pointer transition-all shadow-sm ${
                      activeFilter === platform.name ? 'bg-white border-[#D4A017] ring-2 ring-[#D4A017]/10' : 'bg-white border-gray-50'
                    }`}>
                    <div className="flex items-center gap-2 mb-4 text-[#D4A017]">
                      <div className="p-1 border border-[#D4A017] rounded-md flex items-center justify-center">{platform.icon}</div>
                      <span className="text-[9px] font-bold uppercase tracking-widest">{platform.name}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center">
                        <p className="text-[10px] md:text-xs font-black">{platform.followers}</p>
                        <p className="text-[6px] md:text-[7px] text-gray-300 uppercase font-bold">followers</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] md:text-xs font-black">{platform.follows}</p>
                        <p className="text-[6px] md:text-[7px] text-gray-300 uppercase font-bold">follows</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] md:text-xs font-black">{platform.engagement}</p>
                        <p className="text-[6px] md:text-[7px] text-gray-300 uppercase font-bold">Engagement</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] md:text-xs font-black">{platform.posts}</p>
                        <p className="text-[6px] md:text-[7px] text-gray-300 uppercase font-bold">Posts</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* POSTS GRID */}
              <div>
                <div className="relative flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-bold">
                    {activeFilter ? `Mes posts ${activeFilter}` : 'Tous mes posts'}
                  </h2>
                  <div className="absolute left-1/2 -translate-x-1/2">
                    {activeFilter && (
                      <button onClick={() => setActiveFilter(null)} className="text-[10px] font-bold text-[#D4A017] underline uppercase tracking-widest hover:text-[#b08512] transition-colors">
                        Tout afficher
                      </button>
                    )}
                  </div>
                  <div className="w-10 md:w-20"></div> 
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredPosts.map((post) => (
                    <div key={post.id} onClick={() => setSelectedPost(post)}
                      className="relative rounded-[24px] overflow-hidden bg-gray-100 border-4 border-white shadow-md group cursor-pointer hover:shadow-xl transition-all">
                      
                      <div className="absolute top-3 left-3 z-10 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 border border-[#D4A017]/20">
                        <span className="text-[#D4A017] flex items-center">{post.icon}</span>
                        <span className="text-[8px] font-black uppercase text-[#111827]">{post.platform}</span>
                      </div>

                      <div className="absolute top-3 right-3 z-10 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-white border border-white/10">
                        <Calendar size={10} className="text-[#D4A017]" />
                        <span className="text-[8px] font-bold uppercase tracking-tighter">{post.date}</span>
                      </div>

                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={post.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                      </div>

                      {post.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40">
                            <Play fill="white" className="text-white ml-0.5" size={16} />
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12">
                        <h4 className="text-white text-[11px] font-bold mb-2 ml-2 line-clamp-1">{post.title}</h4>
                        <div className="w-full bg-black/60 backdrop-blur-md rounded-full px-3 py-2 flex justify-between items-center border border-white/20 text-white text-[8px] md:text-[9px] font-bold">
                          <div className="flex items-center gap-1"><Heart size={11} className="text-[#D4A017] fill-[#D4A017]" /> {post.likes}</div>
                          <div className="flex items-center gap-1"><MessageCircle size={11} className="text-[#D4A017] fill-[#D4A017]" /> {post.comments || '0'}</div>
                          <div className="flex items-center gap-1"><Share2 size={11} className="text-[#D4A017]" /> {post.shares || '0'}</div>
                          <div className="flex items-center gap-1"><Eye size={11} className="text-[#D4A017]" /> {post.views}</div>
                          <div className="text-[#D4A017] italic font-black border-l border-white/20 pl-2">2.4%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredPosts.length === 0 && (
                  <div className="text-center py-20 text-gray-400 font-serif italic">Aucun post trouvé pour cette plateforme.</div>
                )}
              </div>
            </div>
          ) : activeTab === 'Opportunités' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
              {opportunities.map((op) => (
                <div key={op.id} className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-50 relative group transition-all hover:shadow-xl">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm"><Briefcase className="text-[#D4A017]" size={24} /></div>
                    <span className="text-[10px] font-bold text-[#22C55E] bg-[#F0FDF4] px-3 py-1.5 rounded-full border border-green-100">{op.price}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{op.title}</h3>
                  <p className="text-gray-400 text-xs mb-4 uppercase font-medium">{op.brand}</p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {op.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-gray-50 rounded-full text-[10px] font-bold text-gray-400 border border-gray-100">{tag}</span>
                    ))}
                  </div>
                  <button className="w-full py-4 bg-[#111827] text-white rounded-full font-bold text-sm hover:bg-black shadow-lg">Postuler maintenant</button>
                </div>
              ))}
            </div>
          ) : activeTab === 'Mes campagnes' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-50">
                <div className="flex justify-between items-center mb-10">
                  <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm"><Briefcase className="text-[#D4A017]" size={24} /></div>
                  <span className="text-[10px] font-bold text-[#22C55E] bg-[#F0FDF4] px-4 py-1.5 rounded-full border border-green-100 uppercase tracking-widest">En cours</span>
                </div>
                <h3 className="text-2xl font-bold mb-10">Campagne active</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400 tracking-widest"><span>Livrables</span><span>5%</span></div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#EBD8A3] w-[5%]" /></div>
                </div>
              </div>
            </div>
          ) : activeTab === 'Mon profil' ? (
            <div className="max-w-2xl w-full bg-white rounded-[32px] shadow-sm border border-gray-50 overflow-hidden mx-auto md:mx-0">
              <div className="h-24 md:h-32 bg-[#EBD8A3] relative">
                <div className="absolute -bottom-10 left-6 md:left-8">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden relative group">
                    <User className="w-full h-full p-4 text-gray-400" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"><Camera className="text-white" size={20} /></div>
                  </div>
                </div>
              </div>
              <div className="pt-14 pb-8 px-6 md:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">créateur</h2>
                    <p className="text-gray-400 text-sm font-medium">Gestion du profil</p>
                  </div>
                  <button className="w-full md:w-auto px-6 py-2 border border-gray-200 rounded-full text-xs font-bold hover:bg-gray-50 transition-colors">Modifier le profil</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3"><Settings className="text-gray-400" size={18} /><span className="text-sm font-bold">Paramètres</span></div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3 text-red-500 cursor-pointer"><LogOut size={18} /><span className="text-sm font-bold">Déconnexion</span></div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}



//social
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { 
  ChevronLeft, Trash2, Globe, AlertCircle,
  Instagram, Youtube, Twitter, 
  Music2, MessageCircle, Eye, EyeOff, Loader2, ChevronDown
} from 'lucide-react';

const PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', icon: <Music2 size={18} />, prefix: '', placeholder: 'nom de profil' },
  { id: 'instagram', name: 'Instagram', icon: <Instagram size={18} />, prefix: '', placeholder: 'nom de profil' },
  { id: 'snapchat', name: 'Snapchat', icon: <MessageCircle size={18} />, prefix: '', placeholder: 'nom de profil' },
  { id: 'twitter', name: 'Twitter / X', icon: <Twitter size={18} />, prefix: '', placeholder: 'nom de profil' },
  { id: 'youtube', name: 'YouTube', icon: <Youtube size={18} />, prefix: '', placeholder: 'nom_de_la_chaine' },
];

export default function SocialMediaSelection() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [socials, setSocials] = useState([{ id: Date.now(), platform: '', handle: '' }]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const isPasswordMatch = password.length > 0 && password === confirmPassword;
  const isFormValid = 
    password.length >= 6 && 
    isPasswordMatch && 
    socials.length > 0 &&
    socials.every(s => s.platform !== '' && s.handle.trim().length >= 2);

  const handleFinish = async () => {
    if (!isFormValid || loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const email = localStorage.getItem('onboarding_email');
      const fullName = localStorage.getItem('user_full_name');
      const phone = localStorage.getItem('signup_phone');
      const ageRaw = localStorage.getItem('signup_age');
      const nichesRaw = localStorage.getItem('signup_niche');
      
      // 1. On transforme le tableau de niches en une seule chaîne (ex: "Mode, Voyage")
      // Ton SQL utilise ->> (text), donc envoyer un Array JS peut parfois poser problème.
      let nicheString = "";
      try { 
        const parsed = nichesRaw ? JSON.parse(nichesRaw) : []; 
        nicheString = Array.isArray(parsed) ? parsed.join(', ') : String(parsed);
      } catch (e) { 
        nicheString = nichesRaw || ""; 
      }

      if (!email) throw new Error("Détails d'inscription manquants. Veuillez recommencer.");

      // 2. Préparation de l'âge (doit être un nombre ou une chaîne vide pour le NULLIF du SQL)
      const ageValue = ageRaw ? parseInt(ageRaw, 10) : "";

      const { data, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName || "",
            phone: phone || "",
            age: ageValue, 
            user_niches: nicheString, // Correction : Clé exacte attendue par le SQL
            user_socials: socials.map(s => ({ 
              platform: s.platform, 
              handle: s.handle.trim() 
            })), // Format JSONB parfait pour jsonb_array_elements
            role: 'creator'
          }
        }
      });

      if (authError) throw authError;

      if (data.user) {
        // Optionnel : vider le localStorage ici
        localStorage.clear(); 
        router.push('/creators/auth/success');
      }

    } catch (err: any) {
      console.error("Erreur Inscription:", err);
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const updateSocial = (id: number, field: string, value: string) => {
    setSocials(socials.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  
  const getPlatformIcon = (id: string) => PLATFORMS.find(p => p.id === id)?.icon || <Globe size={18} />;

  return (
    <main className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      <div className="bg-white border border-gray-200 rounded-[32px] p-8 md:p-12 w-full max-w-2xl shadow-xl shadow-gray-200/50">
        
        <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Vos Réseaux</h2>
            <p className="text-gray-500 font-medium text-sm">Connectez vos plateformes pour finaliser votre profil</p>
        </div>

        <div className="space-y-4 mb-6">
          {socials.map((social) => {
            const selectedPlatformInfo = PLATFORMS.find(p => p.id === social.platform);
            return (
                <div key={social.id} className="group flex items-center bg-white border border-gray-200 rounded-2xl p-1.5 focus-within:border-[#ceaf4a] focus-within:ring-4 focus-within:ring-[#ceaf4a]/10 transition-all">
                    <div className="relative min-w-[150px] md:min-w-[180px]">
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl">
                            <span className={social.platform ? 'text-[#ceaf4a]' : 'text-gray-400'}>{getPlatformIcon(social.platform)}</span>
                            <span className={`text-sm font-bold flex-1 truncate ${!social.platform ? 'text-gray-400' : 'text-gray-900'}`}>{selectedPlatformInfo ? selectedPlatformInfo.name : 'Plateforme'}</span>
                            <ChevronDown size={14} className="text-gray-400" />
                        </div>
                        <select 
                            value={social.platform} 
                            onChange={(e) => updateSocial(social.id, 'platform', e.target.value)} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        >
                            <option value="" disabled>Choisir...</option>
                            {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="w-px h-8 bg-gray-200 mx-2" />
                    <div className="flex-1 flex items-center">
                        {selectedPlatformInfo?.prefix && <span className="text-black font-bold pl-2">{selectedPlatformInfo.prefix}</span>}
                        <input 
                            type="text" 
                            placeholder={selectedPlatformInfo?.placeholder || "Pseudo..."}
                            value={social.handle}
                            onChange={(e) => updateSocial(social.id, 'handle', e.target.value)}
                            disabled={!social.platform}
                            className="w-full py-3 px-1 outline-none text-black font-bold bg-transparent text-sm"
                        />
                    </div>
                    {socials.length > 1 && (
                        <button onClick={() => setSocials(socials.filter(s => s.id !== social.id))} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={18} /></button>
                    )}
                </div>
            );
          })}
        </div>

        <button 
            onClick={() => setSocials([...socials, { id: Date.now(), platform: '', handle: '' }])}
            className="w-full py-4 border border-dashed border-gray-300 rounded-2xl text-gray-500 hover:text-[#ceaf4a] font-bold text-sm mb-8"
        >
            + Ajouter un réseau
        </button>

        <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 space-y-4 mb-8">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest text-center mb-2">Créer votre mot de passe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600">Mot de passe</label>
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-white text-black font-bold outline-none focus:border-[#ceaf4a]" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600">Confirmation</label>
                    <div className="relative">
                        <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full px-5 py-3.5 rounded-2xl border bg-white text-black font-bold outline-none ${isPasswordMatch ? 'border-green-500' : 'border-gray-200'}`} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                </div>
            </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex items-start gap-3 border border-red-100 font-bold text-sm"><AlertCircle size={20} /> {error}</div>}

        <div className="flex justify-between items-center pt-6 border-t border-gray-100">
          <Link href="/creators/auth/niche" className="text-gray-400 font-bold hover:text-black flex items-center gap-2 text-sm"><ChevronLeft size={18} /> Retour</Link>
          <button 
            onClick={handleFinish} 
            disabled={!isFormValid || loading} 
            className={`px-10 py-4 rounded-2xl font-bold transition-all text-sm uppercase flex items-center justify-center min-w-[200px] ${isFormValid && !loading ? "bg-[#ceaf4a] text-white shadow-xl" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Finaliser mon inscription"}
          </button>
        </div>
      </div>
    </main>
  );
}





// createur
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { 
  ChevronLeft, Trash2, Globe, AlertCircle,
  Instagram, Youtube, Twitter, 
  Music2, MessageCircle, Eye, EyeOff, Loader2, ChevronDown
} from 'lucide-react';

const PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', icon: <Music2 size={18} />, prefix: '', placeholder: 'nom de profil' },
  { id: 'instagram', name: 'Instagram', icon: <Instagram size={18} />, prefix: '', placeholder: 'nom de profil' },
  { id: 'snapchat', name: 'Snapchat', icon: <MessageCircle size={18} />, prefix: '', placeholder: 'nom de profil' },
  { id: 'twitter', name: 'Twitter / X', icon: <Twitter size={18} />, prefix: '', placeholder: 'nom de profil' },
  { id: 'youtube', name: 'YouTube', icon: <Youtube size={18} />, prefix: '', placeholder: 'nom_de_la_chaine' },
];

export default function SocialMediaSelection() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [socials, setSocials] = useState([{ id: Date.now(), platform: '', handle: '' }]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const isPasswordMatch = password.length > 0 && password === confirmPassword;
  const isFormValid = 
    password.length >= 6 && 
    isPasswordMatch && 
    socials.length > 0 &&
    socials.every(s => s.platform !== '' && s.handle.trim().length >= 2);
const handleFinish = async () => {
  if (!isFormValid || loading) return;
  
  setLoading(true);
  setError(null);

  try {
    const email = localStorage.getItem('onboarding_email');
    const fullName = localStorage.getItem('user_full_name');
    const phone = localStorage.getItem('signup_phone');
    const ageRaw = localStorage.getItem('signup_age');
    const nichesRaw = localStorage.getItem('signup_niche');
    
    // Sécurité : Vérification de l'email
    if (!email) throw new Error("Détails d'inscription manquants (email).");

    // Sécurité : Parsing de l'âge (évite le NaN)
    const parsedAge = ageRaw ? parseInt(ageRaw, 10) : null;
    const finalAge = isNaN(parsedAge as number) ? null : parsedAge;

    // Sécurité : Parsing des niches
    let niches = [];
    try { 
      niches = nichesRaw ? JSON.parse(nichesRaw) : []; 
    } catch (e) { 
      niches = []; 
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName || "",
          phone: phone || "",
          age: finalAge, // Utilisation de la valeur sécurisée
          user_niches: niches,
          user_socials: socials.map(s => ({ platform: s.platform, handle: s.handle })),
          role: "creator"
        }
      }
    });

    if (authError) throw authError;

    if (data.user) {
      localStorage.clear(); // Plus propre de tout vider
      router.push('/creators/auth/success');
    }

  } catch (err: any) {
    console.error("Erreur Inscription détaillée:", err);
    const friendlyError = err.message === "User already registered" 
      ? "Cet email est déjà utilisé." 
      : "Erreur technique : " + (err.message || "vérifiez votre connexion.");
    setError(friendlyError);
  } finally {
    setLoading(false);
  }
};

  const updateSocial = (id: number, field: string, value: string) => {
    setSocials(socials.map(s => s.id === id ? { ...s, [field]: value } : s));
  };
  
  const getPlatformIcon = (id: string) => PLATFORMS.find(p => p.id === id)?.icon || <Globe size={18} />;

  return (
    <main className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      <div className="bg-white border border-gray-200 rounded-[32px] p-8 md:p-12 w-full max-w-2xl shadow-xl shadow-gray-200/50">
        
        <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Vos Réseaux</h2>
            <p className="text-gray-500 font-medium text-sm">Connectez vos plateformes pour finaliser votre profil</p>
        </div>

        <div className="space-y-4 mb-6">
          {socials.map((social) => {
            const selectedPlatformInfo = PLATFORMS.find(p => p.id === social.platform);
            return (
                <div key={social.id} className="group flex items-center bg-white border border-gray-200 rounded-2xl p-1.5 focus-within:border-[#ceaf4a] focus-within:ring-4 focus-within:ring-[#ceaf4a]/10 transition-all">
                    <div className="relative min-w-[150px] md:min-w-[180px]">
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl">
                            <span className={social.platform ? 'text-[#ceaf4a]' : 'text-gray-400'}>{getPlatformIcon(social.platform)}</span>
                            <span className={`text-sm font-bold flex-1 truncate ${!social.platform ? 'text-gray-400' : 'text-gray-900'}`}>{selectedPlatformInfo ? selectedPlatformInfo.name : 'Plateforme'}</span>
                            <ChevronDown size={14} className="text-gray-400" />
                        </div>
                        <select 
                            value={social.platform} 
                            onChange={(e) => updateSocial(social.id, 'platform', e.target.value)} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        >
                            <option value="" disabled>Choisir...</option>
                            {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="w-px h-8 bg-gray-200 mx-2" />
                    <div className="flex-1 flex items-center">
                        {selectedPlatformInfo?.prefix && <span className="text-black font-bold pl-2">{selectedPlatformInfo.prefix}</span>}
                        <input 
                            type="text" 
                            placeholder={selectedPlatformInfo?.placeholder || "Pseudo..."}
                            value={social.handle}
                            onChange={(e) => updateSocial(social.id, 'handle', e.target.value)}
                            disabled={!social.platform}
                            className="w-full py-3 px-1 outline-none text-black font-bold bg-transparent text-sm"
                        />
                    </div>
                    {socials.length > 1 && (
                        <button onClick={() => setSocials(socials.filter(s => s.id !== social.id))} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={18} /></button>
                    )}
                </div>
            );
          })}
        </div>

        <button 
            onClick={() => setSocials([...socials, { id: Date.now(), platform: '', handle: '' }])}
            className="w-full py-4 border border-dashed border-gray-300 rounded-2xl text-gray-500 hover:text-[#ceaf4a] font-bold text-sm mb-8"
        >
            + Ajouter un réseau
        </button>

        <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 space-y-4 mb-8">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest text-center mb-2">Créer votre mot de passe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600">Mot de passe</label>
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-white text-black font-bold outline-none focus:border-[#ceaf4a]" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-600">Confirmation</label>
                    <div className="relative">
                        <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full px-5 py-3.5 rounded-2xl border bg-white text-black font-bold outline-none ${isPasswordMatch ? 'border-green-500' : 'border-gray-200'}`} />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                </div>
            </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex items-start gap-3 border border-red-100 font-bold text-sm"><AlertCircle size={20} /> {error}</div>}

        <div className="flex justify-between items-center pt-6 border-t border-gray-100">
          <Link href="/creators/auth/niche" className="text-gray-400 font-bold hover:text-black flex items-center gap-2 text-sm"><ChevronLeft size={18} /> Retour</Link>
          <button 
            onClick={handleFinish} 
            disabled={!isFormValid || loading} 
            className={`px-10 py-4 rounded-2xl font-bold transition-all text-sm uppercase flex items-center justify-center min-w-[200px] ${isFormValid && !loading ? "bg-[#ceaf4a] text-white shadow-xl" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Finaliser mon inscription"}
          </button>
        </div>
      </div>
    </main>
  );
}