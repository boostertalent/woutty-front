"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Users, Building2, BarChart3, Shield, Search, TrendingUp, 
  Calendar, LogOut, Loader2, Eye, EyeOff, Trash2, Plus, X,
  User, Edit2, Save, Activity, Clock, FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

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
  const [activeView, setActiveView] = useState<'overview' | 'creators' | 'brands' | 'admins' | 'logs' | 'profile'>('overview');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [passwordToConfirm, setPasswordToConfirm] = useState('');
  const [actionPending, setActionPending] = useState<any>(null);
  const [creators, setCreators] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [creatorFilter, setCreatorFilter] = useState<'all' | 'active' | 'top'>('all');
  const [brandFilter, setBrandFilter] = useState<'all' | 'active' | 'top'>('all');
  const [newAdmin, setNewAdmin] = useState({ 
    email: '', 
    full_name: '', 
    phone: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ full_name: '', phone: '' });
  const [isPrincipalAdmin, setIsPrincipalAdmin] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const logActivity = async (action: string, targetType: string, targetId: string, details: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !adminUser) return;

      await supabase.from('admin_logs').insert({
        admin_id: user.id,
        admin_name: adminUser.name,
        action,
        target_type: targetType,
        target_id: targetId,
        details,
        created_at: new Date().toISOString()
      });

      console.log("📝 Log enregistré:", action);
    } catch (err) {
      console.warn("⚠️ Erreur log:", err);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn("⚠️ Erreur logs:", error.message);
        setActivityLogs([]);
      } else {
        setActivityLogs(data || []);
      }
    } catch (err) {
      console.warn("⚠️ Exception logs:", err);
      setActivityLogs([]);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log("🔍 Vérification session admin...");

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.log("❌ Pas de session, redirection login");
        router.push('/auth/login');
        return;
      }

      console.log("✅ Session trouvée, user ID:", user.id);

      const { data: creatorCheck, error: creatorError } = await supabase
        .from('createur')
        .select('*')
        .eq('id_w', user.id)
        .maybeSingle();

      console.log("📊 Vérification dans table créateur:", { creatorCheck, creatorError });

      if (creatorCheck && creatorCheck.role === 'admin') {
        console.log("✅ Admin principal trouvé dans table créateur");
        
        setIsPrincipalAdmin(true);
        setAdminUser({
          id_w: creatorCheck.id_w,
          name: creatorCheck.full_name || 'Admin',
          email: user.email || '',
          phone: creatorCheck.phone || '',
          initials: (creatorCheck.full_name || 'AD').substring(0, 2).toUpperCase(),
          avatar_url: creatorCheck.avatar_url
        });

        setProfileData({
          full_name: creatorCheck.full_name || '',
          phone: creatorCheck.phone || ''
        });

        const { data: creatorsData, error: creatorsError } = await supabase
          .from('createur')
          .select('*')
          .neq('role', 'admin')
          .order('created_at', { ascending: false });
        
        if (creatorsError) {
          console.warn("⚠️ Erreur créateurs:", creatorsError.message);
        }
        setCreators(creatorsData || []);

        const { data: brandsData, error: brandsError } = await supabase
          .from('marque')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (brandsError) {
          console.warn("⚠️ Erreur marques:", brandsError.message);
        }
        setBrands(brandsData || []);

        const { data: campaignsData, error: campaignsError } = await supabase
          .from('campaigns')
          .select('*');
        
        if (campaignsError) {
          console.warn("⚠️ Erreur campagnes:", campaignsError.message);
        }

        try {
          const { data: adminsData, error: adminsError } = await supabase
            .from('admin')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (adminsError) {
            console.warn("ℹ️ Info admins:", adminsError.message);
            const allAdmins = [
              {
                id_w: creatorCheck.id_w,
                email: user.email,
                full_name: creatorCheck.full_name,
                phone: creatorCheck.phone,
                role: 'admin',
                created_at: creatorCheck.created_at,
                is_principal: true
              }
            ];
            setAdmins(allAdmins);
          } else {
            const allAdmins = [
              {
                id_w: creatorCheck.id_w,
                email: user.email,
                full_name: creatorCheck.full_name,
                phone: creatorCheck.phone,
                role: 'admin',
                created_at: creatorCheck.created_at,
                is_principal: true
              },
              ...(adminsData || [])
            ];
            setAdmins(allAdmins);
          }
        } catch (adminErr) {
          console.warn("⚠️ Exception lors du chargement des admins:", adminErr);
          setAdmins([{
            id_w: creatorCheck.id_w,
            email: user.email,
            full_name: creatorCheck.full_name,
            phone: creatorCheck.phone,
            role: 'admin',
            created_at: creatorCheck.created_at,
            is_principal: true
          }]);
        }

        await fetchActivityLogs();

        setStats({
          creators: creatorsData?.length || 0,
          brands: brandsData?.length || 0,
          campaigns: campaignsData?.length || 0
        });

        generateCumulativeChart(creatorsData || [], brandsData || []);

        console.log("✅ Dashboard admin principal chargé avec succès");
        setLoading(false);
        return;
      }

      const { data: adminCheck, error: adminError } = await supabase
        .from('admin')
        .select('*')
        .eq('id_w', user.id)
        .maybeSingle();

      console.log("📊 Vérification dans table admin:", { adminCheck, adminError });

      if (adminCheck) {
        console.log("✅ Admin secondaire trouvé dans table admin");
        
        setIsPrincipalAdmin(false);
        setAdminUser({
          id_w: adminCheck.id_w,
          name: adminCheck.full_name || 'Admin',
          email: user.email || '',
          phone: adminCheck.phone || '',
          initials: (adminCheck.full_name || 'AD').substring(0, 2).toUpperCase()
        });

        const { data: creatorsData, error: creatorsError } = await supabase
          .from('createur')
          .select('*')
          .neq('role', 'admin')
          .order('created_at', { ascending: false });
        
        if (creatorsError) {
          console.warn("⚠️ Erreur créateurs:", creatorsError.message);
        }
        setCreators(creatorsData || []);

        const { data: brandsData, error: brandsError } = await supabase
          .from('marque')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (brandsError) {
          console.warn("⚠️ Erreur marques:", brandsError.message);
        }
        setBrands(brandsData || []);

        const { data: campaignsData, error: campaignsError } = await supabase
          .from('campaigns')
          .select('*');
        
        if (campaignsError) {
          console.warn("⚠️ Erreur campagnes:", campaignsError.message);
        }

        try {
          const { data: adminsData, error: adminsError } = await supabase
            .from('admin')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (adminsError) {
            console.warn("ℹ️ Info admins:", adminsError.message);
            setAdmins([]);
          } else {
            setAdmins(adminsData || []);
          }
        } catch (adminErr) {
          console.warn("⚠️ Exception lors du chargement des admins:", adminErr);
          setAdmins([]);
        }

        setStats({
          creators: creatorsData?.length || 0,
          brands: brandsData?.length || 0,
          campaigns: campaignsData?.length || 0
        });

        generateCumulativeChart(creatorsData || [], brandsData || []);

        console.log("✅ Dashboard admin secondaire chargé avec succès");
        setLoading(false);
        return;
      }

      console.log("❌ Utilisateur non admin, redirection");
      router.push('/auth/login');

    } catch (error: any) {
      console.error("❌ Erreur dashboard:", error);
      if (error.message?.includes('Failed to fetch')) {
        alert("⚠️ Erreur de connexion. Vérifiez votre réseau.");
      }
      setLoading(false);
    }
  };

  const generateCumulativeChart = (creators: any[], brands: any[]) => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentYear = new Date().getFullYear();
    
    const chartData = months.map((month, index) => {
      const endOfMonth = new Date(currentYear, index + 1, 0);
      
      const creatorsUpToMonth = creators.filter(c => 
        new Date(c.created_at) <= endOfMonth
      ).length;
      
      const brandsUpToMonth = brands.filter(b => 
        new Date(b.created_at) <= endOfMonth
      ).length;

      return {
        month,
        createurs: creatorsUpToMonth,
        marques: brandsUpToMonth
      };
    });

    setChartData(chartData);
  };

  const handleDeleteCreator = async (creatorId: string) => {
    setActionPending({ type: 'delete_creator', id: creatorId });
    setShowPasswordModal(true);
  };

  const handleDeleteBrand = async (brandId: string) => {
    setActionPending({ type: 'delete_brand', id: brandId });
    setShowPasswordModal(true);
  };

  const handleDeleteAdmin = async (adminId: string) => {
    setActionPending({ type: 'delete_admin', id: adminId });
    setShowPasswordModal(true);
  };

  const confirmAction = async () => {
    if (!passwordToConfirm) {
      alert('Veuillez entrer votre mot de passe');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordToConfirm
      });

      if (signInError) {
        alert('❌ Mot de passe incorrect');
        return;
      }

      if (actionPending.type === 'delete_creator') {
        const creator = creators.find(c => c.id_w === actionPending.id);
        const { error } = await supabase
          .from('createur')
          .delete()
          .eq('id_w', actionPending.id);
        
        if (error) throw error;
        await logActivity('DELETE', 'creator', actionPending.id, `Suppression du créateur ${creator?.full_name || 'Inconnu'}`);
        alert('✅ Créateur supprimé');
      } else if (actionPending.type === 'delete_brand') {
        const brand = brands.find(b => b.id_w === actionPending.id);
        const { error } = await supabase
          .from('marque')
          .delete()
          .eq('id_w', actionPending.id);
        
        if (error) throw error;
        await logActivity('DELETE', 'brand', actionPending.id, `Suppression de la marque ${brand?.nom_marque || 'Inconnue'}`);
        alert('✅ Marque supprimée');
      } else if (actionPending.type === 'delete_admin') {
        const admin = admins.find(a => a.id_w === actionPending.id);
        const { error } = await supabase
          .from('admin')
          .delete()
          .eq('id_w', actionPending.id);
        
        if (error) throw error;
        await logActivity('DELETE', 'admin', actionPending.id, `Suppression de l'admin ${admin?.full_name || 'Inconnu'}`);
        alert('✅ Admin supprimé');
      }

      setShowPasswordModal(false);
      setPasswordToConfirm('');
      setActionPending(null);
      fetchDashboardData();

    } catch (err: any) {
      alert('❌ Erreur: ' + err.message);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.email || !newAdmin.full_name || !newAdmin.password || !newAdmin.confirmPassword) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (newAdmin.password !== newAdmin.confirmPassword) {
      alert('❌ Les mots de passe ne correspondent pas');
      return;
    }

    if (newAdmin.password.length < 8) {
      alert('❌ Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      console.log("🔐 Création admin:", newAdmin.email);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdmin.email,
        password: newAdmin.password,
        options: {
          data: { 
            role: 'admin', 
            full_name: newAdmin.full_name 
          },
          emailRedirectTo: undefined
        }
      });

      if (authError) {
        console.error("❌ Erreur auth:", authError);
        throw authError;
      }

      if (authData.user) {
        console.log("✅ Compte créé, insertion dans table admin...");
        
        const { error: insertError } = await supabase
          .from('admin')
          .insert({
            id_w: authData.user.id,
            email: newAdmin.email,
            full_name: newAdmin.full_name,
            phone: newAdmin.phone || null,
            role: 'admin'
          });

        if (insertError) {
          console.error("❌ Erreur insertion:", insertError);
          throw insertError;
        }

        await logActivity('CREATE', 'admin', authData.user.id, `Création de l'admin ${newAdmin.full_name} (${newAdmin.email})`);

        alert(`✅ Admin créé avec succès !\n\n📧 Email: ${newAdmin.email}\n👤 Nom: ${newAdmin.full_name}`);
        setShowAddAdminModal(false);
        setNewAdmin({ email: '', full_name: '', phone: '', password: '', confirmPassword: '' });
        
        // Recharger uniquement la liste des admins
        try {
          const { data: adminsData } = await supabase
            .from('admin')
            .select('*')
            .order('created_at', { ascending: false });
          
          const allAdmins = [
            {
              id_w: adminUser?.id_w,
              email: adminUser?.email,
              full_name: adminUser?.name,
              phone: adminUser?.phone,
              role: 'admin',
              created_at: new Date().toISOString(),
              is_principal: true
            },
            ...(adminsData || [])
          ];
          setAdmins(allAdmins);
        } catch (err) {
          console.warn("⚠️ Erreur rechargement admins:", err);
        }
      }
    } catch (err: any) {
      console.error("❌ Erreur complète:", err);
      alert('❌ Erreur: ' + (err.message || 'Erreur inconnue'));
    }
  };

  const handleUpdateProfile = async () => {
    if (!profileData.full_name) {
      alert('⚠️ Le nom complet est obligatoire');
      return;
    }

    try {
      const { error } = await supabase
        .from('createur')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone
        })
        .eq('id_w', adminUser?.id_w);

      if (error) throw error;

      await logActivity('UPDATE', 'profile', adminUser?.id_w || '', `Mise à jour du profil admin`);

      alert('✅ Profil mis à jour avec succès !');
      setIsEditingProfile(false);
      fetchDashboardData();
    } catch (err: any) {
      alert('❌ Erreur: ' + err.message);
    }
  };

  const getFilteredCreators = () => {
    if (creatorFilter === 'active') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return creators.filter(c => new Date(c.updated_at || c.created_at) >= thirtyDaysAgo);
    }
    if (creatorFilter === 'top') {
      return [...creators].sort((a, b) => {
        const aFollowers = (a.instagram_followers || 0) + (a.youtube_followers || 0) + (a.tiktok_followers || 0);
        const bFollowers = (b.instagram_followers || 0) + (b.youtube_followers || 0) + (b.tiktok_followers || 0);
        return bFollowers - aFollowers;
      }).slice(0, 10);
    }
    return creators;
  };

  const getFilteredBrands = () => {
    if (brandFilter === 'active') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return brands.filter(b => new Date(b.updated_at || b.created_at) >= thirtyDaysAgo);
    }
    if (brandFilter === 'top') {
      return brands.slice(0, 10);
    }
    return brands;
  };

  const handleLogout = async () => {
    try {
      console.log("🚪 Déconnexion en cours...");
      
      await logActivity('LOGOUT', 'auth', adminUser?.id_w || '', 'Déconnexion');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("❌ Erreur déconnexion:", error);
        throw error;
      }

      console.log("✅ Déconnexion réussie");
      
      localStorage.clear();
      
      router.push('/auth/login');
      router.refresh();
      
    } catch (err: any) {
      console.error("❌ Erreur:", err);
      alert('Erreur lors de la déconnexion');
    }
  };

  const handleViewCreatorDashboard = async (creatorId: string) => {
    console.log("👁️ Visualisation créateur:", creatorId);
    
    const creator = creators.find(c => c.id_w === creatorId);
    await logActivity('VIEW', 'creator', creatorId, `Visualisation du dashboard de ${creator?.full_name || 'créateur'}`);
    
    localStorage.removeItem('admin_viewing_brand');
    localStorage.setItem('admin_viewing_creator', creatorId);
    localStorage.setItem('admin_mode', 'view');
    localStorage.setItem('hide_profile_button', 'true'); // ← MASQUER MON PROFIL
    
    router.push(`/creators/dashboard?viewing=${creatorId}`);
  };

  const handleViewBrandDashboard = async (brandId: string) => {
    console.log("👁️ Visualisation marque:", brandId);
    
    const brand = brands.find(b => b.id_w === brandId);
    await logActivity('VIEW', 'brand', brandId, `Visualisation du dashboard de ${brand?.nom_marque || 'marque'}`);
    
    localStorage.removeItem('admin_viewing_creator');
    localStorage.setItem('admin_viewing_brand', brandId);
    localStorage.setItem('admin_mode', 'view');
    localStorage.setItem('hide_profile_button', 'true'); // ← MASQUER MON PROFIL
    
    router.push(`/brands/dashboard?viewing=${brandId}`);
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
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
      case 'CREATE': return '➕';
      case 'DELETE': return '🗑️';
      case 'UPDATE': return '✏️';
      case 'VIEW': return '👁️';
      case 'LOGOUT': return '🚪';
      default: return '📝';
    }
  };

  const getActionColor = (action: string) => {
    switch(action) {
      case 'CREATE': return 'bg-green-50 text-green-700 border-green-200';
      case 'DELETE': return 'bg-red-50 text-red-700 border-red-200';
      case 'UPDATE': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'VIEW': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'LOGOUT': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans text-gray-900">
      
      {/* MODAL MOT DE PASSE */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">🔐 Confirmation requise</h3>
            <p className="text-gray-600 mb-6">Entrez votre mot de passe pour confirmer cette action de suppression.</p>
            <input
              type="password"
              value={passwordToConfirm}
              onChange={(e) => setPasswordToConfirm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && confirmAction()}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#ceaf4a] transition-all mb-6"
              placeholder="Votre mot de passe"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordToConfirm('');
                  setActionPending(null);
                }}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={confirmAction}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AJOUT ADMIN */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">➕ Nouvel admin</h3>
              <button onClick={() => setShowAddAdminModal(false)}>
                <X className="text-gray-400 hover:text-gray-900" size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nom complet *</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={newAdmin.full_name}
                  onChange={(e) => setNewAdmin({...newAdmin, full_name: e.target.value})}
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-[#ceaf4a] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  placeholder="admin@woutty.com"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-[#ceaf4a] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  placeholder="+221 77 123 45 67"
                  value={newAdmin.phone}
                  onChange={(e) => setNewAdmin({...newAdmin, phone: e.target.value})}
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-[#ceaf4a] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mot de passe * (min. 8)</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-[#ceaf4a] transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Confirmer *</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newAdmin.confirmPassword}
                    onChange={(e) => setNewAdmin({...newAdmin, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg outline-none focus:border-[#ceaf4a] transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={handleCreateAdmin}
              disabled={!newAdmin.email || !newAdmin.full_name || !newAdmin.password || !newAdmin.confirmPassword}
              className="w-full mt-4 py-2.5 text-sm bg-[#ceaf4a] text-white rounded-lg font-bold hover:bg-[#b8962f] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Créer l'administrateur
            </button>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col sticky top-0 h-screen z-20">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-[#ceaf4a]">
            Woutty <span className="text-gray-900 text-sm block font-medium">Administration</span>
          </h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <NavItem 
            icon={<BarChart3 size={20} />} 
            label="Vue d'ensemble" 
            active={activeView === 'overview'}
            onClick={() => setActiveView('overview')}
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Créateurs" 
            active={activeView === 'creators'}
            onClick={() => setActiveView('creators')}
          />
          <NavItem 
            icon={<Building2 size={20} />} 
            label="Marques" 
            active={activeView === 'brands'}
            onClick={() => setActiveView('brands')}
          />
          <NavItem 
            icon={<Shield size={20} />} 
            label="Admins" 
            active={activeView === 'admins'}
            onClick={() => setActiveView('admins')}
          />
          {isPrincipalAdmin && (
            <>
              <NavItem 
                icon={<Activity size={20} />} 
                label="Logs d'activité" 
                active={activeView === 'logs'}
                onClick={() => {
                  setActiveView('logs');
                  fetchActivityLogs();
                }}
              />
              <NavItem 
                icon={<User size={20} />} 
                label="Mon profil" 
                active={activeView === 'profile'}
                onClick={() => setActiveView('profile')}
              />
            </>
          )}
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
                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest leading-none">
                      {isPrincipalAdmin ? 'Admin Principal' : 'Admin'}
                    </p>
                  </>
                )}
              </div>
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-black/20 ring-2 ring-white overflow-hidden">
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : adminUser?.avatar_url ? (
                  <img src={adminUser.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : adminUser?.initials ? (
                  adminUser.initials
                ) : (
                  'AD'
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* BOUTON RETOUR DASHBOARD */}
          {isPrincipalAdmin && activeView !== 'overview' && (
            <button
              onClick={() => setActiveView('overview')}
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
                    <h3 className="font-bold text-xl text-gray-900">📈 Croissance cumulative des inscriptions</h3>
                    <p className="text-sm text-gray-400 mt-1">Évolution mensuelle (total cumulé d'inscriptions)</p>
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
            </>
          )}

          {/* GESTION CRÉATEURS */}
          {activeView === 'creators' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">👥 Gestion des créateurs</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCreatorFilter('all')}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                      creatorFilter === 'all' ? 'bg-[#ceaf4a] text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    📋 Tous ({creators.length})
                  </button>
                  <button
                    onClick={() => setCreatorFilter('active')}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                      creatorFilter === 'active' ? 'bg-[#ceaf4a] text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    ⚡ Actifs
                  </button>
                  <button
                    onClick={() => setCreatorFilter('top')}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                      creatorFilter === 'top' ? 'bg-[#ceaf4a] text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    🏆 Top 10
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredCreators().map((creator) => (
                  <div key={creator.id_w} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
                        {creator.avatar_url ? (
                          <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-gray-500 text-lg">
                            {creator.full_name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{creator.full_name || 'Sans nom'}</p>
                        <p className="text-xs text-gray-500 truncate">{creator.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewCreatorDashboard(creator.id_w)}
                        className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                      >
                        <Eye size={16} />
                        Voir
                      </button>
                      {isPrincipalAdmin && (
                        <button
                          onClick={() => handleDeleteCreator(creator.id_w)}
                          className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                        >
                          <Trash2 size={16} />
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GESTION MARQUES */}
          {activeView === 'brands' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">🏢 Gestion des marques</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBrandFilter('all')}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                      brandFilter === 'all' ? 'bg-[#ceaf4a] text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    📋 Toutes ({brands.length})
                  </button>
                  <button
                    onClick={() => setBrandFilter('active')}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                      brandFilter === 'active' ? 'bg-[#ceaf4a] text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    ⚡ Actives
                  </button>
                  <button
                    onClick={() => setBrandFilter('top')}
                    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                      brandFilter === 'top' ? 'bg-[#ceaf4a] text-white shadow-lg' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    🏆 Top 10
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredBrands().map((brand) => (
                  <div key={brand.id_w} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600 text-lg shrink-0">
                        {brand.nom_marque?.charAt(0) || 'M'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{brand.nom_marque || 'Sans nom'}</p>
                        <p className="text-xs text-gray-500 truncate">{brand.email_marque}</p>
                        {brand.domaine && (
                          <p className="text-xs text-gray-400 mt-1">📦 {brand.domaine}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewBrandDashboard(brand.id_w)}
                        className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                      >
                        <Eye size={16} />
                        Voir
                      </button>
                      {isPrincipalAdmin && (
                        <button
                          onClick={() => handleDeleteBrand(brand.id_w)}
                          className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                        >
                          <Trash2 size={16} />
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GESTION ADMINS */}
          {activeView === 'admins' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">🛡️ Gestion des admins</h2>
                {isPrincipalAdmin && (
                  <button
                    onClick={() => setShowAddAdminModal(true)}
                    className="px-6 py-3 bg-[#ceaf4a] text-white rounded-xl font-bold hover:bg-[#b8962f] transition-all flex items-center gap-2 shadow-lg"
                  >
                    <Plus size={20} />
                    Créer un admin
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {admins.map((admin) => (
                  <div key={admin.id_w} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center shrink-0">
                        <Shield size={20} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{admin.full_name || 'Admin'}</p>
                        <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                        {admin.is_principal && (
                          <p className="text-xs text-[#ceaf4a] font-bold mt-1">⭐ Admin Principal</p>
                        )}
                        {admin.phone && (
                          <p className="text-xs text-gray-400 mt-1">📞 {admin.phone}</p>
                        )}
                      </div>
                    </div>
                    {isPrincipalAdmin && (
                      <button
                        onClick={() => handleDeleteAdmin(admin.id_w)}
                        disabled={admin.email === adminUser?.email || admin.is_principal === true}
                        className="w-full py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          admin.is_principal 
                            ? "Admin principal - Ne peut pas être supprimé" 
                            : admin.email === adminUser?.email 
                            ? "Vous ne pouvez pas vous supprimer" 
                            : "Supprimer cet admin"
                        }
                      >
                        <Trash2 size={16} />
                        {admin.is_principal ? "Admin Principal" : admin.email === adminUser?.email ? "Compte actuel" : "Supprimer"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
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
                <button
                  onClick={fetchActivityLogs}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center gap-2"
                >
                  <Activity size={16} />
                  Actualiser
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
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${getActionColor(log.action)}`}>
                                {log.action}
                              </span>
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
                <h2 className="text-3xl font-bold">👤 Mon profil</h2>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-6 py-3 bg-[#ceaf4a] text-white rounded-xl font-bold hover:bg-[#b8962f] transition-all flex items-center gap-2 shadow-lg"
                  >
                    <Edit2 size={20} />
                    Modifier
                  </button>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-2xl">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-3xl overflow-hidden shrink-0">
                    {adminUser?.avatar_url ? (
                      <img src={adminUser.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      adminUser?.initials || 'AD'
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{adminUser?.name}</h3>
                    <p className="text-gray-500 mt-1">{adminUser?.email}</p>
                    <p className="text-xs text-[#ceaf4a] font-bold mt-2">⭐ Administrateur Principal</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nom complet</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#ceaf4a] transition-all"
                      />
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
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        placeholder="+221 77 123 45 67"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl outline-none focus:border-[#ceaf4a] transition-all"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">{adminUser?.phone || 'Non renseigné'}</p>
                    )}
                  </div>

                  {isEditingProfile && (
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileData({
                            full_name: adminUser?.name || '',
                            phone: adminUser?.phone || ''
                          });
                        }}
                        className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleUpdateProfile}
                        className="flex-1 py-3 bg-[#ceaf4a] text-white rounded-xl font-bold hover:bg-[#b8962f] transition-all flex items-center justify-center gap-2"
                      >
                        <Save size={20} />
                        Enregistrer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200 group ${
        active 
          ? 'bg-[#ceaf4a] text-white shadow-lg shadow-[#ceaf4a]/25 font-bold' 
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
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
