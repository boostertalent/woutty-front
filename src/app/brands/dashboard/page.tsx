"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Users, 
  Target, 
  Zap, 
  BarChart3, 
  LogOut, 
  ArrowRight, 
  Sparkles,
  Pencil,
  Trash2,
  LayoutDashboard,
  Search,
  Settings
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { createBrowserClient } from '@supabase/ssr';

export default function BrandDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [creators, setCreators] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBudget: 0,
    totalReach: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      let { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const { data: { session: retrySession } } = await supabase.auth.getSession();
        session = retrySession;
      }
      if (!session) {
        router.push('/auth/login');
        return;
      }
      const BRAND_ID = session.user.id;
      const [creatorsRes, campaignsRes] = await Promise.all([
        supabase.from('info_profile').select('*').order('nbre_followers', { ascending: false }).limit(4),
        supabase.from('campaigns').select('*').eq('id_w', BRAND_ID).order('created_at', { ascending: false })
      ]);
      if (creatorsRes.error) throw creatorsRes.error;
      if (campaignsRes.error) throw campaignsRes.error;

      const validCreators = creatorsRes.data || [];
      const validCampaigns = campaignsRes.data || [];
      setCreators(validCreators);
      setCampaigns(validCampaigns);

      const budget = validCampaigns.reduce((acc, curr) => acc + (Number(curr.budget) || 0), 0);
      const reach = validCreators.reduce((acc, curr) => acc + (Number(curr.nbre_followers) || 0), 0);
      setStats({ totalBudget: budget, totalReach: reach });
    } catch (error: any) {
      console.error("Erreur Dashboard:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []); 

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette campagne ?")) return;
    try {
      const { error } = await supabase.from('campaigns').delete().eq('id', id);
      if (error) throw error;
      setCampaigns(campaigns.filter(c => c.id !== id));
      fetchData();
    } catch (error: any) {
      alert("Erreur lors de la suppression : " + error.message);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/brands/dashboard', active: true },
    { name: 'Campagnes', icon: <Zap size={20} />, href: '/brands/auth/campagne' },
    { name: 'Collaboration', icon: <Zap size={20} />, href: '#' },
    { name: 'Mon profil', icon: <Settings size={20} />, href: '#' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <h2 className="text-2xl font-black tracking-tighter text-[#111827]">WOUTTY<span className="text-[#D4A017]"></span></h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${item.active ? 'bg-[#D4A017]/10 text-[#D4A017]' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}>
                {item.icon}
                {item.name}
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-500 font-bold text-sm transition-all"
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          
          {/* TOP NAV */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#111827]">Dashboard marque/entreprise</h1>
              <p className="text-gray-400 text-sm font-medium">Content de vous revoir !</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/brands/auth/campagne">
                <button className="bg-[#D4A017] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#B88A14] transition-all shadow-lg shadow-[#D4A017]/20">
                  <Zap size={18} fill="currentColor" /> 
                  créer une campagne
                </button>
              </Link>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard title="Budget Total" value={`${stats.totalBudget.toLocaleString()} CFA`} icon={<Target size={24} />} />
                        <StatCard title="Campagne en cours" value={campaigns.length.toString()} icon={<Zap size={24} />} />
            
            <StatCard title="Campagne terminée" value={campaigns.length.toString()} icon={<Zap size={24} />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* COLONNE GAUCHE: CAMPAGNES */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[#111827] font-bold text-lg">Vos campagnes</h2>
                <span className="text-xs font-bold text-[#D4A017] bg-[#D4A017]/5 px-3 py-1 rounded-full uppercase tracking-wider">Actives</span>
              </div>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-24 bg-white rounded-[24px] animate-pulse border border-gray-100 shadow-sm"></div>
                  ))}
                </div>
              ) : campaigns.length > 0 ? (
                campaigns.map((camp) => (
                  <div key={camp.id} className="bg-white p-6 rounded-[24px] border border-gray-100 flex items-center justify-between transition-all hover:shadow-md group shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#D4A017]/10 rounded-full flex items-center justify-center text-[#D4A017] font-bold uppercase shrink-0">
                        {camp.title?.charAt(0) || 'C'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-[#111827] truncate">{camp.title}</h3>
                        <p className="text-xs text-gray-400">
                          {camp.objectives?.[0] || 'Notoriété'} • {Number(camp.budget).toLocaleString()} {camp.currency || 'CFA'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link href={`/brands/auth/edit/${camp.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil size={18} />
                      </Link>
                      <button onClick={() => handleDeleteCampaign(camp.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={18} />
                      </button>
                      <Link href={`/brands/dashboard/details/${camp.id}`} className="ml-2 text-xs font-black text-[#D4A017] bg-[#D4A017]/5 px-4 py-2 rounded-xl border border-[#D4A017]/10 hover:bg-[#D4A017] hover:text-white transition-all uppercase tracking-widest">
                        Détails
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-[32px] bg-white">
                   <p className="text-gray-400 font-medium">Aucune campagne active.</p>
                   <Link href="/brands/auth/campagne" className="text-[#D4A017] text-sm font-bold mt-2 block hover:underline">créer une campagne →</Link>
                </div>
              )}
            </div>

            {/* COLONNE DROITE: MATCHS IA */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col h-fit sticky top-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#111827]">Matchs suggérés</h2>
                <p className="text-[10px] text-[#D4A017] font-black flex items-center gap-1 uppercase tracking-widest mt-1">
                  <Sparkles size={12} /> IA Woutty
                </p>
              </div>

              <div className="space-y-6 mb-8">
                {creators.length > 0 ? (
                  creators.map((creator, idx) => (
                    <div key={creator.id || idx} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-xl transition-all">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0 border border-gray-100 overflow-hidden">
                          {creator.url_photo_profile && (
                            <img src={creator.url_photo_profile} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-[#111827] truncate">{creator.nom_complet || `Influenceur ${idx + 1}`}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter truncate">
                            {creator.la_plateforme || 'Instagram'} • {formatNumber(creator.nbre_followers || 0)}
                          </p>
                        </div>
                      </div>
                      <div className="bg-green-50 text-green-600 text-[9px] font-black px-2 py-1 rounded-md shrink-0 border border-green-100/50">
                        9{idx + 5}%
                      </div>
                    </div>
                  ))
                ) : (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-100 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                        <div className="h-2 bg-gray-50 rounded w-1/3" />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <Link href="/creators/public" className="mt-auto">
                <button className="w-full py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#111827] hover:text-white transition-all group uppercase tracking-widest">
                  Voir tous les créateurs
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}