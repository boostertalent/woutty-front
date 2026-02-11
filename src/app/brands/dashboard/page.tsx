"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter,useSearchParams  } from 'next/navigation';
import { ArrowLeft } from 'lucide-react'; 
import { motion } from 'framer-motion';
import { 
  Users, Zap, LogOut, ArrowRight, Sparkles,
  Pencil, Trash2, LayoutDashboard, Settings, X as CloseIcon, Check,
  RefreshCw, Clock, TrendingUp, UserCheck, Instagram, Youtube, 
  Music2, Camera, Mail, Phone, Loader2, Shield  
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
  const [stats, setStats] = useState({ 
    totalBudget: 0, 
    completedCampaigns: 0, 
    ongoingCampaigns: 0,
    totalCampaigns: 0
  });
  const [brandInfo, setBrandInfo] = useState<any>(null);
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null);
  const [creatorDetails, setCreatorDetails] = useState<any | null>(null);
  const [loadingCreatorDetails, setLoadingCreatorDetails] = useState(false);
  const [showCampaignSelection, setShowCampaignSelection] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const determineStatusByDates = (startDateStr: string, endDateStr: string) => {
    if (!startDateStr || !endDateStr) return 'pending';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(startDateStr);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);
    
    if (endDate.getTime() < today.getTime()) {
      return 'completed';
    } else if (startDate.getTime() <= today.getTime() && endDate.getTime() >= today.getTime()) {
      return 'active';
    } else if (startDate.getTime() > today.getTime()) {
      return 'planned';
    }
    return 'pending';
  };

  const getStatusDisplay = (campaign: any) => {
    const realStatus = determineStatusByDates(campaign.start_date, campaign.end_date);
    
    switch (realStatus) {
      case 'completed':
        return { text: 'Terminée', color: 'bg-green-50 text-green-600 border-green-100' };
      case 'active':
        return { text: 'En cours', color: 'bg-blue-50 text-blue-600 border-blue-100' };
      case 'planned':
        return { text: 'Planifiée', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' };
      default:
        return { text: 'En attente', color: 'bg-gray-50 text-gray-600 border-gray-100' };
    }
  };

  // ✅ ALGORITHME DE SUGGESTION INTELLIGENT
  const getSuggestedCreators = async (userCampaigns: any[]) => {
    try {
      const { data: allCreators, error } = await supabase
        .from('createur')
        .select('*')
        .eq('role', 'creator');

      if (error || !allCreators) {
        console.error("❌ Erreur créateurs:", error);
        return [];
      }

      // Extraire les niches des campagnes
      const campaignNiches = userCampaigns
        .map(c => c.niche)
        .filter(Boolean)
        .flat();

      console.log("📊 Niches des campagnes:", campaignNiches);

      // Calculer le score pour chaque créateur
      const scoredCreators = allCreators.map(creator => {
        let score = 0;
        const reasons: string[] = [];

        // CRITÈRE 1: Correspondance de niche (40 points)
        if (campaignNiches.length > 0 && creator.niche) {
          const creatorNiches = Array.isArray(creator.niche) ? creator.niche : [];
          const nicheMatch = creatorNiches.some(cn => 
            campaignNiches.some(campNiche => 
              cn.toLowerCase().includes(campNiche.toLowerCase()) ||
              campNiche.toLowerCase().includes(cn.toLowerCase())
            )
          );
          
          if (nicheMatch) {
            score += 40;
            reasons.push("Niche correspondante");
          }
        }

        // CRITÈRE 2: Followers (30 points)
        const totalFollowers = 
          (creator.instagram_followers || 0) + 
          (creator.youtube_followers || 0) + 
          (creator.tiktok_followers || 0);

        if (totalFollowers > 100000) {
          score += 30;
          reasons.push("Grande audience");
        } else if (totalFollowers > 50000) {
          score += 25;
        } else if (totalFollowers > 10000) {
          score += 20;
        } else if (totalFollowers > 1000) {
          score += 10;
        }

        // CRITÈRE 3: Budget adapté (20 points)
        const avgBudget = userCampaigns.length > 0 
          ? userCampaigns.reduce((sum, c) => sum + (parseFloat(c.budget) || 0), 0) / userCampaigns.length
          : 0;

        if (avgBudget > 0) {
          const estimatedCost = totalFollowers * 10;
          if (estimatedCost <= avgBudget * 1.2) {
            score += 20;
            reasons.push("Budget adapté");
          } else if (estimatedCost <= avgBudget * 1.5) {
            score += 10;
          }
        }

        // CRITÈRE 4: Profil complet (10 points)
        let profileScore = 0;
        if (creator.avatar_url) profileScore += 3;
        if (creator.full_name) profileScore += 2;
        if (creator.phone) profileScore += 2;
        if (creator.instagram_username || creator.youtube_username || creator.tiktok_username) profileScore += 3;
        
        score += profileScore;
        if (profileScore >= 8) reasons.push("Profil complet");

        // CRITÈRE 5: Déjà collaboré (Bonus 15 points)
        const hasWorkedWith = userCampaigns.some(c => c.assigned_creator_id === creator.id_w);
        if (hasWorkedWith) {
          score += 15;
          reasons.push("Déjà collaboré");
        }

        return {
          ...creator,
          matchScore: score,
          matchReasons: reasons,
          totalFollowers,
          primaryPlatform: getPrimaryPlatform(creator)
        };
      });

      // Trier et retourner top 5
      const topCreators = scoredCreators
        .filter(c => c.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5);

      console.log("✅ Top 5 créateurs suggérés:", topCreators.map(c => ({
        name: c.full_name,
        score: c.matchScore,
        reasons: c.matchReasons
      })));

      return topCreators;

    } catch (err) {
      console.error("❌ Erreur suggestion:", err);
      return [];
    }
  };

  const getPrimaryPlatform = (creator: any) => {
    const platforms = [
      { name: 'Instagram', followers: creator.instagram_followers || 0 },
      { name: 'YouTube', followers: creator.youtube_followers || 0 },
      { name: 'TikTok', followers: creator.tiktok_followers || 0 },
      { name: 'x', followers: creator.x_followers || 0 },
      { name: 'snap', followers: creator.snap_followers || 0 }
    ];
    return platforms.sort((a, b) => b.followers - a.followers)[0]?.name || 'Plateforme';
  };

  // ✅ CHARGER LES DÉTAILS COMPLETS DU CRÉATEUR
  const loadCreatorDetails = async (creatorId: string) => {
    setLoadingCreatorDetails(true);
    try {
      const { data, error } = await supabase
        .from('createur')
        .select('*')
        .eq('id_w', creatorId)
        .single();

      if (error) {
        console.error("❌ Erreur détails créateur:", error);
        return null;
      }

      console.log("✅ Détails créateur chargés:", data);
      setCreatorDetails(data);
      return data;
    } catch (err) {
      console.error("❌ Erreur:", err);
      return null;
    } finally {
      setLoadingCreatorDetails(false);
    }
  };

  // ✅ OUVRIR LE MODAL AVEC DÉTAILS
  const handleCreatorClick = async (creator: any) => {
    setSelectedCreator(creator);
    setShowCampaignSelection(false);
    await loadCreatorDetails(creator.id_w);
  };

  // ✅ PASSER À LA SÉLECTION DE CAMPAGNE
  const proceedToCampaignSelection = () => {
    setShowCampaignSelection(true);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push('/auth/login');
        return;
      }
      


const USER_ID = session.user.id;

const adminViewingId = searchParams.get('viewing');
let brandIdToLoad = USER_ID;
let adminViewMode = false;

if (adminViewingId) {
  brandIdToLoad = adminViewingId;
  adminViewMode = true;
}

setIsAdminViewing(adminViewMode);

const { data: brandData } = await supabase
  .from('marque')
  .select('*')
  .eq('id_w', brandIdToLoad) 
  .single();

      
      if (brandData) {
        setBrandInfo(brandData);
      }
      
      // Récupérer les campagnes 
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id_w',  brandIdToLoad)
        .order('created_at', { ascending: false });
      
      if (campaignsError) {
        setCampaigns([]);
        setStats({ totalBudget: 0, completedCampaigns: 0, ongoingCampaigns: 0, totalCampaigns: 0 });
      } else {
        setCampaigns(campaignsData || []);
        
        // Calculer les stats
        if (campaignsData && campaignsData.length > 0) {
          const today = new Date();
          let totalBudget = 0;
          let completedCampaigns = 0;
          let ongoingCampaigns = 0;

          campaignsData.forEach(campaign => {
            const budget = parseFloat(campaign.budget) || 0;
            totalBudget += budget;

            if (campaign.start_date && campaign.end_date) {
              const start = new Date(campaign.start_date);
              const end = new Date(campaign.end_date);

              if (end < today) {
                completedCampaigns++;
              } else if (start <= today && end >= today) {
                ongoingCampaigns++;
              }
            }
          });

          setStats({ 
            totalBudget, 
            completedCampaigns, 
            ongoingCampaigns,
            totalCampaigns: campaignsData.length
          });
        }
         


        // ✅ SUGGESTIONS INTELLIGENTES
        const suggestedCreators = await getSuggestedCreators(campaignsData || []);
        setCreators(suggestedCreators);
      }
      
    } catch (error: any) {
      console.error("❌ Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const handleAssignCampaign = async (campaignId: string) => {
    const creatorId = selectedCreator?.id_w;

    if (!creatorId) {
      alert("Erreur : Impossible d'identifier le créateur.");
      return;
    }

    setIsAssigning(true);
    
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          assigned_creator_id: creatorId,
          status: 'assigned'
        })
        .eq('id_t_campagne', campaignId);

      if (error) throw error;
      
      alert("✅ Campagne attribuée !");
      setSelectedCreator(null);
      setCreatorDetails(null);
      setShowCampaignSelection(false);
      fetchData();
      
    } catch (error: any) {
      alert("Erreur : " + error.message);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => { 
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) return;
    
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id_t_campagne', campaignId);

      if (error) throw error;
      
      alert('✅ Campagne supprimée !');
      fetchData();
    } catch (error: any) {
      alert("❌ Erreur : " + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };
const handleBackToAdmin = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_mode');
    localStorage.removeItem('admin_viewing_brand');
  }
  router.push('/admin/dashboard');
};
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/brands/dashboard', active: true },
    { name: 'Campagnes', icon: <Zap size={20} />, href: '/brands/auth/campagne' },
    { name: 'Collaborations', icon: <UserCheck size={20} />, href: '/brands/dashboard/collaborations' },
    { name: 'Mon profil', icon: <Settings size={20} />, href: '/brands/dashboard/profile' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      
      {/* MODAL DÉTAILLÉ DU CRÉATEUR */}
      {selectedCreator && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111827]/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] w-full max-w-3xl p-8 shadow-2xl border border-gray-100 my-8">
            
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-[#111827]">
                {showCampaignSelection ? 'Sélectionner une campagne' : 'Profil du créateur'}
              </h3>
              <button 
                onClick={() => {
                  setSelectedCreator(null);
                  setCreatorDetails(null);
                  setShowCampaignSelection(false);
                }} 
                className="p-2 text-gray-400 hover:text-[#111827] transition-colors"
              >
                <CloseIcon size={24} />
              </button>
            </div>

            {!showCampaignSelection ? (
              /* PROFIL DÉTAILLÉ */
              loadingCreatorDetails ? (
                <div className="text-center py-12">
                  <Loader2 className="inline-block w-8 h-8 text-[#D4A017] animate-spin mb-4" />
                  <p className="text-gray-400">Chargement des détails...</p>
                </div>
              ) : creatorDetails ? (
                <div className="space-y-6">
                  {/* AVATAR ET INFO */}
                  <div className="flex items-start gap-6 p-6 bg-gradient-to-br from-[#D4A017]/5 to-[#FFD700]/5 rounded-2xl border border-[#D4A017]/10">
                    <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white shadow-lg overflow-hidden shrink-0">
                      {creatorDetails.avatar_url ? (
                        <img src={creatorDetails.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#D4A017]/10 text-[#D4A017] font-bold text-3xl">
                          {creatorDetails.full_name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-[#111827] mb-2">{creatorDetails.full_name || 'Créateur'}</h4>
                      {creatorDetails.niche && creatorDetails.niche.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {creatorDetails.niche.map((n: string, i: number) => (
                            <span key={i} className="px-3 py-1 bg-[#D4A017]/10 text-[#D4A017] rounded-full text-xs font-bold">
                              {n}
                            </span>
                          ))}
                        </div>
                      )}
                      {creatorDetails.age && (
                        <p className="text-sm text-gray-500">{creatorDetails.age} ans</p>
                      )}
                      {selectedCreator.matchReasons && selectedCreator.matchReasons.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-xs text-gray-500">Raisons du match:</span>
                          {selectedCreator.matchReasons.map((reason: string, i: number) => (
                            <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200 font-medium">
                              ✓ {reason}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* COORDONNÉES */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {creatorDetails.email && (
                      <div className="flex items-center gap-3 p-4all text-gray-700">
                        <Mail size={20} className="text-[#D4A017]" />
                        <div>
                          <p className="text-xs text-gray-400 font-bold">Email</p>
                          <p className="text-sm font-medium">{creatorDetails.email}</p>
                        </div>
                      </div>
                    )}
                    {creatorDetails.phone && (
                      <div className="flex items-center gap-3 p-all text-gray-700">
                        <Phone size={20} className="text-[#D4A017]" />
                        <div>
                          <p className="text-xs text-gray-400 font-bold">Téléphone</p>
                          <p className="text-sm font-medium">{creatorDetails.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RÉSEAUX SOCIAUX */}
                  <div>
                    <h5 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                      <Sparkles size={16} className="text-[#D4A017]" />
                      Réseaux sociaux
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {creatorDetails.instagram_username && (
                        <div className="flex items-center gap-2 p-3all  text-gray-700">
                          <Instagram size={18} className="text-pink-600" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-pink-600 font-bold">Instagram</p>
                            <p className="text-xs font-medium truncate">@{creatorDetails.instagram_username}</p>
                          </div>
                        </div>
                      )}
                      {creatorDetails.youtube_username && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 borderall text-gray-700">
                          <Youtube size={18} className="text-red-600" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-red-600 font-bold">YouTube</p>
                            <p className="text-xs font-medium truncate">@{creatorDetails.youtube_username}</p>
                          </div>
                        </div>
                      )}
                      {creatorDetails.tiktok_username && (
                        <div className="flex items-center gap-2 p-3 bg-gray-50 all text-gray-700">
                          <Music2 size={18} className="text-gray-700" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-gray-700 font-bold">TikTok</p>
                            <p className="text-xs font-medium truncate">@{creatorDetails.tiktok_username}</p>
                          </div>
                        </div>
                      )}
                      {creatorDetails.twitter_username && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 borderall text-gray-700">
                          <XLogo size={18} />
                          <div className="min-w-0">
                            <p className="text-[10px] text-blue-700 font-bold">X</p>
                            <p className="text-xs font-medium truncate">@{creatorDetails.twitter_username}</p>
                          </div>
                        </div>
                      )}
                      {creatorDetails.snapchat_username && (
                        <div className="flex items-center gap-2 p-3 bg-yellow-50 border text-gray-700">
                          <Camera size={18} className="text-yellow-600" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-yellow-600 font-bold">Snapchat</p>
                            <p className="text-xs font-medium truncate">@{creatorDetails.snapchat_username}</p>
                          </div>
                        </div>
                      )}
                      {creatorDetails.facebook_username && (
                        <div className="flex items-center gap-2 p-3 bg-blue-50 border text-gray-700">
                          <Users size={18} className="text-blue-600" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-blue-600 font-bold">Facebook</p>
                            <p className="text-xs font-medium truncate">@{creatorDetails.facebook_username}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* BOUTONS */}
                  <div className="flex gap-3 pt-6 border-t">
                    <button
                      onClick={() => {
                        setSelectedCreator(null);
                        setCreatorDetails(null);
                      }}
                      className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={proceedToCampaignSelection}
                      className="flex-1 py-3 bg-[#D4A017] text-white rounded-xl font-bold hover:bg-[#B88A14] transition-all flex items-center justify-center gap-2"
                    >
                      Attribuer une campagne
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400">Impossible de charger les détails</p>
                </div>
              )
            ) : (
              /* SÉLECTION DE CAMPAGNE */
              <div>
                <p className="text-sm text-gray-500 mb-6">
                  Sélectionnez la campagne à attribuer à <strong>{creatorDetails?.full_name}</strong>
                </p>
                
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {campaigns.filter(c => !c.assigned_creator_id).length > 0 ? (
                    campaigns.filter(c => !c.assigned_creator_id).map((camp) => {
                      const statusDisplay = getStatusDisplay(camp);
                      return (
                        <button
                          key={camp.id_t_campagne}
                          disabled={isAssigning}
                          onClick={() => handleAssignCampaign(camp.id_t_campagne)}
                          className="w-full text-left p-5 rounded-2xl border border-gray-200 hover:border-[#D4A017] hover:bg-[#D4A017]/5 transition-all flex justify-between items-center group disabled:opacity-50"
                        >
                          <div className="min-w-0">
                            <span className="block font-bold text-[#111827] mb-1 group-hover:text-[#D4A017]">
                              {camp.title || 'Sans titre'}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                Budget: {parseFloat(camp.budget || 0).toLocaleString()} CFA
                              </span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${statusDisplay.color}`}>
                                {statusDisplay.text}
                              </span>
                            </div>
                          </div>
                          <ArrowRight size={20} className="text-[#D4A017]" />
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                      <p className="text-gray-400">Aucune campagne disponible</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <button
                    onClick={() => setShowCampaignSelection(false)}
                    className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                  >
                    ← Retour
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <h2 className="text-2xl font-black tracking-tighter text-[#111827]">
            {brandInfo?.nom_marque || 'WOUTTY'}<span className="text-[#D4A017]">.</span>
          </h2>
          {brandInfo?.domaine && (
            <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-wider">
              {brandInfo.domaine}
            </p>
          )}
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                item.active 
                  ? 'bg-[#D4A017]/10 text-[#D4A017]' 
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
              }`}>
                {item.icon}
                {item.name}
              </div>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-50">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-500 font-bold text-sm transition-all"
          >
            <LogOut size={20} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          
          {/* HEADER */}
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
              <button 
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 text-gray-400 hover:text-[#D4A017] text-sm font-bold px-4 py-2 border border-gray-100 rounded-xl hover:border-[#D4A017]/30 transition-all disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> 
                Actualiser
              </button>
              <Link href="/brands/auth/campagne">
                <button className="bg-[#D4A017] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#B88A14] transition-all shadow-lg">
                  <Zap size={18} fill="currentColor" /> Créer une campagne
                </button>
              </Link>
            </div>
          </div>

          {/* STATISTIQUES */}
          <div className="text-sm text-gray-600 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <StatCard 
              title="Budget Total" 
              value={`${stats.totalBudget.toLocaleString('fr-FR')} CFA`} 
              icon={<TrendingUp size={24} />}
              loading={loading}
              subtitle={`${stats.totalCampaigns} campagne${stats.totalCampaigns > 1 ? 's' : ''}`}
            />
            <StatCard 
              title="Campagnes terminées" 
              value={stats.completedCampaigns.toString()} 
              icon={<Check size={24} />} 
              loading={loading}
              subtitle="Basé sur les dates de fin"
            />
            <StatCard 
              title="Campagnes en cours" 
              value={stats.ongoingCampaigns.toString()} 
              icon={<Zap size={24} />} 
              loading={loading}
              subtitle="Actives aujourd'hui"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LISTE DES CAMPAGNES */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[#111827] font-bold text-lg">
                  Vos campagnes ({campaigns.length})
                </h2>
                <div className="text-sm text-gray-400 font-medium flex items-center gap-2">
                  <Clock size={12} />
                  {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="inline-block w-8 h-8 text-[#D4A017] animate-spin mb-4" />
                  <p className="text-gray-400 font-medium">Chargement...</p>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-[24px] bg-white">
                  <Zap size={48} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-600 font-bold text-lg mb-2">Aucune campagne créée</p>
                  <p className="text-sm text-gray-400 mb-6">Créez votre première campagne pour commencer !</p>
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
                  const today = new Date();
                  const daysLeft = endDate ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24)) : null;
                  
                  return (
                    <div 
                      key={camp.id} 
                      className="bg-white p-6 rounded-[24px] border border-gray-100 flex flex-col md:flex-row md:items-center justify-between shadow-sm hover:shadow-md transition-shadow gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#D4A017]/10 rounded-full flex items-center justify-center text-[#D4A017] font-bold uppercase shrink-0">
                          {camp.title?.charAt(0) || 'C'}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-[#111827]">{camp.title || 'Sans titre'}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <p className="text-xs text-gray-400">
                              <span className="font-bold">{parseFloat(camp.budget || 0).toLocaleString('fr-FR')} CFA</span>
                              <span className="mx-2">•</span>
                              {formatDate(camp.start_date)} → {formatDate(camp.end_date)}
                            </p>
                            {daysLeft !== null && daysLeft > 0 && (
                              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold">
                                {daysLeft} jour{daysLeft > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold border ${statusDisplay.color}`}>
                              {statusDisplay.text}
                            </span>
                            {camp.assigned_creator_id && (
                              <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded-full font-bold border border-purple-100">
                                Attribuée
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 shrink-0">
                        <Link 
                          href={`/brands/auth/edit/${camp.id_t_campagne}`} 
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Modifier"
                        >
                          <Pencil size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDeleteCampaign(camp.id_t_campagne)} 
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                        <Link 
                          href={`/brands/dashboard/details/${camp.id_t_campagne}`} 
                          className="ml-2 text-[10px] font-black text-[#111827] bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 hover:bg-[#D4A017] hover:text-white hover:border-[#D4A017] transition-all uppercase tracking-widest"
                        >
                          Détails
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* MATCHS IA INTELLIGENTS */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm h-fit sticky top-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[#111827]">Matchs suggérés</h2>
                <p className="text-[10px] text-[#D4A017] font-black flex items-center gap-1 uppercase tracking-widest mt-1">
                  <Sparkles size={12} /> IA Woutty
                </p>
                {campaigns.length > 0 && (
                  <p className="text-[9px] text-gray-400 mt-2">
                    Basé sur vos {campaigns.length} campagne{campaigns.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {creators.length > 0 ? (
                <>
                  <div className="space-y-6 mb-8">
                    {creators.map((creator, idx) => {
                      const matchPercentage = Math.min(95, Math.round(creator.matchScore));
                      
                      return (
                        <div 
                          key={creator.id_w} 
                          onClick={() => handleCreatorClick(creator)}
                          className="flex items-center justify-between group cursor-pointer hover:bg-[#D4A017]/5 p-3 -m-3 rounded-2xl transition-all border border-transparent hover:border-[#D4A017]/10"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0 border border-gray-100 overflow-hidden">
                              {creator.avatar_url ? (
                                <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                                  {creator.full_name?.charAt(0) || '?'}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-sm text-[#111827] truncate">
                                {creator.full_name || 'Créateur'}
                              </p>
                              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                                {creator.primaryPlatform} • {formatNumber(creator.totalFollowers)}
                              </p>
                              {creator.matchReasons && creator.matchReasons.length > 0 && (
                                <div className="flex gap-1 mt-1">
                                  {creator.matchReasons.slice(0, 2).map((reason: string, i: number) => (
                                    <span 
                                      key={i}
                                      className="text-[8px] bg-[#D4A017]/10 text-[#D4A017] px-1.5 py-0.5 rounded-md font-bold"
                                    >
                                      {reason}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className={`text-[9px] font-black px-2 py-1 rounded-md border ${
                              matchPercentage >= 80 
                                ? 'bg-green-50 text-green-600 border-green-100'
                                : matchPercentage >= 60
                                ? 'bg-yellow-50 text-yellow-600 border-yellow-100'
                                : 'bg-orange-50 text-orange-600 border-orange-100'
                            }`}>
                              {matchPercentage}%
                            </div>
                            <span className="text-[8px] text-[#D4A017] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                              VOIR
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Link href="/creators/public">
                    <button className="w-full py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#111827] hover:text-white transition-all group uppercase tracking-widest">
                      Voir plus
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </>
              ) : (
                <div className="text-center py-8">
                  <Users size={32} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">
                    {campaigns.length === 0 
                      ? "Créez une campagne pour voir les suggestions"
                      : "Aucun créateur disponible"
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
{isAdminViewing && (
  <motion.div 
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 p-2 pl-4 bg-white/80 backdrop-blur-md border border-orange-100 rounded-full shadow-[0_10px_30px_-10px_rgba(234,88,12,0.2)]"
  >
   

    {/* Petit Bouton de sortie */}
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
