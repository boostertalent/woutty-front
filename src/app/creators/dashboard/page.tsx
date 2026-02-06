"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr'; 
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  LogOut,
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
  CheckCircle
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
  const [creatorInfo, setCreatorInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const menuItems = [
    { name: 'Ma performance', icon: <BarChart3 size={20} /> },
    { name: 'Opportunités', icon: <Briefcase size={20} /> },
    { name: 'Mes campagnes', icon: <Send size={20} /> },
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
      console.log("👤 Utilisateur connecté:", USER_ID);

      // Récupérer le créateur
      const { data: creatorData } = await supabase
        .from('createur')
        .select('*')
        .eq('id_w', USER_ID)
        .single();

      if (creatorData) {
        console.log("✅ Créateur:", creatorData.full_name);
        setCreatorInfo(creatorData);
      }

      // Récupérer les profils
      const { data: profileData } = await supabase
        .from('info_profile')
        .select('*')
        .eq('id_w', USER_ID);

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

      // Récupérer les posts
      const { data: postData } = await supabase
        .from('info_poste')
        .select('*')
        .eq('id_w', USER_ID)
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
        };
      });

      setAllPosts(posts);

      // ✅ OPPORTUNITÉS : TOUTES les campagnes attribuées (même terminées)
      const { data: pendingData } = await supabase
        .from('campaigns')
        .select(`
          *,
          marque:marque(nom_marque, domaine)
        `)
        .eq('assigned_creator_id', USER_ID)
        .or('creator_status.is.null,creator_status.eq.pending');

      console.log("📋 Campagnes attribuées (Opportunités):", pendingData?.length || 0);
      setPendingCampaigns(pendingData || []);

      // MES CAMPAGNES : Campagnes acceptées
      const { data: acceptedData } = await supabase
        .from('campaigns')
        .select(`
          *,
          marque:marque(nom_marque, domaine)
        `)
        .eq('assigned_creator_id', USER_ID)
        .eq('creator_status', 'accepted');

      console.log("📊 Campagnes acceptées:", acceptedData?.length || 0);
      setAcceptedCampaigns(acceptedData || []);

    } catch (error: any) {
      console.error("❌ Erreur:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [supabase, getPlatformInfoByName, router]);

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

  // ACCEPTER UNE CAMPAGNE
  const handleAcceptCampaign = async (campaignId: number) => {
    setProcessingCampaign(campaignId);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          creator_status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (error) throw error;

      console.log("✅ Campagne acceptée");
      await fetchData();
    } catch (err: any) {
      console.error("❌ Erreur:", err);
      setError("Erreur lors de l'acceptation de la campagne");
    } finally {
      setProcessingCampaign(null);
    }
  };

  // REFUSER UNE CAMPAGNE
  const handleRejectCampaign = async (campaignId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir refuser cette campagne ?')) return;

    setProcessingCampaign(campaignId);
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          creator_status: 'rejected',
          assigned_creator_id: null
        })
        .eq('id', campaignId);

      if (error) throw error;

      console.log("✅ Campagne refusée");
      await fetchData();
    } catch (err: any) {
      console.error("❌ Erreur:", err);
      setError("Erreur lors du refus de la campagne");
    } finally {
      setProcessingCampaign(null);
    }
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

  // Calculer le progrès dynamique d'une campagne
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
      
      {/* MODAL POSTS (inchangé) */}
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

      {/* ERROR */}
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                activeTab === item.name ? 'bg-[#EBD8A3] text-[#D4A017]' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {item.icon} {item.name}
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
          <LogOut size={20} /> Déconnexion
        </button>
      </aside>

      {/* MOBILE NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 z-50">
        {menuItems.map((item) => (
          <button 
            key={item.name} 
            onClick={() => setActiveTab(item.name)}
            className={`flex flex-col items-center gap-1 ${activeTab === item.name ? 'text-[#D4A017]' : 'text-gray-400'}`}
          >
            {item.icon}
            <span className="text-[10px] font-bold">{item.name.split(' ')[0]}</span>
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
            {activeTab === 'Opportunités' && 'Campagnes qui vous ont été attribuées'}
            {activeTab === 'Mes campagnes' && 'Suivez vos contrats en cours'}
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
                        className="bg-white rounded-[24px] overflow-hidden border shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all text-left"
                      >
                        <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <div className="absolute top-3 left-3 bg-white/95 px-3 py-2 rounded-full flex items-center gap-2 border-2 border-[#D4A017]/30 z-10">
                            {post.icon}
                            <span className="text-[11px] font-black uppercase">{post.platform}</span>
                          </div>
                          <div className="absolute top-3 right-3 bg-black/60 px-3 py-1.5 rounded-full text-white z-10">
                            <span className="text-[8px] font-bold">{post.date}</span>
                          </div>
                          {post.type === 'video' ? (
                            <Play size={48} className="text-[#D4A017]" fill="currentColor" />
                          ) : (
                            <ImageIcon size={48} className="text-[#D4A017]" />
                          )}
                        </div>

                        <div className="p-4">
                          <h4 className="text-sm font-bold mb-3 line-clamp-2 min-h-[40px]">{post.title}</h4>
                          <div className="grid grid-cols-4 gap-2 text-center">
                            <div>
                              <Heart size={12} className="text-[#D4A017] fill-[#D4A017] mx-auto mb-1" />
                              <p className="text-[10px] font-black">{post.likes}</p>
                            </div>
                            <div>
                              <Eye size={12} className="text-[#D4A017] mx-auto mb-1" />
                              <p className="text-[10px] font-black">{post.views}</p>
                            </div>
                            <div>
                              <MessageCircle size={12} className="text-[#D4A017] mx-auto mb-1" />
                              <p className="text-[10px] font-black">{post.comments}</p>
                            </div>
                            <div>
                              <Share2 size={12} className="text-[#D4A017] mx-auto mb-1" />
                              <p className="text-[10px] font-black">{post.shares}</p>
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
              {pendingCampaigns.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-[32px] border border-gray-100">
                  <Briefcase size={64} className="mx-auto text-gray-200 mb-4" />
                  <h2 className="text-xl font-bold text-gray-600 mb-2">Aucune opportunité</h2>
                  <p className="text-gray-400">
                    Les marques vous proposeront des campagnes ici
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pendingCampaigns.map((campaign) => {
                    const progress = calculateProgress(campaign);
                    const isCompleted = progress >= 100;
                    const daysLeft = Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
                    
                    return (
                      <div key={campaign.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Building2 size={16} className="text-[#D4A017]" />
                              <p className="text-sm font-bold text-gray-500">
                                {campaign.marque?.nom_marque || 'Marque'}
                              </p>
                            </div>
                            <h3 className="text-xl font-bold mb-1">{campaign.title || 'Campagne'}</h3>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                            isCompleted 
                              ? 'bg-green-50 text-green-600 border-green-100'
                              : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                          }`}>
                            {isCompleted ? '✓ Terminée' : 'Nouvelle'}
                          </span>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Budget</span>
                            <span className="font-bold text-[#D4A017] text-lg">
                              {parseFloat(campaign.budget || 0).toLocaleString('fr-FR')} CFA
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Début</span>
                            <span className="font-medium">{formatDate(campaign.start_date)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Fin</span>
                            <span className="font-medium">{formatDate(campaign.end_date)}</span>
                          </div>
                          {!isCompleted && daysLeft > 0 && (
                            <div className="flex items-center justify-between text-sm bg-blue-50 p-2 rounded-lg">
                              <span className="text-blue-600 font-medium">⏱️ Jours restants</span>
                              <span className="font-bold text-blue-700">{daysLeft} jour{daysLeft > 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {campaign.marque?.domaine && (
                            <div className="pt-2 border-t">
                              <span className="text-xs text-gray-400">Secteur: </span>
                              <span className="text-xs font-bold text-gray-600">{campaign.marque.domaine}</span>
                            </div>
                          )}
                        </div>

                        {/* Barre de progression */}
                        <div className="mb-6">
                          <div className="flex justify-between text-xs text-gray-500 mb-2">
                            <span>Progression</span>
                            <span className="font-bold text-[#D4A017]">{progress}%</span>
                          </div>
                          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                isCompleted 
                                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                                  : 'bg-gradient-to-r from-[#D4A017] to-[#FFD700]'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleRejectCampaign(campaign.id)}
                            disabled={processingCampaign === campaign.id || isCompleted}
                            className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingCampaign === campaign.id ? (
                              <Loader2 className="animate-spin mx-auto" size={20} />
                            ) : (
                              '✕ Refuser'
                            )}
                          </button>
                          <button 
                            onClick={() => handleAcceptCampaign(campaign.id)}
                            disabled={processingCampaign === campaign.id || isCompleted}
                            className="flex-1 py-3 bg-[#D4A017] text-white rounded-xl font-bold hover:bg-[#B88A14] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {processingCampaign === campaign.id ? (
                              <Loader2 className="animate-spin" size={20} />
                            ) : isCompleted ? (
                              <>
                                <CheckCircle size={20} />
                                Achevée
                              </>
                            ) : (
                              <>
                                <Check size={20} />
                                Accepter
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
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

                        {/* Barre de progression */}
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

                        {/* Détails */}
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
                              {progress >= 100 ? (
                                <CheckCircle className="mx-auto" size={24} />
                              ) : (
                                <TrendingUp className="mx-auto" size={24} />
                              )}
                            </p>
                            <p className="text-xs text-purple-500">
                              {progress >= 100 ? 'Terminée' : 'En cours'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
