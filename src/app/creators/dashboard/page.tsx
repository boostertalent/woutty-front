"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr'; 
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion'; 

import { 
  BarChart3, 
  Briefcase, 
  Send, 
  User, 
  Instagram, 
  MessageCircle,
  Heart,
  Eye,
  Share2,
  Ghost,
  Camera,
  Settings,
  Calendar,
  X as CloseIcon,
  Play,
  Youtube,
  Facebook,
  AlertCircle,
  Loader2,
  ExternalLink,
  Image as ImageIcon,
  Shield,
  Check,
  Building2,
  TrendingUp,
  CheckCircle,
  Bell,
  Archive
} from 'lucide-react';

const XLogo = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.486 3.24H4.298L17.607 20.65z" />
  </svg>
);

const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const n = Number(num);
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return Math.round(n).toString();
};

const calculateEngagementRate = (post: any): string => {
  const likes = post.nbre_like || 0;
  const comments = post.nbre_commentaire || 0;
  const views = post.nbre_vue || 0;
  if (views === 0) return '0%';
  const engagement = (likes + comments) / views;
  return `${(engagement * 100).toFixed(1)}%`;
};

export default function CreatorDashboard() {
  const searchParams = useSearchParams();
  const [isAdminViewing, setIsAdminViewing] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [activeTab, setActiveTab] = useState('Ma performance');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingCampaign, setProcessingCampaign] = useState<number | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [pendingCampaigns, setPendingCampaigns] = useState<any[]>([]);
  const [acceptedCampaigns, setAcceptedCampaigns] = useState<any[]>([]);
  const [completedCampaigns, setCompletedCampaigns] = useState<any[]>([]);
  const [creatorInfo, setCreatorInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<number>(0);
  
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [completedCampaignsCount, setCompletedCampaignsCount] = useState(0);

  const menuItems = [
    { name: 'Ma performance', icon: <BarChart3 size={20} /> },
    { name: 'Opportunités', icon: <Briefcase size={20} />, badge: notifications },
    { name: 'Mes campagnes', icon: <Send size={20} /> },
    { name: 'Terminées', icon: <Archive size={20} /> },
  ];

  const platformConfig: Record<string, { name: string; icon: JSX.Element }> = {
    'instagram': { name: 'Instagram', icon: <Instagram size={14} /> },
    'youtube': { name: 'YouTube', icon: <Youtube size={14} /> },
    'tiktok': { name: 'TikTok', icon: <span className="text-[12px]">🎵</span> },
    'snapchat': { name: 'Snapchat', icon: <Ghost size={14} /> },
    'twitter': { name: 'X', icon: <XLogo size={14} /> },
    'x': { name: 'X', icon: <XLogo size={14} /> },
    'facebook': { name: 'Facebook', icon: <Facebook size={14} /> }
  };

  const getPlatformInfoByName = useCallback((platformName: string) => {
    if (!platformName) return { name: 'Social', icon: <Camera size={14} /> };
    const lowerName = platformName.toLowerCase().trim();
    if (platformConfig[lowerName]) return platformConfig[lowerName];
    if (lowerName.includes('insta')) return platformConfig.instagram;
    if (lowerName.includes('yout')) return platformConfig.youtube;
    if (lowerName.includes('tik')) return platformConfig.tiktok;
    if (lowerName.includes('snap')) return platformConfig.snapchat;
    if (lowerName.includes('x') || lowerName.includes('twitter')) return platformConfig.x;
    if (lowerName.includes('face')) return platformConfig.facebook;
    return { name: platformName, icon: <Camera size={14} /> };
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    console.log("🔄 Chargement des données dynamiques...");

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error("❌ Pas de session:", sessionError);
        router.push('/auth/login');
        return;
      }

      const USER_ID = session.user.id;

      const adminViewingId = searchParams.get('viewing');
      let creatorIdToLoad = USER_ID;
      let adminViewMode = false;

      if (adminViewingId) {
        creatorIdToLoad = adminViewingId;
        adminViewMode = true;
      }

      setIsAdminViewing(adminViewMode);

      const { data: creatorData } = await supabase
        .from('createur')
        .select('*')
        .eq('id_w', creatorIdToLoad)
        .single();

      if (creatorData) {
        console.log("✅ Créateur:", creatorData.full_name);
        setCreatorInfo(creatorData);
      }

      const { data: profileData } = await supabase
        .from('info_profile')
        .select('*')
        .eq('id_w', creatorIdToLoad);

      const profileMap = new Map();
      (profileData || []).forEach((p: any) => {
        if (p.id_plateforme) {
          profileMap.set(p.id_plateforme, p);
        }
      });

      const platforms = (profileData || []).map((p: any, idx: number) => {
        const platformName = p.la_plateforme || p.nom_plateforme || 'Plateforme';
        const platformInfo = getPlatformInfoByName(platformName);
        
        return {
          id: `platform_${idx}_${p.id_plateforme}`,
          id_w: p.id_w,
          id_plateforme: p.id_plateforme,
          originalName: platformName,
          name: platformInfo.name,
          icon: platformInfo.icon,
          followers: formatNumber(p.nbre_followers),
          follows: formatNumber(p.nbre_follows),
          posts: formatNumber(p.nbre_poste),
          engagement: p.nbre_followers > 0 ? 
            `${((p.nbre_poste || 0) / (p.nbre_followers || 1) * 100).toFixed(1)}%` : '0%'
        };
      });
      
      setSelectedPlatforms(platforms);

      const { data: postData } = await supabase
        .from('info_poste')
        .select('*')
        .eq('id_w', creatorIdToLoad)
        .order('date_poste', { ascending: false });

      const posts = (postData || []).map((post: any, index: number) => {
        const platformProfile = profileMap.get(post.id_plateforme);
        const platformOriginalName = platformProfile?.la_plateforme || platformProfile?.nom_plateforme || 'Social';
        const platformInfo = getPlatformInfoByName(platformOriginalName);
        
        const isVideo = post.type_poste?.toLowerCase().includes('vid') || 
                       post.url_poste?.toLowerCase().match(/\.(mp4|mov|avi|webm|mkv)(\?|$)/i);

        let formattedDate = 'Date inconnue';
        if (post.date_poste) {
          try {
            formattedDate = new Date(post.date_poste).toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            });
          } catch (e) {
            console.warn("Erreur format date");
          }
        }

        return {
          id: `post_${index}_${Date.now()}`,
          id_w: post.id_w,
          id_plateforme: post.id_plateforme,
          title: post.titre_poste || 'Sans titre',
          date: formattedDate,
          platform: platformInfo.name,
          originalPlatform: platformOriginalName,
          type: isVideo ? 'video' : 'image',
          icon: platformInfo.icon,
          mediaUrl: post.url_poste || null,
          hasMedia: !!(post.url_poste && post.url_poste.trim() !== ''),
          likes: formatNumber(post.nbre_like),
          views: formatNumber(post.nbre_vue),
          comments: formatNumber(post.nbre_commentaire),
          shares: formatNumber(post.nbre_partage),
          eng: calculateEngagementRate(post),
          location_country: post.pays || post.country || null,
          location_city: post.ville || post.city || null,
        };
      });

      setAllPosts(posts);

      // OPPORTUNITÉS - Nouvelles campagnes attribuées
     
