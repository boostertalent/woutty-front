"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import {
  Users, Building2, BarChart3, Shield, Search,
  LogOut, Loader2, X, User, Activity, HeadphonesIcon, MessageCircle, FileVideo
} from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isPrincipalAdmin, setIsPrincipalAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    checkAdminAccess();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('admin-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.push('/auth/login'); return; }
      setUserId(user.id);

      const { data: creatorCheck } = await supabase
        .from('createur').select('*').eq('id_w', user.id).maybeSingle();

      if (creatorCheck && creatorCheck.role === 'admin') {
        setIsPrincipalAdmin(true);
        setAdminUser({
          name: creatorCheck.full_name || 'Admin',
          email: user.email || '',
          initials: (creatorCheck.full_name || 'AD').substring(0, 2).toUpperCase(),
          avatar_url: creatorCheck.avatar_url
        });
        setLoading(false);
        return;
      }

      const { data: adminCheck } = await supabase
        .from('admin').select('*').eq('id_w', user.id).maybeSingle();

      if (adminCheck) {
        setIsPrincipalAdmin(false);
        setAdminUser({
          name: adminCheck.full_name || 'Admin',
          email: user.email || '',
          initials: (adminCheck.full_name || 'AD').substring(0, 2).toUpperCase()
        });
        setLoading(false);
        return;
      }

      router.push('/auth/login');
    } catch {
      router.push('/auth/login');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    router.push('/auth/login');
    router.refresh();
  };

  // Tous les items de navigation - chaque item est une vraie route
  const navItems = [
    { href: '/admin/dashboard',   label: "Vue d'ensemble", icon: <BarChart3 size={20} />, always: true },
    { href: '/admin/campaigns',   label: 'Campagnes',       icon: <MessageCircle size={20} />, always: true },
    { href: '/admin/creators',    label: 'Créateurs',       icon: <Users size={20} />,      always: true },
    { href: '/admin/brands',      label: 'Marques',         icon: <Building2 size={20} />,  always: true },
    { href: '/admin/admins',      label: 'Admins',          icon: <Shield size={20} />,     always: true },
    { href: '/admin/validate-submissions', label: 'Zone Tampon', icon: <FileVideo size={20} />, always: true },
    { href: '/admin/assistance',  label: 'Assistance',      icon: <HeadphonesIcon size={20} />, always: true },
    { href: '/admin/logs',        label: "Logs d'activité", icon: <Activity size={20} />,   always: false },
    { href: '/admin/profile',     label: 'Mon profil',      icon: <User size={20} />,       always: false },
  ];

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="w-16 h-16 text-[#ceaf4a] animate-spin" />
      </div>
    );
  }

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
          {navItems.map((item) => {
            // Masquer Logs et Profil si pas admin principal
            if (!item.always && !isPrincipalAdmin) return null;

            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                  isActive
                    ? 'bg-[#ceaf4a] text-white shadow-lg shadow-[#ceaf4a]/25 font-bold'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 transition-all duration-200 font-bold group">
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="text-sm">Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="relative w-96 hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              id="admin-search-input"
              type="text"
              placeholder="Rechercher (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl py-2 pl-10 focus:ring-2 focus:ring-[#ceaf4a]/20 outline-none transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900">
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <NotificationBell recipientId={userId} />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold capitalize leading-none mb-1">{adminUser?.name}</p>
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest leading-none">
                  {isPrincipalAdmin ? 'Admin Principal' : 'Admin'}
                </p>
              </div>
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-black/20 ring-2 ring-white overflow-hidden">
                {adminUser?.avatar_url ? (
                  <img src={adminUser.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (adminUser?.initials || 'AD')}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENU */}
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {children}
        </div>

        {/* BOUTON SUPPORT */}
        <button
          onClick={() => window.open('https://boostertalent.app.n8n.cloud/webhook/b4d75f16-f24e-4ca0-97a6-49502970c201/chat', 'ChatSupportWoutty', 'width=400,height=700,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes')}
          className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-r from-[#ceaf4a] to-[#b8962f] text-white rounded-full shadow-2xl hover:shadow-[#ceaf4a]/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        >
          <MessageCircle size={28} className="group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">!</span>
        </button>

      </main>
    </div>
  );
}
