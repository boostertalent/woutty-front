"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { LayoutDashboard, UserCheck, Settings, LogOut, Loader2 } from 'lucide-react';

export default function BrandDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [brandInfo, setBrandInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchBrandInfo();
  }, []);

  const fetchBrandInfo = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth/login'); return; }

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
    await supabase.auth.signOut();
    router.push('/auth/login');
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
      name: 'Mon profil',
      icon: <Settings size={20} />,
      href: '/brands/dashboard/profile',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#D4A017] animate-spin" />
      </div>
    );
  }

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
            // Dashboard actif uniquement sur /brands/dashboard exactement
            // Collaborations actif sur /brands/dashboard/collaborations
            // Profil actif sur /brands/dashboard/profile
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

      {/* CONTENU DE LA PAGE */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
