"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react'; 
import { motion } from 'framer-motion';
import { 
  Users, Zap, ArrowRight, Sparkles,
  Pencil, Trash2, X as CloseIcon, Check,
  RefreshCw, Clock, TrendingUp, Instagram, Youtube, 
  Music2, Camera, Mail, Loader2, MessageCircle
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { createBrowserClient } from '@supabase/ssr';

const XLogo = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.486 3.24H4.298L17.607 20.65z" />
  </svg>
);

export default function BrandDashboard() {
  const searchParams = useSearchParams();
  const [isAdminViewing, setIsAdminViewing] = useState(false);
  const router = useRouter();
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [creators, setCreators] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalBudget: 0, completedCampaigns: 0, ongoingCampaigns: 0, totalCampaigns: 0 });
  const [brandInfo, setBrandInfo] = useState<any>(null);
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null);
  const [creatorDetails, setCreatorDetails] = useState<any | null>(null);
  const [loadingCreatorDetails, setLoadingCreatorDetails] = useState(false);
  const [showCampaignSelection, setShowCampaignSelection] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const determineStatusByDates = (startDateStr: string, endDateStr: string) => {
    if (!startDateStr || !endDateStr) return 'pending';
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const startDate = new Date(startDateStr); startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(endDateStr); endDate.setHours(23, 59, 59, 999);
    if (endDate < today) return 'completed';
    if (startDate <= today && endDate >= today) return 'active';
    if (startDate > today) return 'planned';
    return 'pending';
  };

  const getStatusDisplay = (campaign: any) => {
    switch (determineStatusByDates(campaign.start_date, campaign.end_date)) {
      case 'completed': return { text: 'Terminée', color: 'bg-green-50 text-green-600 border-green-100' };
      case 'active': return { text: 'En cours', color: 'bg-blue-50 text-blue-600 border-blue-100' };
      case 'planned': return { text: 'Planifiée', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' };
      default: return { text: 'En attente', color: 'bg-gray-50 text-gray-600 border-gray-100' };
    }
  };

  const getPrimaryPlatform = (creator: any) => {
    const platforms = [
      { name: 'Instagram', followers: creator.instagram_followers || 0 },
      { name: 'YouTube', followers: creator.youtube_followers || 0 },
      { name: 'TikTok', followers: creator.tiktok_followers || 0 },
      { name: 'X', followers: creator.x_followers || 0 },
      { name: 'Snap', followers: creator.snap_followers || 0 }
    ];
    return platforms.sort((a, b) => b.followers - a.followers)[0]?.name || 'Plateforme';
  };

  const getSuggestedCreators = async (userCampaigns: any[]) => {
    try {
      const { data: allCreators, error } = await supabase.from('createur').select('*').eq('role', 'creator');
      if (error || !allCreators) return [];
      const campaignNiches = userCampaigns.map(c => c.niche).filter(Boolean).flat();
      const scoredCreators = allCreators.map(creator => {
        let score = 0; const reasons: string[] = [];
        if (campaignNiches.length > 0 && creator.niche) {
          const creatorNiches = Array.isArray(creator.niche) ? creator.niche : [];
          if (creatorNiches.some(cn => campaignNiches.some(cn2 => cn.toLowerCase().includes(cn2.toLowerCase()) || cn2.toLowerCase().includes(cn.toLowerCase())))) {
            score += 40; reasons.push("Niche correspondante");
          }
        }
        const totalFollowers = (creator.instagram_followers || 0) + (creator.youtube_followers || 0) + (creator.tiktok_followers || 0);
        if (totalFollowers > 100000) { score += 30; reasons.push("Grande audience"); }
        else if (totalFollowers > 50000) score += 25;
        else if (totalFollowers > 10000) score += 20;
        else if (totalFollowers > 1000) score += 10;
        const avgBudget = userCampaigns.length > 0 ? userCampaigns.reduce((s, c) => s + (parseFloat(c.budget) || 0), 0) / userCampaigns.length : 0;
        if (avgBudget > 0) {
          const ec = totalFollowers * 10;
          if (ec <= avgBudget * 1.2) { score += 20; reasons.push("Budget adapté"); }
          else if (ec <= avgBudget * 1.5) score += 10;
        }
        let ps = 0;
        if (creator.avatar_url) ps += 3; if (creator.full_name) ps += 2; if (creator.phone) ps += 2;
        if (creator.instagram_username || creator.youtube_username || creator.tiktok_username) ps += 3;
        score += ps; if (ps >= 8) reasons.push("Profil complet");
        if (userCampaigns.some(c => c.assigned_creator_id === creator.id_w)) { score += 15; reasons.push("Déjà collaboré"); }
        return { ...creator, matchScore: score, matchReasons: reasons, totalFollowers, primaryPlatform: getPrimaryPlatform(creator) };
      });
      return scoredCreators.filter(c => c.matchScore > 0).sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
    } catch { return []; }
  };

  const loadCreatorDetails = async (creatorId: string) => {
    setLoadingCreatorDetails(true);
    try {
      const { data } = await supabase.from('createur').select('*').eq('id_w', creatorId).single();
      setCreatorDetails(data);
    } catch { } finally { setLoadingCreatorDetails(false); }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) { router.push('/auth/login'); return; }
      const adminViewingId = searchParams.get('viewing');
      const brandIdToLoad = adminViewingId || session.user.id;
      setIsAdminViewing(!!adminViewingId);
      const { data: brandData } = await supabase.from('marque').select('*').eq('id_w', brandIdToLoad).single();
      if (brandData) setBrandInfo(brandData);
      const { data: campaignsData, error: campaignsError } = await supabase.from('campaigns').select('*').eq('id_w', brandIdToLoad).order('created_at', { ascending: false });
      if (campaignsError) {
        setCampaigns([]); setStats({ totalBudget: 0, completedCampaigns: 0, ongoingCampaigns: 0, totalCampaigns: 0 });
      } else {
        setCampaigns(campaignsData || []);
        if (campaignsData?.length) {
          const today = new Date(); let totalBudget = 0, completedCampaigns = 0, ongoingCampaigns = 0;
          campaignsData.forEach(c => {
            totalBudget += parseFloat(c.budget) || 0;
            if (c.start_date && c.end_date) {
              const s = new Date(c.start_date), e = new Date(c.end_date);
              if (e < today) completedCampaigns++; else if (s <= today && e >= today) ongoingCampaigns++;
            }
          });
          setStats({ totalBudget, completedCampaigns, ongoingCampaigns, totalCampaigns: campaignsData.length });
        }
        setCreators(await getSuggestedCreators(campaignsData || []));
      }
    } catch (e: any) { console.error("❌", e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAssignCampaign = async (campaignId: string) => {
    if (!selectedCreator?.id_w) { alert("❌ Erreur : Impossible d'identifier le créateur."); return; }
    setIsAssigning(true);
    try {
      const { error } = await supabase.from('campaigns').update({ assigned_creator_id: selectedCreator.id_w, creator_status: 'pending', status: 'assigned' }).eq('id_t_campagne', campaignId);
      if (error) throw error;
      alert(`✅ Campagne attribuée à ${selectedCreator?.full_name} !`);
      setSelectedCreator(null); setCreatorDetails(null); setShowCampaignSelection(false);
      await fetchData();
    } catch (e: any) { alert("❌ " + e.message); } finally { setIsAssigning(false); }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Supprimer cette campagne ?')) return;
    try {
      const { error } = await supabase.from('campaigns').delete().eq('id_t_campagne', campaignId);
      if (error) throw error;
      alert('✅ Supprimée !'); fetchData();
    } catch (e: any) { alert("❌ " + e.message); }
  };

  const handleBackToAdmin = () => {
    localStorage.removeItem('admin_mode'); localStorage.removeItem('admin_viewing_brand');
    router.push('/admin/dashboard');
  };

  const formatNumber = (n: number) => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : n >= 1000 ? (n/1000).toFixed(1)+'K' : n.toString();
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';

  // ✅ Plus de sidebar ici — gérée par layout.tsx
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* MODAL CRÉATEUR */}
        {selectedCreator && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl border border-gray-100 my-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-[#111827]">
                  {showCampaignSelection ? 'Sélectionner une campagne' : 'Profil du créateur'}
                </h3>
                <button onClick={() => { setSelectedCreator(null); setCreatorDetails(null); setShowCampaignSelection(false); }}
                  className="p-2 text-gray-400 hover:text-[#111827] hover:bg-gray-100 rounded-xl transition-colors">
                  <CloseIcon size={24} />
                </button>
              </div>

              {!showCampaignSelection ? (
                loadingCreatorDetails ? (
                  <div className="text-center py-16">
                    <Loader2 className="inline-block w-10 h-10 text-[#D4A017] animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Chargement du profil...</p>
                  </div>
                ) : creatorDetails ? (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center p-8 bg-gradient-to-br from-[#D4A017]/5 to-[#FFD700]/5 rounded-2xl border border-[#D4A017]/10">
                      <div className="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-xl overflow-hidden mb-6">
                        {creatorDetails.avatar_url ? (
                          <img src={creatorDetails.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#D4A017] to-[#FFD700] text-white font-bold text-5xl">
                            {creatorDetails.full_name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <h4 className="text-3xl font-bold text-[#111827] mb-4 text-center">{creatorDetails.full_name || 'Créateur'}</h4>
                      {creatorDetails.niche?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6 justify-center">
                          {creatorDetails.niche.map((n: string, i: number) => (
                            <span key={i} className="px-4 py-2 bg-[#D4A017]/10 text-[#D4A017] rounded-full text-sm font-bold border border-[#D4A017]/20">{n}</span>
                          ))}
                        </div>
                      )}
                      <div className="grid md:grid-cols-3 gap-4 w-full">
                        {creatorDetails.instagram_followers > 0 && (
                          <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl border border-pink-100">
                            <Instagram size={20} className="text-pink-600 shrink-0" />
                            <div><p className="text-xs text-pink-600 font-bold">Instagram</p><p className="text-sm font-bold">{formatNumber(creatorDetails.instagram_followers)} followers</p></div>
                          </div>
                        )}
                        {creatorDetails.youtube_followers > 0 && (
                          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                            <Youtube size={20} className="text-red-600 shrink-0" />
                            <div><p className="text-xs text-red-600 font-bold">YouTube</p><p className="text-sm font-bold">{formatNumber(creatorDetails.youtube_followers)} abonnés</p></div>
                          </div>
                        )}
                        {creatorDetails.tiktok_followers > 0 && (
                          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <Music2 size={20} className="text-gray-700 shrink-0" />
                            <div><p className="text-xs text-gray-700 font-bold">TikTok</p><p className="text-sm font-bold">{formatNumber(creatorDetails.tiktok_followers)} followers</p></div>
                          </div>
                        )}
                      </div>
                      {selectedCreator.matchReasons?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-6 justify-center">
                          {selectedCreator.matchReasons.map((r: string, i: number) => (
                            <span key={i} className="text-sm bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200 font-medium flex items-center gap-2"><Check size={14} />{r}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Réseaux sociaux */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {creatorDetails.instagram_username && (
                        <div className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl border border-pink-200">
                          <Instagram size={22} className="text-pink-600 shrink-0" />
                          <div className="min-w-0"><p className="text-[11px] text-pink-600 font-black uppercase">Instagram</p><p className="text-sm font-bold truncate">@{creatorDetails.instagram_username}</p></div>
                        </div>
                      )}
                      {creatorDetails.youtube_username && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                          <Youtube size={22} className="text-red-600 shrink-0" />
                          <div className="min-w-0"><p className="text-[11px] text-red-600 font-black uppercase">YouTube</p><p className="text-sm font-bold truncate">@{creatorDetails.youtube_username}</p></div>
                        </div>
                      )}
                      {creatorDetails.tiktok_username && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <Music2 size={22} className="text-gray-700 shrink-0" />
                          <div className="min-w-0"><p className="text-[11px] text-gray-700 font-black uppercase">TikTok</p><p className="text-sm font-bold truncate">@{creatorDetails.tiktok_username}</p></div>
                        </div>
                      )}
                      {creatorDetails.twitter_username && (
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <XLogo size={22} />
                          <div className="min-w-0"><p className="text-[11px] text-blue-700 font-black uppercase">X</p><p className="text-sm font-bold truncate">@{creatorDetails.twitter_username}</p></div>
                        </div>
                      )}
                      {creatorDetails.snapchat_username && (
                        <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                          <Camera size={22} className="text-yellow-600 shrink-0" />
                          <div className="min-w-0"><p className="text-[11px] text-yellow-600 font-black uppercase">Snapchat</p><p className="text-sm font-bold truncate">@{creatorDetails.snapchat_username}</p></div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-gray-100">
                      <button onClick={() => { setSelectedCreator(null); setCreatorDetails(null); }}
                        className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all">
                        Annuler
                      </button>
                      <button onClick={() => setShowCampaignSelection(true)}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-[#D4A017] to-[#FFD700] text-white rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2">
                        Attribuer une campagne <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12"><p className="text-gray-500 font-medium">Impossible de charger les détails</p></div>
                )
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-6">Sélectionnez la campagne à attribuer à <strong className="text-[#D4A017]">{creatorDetails?.full_name}</strong></p>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {campaigns.filter(c => !c.assigned_creator_id).length > 0 ? (
                      campaigns.filter(c => !c.assigned_creator_id).map((camp) => (
                        <motion.button key={camp.id_t_campagne} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                          disabled={isAssigning} onClick={() => handleAssignCampaign(camp.id_t_campagne)}
                          className="w-full text-left p-5 rounded-2xl border-2 border-gray-200 hover:border-[#D4A017] hover:bg-[#D4A017]/5 transition-all flex justify-between items-center group disabled:opacity-50">
                          <div>
                            <span className="block font-bold text-[#111827] mb-2 group-hover:text-[#D4A017]">{camp.title || 'Sans titre'}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-600">Budget: <span className="font-bold text-[#D4A017]">{parseFloat(camp.budget||0).toLocaleString()} CFA</span></span>
                              <span className={`text-[10px] px-2 py-1 rounded-full font-bold border ${getStatusDisplay(camp).color}`}>{getStatusDisplay(camp).text}</span>
                            </div>
                          </div>
                          <ArrowRight size={22} className="text-[#D4A017] group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                      ))
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                        <p className="text-gray-500 font-medium">Aucune campagne disponible</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
                    <button onClick={() => setShowCampaignSelection(false)}
                      className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                      <ArrowLeft size={18} /> Retour
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* EN-TÊTE */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#111827]">
              Dashboard {brandInfo?.nom_marque ? `- ${brandInfo.nom_marque}` : 'marque'}
            </h1>
            <p className="text-gray-400 text-sm font-medium mt-1">
              {brandInfo?.email_marque ? `${brandInfo.email_marque} • ` : ''}Contrôlez vos collaborations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} disabled={loading}
              className="flex items-center gap-2 text-gray-400 hover:text-[#D4A017] text-sm font-bold px-4 py-2 border border-gray-100 rounded-xl hover:border-[#D4A017]/30 transition-all disabled:opacity-50">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualiser
            </button>
            <Link href="/brands/campaign-choice">
              <button className="bg-[#D4A017] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#B88A14] transition-all shadow-lg">
                <Zap size={18} fill="currentColor" /> Créer une campagne
              </button>
            </Link>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 text-sm text-gray-600">
          <StatCard title="Budget Total" value={`${stats.totalBudget.toLocaleString('fr-FR')} CFA`} icon={<TrendingUp size={24} />} loading={loading} subtitle={`${stats.totalCampaigns} campagne${stats.totalCampaigns > 1 ? 's' : ''}`} />
          <StatCard title="Campagnes terminées" value={stats.completedCampaigns.toString()} icon={<Check size={24} />} loading={loading} subtitle="Basé sur les dates de fin" />
          <StatCard title="Campagnes en cours" value={stats.ongoingCampaigns.toString()} icon={<Zap size={24} />} loading={loading} subtitle="Actives aujourd'hui" />
        </div>

        {/* GRILLE PRINCIPALE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* CAMPAGNES */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[#111827] font-bold text-lg">Vos campagnes ({campaigns.length})</h2>
              <div className="text-sm text-gray-400 font-medium flex items-center gap-2">
                <Clock size={12} />
                {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12"><Loader2 className="inline-block w-8 h-8 text-[#D4A017] animate-spin" /></div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-[24px] bg-white">
                <Zap size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-600 font-bold text-lg mb-2">Aucune campagne créée</p>
                <Link href="/brands/auth/campagne">
                  <button className="bg-[#D4A017] text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2 hover:bg-[#B88A14] transition-all">
                    <Zap size={18} fill="currentColor" /> Créer une campagne
                  </button>
                </Link>
              </div>
            ) : (
              campaigns.map((camp) => {
                const statusDisplay = getStatusDisplay(camp);
                const endDate = camp.end_date ? new Date(camp.end_date) : null;
                const daysLeft = endDate ? Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;
                return (
                  <div key={camp.id_t_campagne} className="bg-white p-6 rounded-[24px] border border-gray-100 flex flex-col md:flex-row md:items-center justify-between shadow-sm hover:shadow-md transition-shadow gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#D4A017]/10 rounded-full flex items-center justify-center text-[#D4A017] font-bold uppercase shrink-0">
                        {camp.title?.charAt(0) || 'C'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-[#111827]">{camp.title || 'Sans titre'}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <p className="text-xs text-gray-400">
                            <span className="font-bold">{parseFloat(camp.budget||0).toLocaleString('fr-FR')} CFA</span>
                            <span className="mx-2">•</span>
                            {formatDate(camp.start_date)} → {formatDate(camp.end_date)}
                          </p>
                          {daysLeft !== null && daysLeft > 0 && (
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold">{daysLeft} jour{daysLeft>1?'s':''}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[10px] px-2 py-1 rounded-full font-bold border ${statusDisplay.color}`}>{statusDisplay.text}</span>
                          {camp.assigned_creator_id && <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded-full font-bold border border-purple-100">Attribuée</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link href={`/brands/auth/edit/${camp.id_t_campagne}`} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Pencil size={18} /></Link>
                      <button onClick={() => handleDeleteCampaign(camp.id_t_campagne)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                      <Link href={`/brands/dashboard/details/${camp.id_t_campagne}`}
                        className="ml-2 text-[10px] font-black text-[#111827] bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 hover:bg-[#D4A017] hover:text-white hover:border-[#D4A017] transition-all uppercase tracking-widest">
                        Détails
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* MATCHS SUGGÉRÉS */}
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm h-fit sticky top-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#111827]">Matchs suggérés</h2>
              <p className="text-[10px] text-[#D4A017] font-black flex items-center gap-1 uppercase tracking-widest mt-1">
                <Sparkles size={12} /> IA Woutty
              </p>
            </div>
            {creators.length > 0 ? (
              <>
                <div className="space-y-6 mb-8">
                  {creators.map((creator) => {
                    const mp = Math.min(95, Math.round(creator.matchScore));
                    return (
                      <div key={creator.id_w} onClick={() => { setSelectedCreator(creator); setShowCampaignSelection(false); loadCreatorDetails(creator.id_w); }}
                        className="flex items-center justify-between group cursor-pointer hover:bg-[#D4A017]/5 p-3 -m-3 rounded-2xl transition-all border border-transparent hover:border-[#D4A017]/10">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0 overflow-hidden">
                            {creator.avatar_url ? <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">{creator.full_name?.charAt(0)||'?'}</div>}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm text-[#111827] truncate">{creator.full_name||'Créateur'}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">{creator.primaryPlatform} • {formatNumber(creator.totalFollowers)}</p>
                            {creator.matchReasons?.slice(0,2).map((r: string, i: number) => (
                              <span key={i} className="text-[8px] bg-[#D4A017]/10 text-[#D4A017] px-1.5 py-0.5 rounded-md font-bold mr-1">{r}</span>
                            ))}
                          </div>
                        </div>
                        <div className={`text-[9px] font-black px-2 py-1 rounded-md border ${mp>=80?'bg-green-50 text-green-600 border-green-100':mp>=60?'bg-yellow-50 text-yellow-600 border-yellow-100':'bg-orange-50 text-orange-600 border-orange-100'}`}>{mp}%</div>
                      </div>
                    );
                  })}
                </div>
                <Link href="/creators/public">
                  <button className="w-full py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#111827] hover:text-white transition-all uppercase tracking-widest">
                    Voir plus <ArrowRight size={14} />
                  </button>
                </Link>
              </>
            ) : (
              <div className="text-center py-8">
                <Users size={32} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">{campaigns.length===0?"Créez une campagne pour voir les suggestions":"Aucun créateur disponible"}</p>
              </div>
            )}
          </div>
        </div>

        {/* BOUTON CHAT */}
        <button onClick={() => window.open('https://boostertalent.app.n8n.cloud/webhook/b4d75f16-f24e-4ca0-97a6-49502970c201/chat','ChatWoutty','width=400,height=700,menubar=no,toolbar=no')}
          className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-r from-[#ceaf4a] to-[#b8962f] text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group">
          <MessageCircle size={28} className="group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">!</span>
        </button>

        {/* BANNIÈRE ADMIN */}
        {isAdminViewing && (
          <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 p-2 pl-4 bg-white/80 backdrop-blur-md border border-orange-100 rounded-full shadow-lg">
            <button onClick={handleBackToAdmin}
              className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 hover:bg-black text-white rounded-full text-xs font-black transition-all">
              retour au dashboard admin
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
