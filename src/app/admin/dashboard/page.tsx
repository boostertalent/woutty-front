"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Users, Building2, BarChart3, Shield, Search, TrendingUp, 
  Calendar, LogOut, Loader2, X,
  User, Edit2, Save, Activity, Clock, FileText, HeadphonesIcon,
  CheckCircle2, XCircle, Mail, Phone, MessageCircle, Package
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import Link from 'next/link';

interface DashboardStats {
  creators: number;
  brands: number;
  campaigns: number;
}

interface AdminUser {
  id_w: string;
  name: string;
  email: string;
  phone: string;
  initials: string;
  avatar_url?: string;
}

interface ActivityLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({ creators: 0, brands: 0, campaigns: 0 });
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'logs' | 'profile' | 'assistance'>('overview');
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [assistanceRequests, setAssistanceRequests] = useState<any[]>([]);
  const [assistanceFilter, setAssistanceFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [chartData, setChartData] = useState<any[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ full_name: '', phone: '' });
  const [isPrincipalAdmin, setIsPrincipalAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ✅ Lire le hash de l'URL pour basculer automatiquement sur la bonne vue
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#assistance') {
        setActiveView('assistance');
        fetchAssistanceRequests();
      } else if (hash === '#logs') {
        setActiveView('logs');
        fetchActivityLogs();
      } else if (hash === '#profile') {
        setActiveView('profile');
      } else {
        setActiveView('overview');
      }
    };

    // Lire le hash initial au chargement
    handleHashChange();

    // Écouter les changements de hash
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    fetchDashboardData();
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('admin-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (activeView === 'assistance') {
      fetchAssistanceRequests();
    }
  }, [assistanceFilter]);

  const logActivity = async (action: string, targetType: string, targetId: string, details: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !adminUser) return;
      await supabase.from('admin_logs').insert({
        admin_id: user.id,
        admin_name: adminUser.name,
        action, target_type: targetType, target_id: targetId, details,
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn("⚠️ Erreur log:", err);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_logs').select('*')
        .order('created_at', { ascending: false }).limit(50);
      setActivityLogs(error ? [] : (data || []));
    } catch { setActivityLogs([]); }
  };

  const fetchAssistanceRequests = async () => {
    try {
      let query = supabase
        .from('campaign_assistance_requests').select('*')
        .order('requested_at', { ascending: false });
      if (assistanceFilter !== 'all') query = query.eq('status', assistanceFilter);
      const { data, error } = await query;
      setAssistanceRequests(error ? [] : (data || []));
    } catch { setAssistanceRequests([]); }
  };

  const updateAssistanceStatus = async (requestId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'in_progress') {
        const request = assistanceRequests.find(r => r.id === requestId);
        if (request && !request.contacted_at) updates.contacted_at = new Date().toISOString();
      }
      if (newStatus === 'completed') updates.completed_at = new Date().toISOString();

      const { error } = await supabase.from('campaign_assistance_requests').update(updates).eq('id', requestId);
      if (error) throw error;
      await logActivity('UPDATE', 'assistance', requestId, `Changement statut assistance vers ${newStatus}`);
      alert('✅ Statut mis à jour !');
      fetchAssistanceRequests();
    } catch (error: any) {
      alert('❌ Erreur : ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'in_progress': return <Loader2 size={16} className="animate-spin" />;
      case 'completed': return <CheckCircle2 size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) { router.push('/auth/login'); return; }

      const { data: creatorCheck } = await supabase
        .from('createur').select('*').eq('id_w', user.id).maybeSingle();

      if (creatorCheck && creatorCheck.role === 'admin') {
        setIsPrincipalAdmin(true);
        setAdminUser({
          id_w: creatorCheck.id_w,
          name: creatorCheck.full_name || 'Admin',
          email: user.email || '',
          phone: creatorCheck.phone || '',
          initials: (creatorCheck.full_name || 'AD').substring(0, 2).toUpperCase(),
          avatar_url: creatorCheck.avatar_url
        });
        setProfileData({ full_name: creatorCheck.full_name || '', phone: creatorCheck.phone || '' });

        const [{ data: creatorsData }, { data: brandsData }, { data: campaignsData }] = await Promise.all([
          supabase.from('createur').select('*').neq('role', 'admin').order('created_at', { ascending: false }),
          supabase.from('marque').select('*').order('created_at', { ascending: false }),
          supabase.from('campaigns').select('*')
        ]);

        await fetchActivityLogs();
        setStats({ creators: creatorsData?.length || 0, brands: brandsData?.length || 0, campaigns: campaignsData?.length || 0 });
        generateCumulativeChart(creatorsData || [], brandsData || []);
        setLoading(false);
        return;
      }

      const { data: adminCheck } = await supabase
        .from('admin').select('*').eq('id_w', user.id).maybeSingle();

      if (adminCheck) {
        setIsPrincipalAdmin(false);
        setAdminUser({
          id_w: adminCheck.id_w,
          name: adminCheck.full_name || 'Admin',
          email: user.email || '',
          phone: adminCheck.phone || '',
          initials: (adminCheck.full_name || 'AD').substring(0, 2).toUpperCase()
        });

        const [{ data: creatorsData }, { data: brandsData }, { data: campaignsData }] = await Promise.all([
          supabase.from('createur').select('*').neq('role', 'admin'),
          supabase.from('marque').select('*'),
          supabase.from('campaigns').select('*')
        ]);

        setStats({ creators: creatorsData?.length || 0, brands: brandsData?.length || 0, campaigns: campaignsData?.length || 0 });
        generateCumulativeChart(creatorsData || [], brandsData || []);
        setLoading(false);
        return;
      }

      router.push('/auth/login');
    } catch (error: any) {
      console.error("❌ Erreur dashboard:", error);
      setLoading(false);
    }
  };

  const generateCumulativeChart = (creators: any[], brands: any[]) => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentYear = new Date().getFullYear();
    setChartData(months.map((month, index) => {
      const endOfMonth = new Date(currentYear, index + 1, 0);
      return {
        month,
        createurs: creators.filter(c => new Date(c.created_at) <= endOfMonth).length,
        marques: brands.filter(b => new Date(b.created_at) <= endOfMonth).length
      };
    }));
  };

  const handleUpdateProfile = async () => {
    if (!profileData.full_name) { alert('⚠️ Le nom complet est obligatoire'); return; }
    try {
      const { error } = await supabase.from('createur')
        .update({ full_name: profileData.full_name, phone: profileData.phone })
        .eq('id_w', adminUser?.id_w);
      if (error) throw error;
      await logActivity('UPDATE', 'profile', adminUser?.id_w || '', 'Mise à jour du profil admin');
      alert('✅ Profil mis à jour avec succès !');
      setIsEditingProfile(false);
      fetchDashboardData();
    } catch (err: any) {
      alert('❌ Erreur: ' + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logActivity('LOGOUT', 'auth', adminUser?.id_w || '', 'Déconnexion');
      await supabase.auth.signOut();
      localStorage.clear();
      router.push('/auth/login');
      router.refresh();
    } catch (err: any) {
      alert('Erreur lors de la déconnexion');
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const getActionIcon = (action: string) => {
    switch(action) {
      case 'CREATE': return '➕'; case 'DELETE': return '🗑️';
      case 'UPDATE': return '✏️'; case 'VIEW': return '👁️';
      case 'LOGOUT': return '🚪'; default: return '📝';
    }
  };

  const getActionColor = (action: string) => {
    switch(action) {
      case 'CREATE': return 'bg-green-50 text-green-700 border-green-200';
      case 'DELETE': return 'bg-red-50 text-red-700 border-red-200';
      case 'UPDATE': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'VIEW': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // ✅ Changer de vue ET mettre à jour le hash dans l'URL
  const changeView = (view: 'overview' | 'assistance' | 'logs' | 'profile') => {
    setActiveView(view);
    if (view === 'overview') {
      window.history.pushState(null, '', '/admin/dashboard');
    } else {
      window.history.pushState(null, '', `/admin/dashboard#${view}`);
    }
    if (view === 'assistance') fetchAssistanceRequests();
    if (view === 'logs') fetchActivityLogs();
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">

      {/* BOUTON RETOUR */}
      {activeView !== 'overview' && (
        <button
          onClick={() => changeView('overview')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all text-sm shadow-sm"
        >
          <BarChart3 size={16} />
          Retour au dashboard
        </button>
      )}

      {/* VUE D'ENSEMBLE */}
      {activeView === 'overview' && (
        <>
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
              <Calendar size={16} /> Année {new Date().getFullYear()}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Créateurs" value={stats.creators} trend="+12.5%" icon={<Users className="text-blue-600" />} color="blue" loading={loading} />
            <StatCard title="Total Marques" value={stats.brands} trend="+8.2%" icon={<Building2 className="text-purple-600" />} color="purple" loading={loading} />
            <StatCard title="Campagnes Actives" value={stats.campaigns} trend="+4.1%" icon={<TrendingUp className="text-[#ceaf4a]" />} color="gold" loading={loading} />
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h3 className="font-bold text-xl text-gray-900">📈 Croissance cumulative des inscriptions</h3>
                <p className="text-sm text-gray-400 mt-1">Évolution mensuelle (total cumulé d'inscriptions)</p>
              </div>
              <div className="flex gap-4 text-xs font-bold bg-gray-50 p-2 rounded-xl">
                <div className="flex items-center gap-2 text-blue-600 px-2">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span> Créateurs
                </div>
                <div className="flex items-center gap-2 text-[#b8962f] px-2">
                  <span className="w-2.5 h-2.5 bg-[#ceaf4a] rounded-full"></span> Marques
                </div>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCreat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBrand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ceaf4a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ceaf4a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="createurs" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCreat)" />
                  <Area type="monotone" dataKey="marques" stroke="#ceaf4a" strokeWidth={3} fillOpacity={1} fill="url(#colorBrand)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ✅ RACCOURCIS RAPIDES vers Assistance / Packs / Logs / Profil */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button onClick={() => changeView('assistance')}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex items-center gap-4 text-left">
              <div className="p-3 bg-yellow-50 rounded-xl"><HeadphonesIcon size={24} className="text-yellow-600" /></div>
              <div>
                <p className="font-bold text-gray-900">Assistance</p>
                <p className="text-xs text-gray-400">Demandes en attente</p>
              </div>
            </button>
            <Link
              href="/admin/packs"
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex items-center gap-4 text-left"
            >
              <div className="p-3 bg-blue-50 rounded-xl">
                <Package size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Packs</p>
                <p className="text-xs text-gray-400">Vue globale des packs</p>
              </div>
            </Link>
             <Link
    href="/admin/validate-posts"
    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex items-center gap-4 text-left"
  >
    <div className="p-3 bg-green-50 rounded-xl">
      <Shield size={24} className="text-green-600" />
    </div>
    <div>
      <p className="font-bold text-gray-900">Validation Posts</p>
      <p className="text-xs text-gray-400">Approuver les posts</p>
    </div>
  </Link>
            {isPrincipalAdmin && (
              <>
                <button onClick={() => changeView('logs')}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex items-center gap-4 text-left">
                  <div className="p-3 bg-purple-50 rounded-xl"><Activity size={24} className="text-purple-600" /></div>
                  <div>
                    <p className="font-bold text-gray-900">Logs d'activité</p>
                    <p className="text-xs text-gray-400">Historique des actions</p>
                  </div>
                </button>
                <button onClick={() => changeView('profile')}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex items-center gap-4 text-left">
                  <div className="p-3 bg-gray-100 rounded-xl"><User size={24} className="text-gray-600" /></div>
                  <div>
                    <p className="font-bold text-gray-900">Mon profil</p>
                    <p className="text-xs text-gray-400">Modifier mes infos</p>
                  </div>
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* DEMANDES D'ASSISTANCE */}
      {activeView === 'assistance' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <HeadphonesIcon size={32} className="text-[#D4A017]" />
                Demandes d'assistance
              </h2>
              <p className="text-gray-500 text-sm mt-1">Marques ayant demandé de l'aide pour créer une campagne</p>
            </div>
            <button onClick={fetchAssistanceRequests}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
              <Loader2 size={16} /> Actualiser
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            {(['all', 'pending', 'in_progress', 'completed'] as const).map((f) => (
              <button key={f} onClick={() => { setAssistanceFilter(f); fetchAssistanceRequests(); }}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${assistanceFilter === f ? 'bg-[#ceaf4a] text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                {f === 'all' ? `Toutes (${assistanceRequests.length})` : f === 'pending' ? 'En attente' : f === 'in_progress' ? 'En cours' : 'Terminées'}
              </button>
            ))}
          </div>

          {assistanceRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <HeadphonesIcon size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500 font-bold">Aucune demande d'assistance</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {assistanceRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                        <User size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{request.brand_name || 'Marque'}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <div className="flex items-center gap-1"><Mail size={14} />{request.brand_email}</div>
                          {request.brand_phone && <div className="flex items-center gap-1"><Phone size={14} />{request.brand_phone}</div>}
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1.5 rounded-full font-bold border flex items-center gap-1.5 ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}{getStatusLabel(request.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      <div>
                        <p className="text-xs text-gray-400">Demandé le</p>
                        <p className="font-medium">{new Date(request.requested_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    {request.contacted_at && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MessageCircle size={16} />
                        <div>
                          <p className="text-xs text-gray-400">Contacté le</p>
                          <p className="font-medium">{new Date(request.contacted_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    )}
                    {request.completed_at && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <CheckCircle2 size={16} />
                        <div>
                          <p className="text-xs text-gray-400">Terminé le</p>
                          <p className="font-medium">{new Date(request.completed_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    {request.status === 'pending' && (
                      <button onClick={() => updateAssistanceStatus(request.id, 'in_progress')}
                        className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-100 transition-all">
                        Prendre en charge
                      </button>
                    )}
                    {request.status === 'in_progress' && (
                      <button onClick={() => updateAssistanceStatus(request.id, 'completed')}
                        className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg font-bold text-sm hover:bg-green-100 transition-all">
                        Marquer comme terminée
                      </button>
                    )}
                    {(request.status === 'pending' || request.status === 'in_progress') && (
                      <button onClick={() => updateAssistanceStatus(request.id, 'cancelled')}
                        className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-sm hover:bg-red-100 transition-all">
                        Annuler
                      </button>
                    )}
                    {request.status === 'completed' && (
                      <button onClick={() => updateAssistanceStatus(request.id, 'in_progress')}
                        className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-100 transition-all">
                        Rouvrir
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LOGS D'ACTIVITÉ */}
      {activeView === 'logs' && isPrincipalAdmin && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">📊 Logs d'activité</h2>
              <p className="text-gray-500 text-sm mt-1">Suivi des actions des administrateurs</p>
            </div>
            <button onClick={fetchActivityLogs}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
              <Activity size={16} /> Actualiser
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {activityLogs.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-500 font-medium">Aucune activité enregistrée</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {activityLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-gray-50 transition-all">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${getActionColor(log.action)}`}>
                        <span className="text-lg">{getActionIcon(log.action)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-gray-900">{log.admin_name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${getActionColor(log.action)}`}>{log.action}</span>
                        </div>
                        <p className="text-sm text-gray-600">{log.details}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <Clock size={12} />
                          <span>{formatRelativeTime(log.created_at)}</span>
                          <span>•</span>
                          <span className="capitalize">{log.target_type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MON PROFIL */}
      {activeView === 'profile' && isPrincipalAdmin && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">👤 Mon profil administrateur</h2>
            {!isEditingProfile && (
              <button onClick={() => setIsEditingProfile(true)}
                className="px-6 py-3 bg-[#ceaf4a] text-white rounded-xl font-bold hover:bg-[#b8962f] transition-all flex items-center gap-2 shadow-lg">
                <Edit2 size={20} /> Modifier
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-2xl">
            <div className="bg-[#fef9e7] border border-[#ceaf4a] rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700">
                <span className="font-bold text-[#ceaf4a]">ℹ️ Note :</span> Ceci est votre profil <strong>administrateur</strong>.
              </p>
            </div>

            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full bg-gray-900 flex items-center justify-center overflow-hidden shrink-0">
                {adminUser?.avatar_url ? (
                  <img src={adminUser.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Shield size={40} className="text-[#ceaf4a]" />
                )}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{adminUser?.name}</h3>
                <p className="text-gray-500 mt-1">{adminUser?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-[#ceaf4a] text-white px-3 py-1 rounded-full font-bold">⭐ Administrateur Principal</span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold">🛡️ Accès complet</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nom complet</label>
                {isEditingProfile ? (
                  <input type="text" value={profileData.full_name}
                    onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#ceaf4a] transition-all" />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">{adminUser?.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">{adminUser?.email}</p>
                <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Téléphone</label>
                {isEditingProfile ? (
                  <input type="tel" value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    placeholder="+221 77 123 45 67"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#ceaf4a] transition-all" />
                ) : (
                  <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">{adminUser?.phone || 'Non renseigné'}</p>
                )}
              </div>

            
              {isEditingProfile && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => { setIsEditingProfile(false); setProfileData({ full_name: adminUser?.name || '', phone: adminUser?.phone || '' }); }}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">
                    Annuler
                  </button>
                  <button onClick={handleUpdateProfile}
                    className="flex-1 py-3 bg-[#ceaf4a] text-white rounded-xl font-bold hover:bg-[#b8962f] transition-all flex items-center justify-center gap-2">
                    <Save size={20} /> Enregistrer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, trend, icon, color, loading }: any) {
  const bgIcon = color === 'blue' ? 'bg-blue-50' : color === 'purple' ? 'bg-purple-50' : 'bg-[#fdf2d0]';
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3.5 rounded-2xl ${bgIcon}`}>{icon}</div>
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
