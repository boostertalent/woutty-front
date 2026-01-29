"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Target, TrendingUp, Sparkles, Heart, 
  Send, MessageCircle, Eye, Percent, Loader2, ChevronLeft, Calendar, PlusCircle
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CampaignDetailDynamic() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [campaign, setCampaign] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaignData() {
      if (!id) return;
      try {
        setLoading(true);

        const { data: campaignData, error: campaignError } = await supabase
          .from('campaigns')
          .select('*')
          .eq('id', id)
          .single();

        if (campaignError) throw campaignError;

        const { data: postsData, error: postsError } = await supabase
          .from('info_poste')
          .select('*')
          .eq('campaign_id', id); 

        if (postsError) throw postsError;

        setCampaign(campaignData);
        setPosts(postsData || []);
      } catch (error) {
        console.error("Erreur de chargement:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCampaignData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <Loader2 className="animate-spin text-[#D4A017]" size={40} />
      </div>
    );
  }

  // --- LOGIQUE DE CALCUL ---
  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  const periode = `${formatDate(campaign?.created_at)} au ${formatDate(campaign?.end_date)}`;
  const totalViews = posts.reduce((acc, p) => acc + (Number(p.nbre_vue) || 0), 0);
  const avgEngagement = posts.length > 0 
    ? (posts.reduce((acc, p) => acc + (Number(p.engagement_rate) || 0), 0) / posts.length).toFixed(1)
    : "0";

  const stats = [
    { label: "NOMBRE DE POSTS", value: posts.length, icon: <Target size={20} /> },
    { label: "PÉRIODE", value: periode, icon: <Calendar size={20} /> },
    { label: "VUES TOTALES", value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews, icon: <TrendingUp size={20} /> },
    { label: "ENGAGEMENT", value: `${avgEngagement}%`, icon: <Percent size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-black mb-6 font-bold transition-all group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Retour
        </button>

        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-serif font-bold text-[#111827]">
            {campaign?.title || `Détail campagne`}
          </h1>
          <button 
            onClick={() => router.push(`/brands/auth/edit/${id}`)}
            className="bg-[#D4A017] hover:bg-[#b88a14] text-white px-8 py-3 rounded-full font-bold text-sm transition-all shadow-lg shadow-[#D4A017]/20 active:scale-95"
          >
            Modifier campagne
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <div className="bg-gray-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-[#D4A017]">
                {stat.icon}
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                {stat.label}
              </p>
              <p className={`font-bold text-[#111827] ${stat.label === 'PÉRIODE' ? 'text-lg' : 'text-3xl'}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold text-[#111827] mb-8">Mes posts ({posts.length})</h2>
        
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div key={post.id} className="relative aspect-square bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-sm group">
                {post.image_url ? (
                  <img 
                    src={post.image_url} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt="Post"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300 font-bold">
                    Pas d'aperçu
                  </div>
                )}

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] bg-black/60 backdrop-blur-md rounded-full py-2 px-4 flex justify-between items-center border border-white/20 text-white shadow-xl">
                  <StatItem icon={<Heart size={14} />} value={post.nbre_like} />
                  <StatItem icon={<Send size={14} />} value={post.nbre_partage} />
                  <StatItem icon={<MessageCircle size={14} />} value={post.nbre_commentaire} />
                  <StatItem icon={<Eye size={14} />} value={post.nbre_vue} />
                  <StatItem icon={<Percent size={14} />} value={post.engagement_rate || '0'} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-[40px] border-2 border-dashed border-gray-100 p-20 flex flex-col items-center text-center">
            <div className="bg-gray-50 p-6 rounded-full mb-6">
              <Sparkles className="text-gray-300" size={48} />
            </div>
            <h3 className="text-xl font-bold text-[#111827] mb-2">Aucun post pour le moment</h3>
            <p className="text-gray-400 max-w-xs mb-8">
              Une fois que des publications seront liées à cette campagne, elles apparaîtront ici.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ icon, value }: { icon: any, value: any }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[#D4A017] mb-0.5">{icon}</span>
      <span className="text-[10px] font-bold">
        {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : (value || 0)}
      </span>
    </div>
  );
}