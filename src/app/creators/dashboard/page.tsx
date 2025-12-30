'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr'; // Client Supabase pour le navigateur
import { useRouter } from 'next/navigation';
import { Loader2, LogOut, LayoutDashboard, Briefcase, Wallet, BarChart3, Settings } from 'lucide-react';

export default function CreatorsDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // On initialise le client SSR côté client
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  useEffect(() => {
    const fetchUser = async () => {
    
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        router.push('/creators/auth/login');
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    
    fetchUser();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/creators/auth/login');
    router.refresh(); // Force le rafraîchissement pour vider les caches
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-black" />
          <p className="text-gray-500 font-medium">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white p-2 rounded-lg">
            <LayoutDashboard size={24} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">Espace Créateur</h1>
        </div>
        
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-black/5 border border-gray-100">
          <div className="mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-2">
              Bienvenue, <span className="text-gray-500 font-medium">{user.email?.split('@')[0]}</span> 👋
            </h2>
            <p className="text-gray-400 font-bold italic">
              Connecté via {user.app_metadata?.provider === 'google' ? 'Google' : 'Email'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardCard 
              icon={<Briefcase className="text-blue-500" />} 
              title="Mes campagnes" 
              desc="Gérez vos collaborations avec les marques ici." 
            />
            <DashboardCard 
              icon={<Wallet className="text-green-500" />} 
              title="Mes paiements" 
              desc="Consultez vos revenus et vos transactions." 
            />
            <DashboardCard 
              icon={<BarChart3 className="text-purple-500" />} 
              title="Statistiques" 
              desc="Suivez la croissance de votre audience." 
            />
            <DashboardCard 
              icon={<Settings className="text-gray-400" />} 
              title="Paramètres" 
              desc="Modifiez vos préférences de compte." 
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// Composant réutilisable pour les cartes
function DashboardCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="group p-6 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-black hover:bg-white transition-all cursor-pointer">
      <div className="mb-4 p-3 bg-white inline-block rounded-xl shadow-sm group-hover:shadow-md transition-all">
        {icon}
      </div>
      <h3 className="text-lg font-black mb-1">{title}</h3>
      <p className="text-gray-500 text-sm font-medium leading-relaxed">{desc}</p>
    </div>
  );
}