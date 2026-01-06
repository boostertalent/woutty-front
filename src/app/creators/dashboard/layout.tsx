'use client';

import React, { useEffect, useState } from "react";
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, 
  LayoutDashboard, 
  Send, 
  BarChart3, 
  Settings, 
  LogOut,
  Bell,
  User as UserIcon
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // AJOUT : avatar_url dans le state
  const [userProfile, setUserProfile] = useState<{full_name?: string, avatar_url?: string} | null>(null);

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !user) {
        setTimeout(() => {
          if (mounted) router.replace('/creators/auth/login');
        }, 500);
      } else {
        // MODIFICATION : On récupère aussi avatar_url
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();
        
        if (mounted) {
          setUserProfile(profile);
          setIsAuthorized(true);
          setIsLoading(false);
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        if (session) {
          setIsAuthorized(true);
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setIsAuthorized(false);
          router.replace('/creators/auth/login');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/creators/auth/login');
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#ceaf4a]" />
          <p className="text-sm font-bold text-gray-400 tracking-widest uppercase">Vérification de l'accès...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* --- SIDEBAR FIXE --- */}
      <aside className="w-72 bg-white border-r border-gray-100 hidden lg:flex flex-col fixed h-full">
        <div className="p-8">
          <Link href="/creators/dashboard" className="flex items-center gap-3 font-black text-2xl tracking-tighter">
            <div className="w-10 h-10 bg-[#ceaf4a] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#ceaf4a]/20 font-bold">
              W
            </div>
            WOUTTY
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavAnchor href="/creators/dashboard" icon={LayoutDashboard} label="Tableau de bord" active={pathname === '/creators/dashboard'} />
          <NavAnchor href="/creators/dashboard/campaigns" icon={Send} label="Mes Campagnes" active={pathname.includes('/campaigns')} />
          <NavAnchor href="/creators/dashboard/analytics" icon={BarChart3} label="Statistiques" active={pathname.includes('/analytics')} />
          <NavAnchor href="/creators/dashboard/settings" icon={Settings} label="Paramètres" active={pathname.includes('/settings')} />
        </nav>

        {/* Profil & Déconnexion MODIFIÉ */}
        <div className="p-6 border-t border-gray-50 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-[#fdf2d0] flex-shrink-0">
              {userProfile?.avatar_url ? (
                <img 
                  src={userProfile.avatar_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#fdf2d0] flex items-center justify-center text-[#ceaf4a]">
                  <UserIcon size={20} />
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate text-gray-900">
                {userProfile?.full_name || "Créateur"}
              </p>
              <p className="text-[10px] text-[#ceaf4a] font-black uppercase tracking-wider">
                Vérifié
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-gray-400 font-bold p-3 hover:bg-red-50 hover:text-red-500 w-full rounded-2xl transition-all group text-sm"
          >
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* --- ZONE DE CONTENU --- */}
      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        <header className="lg:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20">
           <span className="font-black text-[#ceaf4a]">WOUTTY</span>
           <Bell size={20} className="text-gray-400" />
        </header>

        <section className="p-6 lg:p-10">
          {children}
        </section>
      </main>
    </div>
  );
}

function NavAnchor({ href, icon: Icon, label, active }: { href: string, icon: any, label: string, active: boolean }) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-4 w-full p-4 rounded-2xl font-bold transition-all ${
        active 
        ? "bg-[#ceaf4a] text-white shadow-xl shadow-[#ceaf4a]/15 scale-[1.02]" 
        : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
      }`}
    >
      <Icon size={22} />
      <span className="text-[15px]">{label}</span>
    </Link>
  );
}