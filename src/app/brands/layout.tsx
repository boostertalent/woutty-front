"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { LayoutDashboard, UserCheck, Settings, LogOut, Loader2, FileVideo } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';
import ChatWidget from '@/components/ChatWidget';

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [brandInfo, setBrandInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ✅ Vérifier si c'est une page d'inscription
  const isAuthPage = pathname.startsWith('/brands/auth');

  useEffect(() => {
    if (!isAuthPage) {
      fetchBrandInfo();
    } else {
      setLoading(false); 
    }
  }, [isAuthPage]);

  const fetchBrandInfo = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth/login'); return; }
      setUserId(session.user.id);

      // Vérifier si admin en mode visualisation
      const adminViewingId = typeof window !== 'undefined'
        ? localStorage.getItem('admin_viewing_brand')
        : null;
      const brandId = adminViewingId || session.user.id;

      const { data } = await supabase
        .from('marque')
        .select('nom_marque, domaine')
        .eq('id_w', brandId)
        .single();

      setBrandInfo(data);
    } catch {
      // silencieux
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_viewing_brand');
        localStorage.removeItem('admin_mode');
      }
      await supabase.auth.signOut({ scope: 'global' });
    } catch {
      await supabase.auth.signOut();
    }
    router.replace('/auth/login');
    router.refresh();
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      href: '/brands/dashboard',
    },
    {
      name: 'Collaborations',
      icon: <UserCheck size={20} />,
      href: '/brands/dashboard/collaborations',
    },
    {
      name: 'Contenus à valider',
      icon: <FileVideo size={20} />,
      href: '/brands/dashboard/validate-submissions',
    },
    {
      name: 'Mon profil',
      icon: <Settings size={20} />,
      href: '/brands/dashboard/profile',
    },
  ];

  
  if (isAuthPage) {
    return <>{children}</>;
  }

  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#D4A017] animate-spin" />
      </div>
    );
  }

  // ✅ Pour /brands/dashboard
  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col sticky top-0 h-screen shrink-0">

        {/* LOGO / NOM MARQUE */}
        <div className="p-8">
          <h2 className="text-2xl font-black tracking-tighter text-[#111827]">
            {brandInfo?.nom_marque || 'WOUTTY'}
            <span className="text-[#D4A017]">.</span>
          </h2>
          {brandInfo?.domaine && (
            <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">
              {brandInfo.domaine}
            </p>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = item.href === '/brands/dashboard'
              ? pathname === '/brands/dashboard'
              : pathname.startsWith(item.href);

            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#D4A017]/10 text-[#D4A017]'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                }`}>
                  {item.icon}
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* DÉCONNEXION */}
        <div className="p-4 border-t border-gray-50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-500 font-bold text-sm transition-all rounded-xl hover:bg-red-50"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-y-auto">

        {/* HEADER (notif + déconnexion : visible sur mobile car la sidebar est masquée) */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-end gap-2 px-4 md:px-8 sticky top-0 z-10">
          <NotificationBell recipientId={userId} />
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors md:hidden"
            aria-label="Se déconnecter"
          >
            <LogOut size={16} />
            <span className="max-[380px]:hidden">Quitter</span>
          </button>
        </header>

        {children}
      </main>

      <ChatWidget />
    </div>
  );
}
