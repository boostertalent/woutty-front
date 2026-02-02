"use client"; // Indique à Next.js que ce composant s'exécute côté client

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Hook Next.js pour la navigation
import { createBrowserClient } from '@supabase/ssr'; // Client Supabase côté navigateur
import { 
  Users, Building2, BarChart3, ShieldCheck, Search, 
  Bell, TrendingUp, Calendar, LogOut, Loader2,
  ArrowUpRight 
} from 'lucide-react'; // Icônes
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts'; // Composants graphiques

// --- DONNÉES SIMULÉES POUR LE GRAPHIQUE ---
const activityData = [
  { month: 'Juil', createurs: 40, marques: 24 },
  { month: 'Août', createurs: 150, marques: 56 },
  { month: 'Sept', createurs: 200, marques: 98 },
  { month: 'Oct', createurs: 450, marques: 120 },
  { month: 'Nov', createurs: 380, marques: 190 },
  { month: 'Déc', createurs: 600, marques: 250 },
];

// --- TYPES TYPESCRIPT ---
interface DashboardStats {
  creators: number;
  brands: number;
  campaigns: number;
}

interface AdminUser {
  name: string;
  email: string;
  initials: string;
}

export default function AdminDashboard() {
  const router = useRouter(); // Hook pour navigation programmatique
  const [loading, setLoading] = useState(true); // État du chargement
  const [stats, setStats] = useState<DashboardStats>({ creators: 0, brands: 0, campaigns: 0 }); // Statistiques
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null); // Info admin

  // Initialisation du client Supabase
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // --- EFFECT POUR CHARGER LES DONNÉES ---
  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- FONCTION DE RÉCUPÉRATION DES DONNÉES ---
  const fetchDashboardData = async () => {
    try {
      setLoading(true); // active le chargement

      // Récupère l'utilisateur connecté
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push('/auth/login'); // Redirection si non connecté
        return;
      }

      // Récupère le profil de l'utilisateur
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        // router.push('/'); // Sécurité admin (optionnel)
      }

      // Mise à jour de l'état de l'utilisateur admin
      setAdminUser({
        name: profile?.full_name || user.email?.split('@')[0] || 'Admin',
        email: user.email || '',
        initials: (profile?.full_name || 'AD').substring(0, 2).toUpperCase()
      });

      // Comptage des créateurs
      const { count: creatorsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'creator');

      // Comptage des marques
      const { count: brandsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'brand');

      // Mise à jour des stats
      setStats({
        creators: creatorsCount || 0,
        brands: brandsCount || 0,
        campaigns: 142 // valeur statique pour l'exemple
      });

    } catch (error) {
      console.error("Erreur dashboard:", error);
    } finally {
      setLoading(false); // Fin du chargement
    }
  };

  // --- FONCTION DE DÉCONNEXION ---
  const handleLogout = async () => {
    await supabase.auth.signOut(); // Déconnexion
    router.push('/auth/login'); // Redirection login
    router.refresh(); // Rafraîchissement
  };

  // --- RENDU PRINCIPAL ---
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans text-gray-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col sticky top-0 h-screen z-20">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-[#ceaf4a]">
            Woutty <span className="text-gray-900 text-sm block font-medium">Administration</span>
          </h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <NavItem icon={<BarChart3 size={20} />} label="Vue d'ensemble" active />
          <NavItem icon={<Users size={20} />} label="Créateurs" />
          <NavItem icon={<Building2 size={20} />} label="Marques" />
          <NavItem icon={<ShieldCheck size={20} />} label="Modération" />
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all duration-200 font-bold group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="text-sm">Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">
        
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="relative w-96 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher (Ctrl+K)" 
              className="w-full bg-gray-50 border-none rounded-xl py-2 pl-10 focus:ring-2 focus:ring-[#ceaf4a]/20 outline-none transition-all"
            />
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                {loading ? (
                  <div className="space-y-1.5 flex flex-col items-end">
                    <div className="h-3.5 w-24 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-2.5 w-16 bg-gray-100 animate-pulse rounded"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-bold capitalize leading-none mb-1">{adminUser?.name}</p>
                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest leading-none">Admin connecté</p>
                  </>
                )}
              </div>
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-black/20 ring-2 ring-white">
                {loading ? <Loader2 size={16} className="animate-spin" /> : adminUser?.initials}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              {loading ? (
                <div className="h-8 w-64 bg-gray-200 animate-pulse rounded-lg mb-2"></div>
              ) : (
                <h1 className="text-3xl font-bold text-gray-900">
                  Ravi de vous revoir, <span className="text-[#ceaf4a]">{adminUser?.name}</span> 👋
                </h1>
              )}
              <p className="text-gray-500 font-medium mt-1">Voici l'état de la plateforme aujourd'hui.</p>
            </div>
            
            <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all text-sm shadow-sm">
              <Calendar size={16} /> 30 derniers jours
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Total Créateurs" 
              value={stats.creators} 
              trend="+12.5%" 
              icon={<Users className="text-blue-600" />} 
              color="blue" 
              loading={loading}
            />
            <StatCard 
              title="Total Marques" 
              value={stats.brands} 
              trend="+8.2%" 
              icon={<Building2 className="text-purple-600" />} 
              color="purple" 
              loading={loading}
            />
            <StatCard 
              title="Campagnes Actives" 
              value={stats.campaigns} 
              trend="+4.1%" 
              icon={<TrendingUp className="text-[#ceaf4a]" />} 
              color="gold" 
              loading={loading}
            />
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h3 className="font-bold text-xl text-gray-900">Croissance des inscriptions</h3>
                <p className="text-sm text-gray-400 mt-1">Comparaison mensuelle Créateurs vs Marques</p>
              </div>
              <div className="flex gap-4 text-xs font-bold bg-gray-50 p-2 rounded-xl">
                <div className="flex items-center gap-2 text-blue-600 px-2">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm"></span> Créateurs
                </div>
                <div className="flex items-center gap-2 text-[#b8962f] px-2">
                  <span className="w-2.5 h-2.5 bg-[#ceaf4a] rounded-full shadow-sm"></span> Marques
                </div>
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCreat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBrand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ceaf4a" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ceaf4a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 12}}
                    dy={10}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="createurs" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorCreat)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="marques" 
                    stroke="#ceaf4a" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorBrand)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// --- COMPOSANTS INTERNES ---
function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200 group ${
      active 
        ? 'bg-[#ceaf4a] text-white shadow-lg shadow-[#ceaf4a]/25 font-bold' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    }`}>
      {icon}
      <span className="text-sm font-medium">{label}</span>
      {!active && <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight size={14} />
      </div>}
    </div>
  );
}

function StatCard({ title, value, trend, icon, color, loading }: any) {
  const bgIcon = color === 'blue' ? 'bg-blue-50' : color === 'purple' ? 'bg-purple-50' : 'bg-[#fdf2d0]';
  
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3.5 rounded-2xl ${bgIcon}`}>
          {icon}
        </div>
        <span className="text-green-600 text-[11px] font-bold bg-green-50 px-2.5 py-1.5 rounded-full flex items-center gap-1">
          <TrendingUp size={12} /> {trend}
        </span>
      </div>
      
      <h4 className="text-gray-500 text-sm font-semibold tracking-wide">{title}</h4>
      
      {loading ? (
        <div className="h-9 w-24 bg-gray-100 animate-pulse rounded-lg mt-1"></div>
      ) : (
        <p className="text-3xl font-bold mt-1 text-gray-900">{value}</p>
      )}
    </div>
  );
}
