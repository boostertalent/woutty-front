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
  Camera,
  Settings,
  LogOut,
  Calendar
} from 'lucide-react';

export default function CreatorDashboard() {
  const [activeTab, setActiveTab] = useState('Ma performance');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  const menuItems = [
    { name: 'Ma performance', icon: <BarChart3 size={20} /> },
    { name: 'Opportunités', icon: <Briefcase size={20} /> },
    { name: 'Mes campagnes', icon: <Send size={20} /> },
    { name: 'Mon profil', icon: <User size={20} /> },
  ];

  const [selectedPlatforms] = useState([
    { id: 'insta', name: 'Instagram', icon: <Instagram size={14} />, followers: '1 M', follows: '3M', posts: '8M', engagement: '2%' },
    { id: 'tt', name: 'Tik tok', icon: <span className="text-[10px]">🎵</span>, followers: '1.2 M', follows: '300', posts: '20', engagement: '20%' },
    { id: 'snap', name: 'Snapchat', icon: <Ghost size={14} />, followers: '800 K', follows: '150', posts: '150', engagement: '15%' },
    { id: 'x', name: 'X', icon: <Twitter size={14} />, followers: '10 K', follows: '200', posts: '1.2K', engagement: '5%' },
  ]);

  // Ajout des titres et des dates ici
  const allPosts = [
    { 
      id: 1, 
      title: "Routine Matinale Bio", 
      date: "24 Janv. 2024",
      platform: 'Instagram', 
      icon: <Instagram size={10} />, 
      image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop', 
      likes: '12K', 
      views: '45K' 
    },
    { 
      id: 2, 
      title: "Review Setup Gaming", 
      date: "22 Janv. 2024",
      platform: 'Tik tok', 
      icon: <span className="text-[10px]">🎵</span>, 
      image: 'https://images.unsplash.com/photo-1596558450268-9c27524baaf7?w=400&h=300&fit=crop', 
      likes: '85K', 
      views: '1.2M' 
    },
    { 
      id: 3, 
      title: "Vlog Unboxing", 
      date: "19 Janv. 2024",
      platform: 'Snapchat', 
      icon: <Ghost size={10} />, 
      image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop', 
      likes: '5K', 
      views: '20K' 
    },
  ];

  const opportunities = [
    { id: 1, title: "Lancement cosmétique bio", brand: "Natural beauty", price: "350,000 FCFA", tags: ["Skincare", "Beauty"] },
    { id: 2, title: "Lancement App Gaming", brand: "Playzone", price: "50,000 FCFA", tags: ["Tech", "Live"] },
  ];

  const filteredPosts = useMemo(() => {
    if (!activeFilter) return allPosts;
    return allPosts.filter(post => post.platform.toLowerCase() === activeFilter.toLowerCase());
  }, [activeFilter]);

  return (
    <div className="flex h-screen w-full bg-[#F9FAFB] font-sans overflow-hidden text-[#111827]">
      
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col p-6 h-full flex-shrink-0">
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
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === item.name ? 'bg-[#EBD8A3] text-[#D4A017]' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col p-10 h-full overflow-hidden">
        
        <header className="mb-8 flex-shrink-0">
          <h1 className="text-3xl font-serif font-bold">
            {activeTab === 'Mes campagnes' ? 'Suivi contrats' : activeTab}
          </h1>
          <p className="text-gray-400 text-sm mt-1 font-medium italic">Gérez votre influence et vos revenus en temps réel.</p>
        </header>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'Ma performance' ? (
            <div className="h-full flex flex-col space-y-8">
              <div className="grid grid-cols-4 gap-4 flex-shrink-0">
                {selectedPlatforms.map((platform) => (
                  <div 
                    key={platform.id}
                    onClick={() => setActiveFilter(platform.name)}
                    className={`p-4 rounded-[24px] border cursor-pointer transition-all shadow-sm ${
                      activeFilter === platform.name ? 'bg-white border-[#D4A017] ring-2 ring-[#D4A017]/10' : 'bg-white border-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-4 text-[#D4A017]">
                      <div className="p-1 border border-[#D4A017] rounded-md">{platform.icon}</div>
                      <span className="text-[9px] font-bold uppercase tracking-widest">{platform.name}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-center">
                        <p className="text-xs font-black">{platform.followers}</p>
                        <p className="text-[7px] text-gray-300 uppercase font-bold">followers</p>
                      </div>
                       <div className="text-center">
                        <p className="text-xs font-black">{platform.follows}</p>
                        <p className="text-[7px] text-gray-300 uppercase font-bold">follows</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-black">{platform.engagement}</p>
                        <p className="text-[7px] text-gray-300 uppercase font-bold">Engagement</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-black">{platform.posts}</p>
                        <p className="text-[7px] text-gray-300 uppercase font-bold">Posts</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-serif font-bold">Mes posts</h2>
                  <button onClick={() => setActiveFilter(null)} className="text-[10px] font-bold text-[#D4A017] underline">Voir tout</button>
                </div>
                <div className="grid grid-cols-3 gap-6 flex-1 min-h-0 overflow-y-auto pr-2">
                  {filteredPosts.map((post) => (
                    <div key={post.id} className="relative rounded-[24px] overflow-hidden bg-gray-100 border-4 border-white shadow-md group h-fit">
                      {/* Badge Plateforme */}
                      <div className="absolute top-3 left-3 z-10 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 border border-[#D4A017]/20">
                        <span className="text-[#D4A017]">{post.icon}</span>
                        <span className="text-[8px] font-black uppercase tracking-tighter text-[#111827]">
                          {post.platform}
                        </span>
                      </div>

                      {/* Nouveau: Badge Date */}
                      <div className="absolute top-3 right-3 z-10 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-white border border-white/10">
                        <Calendar size={10} className="text-[#D4A017]" />
                        <span className="text-[8px] font-bold uppercase tracking-tighter">
                          {post.date}
                        </span>
                      </div>
                      
                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={post.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                      </div>

                      {/* Overlay Infos (Titre + Stats) */}
                      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12">
                        {/* Nouveau: Titre du Post */}
                        <h4 className="text-white text-[11px] font-bold mb-2 ml-2 line-clamp-1">
                          {post.title}
                        </h4>
                        
                        <div className="w-full bg-black/50 backdrop-blur-md rounded-full px-4 py-2 flex justify-between items-center border border-white/20 text-white text-[9px] font-bold">
                          <div className="flex items-center gap-1"><Heart size={11} className="text-[#D4A017] fill-[#D4A017]" /> {post.likes}</div>
                          <div className="flex items-center gap-1"><MessageCircle size={11} className="text-[#D4A017] fill-[#D4A017]" /> 12</div>
                          <div className="flex items-center gap-1"><Share2 size={11} className="text-[#D4A017]" /> 5</div>
                          <div className="flex items-center gap-1"><Eye size={11} className="text-[#D4A017]" /> {post.views}</div>
                          <div className="text-[#D4A017] italic">% 2.4</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab === 'Opportunités' ? (
            <div className="grid grid-cols-2 gap-8 items-start">
              {opportunities.map((op) => (
                <div key={op.id} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-50 relative group transition-all hover:shadow-xl">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                      <Briefcase className="text-[#D4A017]" size={24} />
                    </div>
                    <span className="text-[10px] font-bold text-[#22C55E] bg-[#F0FDF4] px-3 py-1.5 rounded-full border border-green-100">
                      {op.price}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{op.title}</h3>
                  <p className="text-gray-400 text-xs mb-4 uppercase tracking-tighter font-medium">{op.brand}</p>
                  <div className="flex gap-2 mb-8">
                    {op.tags.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-gray-50 rounded-full text-[10px] font-bold text-gray-400 border border-gray-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="w-full py-4 bg-[#111827] text-white rounded-full font-bold text-sm hover:bg-black transition-all active:scale-[0.98] shadow-lg shadow-black/10">
                    Postuler maintenant
                  </button>
                </div>
              ))}
            </div>
          ) : activeTab === 'Mes campagnes' ? (
            <div className="grid grid-cols-2 gap-8 items-start">
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-50">
                <div className="flex justify-between items-center mb-10">
                  <div className="w-12 h-12 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                    <Briefcase className="text-[#D4A017]" size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-[#22C55E] bg-[#F0FDF4] px-4 py-1.5 rounded-full border border-green-100 uppercase tracking-widest">
                    En cours
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-10">Lancement cosmétique bio</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400 tracking-widest">
                    <span>Livrables</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#EBD8A3] w-[5%]" />
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'Mon profil' ? (
            <div className="max-w-2xl bg-white rounded-[32px] shadow-sm border border-gray-50 overflow-hidden">
              <div className="h-32 bg-[#EBD8A3] relative">
                <div className="absolute -bottom-12 left-8">
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden relative group">
                    <User className="w-full h-full p-4 text-gray-400" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <Camera className="text-white" size={20} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-16 pb-8 px-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-bold">créateur</h2>
                    <p className="text-gray-400 text-sm font-medium">Créatrice Lifestyle & Beauté</p>
                  </div>
                  <button className="px-6 py-2 border border-gray-200 rounded-full text-xs font-bold hover:bg-gray-50 transition-colors">
                    Modifier le profil
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                    <Settings className="text-gray-400" size={18} />
                    <span className="text-sm font-bold">Paramètres du compte</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3 text-red-500 cursor-pointer">
                    <LogOut size={18} />
                    <span className="text-sm font-bold">Se déconnecter</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}