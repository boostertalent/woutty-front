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
  const id_t_campagne = params?.id;

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
      if (!id_t_campagne) {
        setError("ID de campagne manquant");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth/login');
          return;
        }

        const USER_ID = session.user.id;

        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id_t_campagne', id_t_campagne)
          .single();

        if (campaignError) throw new Error(`Campagne ${id_t_campagne} introuvable`);

        setCampaign(campaignData);

        if (campaignData.id_w === USER_ID) {
          setUserRole('brand');
          
          const { data: brand } = await supabase
            .from('marque')
            .select('*')
            .eq('id_w', USER_ID)
            .single();
          
          if (brand) setBrandInfo(brand);
          
          if (campaignData.assigned_creator_id) {
            const { data: creator } = await supabase
              .from('createur')
              .select('*')
              .eq('id_w', campaignData.assigned_creator_id)
              .single();
            
            if (creator) setCreatorInfo(creator);
          }
          
        } else if (campaignData.assigned_creator_id === USER_ID) {
          setUserRole('creator');
          
          const { data: creator } = await supabase
            .from('createur')
            .select('*')
            .eq('id_w', USER_ID)
            .single();
          
          if (creator) setCreatorInfo(creator);
          
          const { data: brand } = await supabase
            .from('marque')
            .select('*')
            .eq('id_w', campaignData.id_w)
            .single();
          
          if (brand) setBrandInfo(brand);
        } else {
          throw new Error("Vous n'avez pas accès à cette campagne");
        }

        // ✅ CHARGER UNIQUEMENT LES POSTS VALIDÉS
        const { data: postsData, error: postsError } = await supabase
          .from('info_poste')
          .select('*')
          .eq('id_t_campagne', id_t_campagne)
          .eq('is_validated', true) 
          .order('date_poste', { ascending: false });
        
        if (postsError) {
          console.error('⚠️ Erreur chargement posts:', postsError);
        }
        
        console.log(`✅ ${postsData?.length || 0} posts validés chargés pour la campagne`);
        
        const postsWithEngagement = (postsData || []).map((post: any) => ({
          ...post,
          engagement_rate: calculateEngagementRate(post)
        }));

        setPosts(postsWithEngagement);

      } catch (error: any) {
        setError(error.message || "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }

    fetchCampaignData();
  }, [id_t_campagne, supabase, router]);

  const calculateEngagementRate = (post: any) => {
    const likes = Number(post.nbre_like) || 0;
    const comments = Number(post.nbre_commentaire) || 0;
    const views = Number(post.nbre_vue) || 0;
    
    if (views === 0) return 0;
    
    const engagement = ((likes + comments) / views) * 100;
    return engagement.toFixed(1);
  };

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
      month: 'short'
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
        <Loader2 className="animate-spin text-[#D4A017]" size={32} />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full border">
          <AlertCircle className="text-red-500 mx-auto mb-3" size={40} />
          <h2 className="text-lg font-bold text-center mb-2">Erreur</h2>
          <p className="text-sm text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="w-full py-2 bg-gray-100 rounded-lg font-bold text-sm hover:bg-gray-200"
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  const totalViews = posts.reduce((acc, p) => acc + (Number(p.nbre_vue) || 0), 0);
  const totalLikes = posts.reduce((acc, p) => acc + (Number(p.nbre_like) || 0), 0);
  const totalComments = posts.reduce((acc, p) => acc + (Number(p.nbre_commentaire) || 0), 0);
  const totalShares = posts.reduce((acc, p) => acc + (Number(p.nbre_partage) || 0), 0);
  
  const avgEngagement = posts.length > 0 
    ? (posts.reduce((acc, p) => acc + Number(p.engagement_rate || 0), 0) / posts.length).toFixed(1)
    : "0";

  const progress = calculateProgress();

  const stats = [
    { label: "Budget", value: `${parseFloat(campaign.budget || 0).toLocaleString('fr-FR')} CFA`, icon: <DollarSign size={16} />, color: "text-green-600" },
    { label: "Progression", value: `${progress}%`, icon: <Clock size={16} />, color: "text-blue-600" },
    { label: "Posts", value: posts.length, icon: <Target size={16} />, color: "text-purple-600" },
    { label: "Vues", value: formatNumber(totalViews), icon: <Eye size={16} />, color: "text-orange-600" },
    { label: "Engagement", value: `${avgEngagement}%`, icon: <Percent size={16} />, color: "text-[#D4A017]" },
    { label: "Likes", value: formatNumber(totalLikes), icon: <Heart size={16} />, color: "text-red-600" },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-3 md:p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER COMPACT */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-1 text-gray-400 hover:text-black mb-4 font-medium text-sm"
        >
          <ChevronLeft size={16} /> Retour
        </button>

        {/* INFO CAMPAGNE COMPACT */}
        <div className="bg-white rounded-2xl p-4 md:p-5 mb-4 border shadow-sm">
          <div className="flex flex-col md:flex-row justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-1">
                {campaign.title || "Campagne"}
              </h1>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                {userRole === 'brand' && creatorInfo && (
                  <div className="flex items-center gap-1">
                    <User size={12} className="text-[#D4A017]" />
                    <span>{creatorInfo.full_name}</span>
                  </div>
                )}
                {userRole === 'creator' && brandInfo && (
                  <div className="flex items-center gap-1">
                    <Building2 size={12} className="text-[#D4A017]" />
                    <span>{brandInfo.nom_marque}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar size={12} className="text-[#D4A017]" />
                  <span>{formatDate(campaign.start_date)} → {formatDate(campaign.end_date)}</span>
                </div>
              </div>
            </div>
            
            {userRole === 'brand' && (
              <button 
                onClick={() => router.push(`/brands/dashboard/edit/${id_t_campagne}`)}
                className="bg-[#D4A017] hover:bg-[#b88a14] text-white px-4 py-2 rounded-lg font-bold text-xs h-fit"
              >
                ✏️ Modifier
              </button>
            )}
          </div>

          {/* BARRE PROGRESSION COMPACT */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span>Progression</span>
              <span className="font-bold text-[#D4A017]">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#D4A017] to-[#FFD700]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* STATS COMPACT */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-3 rounded-xl border shadow-sm">
              <div className={`${stat.color} mb-2`}>{stat.icon}</div>
              <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">{stat.label}</p>
              <p className="font-bold text-sm text-[#111827]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* PERFORMANCE GLOBALE COMPACT */}
        <div className="bg-gradient-to-br from-[#D4A017]/10 to-[#FFD700]/10 rounded-2xl p-4 mb-4 border border-[#D4A017]/20">
          <h3 className="text-sm font-bold text-[#111827] mb-3">Performance globale</h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <Eye className="text-[#D4A017] mx-auto mb-1" size={18} />
              <p className="text-lg font-black text-[#111827]">{formatNumber(totalViews)}</p>
              <p className="text-[9px] text-gray-600 font-medium">Vues</p>
            </div>
            <div className="text-center">
              <Heart className="text-red-500 mx-auto mb-1" size={18} />
              <p className="text-lg font-black text-[#111827]">{formatNumber(totalLikes)}</p>
              <p className="text-[9px] text-gray-600 font-medium">Likes</p>
            </div>
            <div className="text-center">
              <MessageCircle className="text-blue-500 mx-auto mb-1" size={18} />
              <p className="text-lg font-black text-[#111827]">{formatNumber(totalComments)}</p>
              <p className="text-[9px] text-gray-600 font-medium">Comm.</p>
            </div>
            <div className="text-center">
              <Send className="text-green-500 mx-auto mb-1" size={18} />
              <p className="text-lg font-black text-[#111827]">{formatNumber(totalShares)}</p>
              <p className="text-[9px] text-gray-600 font-medium">Partages</p>
            </div>
          </div>
        </div>

        {/* POSTS VALIDÉS UNIQUEMENT */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[#111827]">
              Posts validés ({posts.length})
            </h2>
            {/* ✅ Badge indicateur */}
            <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold border border-green-200 flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Validés uniquement
            </span>
          </div>
          
          {posts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {posts.map((post, index) => (
                <div key={post.id_t_poste || index} className="bg-white rounded-xl overflow-hidden border shadow-sm hover:shadow-md transition-all">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                    <span className="text-3xl">
                      {post.type_poste?.toLowerCase().includes('vid') ? '🎥' : '📸'}
                    </span>
                    <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded-full text-[9px] font-bold">
                      {post.type_poste || 'Post'}
                    </div>
                    <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-full text-[9px] font-bold text-white">
                      {formatDate(post.date_poste)}
                    </div>
                    {/* ✅ Badge "Validé" */}
                    <div className="absolute bottom-2 right-2 bg-green-500 px-2 py-1 rounded-full text-[9px] font-bold text-white flex items-center gap-1">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Validé
                    </div>
                  </div>
                  <div className="p-2">
                    <h4 className="font-bold text-xs mb-2 line-clamp-1">
                      {post.titre_poste || 'Sans titre'}
                    </h4>
                    <div className="grid grid-cols-5 gap-1 text-center">
                      <StatItem icon={<Heart size={10} className="fill-red-500 text-red-500" />} value={post.nbre_like} />
                      <StatItem icon={<Eye size={10} className="text-blue-500" />} value={post.nbre_vue} />
                      <StatItem icon={<MessageCircle size={10} className="text-green-500" />} value={post.nbre_commentaire} />
                      <StatItem icon={<Send size={10} className="text-purple-500" />} value={post.nbre_partage} />
                      <div className="flex flex-col items-center">
                        <Percent size={10} className="text-[#D4A017] mb-0.5" />
                        <span className="text-[8px] font-black text-[#D4A017]">{post.engagement_rate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-center text-center">
              <Sparkles className="text-gray-300 mb-3" size={32} />
              <h3 className="text-base font-bold text-[#111827] mb-1">Aucun post validé</h3>
              <p className="text-xs text-gray-400 max-w-md">
                Les posts apparaîtront ici une fois validés par l'administrateur
              </p>
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
      <span className="text-[8px] font-black mt-0.5">{formatted}</span>
    </div>
  );
}
