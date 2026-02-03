"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Target, TrendingUp, Sparkles, Heart, 
  Send, MessageCircle, Eye, Percent, Loader2, ChevronLeft, 
  Calendar, User, Building2, AlertCircle, DollarSign, Clock
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function CampaignDetailDynamic() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [campaign, setCampaign] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [creatorInfo, setCreatorInfo] = useState<any>(null);
  const [brandInfo, setBrandInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'brand' | 'creator' | null>(null);

  useEffect(() => {
    async function fetchCampaignData() {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);

        // 1. VÉRIFIER LA SESSION
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth/login');
          return;
        }

        const USER_ID = session.user.id;

        // 2. RÉCUPÉRER LA CAMPAGNE
        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', id)
          .single();

        if (campaignError) {
          console.error("❌ Erreur campagne:", campaignError);
          throw new Error("Campagne introuvable");
        }

        console.log("✅ Campagne chargée:", campaignData.title);
        setCampaign(campaignData);

        // 3. DÉTERMINER LE RÔLE DE L'UTILISATEUR
        if (campaignData.id_w === USER_ID) {
          setUserRole('brand');
          
          // Récupérer les infos de la marque
          const { data: brand } = await supabase
            .from('marque')
            .select('*')
            .eq('id_w', USER_ID)
            .single();
          
          if (brand) setBrandInfo(brand);
          
        } else if (campaignData.assigned_creator_id === USER_ID) {
          setUserRole('creator');
          
          // Récupérer les infos du créateur
          const { data: creator } = await supabase
            .from('createur')
            .select('*')
            .eq('id_w', USER_ID)
            .single();
          
          if (creator) setCreatorInfo(creator);
        } else {
          throw new Error("Vous n'avez pas accès à cette campagne");
        }

        // 4. RÉCUPÉRER LES POSTS LIÉS À CETTE CAMPAGNE
        // Option A : Si vous avez un champ campaign_id dans info_poste
        let postsQuery = supabase
          .from('info_poste')
          .select('*');

        if (campaignData.assigned_creator_id) {
          // Récupérer les posts du créateur assigné pendant la période de la campagne
          postsQuery = postsQuery
            .eq('id_w', campaignData.assigned_creator_id);
          
          // Filtrer par dates si disponibles
          if (campaignData.start_date) {
            postsQuery = postsQuery.gte('date_poste', campaignData.start_date);
          }
          if (campaignData.end_date) {
            postsQuery = postsQuery.lte('date_poste', campaignData.end_date);
          }
        }

        const { data: postsData, error: postsError } = await postsQuery
          .order('date_poste', { ascending: false });

        if (postsError) {
          console.error("❌ Erreur posts:", postsError);
        }

        console.log("📸 Posts trouvés:", postsData?.length || 0);
        
        // Calculer le taux d'engagement pour chaque post
        const postsWithEngagement = (postsData || []).map(post => ({
          ...post,
          engagement_rate: calculateEngagementRate(post)
        }));

        setPosts(postsWithEngagement);

      } catch (error: any) {
        console.error("❌ Erreur:", error);
        setError(error.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }

    fetchCampaignData();
  }, [id, supabase, router]);

  // Calculer le taux d'engagement
  const calculateEngagementRate = (post: any) => {
    const likes = Number(post.nbre_like) || 0;
    const comments = Number(post.nbre_commentaire) || 0;
    const views = Number(post.nbre_vue) || 0;
    
    if (views === 0) return 0;
    
    const engagement = ((likes + comments) / views) * 100;
    return engagement.toFixed(1);
  };

  // Calculer la progression de la campagne
  const calculateProgress = () => {
    if (!campaign?.start_date || !campaign?.end_date) return 0;
    
    const start = new Date(campaign.start_date).getTime();
    const end = new Date(campaign.end_date).getTime();
    const now = new Date().getTime();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-center">
          <Loader2 className="animate-spin text-[#D4A017] mx-auto mb-4" size={48} />
          <p className="text-gray-500 font-medium">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
        <div className="bg-white rounded-[32px] p-8 max-w-md w-full border border-red-100">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-center mb-2">Erreur</h2>
          <p className="text-gray-600 text-center mb-6">{error || "Campagne introuvable"}</p>
          <button
            onClick={() => router.back()}
            className="w-full py-3 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition-all"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // --- CALCULS STATISTIQUES ---
  const totalViews = posts.reduce((acc, p) => acc + (Number(p.nbre_vue) || 0), 0);
  const totalLikes = posts.reduce((acc, p) => acc + (Number(p.nbre_like) || 0), 0);
  const totalComments = posts.reduce((acc, p) => acc + (Number(p.nbre_commentaire) || 0), 0);
  const totalShares = posts.reduce((acc, p) => acc + (Number(p.nbre_partage) || 0), 0);
  
  const avgEngagement = posts.length > 0 
    ? (posts.reduce((acc, p) => acc + Number(p.engagement_rate || 0), 0) / posts.length).toFixed(1)
    : "0";

  const progress = calculateProgress();

  const stats = [
    { 
      label: "BUDGET", 
      value: `${parseFloat(campaign.budget || 0).toLocaleString('fr-FR')} CFA`, 
      icon: <DollarSign size={20} />,
      color: "text-green-600"
    },
    { 
      label: "PROGRESSION", 
      value: `${progress}%`, 
      icon: <Clock size={20} />,
      color: "text-blue-600"
    },
    { 
      label: "POSTS CRÉÉS", 
      value: posts.length, 
      icon: <Target size={20} />,
      color: "text-purple-600"
    },
    { 
      label: "VUES TOTALES", 
      value: formatNumber(totalViews), 
      icon: <Eye size={20} />,
      color: "text-orange-600"
    },
    { 
      label: "ENGAGEMENT MOY.", 
      value: `${avgEngagement}%`, 
      icon: <Percent size={20} />,
      color: "text-[#D4A017]"
    },
    { 
      label: "LIKES TOTAUX", 
      value: formatNumber(totalLikes), 
      icon: <Heart size={20} />,
      color: "text-red-600"
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-gray-400 hover:text-black mb-6 font-bold transition-all group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour
        </button>

        {/* TITRE ET INFOS PRINCIPALES */}
        <div className="bg-white rounded-[32px] p-6 md:p-8 mb-8 border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#111827] mb-2">
                {campaign.title || "Campagne"}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {userRole === 'brand' && creatorInfo && (
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-[#D4A017]" />
                    <span>Créateur: <strong>{creatorInfo.full_name}</strong></span>
                  </div>
                )}
                {userRole === 'creator' && brandInfo && (
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-[#D4A017]" />
                    <span>Marque: <strong>{brandInfo.nom_marque}</strong></span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-[#D4A017]" />
                  <span>{formatDate(campaign.start_date)} → {formatDate(campaign.end_date)}</span>
                </div>
              </div>
            </div>
            
            {userRole === 'brand' && (
              <button 
                onClick={() => router.push(`/brands/auth/edit/${id}`)}
                className="bg-[#D4A017] hover:bg-[#b88a14] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95"
              >
                Modifier campagne
              </button>
            )}
          </div>

          {/* Barre de progression */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Progression</span>
              <span className="font-bold text-[#D4A017]">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#D4A017] to-[#FFD700] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`${stat.color} mb-4`}>
                {stat.icon}
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                {stat.label}
              </p>
              <p className="font-bold text-[#111827] text-2xl">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* STATISTIQUES GLOBALES */}
        <div className="bg-gradient-to-br from-[#D4A017]/10 to-[#FFD700]/10 rounded-[32px] p-6 md:p-8 mb-8 border border-[#D4A017]/20">
          <h3 className="text-lg font-bold text-[#111827] mb-6">Performance globale</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Eye className="text-[#D4A017] mx-auto mb-2" size={24} />
              <p className="text-2xl font-black text-[#111827]">{formatNumber(totalViews)}</p>
              <p className="text-xs text-gray-600 font-medium mt-1">Vues</p>
            </div>
            <div className="text-center">
              <Heart className="text-red-500 mx-auto mb-2" size={24} />
              <p className="text-2xl font-black text-[#111827]">{formatNumber(totalLikes)}</p>
              <p className="text-xs text-gray-600 font-medium mt-1">Likes</p>
            </div>
            <div className="text-center">
              <MessageCircle className="text-blue-500 mx-auto mb-2" size={24} />
              <p className="text-2xl font-black text-[#111827]">{formatNumber(totalComments)}</p>
              <p className="text-xs text-gray-600 font-medium mt-1">Commentaires</p>
            </div>
            <div className="text-center">
              <Send className="text-green-500 mx-auto mb-2" size={24} />
              <p className="text-2xl font-black text-[#111827]">{formatNumber(totalShares)}</p>
              <p className="text-xs text-gray-600 font-medium mt-1">Partages</p>
            </div>
          </div>
        </div>

        {/* LISTE DES POSTS */}
        <div>
          <h2 className="text-xl font-bold text-[#111827] mb-6">
            Posts de la campagne ({posts.length})
          </h2>
          
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div 
                  key={post["id_t-poste"]} 
                  className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all"
                >
                  {/* Image/Vidéo preview */}
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                    {post.url_poste ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl">
                          {post.type_poste?.toLowerCase().includes('vid') ? '🎥' : '📸'}
                        </span>
                      </div>
                    ) : (
                      <div className="text-gray-300 font-bold">Pas d'aperçu</div>
                    )}
                    
                    {/* Badge plateforme */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold border border-gray-200">
                      {post.type_poste || 'Post'}
                    </div>
                    
                    {/* Date */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-white">
                      {formatDate(post.date_poste)}
                    </div>
                  </div>

                  {/* Infos du post */}
                  <div className="p-4">
                    <h4 className="font-bold text-sm mb-3 line-clamp-2 min-h-[40px]">
                      {post.titre_poste || 'Sans titre'}
                    </h4>

                    {/* Stats */}
                    <div className="grid grid-cols-5 gap-2 text-center">
                      <StatItem 
                        icon={<Heart size={12} className="fill-red-500 text-red-500" />} 
                        value={post.nbre_like} 
                      />
                      <StatItem 
                        icon={<Eye size={12} className="text-blue-500" />} 
                        value={post.nbre_vue} 
                      />
                      <StatItem 
                        icon={<MessageCircle size={12} className="text-green-500" />} 
                        value={post.nbre_commentaire} 
                      />
                      <StatItem 
                        icon={<Send size={12} className="text-purple-500" />} 
                        value={post.nbre_partage} 
                      />
                      <div className="flex flex-col items-center">
                        <Percent size={12} className="text-[#D4A017] mb-1" />
                        <span className="text-[10px] font-black text-[#D4A017]">
                          {post.engagement_rate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-[32px] border-2 border-dashed border-gray-200 p-12 md:p-20 flex flex-col items-center text-center">
              <div className="bg-gray-50 p-6 rounded-full mb-6">
                <Sparkles className="text-gray-300" size={48} />
              </div>
              <h3 className="text-xl font-bold text-[#111827] mb-2">
                Aucun post pour le moment
              </h3>
              <p className="text-gray-400 max-w-md mb-8">
                Les publications du créateur pendant la période de la campagne apparaîtront automatiquement ici.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={16} />
                <span>
                  Période: {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon, value }: { icon: any, value: any }) {
  const formatted = Number(value) >= 1000 
    ? `${(Number(value) / 1000).toFixed(1)}k` 
    : (value || 0);
  
  return (
    <div className="flex flex-col items-center">
      {icon}
      <span className="text-[10px] font-black mt-1">
        {formatted}
      </span>
    </div>
  );
}
