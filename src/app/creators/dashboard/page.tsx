"use client";

import React, { useState, useEffect } from 'react';
import { 
  Heart, Eye, TrendingUp, Zap, Calendar, 
  ArrowUpRight, LayoutDashboard, Briefcase, 
  CheckCircle2, Clock, BarChart3, Users
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CreatorDashboard() {
  const [activeMenu, setActiveMenu] = useState<'stats' | 'available' | 'my_campaigns'>('stats');
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const USER_ID_W = "votre-uuid-test"; 

  useEffect(() => {
    async function fetchCreatorData() {
      try {
        setLoading(true);
        const { data: profileData } = await supabase
          .from('info_profile')
          .select('*')
          .eq('id_w', USER_ID_W)
          .single();

        const { data: postsData } = await supabase
          .from('info_poste')
          .select('*')
          .order('date_poste', { ascending: false })
          .limit(6);

        setProfile(profileData);
        setPosts(postsData || []);
      } catch (error) {
        console.error("Erreur dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCreatorData();
  }, []);

  if (loading) return <div className="p-20 text-center font-bold text-[#D4A017]">Chargement du studio...</div>;

  return (
    <div className="flex min-h-screen bg-[#FAFBFC] font-sans">
      
      {/* --- MENU LATÉRAL --- */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col sticky top-0 h-screen shadow-sm">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-[#111827] rounded-xl flex items-center justify-center text-[#D4A017]">
              <Zap size={24} fill="currentColor" />
            </div>
            <span className="font-serif font-black text-xl tracking-tighter">CREATOR<span className="text-[#D4A017]">.</span></span>
          </div>

          <nav className="space-y-1">
            <p className="text-[10px] font-black uppercase text-gray-400 mb-4 ml-4 tracking-widest">Analyse</p>
            <MenuButton 
              isActive={activeMenu === 'stats'} 
              onClick={() => setActiveMenu('stats')} 
              icon={<BarChart3 size={18} />} 
              label="Ma Performance" 
            />
            
            <p className="text-[10px] font-black uppercase text-gray-400 mb-4 mt-8 ml-4 tracking-widest">Business</p>
            <MenuButton 
              isActive={activeMenu === 'available'} 
              onClick={() => setActiveMenu('available')} 
              icon={<Briefcase size={18} />} 
              label="Opportunités" 
            />
            <MenuButton 
              isActive={activeMenu === 'my_campaigns'} 
              onClick={() => setActiveMenu('my_campaigns')} 
              icon={<CheckCircle2 size={18} />} 
              label="Mes Campagnes" 
            />
          </nav>
        </div>

        {/* Profil Mini en bas du menu */}
        <div className="mt-auto p-6 border-t border-gray-50">
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl">
            <img src={profile?.url_photo_profile} className="w-10 h-10 rounded-xl object-cover" />
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">{profile?.nom_complet}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase">{profile?.nom_plateforme}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- CONTENU PRINCIPAL --- */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        
        {/* Header Dynamique selon le menu */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-serif font-black text-[#111827]">
              {activeMenu === 'stats' ? "Analytics Studio" : activeMenu === 'available' ? "Marketplace" : "Suivi Contrats"}
            </h1>
            <p className="text-gray-400 text-sm mt-1">Gérez votre influence et vos revenus en temps réel.</p>
          </div>
          <button className="bg-[#111827] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:shadow-xl transition-all">
            Mettre à jour
          </button>
        </div>

        {/* Rendu Conditionnel des Sections */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* SECTION : PERFORMANCE */}
          {activeMenu === 'stats' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard title="Abonnés" value={profile?.nbre_followers?.toLocaleString()} icon={<Users size={22} />} trend="Live" />
                <StatCard title="Posts" value={profile?.nbre_poste} icon={<LayoutDashboard size={22} />} />
                <StatCard title="Engagement" value="4.8%" icon={<Zap size={22} className="text-[#D4A017]" />} />
                <StatCard title="Moy. Likes" value={posts.length > 0 ? Math.round(posts.reduce((acc, p) => acc + p.nbre_like, 0) / posts.length) : "0"} icon={<Heart size={22} />} />
              </div>

              <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm">
                <h2 className="text-xl font-bold mb-8">Flux de Publications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {posts.map((post) => <PostCard key={post.id_w} post={post} />)}
                </div>
              </div>
            </>
          )}

          {/* SECTION : OPPORTUNITÉS */}
          {activeMenu === 'available' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CampaignAvailableCard title="Lancement Cosmétique Bio" brand="Naturelle Lux" reward="350,000 CFA" tags={["Skincare", "Reels"]} />
              <CampaignAvailableCard title="Série Gaming Mobile" brand="PlayZone" reward="150,000 CFA" tags={["Tech", "Live"]} />
            </div>
          )}

          {/* SECTION : MES CAMPAGNES */}
          {activeMenu === 'my_campaigns' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CampaignActiveCard title="Partenariat Tech 2026" status="Production" progress={65} />
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function MenuButton({ isActive, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${
        isActive 
        ? "bg-[#D4A017]/10 text-[#D4A017] shadow-sm" 
        : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function PostCard({ post }: { post: any }) {
  return (
    <div className="group bg-white rounded-[32px] border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
      <div className="relative h-56 bg-gray-50 flex items-center justify-center">
        <span className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm">{post.type_poste}</span>
        <Eye className="text-gray-200 group-hover:scale-110 transition-transform" size={40} />
      </div>
      <div className="p-6">
        <h3 className="font-bold text-[#111827] line-clamp-2 min-h-[3rem] group-hover:text-[#D4A017] transition-colors">{post.titre_poste}</h3>
        <div className="flex justify-between mt-6 bg-gray-50 p-4 rounded-2xl">
          <div className="text-center">
            <p className="text-[9px] font-bold text-gray-400 uppercase">Likes</p>
            <p className="font-black text-sm">{post.nbre_like?.toLocaleString()}</p>
          </div>
          <div className="text-center border-x border-gray-200 px-4">
            <p className="text-[9px] font-bold text-gray-400 uppercase">Vues</p>
            <p className="font-black text-sm text-[#D4A017]">{post.nbre_vue?.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-bold text-gray-400 uppercase">Comms</p>
            <p className="font-black text-sm">{post.nbre_commentaire}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CampaignAvailableCard({ title, brand, reward, tags }: any) {
  return (
    <div className="bg-white p-8 rounded-[40px] border border-gray-100 hover:border-[#D4A017]/50 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-[#D4A017] group-hover:bg-[#D4A017] group-hover:text-white transition-all">
          <Briefcase size={28}/>
        </div>
        <span className="text-xl font-black text-green-600">{reward}</span>
      </div>
      <h3 className="text-xl font-black text-[#111827] mb-1">{title}</h3>
      <p className="text-gray-400 font-bold text-sm mb-6">{brand}</p>
      <div className="flex gap-2 mb-8">
        {tags.map((t: string) => <span key={t} className="text-[10px] font-black bg-gray-50 px-3 py-1.5 rounded-lg text-gray-400 uppercase">{t}</span>)}
      </div>
      <button className="w-full py-4 bg-[#111827] text-white rounded-2xl font-black text-sm hover:bg-[#D4A017] transition-all flex items-center justify-center gap-2">
        Postuler maintenant <ArrowUpRight size={18} />
      </button>
    </div>
  );
}

function CampaignActiveCard({ title, status, progress }: any) {
  return (
    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A017]/5 rounded-full -mr-16 -mt-16" />
      <div className="flex justify-between items-center mb-8">
        <span className="text-xs font-black text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-widest">{status}</span>
        <Clock size={20} className="text-gray-300" />
      </div>
      <h3 className="text-2xl font-black text-[#111827] mb-8">{title}</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-xs font-black text-gray-400 uppercase">
          <span>Livrables</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-3 bg-gray-50 rounded-full">
          <div className="h-full bg-[#D4A017] rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}