const { data: pendingData, error: pendingError } = await supabase
  .from('campaigns')
  .select('*')  
  .eq('assigned_creator_id', creatorIdToLoad)
  .or('creator_status.is.null,creator_status.eq.pending');

if (pendingError) {
  console.error("Erreur Opportunités détaillée:", pendingError);
} else {
  console.log("📋 Opportunités trouvées:", pendingData);
  setPendingCampaigns(pendingData || []);
  setNotifications(pendingData?.length || 0);
}
      console.log("📋 Opportunités:", pendingData?.length || 0);
      setPendingCampaigns(pendingData || []);
      setNotifications(pendingData?.length || 0);

      // MES CAMPAGNES - Acceptées et en cours
const { data: acceptedData, error: acceptedError } = await supabase
  .from('campaigns')
  .select('*')  
  .eq('assigned_creator_id', creatorIdToLoad)
  .eq('creator_status', 'accepted');

if (acceptedError) {
  console.error("Erreur Campagnes Acceptées:", acceptedError);
} else {
  console.log("📊 Campagnes en cours trouvées:", acceptedData);
  setAcceptedCampaigns(acceptedData || []);
}
      // Filtrer les campagnes en cours
      const ongoingCampaigns = acceptedData?.filter(c => {
        if (!c.end_date) return true;
        return new Date(c.end_date) >= new Date();
      }) || [];

      console.log("📊 Campagnes en cours:", ongoingCampaigns.length);
      setAcceptedCampaigns(ongoingCampaigns);

      // CAMPAGNES TERMINÉES
      const finishedCampaigns = acceptedData?.filter(c => {
        if (!c.end_date) return false;
        return new Date(c.end_date) < new Date();
      }) || [];

      console.log("✅ Campagnes terminées:", finishedCampaigns.length);
      setCompletedCampaigns(finishedCampaigns);

      // CALCUL REVENUS
      const revenue = finishedCampaigns.reduce((sum, c) => {
        return sum + (parseFloat(c.budget) || 0);
      }, 0);

      setTotalRevenue(revenue);
      setCompletedCampaignsCount(finishedCampaigns.length);
      console.log(`💰 Revenus: ${revenue} CFA (${finishedCampaigns.length} campagnes)`);

    } catch (error: any) {
      console.error("❌ Erreur:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [supabase, getPlatformInfoByName, router, searchParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredPosts = useMemo(() => {
    if (!activeFilter) return allPosts;
    const normalizedFilter = activeFilter.toLowerCase().trim();
    return allPosts.filter(post => {
      const platformName = (post.platform || '').toLowerCase();
      const originalPlatform = (post.originalPlatform || '').toLowerCase();
      return platformName.includes(normalizedFilter) || originalPlatform.includes(normalizedFilter);
    });
  }, [activeFilter, allPosts]);

  const handleAcceptCampaign = async (campaignId: string) => { 
    setProcessingCampaign(campaignId);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          creator_status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id_t_campagne', campaignId); 

      if (error) throw error;

      console.log("✅ Campagne acceptée");
      await fetchData();
    } catch (err: any) {
      console.error("❌ Erreur détaillée:", err);
      setError("Erreur lors de l'acceptation de la campagne");
    } finally {
      setProcessingCampaign(null);
    }
};
 const handleRejectCampaign = async (campaignId: string) => { 
    if (!confirm('Êtes-vous sûr de vouloir refuser cette campagne ?')) return;

    setProcessingCampaign(campaignId);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          creator_status: 'rejected',
          assigned_creator_id: null 
        })
        .eq('id_t_campagne', campaignId); 

      if (error) throw error;

      console.log("✅ Campagne refusée");
      await fetchData();
    } catch (err: any) {
      console.error("❌ Erreur détaillée:", err);
      setError("Erreur lors du refus de la campagne");
    } finally {
      setProcessingCampaign(null);
    }
};

  const handleBackToAdmin = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_mode');
      localStorage.removeItem('admin_viewing_creator');
    }
    router.push('/admin/dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateProgress = (campaign: any) => {
    if (!campaign.start_date || !campaign.end_date) return 0;
    
    const start = new Date(campaign.start_date).getTime();
    const end = new Date(campaign.end_date).getTime();
    const now = new Date().getTime();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#D4A017] animate-spin mx-auto mb-4" />
          <p className="font-bold text-[#D4A017] animate-pulse">Chargement de votre dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#F9FAFB] font-sans overflow-hidden text-[#111827]">
      
      {/* MODAL POSTS - Identique */}
      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <button 
            onClick={() => setSelectedPost(null)} 
            className="absolute top-4 right-4 z-[110] text-white hover:rotate-90 transition-transform bg-black/50 p-2 rounded-full"
          >
            <CloseIcon size={28} />
          </button>
          
          <div className="bg-white rounded-[32px] overflow-hidden max-w-5xl w-full flex flex-col md:flex-row max-h-[90vh] shadow-2xl">
            <div className="w-full md:w-[60%] bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-8 min-h-[400px]">
              {selectedPost.hasMedia ? (
                <div className="text-center space-y-6 max-w-md">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 bg-[#D4A017]/20 rounded-full animate-ping" />
                    <div className="relative w-32 h-32 bg-[#D4A017]/20 rounded-full flex items-center justify-center">
                      {selectedPost.type === 'video' ? (
                        <Play size={64} className="text-[#D4A017] ml-2" fill="currentColor" />
                      ) : (
                        <ImageIcon size={64} className="text-[#D4A017]" />
                      )}
                    </div>
                  </div>
                  
                  <div className="text-white space-y-4">
                    <h3 className="text-2xl font-bold">
                      {selectedPost.type === 'video' ? '🎬 Vidéo disponible' : '📸 Image disponible'}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Ce contenu est hébergé sur <span className="font-bold text-[#D4A017]">{selectedPost.platform}</span>
                    </p>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 text-left">
                    <div className="flex items-start gap-3">
                      <Shield className="text-yellow-400 mt-0.5" size={20} />
                      <div className="text-xs text-yellow-100">
                        <p className="font-bold mb-1">🔒 Restrictions de sécurité</p>
                        <p className="text-yellow-200/80">
                          Pour protéger votre vie privée, les contenus ne peuvent pas être affichés ici.
                        </p>
                      </div>
                    </div>
                  </div>

                  <a
                    href={selectedPost.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 px-10 py-5 bg-[#D4A017] text-white rounded-full font-bold text-lg hover:bg-[#B88A14] transition-all shadow-2xl hover:scale-105"
                  >
                    <ExternalLink size={24} className="group-hover:rotate-12 transition-transform" />
                    Voir sur {selectedPost.platform}
                  </a>
                  
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
                    {selectedPost.icon}
                    <span className="text-xs font-bold text-white">{selectedPost.platform}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-white">
                  <Camera size={64} className="mx-auto mb-4 opacity-50" />
                  <p>Aucun média disponible</p>
                </div>
              )}
            </div>
            
            <div className="w-full md:w-[40%] p-8 flex flex-col bg-white overflow-y-auto">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                  <span className="text-[#D4A017] bg-[#D4A017]/10 p-2 rounded-lg">{selectedPost.icon}</span>
                  <span className="text-xs font-black uppercase">{selectedPost.platform}</span>
                </div>
                
                <h2 className="text-2xl font-serif font-bold mb-2">{selectedPost.title}</h2>
                <p className="text-gray-400 text-sm flex items-center gap-2 mb-6">
                  <Calendar size={14} className="text-[#D4A017]" /> {selectedPost.date}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-100">
                    <p className="text-[10px] uppercase font-bold text-red-400 mb-2">Likes</p>
                    <p className="text-2xl font-black text-red-600">{selectedPost.likes}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                    <p className="text-[10px] uppercase font-bold text-blue-400 mb-2">Vues</p>
                    <p className="text-2xl font-black text-blue-600">{selectedPost.views}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                    <p className="text-[10px] uppercase font-bold text-green-400 mb-2">Comm.</p>
                    <p className="text-2xl font-black text-green-600">{selectedPost.comments}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-100">
                    <p className="text-[10px] uppercase font-bold text-purple-400 mb-2">Partages</p>
                    <p className="text-2xl font-black text-purple-600">{selectedPost.shares}</p>
                  </div>
                  <div className="col-span-2 p-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-100">
                    <p className="text-[10px] uppercase font-bold text-amber-400 mb-2">Engagement</p>
                    <p className="text-3xl font-black text-amber-600">{selectedPost.eng}</p>
                  </div>
                  
                  {(selectedPost.location_country || selectedPost.location_city) && (
                    <div className="col-span-2 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                      <div className="flex items-center gap-3 mb-2">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <p className="text-xs uppercase font-bold text-blue-600">Zone touchée</p>
                      </div>
                      <p className="text-xl font-black text-blue-700">
                        {selectedPost.location_city && selectedPost.location_country 
                          ? `${selectedPost.location_city}, ${selectedPost.location_country}`
                          : selectedPost.location_city || selectedPost.location_country || 'Non spécifié'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => setSelectedPost(null)}
                className="w-full py-4 mt-6 border-2 border-gray-200 text-gray-700 rounded-full font-bold hover:bg-gray-50"
              >
                ✕ Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 rounded-2xl p-4 shadow-lg max-w-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500" size={20} />
            <div>
              <p className="font-bold text-red-700">Erreur</p>
              <p className="text-sm text-red-600">{error}</p>
              <button onClick={() => setError(null)} className="text-xs mt-2 px-3 py-1 bg-red-100 rounded-full">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-white border-r flex-col p-6 h-full">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-full border-2 border-[#D4A017] flex items-center justify-center overflow-hidden">
            {creatorInfo?.avatar_url ? (
              <img src={creatorInfo.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="text-[#D4A017]" size={20} />
            )}
          </div>
          <span className="font-serif font-bold text-lg truncate">{creatorInfo?.full_name || 'Créateur'}</span>
        </div>
        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => (
            <button 
              key={item.name} 
              onClick={() => setActiveTab(item.name)}
              className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === item.name ? 'bg-[#EBD8A3] text-[#D4A017]' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {item.icon} {item.name}
              {item.badge && item.badge > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          <Link href="/creators/dashboard/profile">
            <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-50 transition-all">
              <Settings size={20} /> Mon profil
            </div>
          </Link>
        </nav>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-500 font-bold text-sm w-full"
        >
          Déconnexion
        </button>
      </aside>

      {/* MOBILE NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 z-50">
        {menuItems.map((item) => (
          <button 
            key={item.name} 
            onClick={() => setActiveTab(item.name)}
            className={`relative flex flex-col items-center gap-1 ${activeTab === item.name ? 'text-[#D4A017]' : 'text-gray-400'}`}
          >
            {item.icon}
            <span className="text-[10px] font-bold">{item.name.split(' ')[0]}</span>
            {item.badge && item.badge > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </button>
        ))}
        <Link href="/creators/dashboard/profile" className="flex flex-col items-center gap-1 text-gray-400">
          <Settings size={20} />
          <span className="text-[10px] font-bold">Profil</span>
        </Link>
      </nav>

      {/* MAIN */}
      <main className="flex-1 flex flex-col p-4 md:p-10 h-full overflow-hidden pb-20 md:pb-10">
        <header className="mb-8">
          <h1 className="text-3xl font-serif font-bold">{activeTab}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {activeTab === 'Ma performance' && 'Gérez votre influence en temps réel'}
            {activeTab === 'Opportunités' && `${notifications} nouvelle${notifications > 1 ? 's' : ''} opportunité${notifications > 1 ? 's' : ''}`}
            {activeTab === 'Mes campagnes' && 'Suivez vos contrats en cours'}
            {activeTab === 'Terminées' && 'Vos campagnes accomplies'}
          </p>
        </header>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'Ma performance' ? (
            <div className="space-y-8">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <p className="text-sm text-blue-700 font-medium">
                  {selectedPlatforms.length} plateforme{selectedPlatforms.length > 1 ? 's' : ''} • {allPosts.length} post{allPosts.length > 1 ? 's' : ''}
                </p>
              </div>

              {/* BLOC REVENUS RÉDUIT */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <TrendingUp size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Revenus totaux</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-green-600">
                          {totalRevenue.toLocaleString('fr-FR')}
                        </span>
                        <span className="text-sm font-bold text-green-600">CFA</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-green-700">{completedCampaignsCount}</p>
                    <p className="text-xs text-gray-500 uppercase font-bold">Campagnes</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold mb-4">Mes plateformes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {selectedPlatforms.map((platform) => (
                    <button 
                      key={platform.id}
                      onClick={() => setActiveFilter(activeFilter === platform.name ? null : platform.name)}
                      className={`p-4 rounded-[24px] border text-left transition-all ${
                        activeFilter === platform.name ? 'bg-white border-[#D4A017] ring-2 ring-[#D4A017]/10' : 'bg-white border-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1 border border-[#D4A017] rounded-md">{platform.icon}</div>
                        <span className="text-[9px] font-bold uppercase">{platform.name}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <p className="text-xs font-black">{platform.followers}</p>
                          <p className="text-[7px] text-gray-400 uppercase font-bold">Abonnés</p>
                        </div>
                        <div>
                          <p className="text-xs font-black">{platform.follows}</p>
                          <p className="text-[7px] text-gray-400 uppercase font-bold">Abonnements</p>
                        </div>
                        <div>
                          <p className="text-xs font-black">{platform.engagement}</p>
                          <p className="text-[7px] text-gray-400 uppercase font-bold">Engagement</p>
                        </div>
                        <div>
                          <p className="text-xs font-black">{platform.posts}</p>
                          <p className="text-[7px] text-gray-400 uppercase font-bold">Posts</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-bold">
                    {activeFilter ? `Posts ${activeFilter}` : 'Tous mes posts'}
                  </h2>
                  {activeFilter && (
                    <button 
                      onClick={() => setActiveFilter(null)} 
                      className="text-xs font-bold text-[#D4A017] px-3 py-1 bg-[#EBD8A3] rounded-full"
                    >
                      Tout afficher
                    </button>
                  )}
                </div>
                
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-[24px]">
                    <Camera className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-400">Aucun post trouvé</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts.map((post) => (
                      <button
                        key={post.id}
                        onClick={() => setSelectedPost(post)}
                        className="bg-white rounded-[24px] overflow-hidden border-2 border-gray-100 shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:border-[#D4A017] transition-all duration-300 text-left group"
                      >
                        <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                          <div className="absolute top-3 left-3 bg-white/95 px-3 py-2 rounded-full flex items-center gap-2 border-2 border-[#D4A017]/30 z-10 shadow-lg">
                            {post.icon}
                            <span className="text-[11px] font-black uppercase">{post.platform}</span>
                          </div>
                          
                          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-full text-white z-10">
                            <span className="text-[8px] font-bold">{post.date}</span>
                          </div>

                          <div className="relative z-0 group-hover:scale-110 transition-transform duration-300">
                            {post.type === 'video' ? (
                              <div className="relative">
                                <div className="absolute inset-0 bg-[#D4A017]/20 rounded-full animate-ping" />
                                <Play size={56} className="text-[#D4A017] relative" fill="currentColor" />
                              </div>
                            ) : (
                              <ImageIcon size={56} className="text-[#D4A017]" />
                            )}
                          </div>

                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="p-5">
                          <h4 className="text-sm font-bold mb-3 line-clamp-2 min-h-[40px] group-hover:text-[#D4A017] transition-colors">
                            {post.title}
                          </h4>

                          {(post.location_country || post.location_city) && (
                            <div className="mb-3 pb-3 border-b border-gray-100">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                    <circle cx="12" cy="10" r="3"/>
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[9px] text-gray-400 uppercase font-bold mb-0.5">Zone touchée</p>
                                  <p className="text-xs font-bold text-blue-600 truncate">
                                    {post.location_city && post.location_country 
                                      ? `${post.location_city}, ${post.location_country}`
                                      : post.location_city || post.location_country || 'Non spécifié'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-4 gap-2 text-center">
                            <div className="group/stat hover:bg-red-50 p-2 rounded-lg transition-colors">
                              <Heart size={12} className="text-red-500 fill-red-500 mx-auto mb-1 group-hover/stat:scale-125 transition-transform" />
                              <p className="text-[10px] font-black text-gray-700">{post.likes}</p>
                              <p className="text-[8px] text-gray-400 uppercase font-bold">Likes</p>
                            </div>
                            <div className="group/stat hover:bg-blue-50 p-2 rounded-lg transition-colors">
                              <Eye size={12} className="text-blue-500 mx-auto mb-1 group-hover/stat:scale-125 transition-transform" />
                              <p className="text-[10px] font-black text-gray-700">{post.views}</p>
                              <p className="text-[8px] text-gray-400 uppercase font-bold">Vues</p>
                            </div>
                            <div className="group/stat hover:bg-green-50 p-2 rounded-lg transition-colors">
                              <MessageCircle size={12} className="text-green-500 mx-auto mb-1 group-hover/stat:scale-125 transition-transform" />
                              <p className="text-[10px] font-black text-gray-700">{post.comments}</p>
                              <p className="text-[8px] text-gray-400 uppercase font-bold">Comm.</p>
                            </div>
                            <div className="group/stat hover:bg-purple-50 p-2 rounded-lg transition-colors">
                              <Share2 size={12} className="text-purple-500 mx-auto mb-1 group-hover/stat:scale-125 transition-transform" />
                              <p className="text-[10px] font-black text-gray-700">{post.shares}</p>
                              <p className="text-[8px] text-gray-400 uppercase font-bold">Parts</p>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-[9px] text-gray-400 uppercase font-bold">Engagement</span>
                            <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                              <TrendingUp size={10} className="text-amber-600" />
                              <span className="text-xs font-black text-amber-700">{post.eng}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'Opportunités' ? (
  <div>
    {notifications > 0 && (
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
          <Bell size={24} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-blue-900">
            🎉 {notifications} nouvelle{notifications > 1 ? 's' : ''} campagne{notifications > 1 ? 's' : ''} !
          </p>
          <p className="text-sm text-blue-700">
            Une marque vous a attribué {notifications > 1 ? 'des campagnes' : 'une campagne'}
          </p>
        </div>
      </div>
    )}

    {pendingCampaigns.length === 0 ? (
      <div className="text-center py-16 bg-white rounded-[32px] border border-gray-100">
        <Briefcase size={64} className="mx-auto text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-600 mb-2">Aucune opportunité</h2>
        <p className="text-gray-400">
          Les marques vous proposeront des campagnes ici
        </p>
      </div>
    ) : (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
        {/* EN-TÊTE */}
        <div className="p-5 md:p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50">
          <h2 className="text-xl font-bold text-[#111827]">
            Nouvelles opportunités ({pendingCampaigns.length})
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Cliquez sur "Accepter" ou "Refuser" pour gérer vos opportunités
          </p>
        </div>

        {/* LISTE RESPONSIVE */}
        <div className="overflow-x-auto">
          {/* VERSION DESKTOP - Tableau */}
          <table className="hidden md:table w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Campagne
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Marque
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Budget
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Période
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingCampaigns.map((campaign) => {
                const daysLeft = Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
                
                return (
                  <tr key={campaign.id_t_campagne} className="hover:bg-blue-50/50 transition-colors">
                    {/* CAMPAGNE */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                          <Briefcase size={20} className="text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">
                            {campaign.title || 'Campagne'}
                          </p>
                          <span className="inline-block text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold mt-1">
                            🆕 Nouvelle
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* MARQUE */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-gray-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-700 truncate">
                            {campaign.marque?.nom_marque || 'Marque'}
                          </p>
                          {campaign.marque?.domaine && (
                            <p className="text-xs text-gray-400 truncate">
                              {campaign.marque.domaine}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* BUDGET */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <TrendingUp size={12} className="text-[#D4A017]" />
                        <span className="text-sm font-black text-[#D4A017]">
                          {parseFloat(campaign.budget || 0).toLocaleString('fr-FR')}
                        </span>
                        <span className="text-xs text-gray-500">CFA</span>
                      </div>
                    </td>

                    {/* PÉRIODE */}
                    <td className="px-4 py-4">
                      <div className="text-xs text-gray-600">
                        <p className="font-medium">{formatDate(campaign.start_date)}</p>
                        <p className="text-gray-400">au {formatDate(campaign.end_date)}</p>
                        {daysLeft > 0 && (
                          <span className="inline-block mt-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold">
                            {daysLeft}j restants
                          </span>
                        )}
                      </div>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-4 py-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleRejectCampaign(campaign.id_t_campagne)}
                          disabled={processingCampaign === campaign.id_t_campagne}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title="Refuser"
                        >
                          {processingCampaign === campaign.id_t_campagne ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <CloseIcon size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => handleAcceptCampaign(campaign.id_t_campagne)}
                          disabled={processingCampaign === campaign.id_t_campagne}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4A017] text-white rounded-lg text-xs font-bold hover:bg-[#B88A14] transition-all disabled:opacity-50"
                        >
                          {processingCampaign === campaign.id_t_campagne ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <>
                              <Check size={14} />
                              Accepter
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* VERSION MOBILE - Liste compacte */}
          <div className="md:hidden divide-y divide-gray-100">
            {pendingCampaigns.map((campaign) => {
              const daysLeft = Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
              
              return (
                <div key={campaign.id_t_campagne} className="p-4 hover:bg-blue-50/50 transition-colors">
                  {/* En-tête mobile */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <Briefcase size={18} className="text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-gray-900 truncate">
                          {campaign.title || 'Campagne'}
                        </p>
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                          <Building2 size={10} />
                          {campaign.marque?.nom_marque || 'Marque'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-bold shrink-0 ml-2">
                      🆕 Nouvelle
                    </span>
                  </div>

                  {/* Infos principales */}
                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                    <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                      <p className="text-green-600 font-bold mb-0.5">Budget</p>
                      <p className="font-black text-green-700">
                        {parseFloat(campaign.budget || 0).toLocaleString('fr-FR')} CFA
                      </p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                      <p className="text-blue-600 font-bold mb-0.5">Durée</p>
                      <p className="font-black text-blue-700">{daysLeft} jours</p>
                    </div>
                  </div>

                  {/* Période */}
                  <div className="text-xs text-gray-500 mb-3 pb-3 border-b">
                    <p>Du {formatDate(campaign.start_date)} au {formatDate(campaign.end_date)}</p>
                    {campaign.marque?.domaine && (
                      <p className="mt-1">
                        <span className="font-bold text-gray-600">{campaign.marque.domaine}</span>
                      </p>
                    )}
                  </div>

                  {/* Actions mobile */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRejectCampaign(campaign.id_t_campagne)}
                      disabled={processingCampaign === campaign.id_t_campagne}
                      className="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {processingCampaign === campaign.id_t_campagne ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <CloseIcon size={16} />
                          Refuser
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleAcceptCampaign(campaign.id_t_campagne)}
                      disabled={processingCampaign === campaign.id_t_campagne}
                      className="flex-1 py-2.5 bg-[#D4A017] text-white rounded-lg text-sm font-bold hover:bg-[#B88A14] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {processingCampaign === campaign.id_t_campagne ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          <Check size={16} />
                          Accepter
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    )}
  </div>
) : activeTab === 'Mes campagnes' ? (
            <div>
              {acceptedCampaigns.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-[32px] border border-gray-100">
                  <Send size={64} className="mx-auto text-gray-200 mb-4" />
                  <h2 className="text-xl font-bold text-gray-600 mb-2">Aucun contrat en cours</h2>
                  <p className="text-gray-400">
                    Acceptez des campagnes dans l'onglet Opportunités
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {acceptedCampaigns.map((campaign) => {
                    const progress = calculateProgress(campaign);
                    const daysLeft = Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
                    
                    return (
                      <div key={campaign.id} className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Building2 size={16} className="text-[#D4A017]" />
                              <p className="text-sm font-bold text-gray-500">
                                {campaign.marque?.nom_marque || 'Marque'}
                              </p>
                            </div>
                            <h3 className="text-2xl font-bold mb-1">{campaign.title || 'Campagne'}</h3>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-black text-[#D4A017]">{progress}%</p>
                            <p className="text-xs text-gray-400 uppercase font-bold">Progression</p>
                          </div>
                        </div>

                        <div className="mb-6">
                          <div className="flex justify-between text-xs text-gray-500 mb-2">
                            <span>Début: {formatDate(campaign.start_date)}</span>
                            <span>Fin: {formatDate(campaign.end_date)}</span>
                          </div>
                          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#D4A017] to-[#FFD700] transition-all duration-500 flex items-center justify-end pr-2"
                              style={{ width: `${progress}%` }}
                            >
                              {progress > 10 && (
                                <span className="text-white text-xs font-bold">{progress}%</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                            <p className="text-xs text-green-400 uppercase font-bold mb-1">Budget</p>
                            <p className="text-lg font-black text-green-600">
                              {parseFloat(campaign.budget || 0).toLocaleString('fr-FR')}
                            </p>
                            <p className="text-xs text-green-500">CFA</p>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                            <p className="text-xs text-blue-400 uppercase font-bold mb-1">Jours restants</p>
                            <p className="text-lg font-black text-blue-600">{daysLeft}</p>
                            <p className="text-xs text-blue-500">{daysLeft > 1 ? 'jours' : 'jour'}</p>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                            <p className="text-xs text-purple-400 uppercase font-bold mb-1">Statut</p>
                            <p className="text-lg font-black text-purple-600">
                              <TrendingUp className="mx-auto" size={24} />
                            </p>
                            <p className="text-xs text-purple-500">En cours</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === 'Terminées' ? (
            <div>
              {completedCampaigns.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-[32px] border border-gray-100">
                  <Archive size={64} className="mx-auto text-gray-200 mb-4" />
                  <h2 className="text-xl font-bold text-gray-600 mb-2">Aucune campagne terminée</h2>
                  <p className="text-gray-400">
                    Vos campagnes accomplies apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {completedCampaigns.map((campaign) => (
                    <div key={campaign.id} className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border-2 border-green-200">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 size={16} className="text-green-600" />
                            <p className="text-sm font-bold text-gray-500">
                              {campaign.marque?.nom_marque || 'Marque'}
                            </p>
                          </div>
                          <h3 className="text-2xl font-bold mb-1">{campaign.title || 'Campagne'}</h3>
                        </div>
                        <div className="text-center">
                          <CheckCircle size={48} className="text-green-600 mx-auto mb-2" />
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                            ✓ Terminée
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                          <p className="text-xs text-green-400 uppercase font-bold mb-1">Gain</p>
                          <p className="text-xl font-black text-green-600">
                            {parseFloat(campaign.budget || 0).toLocaleString('fr-FR')}
                          </p>
                          <p className="text-xs text-green-500">CFA</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                          <p className="text-xs text-blue-400 uppercase font-bold mb-1">Durée</p>
                          <p className="text-xl font-black text-blue-600">
                            {Math.ceil((new Date(campaign.end_date).getTime() - new Date(campaign.start_date).getTime()) / (1000 * 3600 * 24))}
                          </p>
                          <p className="text-xs text-blue-500">jours</p>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-100">
                          <p className="text-xs text-purple-400 uppercase font-bold mb-1">Fin</p>
                          <p className="text-sm font-black text-purple-600">
                            {formatDate(campaign.end_date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </main>

      {isAdminViewing && (
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 p-2 pl-4 bg-white/80 backdrop-blur-md border border-orange-100 rounded-full shadow-[0_10px_30px_-10px_rgba(234,88,12,0.2)]"
        >
          <button 
            onClick={handleBackToAdmin}
            className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 hover:bg-black text-white rounded-full text-xs font-black transition-all active:scale-95"
          >
            retour au dashboard admin
          </button>
        </motion.div>
      )}
    </div>
  );
}
