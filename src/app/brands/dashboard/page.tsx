"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, Zap, LogOut, ArrowRight, Sparkles,
  Pencil, Trash2, LayoutDashboard, Settings, X as CloseIcon, Check,
  RefreshCw, Clock, TrendingUp, UserCheck
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { createBrowserClient } from '@supabase/ssr';

export default function BrandDashboard() {
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

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error("❌ Pas de session:", sessionError);
        router.push('/auth/login');
        return;
      }
      
      const USER_ID = session.user.id;
      console.log("👤 User ID:", USER_ID);
      
      // Récupérer la marque
      const { data: brandData, error: brandError } = await supabase
        .from('marque')
        .select('*')
        .eq('id_w', USER_ID)
        .single();
      
      if (brandError) {
        console.warn("⚠️ Marque non trouvée:", brandError.message);
      } else if (brandData) {
        console.log("✅ Marque chargée:", brandData.nom_marque);
        setBrandInfo(brandData);
      }
      
      // Récupérer les créateurs
      const { data: creatorsData, error: creatorsError } = await supabase
        .from('info_profile')
        .select('*')
        .order('nbre_followers', { ascending: false })
        .limit(4);
      
      if (creatorsError) {
        console.error("❌ Erreur créateurs:", creatorsError);
      } else {
        setCreators(creatorsData || []);
      }
      
      // Récupérer les campagnes - CORRECTION ICI
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id_w', USER_ID)
        .order('created_at', { ascending: false });
      
      if (campaignsError) {
        console.error("❌ Erreur campagnes:", campaignsError);
        setCampaigns([]);
        // Reset stats si erreur
        setStats({ 
          totalBudget: 0, 
          completedCampaigns: 0, 
          ongoingCampaigns: 0,
          totalCampaigns: 0
        });
      } else {
        console.log("✅ Campagnes chargées:", campaignsData?.length || 0);
        
        setCampaigns(campaignsData || []);
        
        // CALCULER LES STATISTIQUES - CORRECTION
        if (campaignsData && campaignsData.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          let totalBudget = 0;
          let completedCampaigns = 0;
          let ongoingCampaigns = 0;

          campaignsData.forEach(campaign => {
            // Budget - conversion en nombre
            const budgetValue = campaign.budget;
            let budget = 0;
            
            if (typeof budgetValue === 'number') {
              budget = budgetValue;
            } else if (typeof budgetValue === 'string') {
              budget = parseFloat(budgetValue) || 0;
            }
            
            totalBudget += budget;
            console.log(`💰 "${campaign.title}": ${budget} CFA`);

            // Vérifier les dates
            if (campaign.start_date && campaign.end_date) {
              const start = new Date(campaign.start_date);
              start.setHours(0, 0, 0, 0);
              
              const end = new Date(campaign.end_date);
              end.setHours(23, 59, 59, 999);

              if (end.getTime() < today.getTime()) {
                completedCampaigns++;
                console.log(`✅ "${campaign.title}" → TERMINÉE`);
              } else if (start.getTime() <= today.getTime() && end.getTime() >= today.getTime()) {
                ongoingCampaigns++;
                console.log(`🟡 "${campaign.title}" → EN COURS`);
              } else {
                console.log(`🟠 "${campaign.title}" → PLANIFIÉE`);
              }
            } else {
              console.log(`⚠️ "${campaign.title}" → Dates manquantes`);
            }
          });

          console.log("📊 STATISTIQUES CALCULÉES:");
          console.log(`   💰 Budget total: ${totalBudget}`);
          console.log(`   ✅ Terminées: ${completedCampaigns}`);
          console.log(`   🟡 En cours: ${ongoingCampaigns}`);
          console.log(`   📝 Total: ${campaignsData.length}`);

          // MISE À JOUR DES STATS
          setStats({ 
            totalBudget: totalBudget, 
            completedCampaigns: completedCampaigns, 
            ongoingCampaigns: ongoingCampaigns,
            totalCampaigns: campaignsData.length
          });
        } else {
          // Pas de campagnes
          setStats({ 
            totalBudget: 0, 
            completedCampaigns: 0, 
            ongoingCampaigns: 0,
            totalCampaigns: 0
          });
        }
      }
      
    } catch (error: any) {
      console.error("❌ Erreur générale:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const handleAssignCampaign = async (campaignId: string) => {
  // Récupération de l'ID du créateur (vérifie si c'est id_w ou id dans ton objet)
  const creatorId = selectedCreator?.id_w;

  // PROTECTION CRITIQUE
  if (!creatorId || creatorId === "undefined") {
    console.error("ID Créateur manquant :", selectedCreator);
    alert("Erreur : Impossible d'identifier le créateur.");
    return;
  }

  setIsAssigning(true);
  
  try {
    const { error } = await supabase
      .from('campaigns')
      .update({ 
        assigned_creator_id: creatorId, // Doit être un UUID valide
        status: 'assigned'
      })
      .eq('id_t_campagne', campaignId);

    if (error) throw error;
    
    alert("✅ Campagne attribuée !");
    setSelectedCreator(null);
    fetchData();
    
  } catch (error: any) {
    alert("Erreur : " + error.message);
  } finally {
    setIsAssigning(false);
  }
};
  const handleDeleteCampaign = async (campaignId: string) => { 
  if (!campaignId || campaignId === "undefined") {
    alert("❌ Erreur : ID de campagne manquant.");
    return;
  }

  if (!confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) return;
  
  try {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id_t_campagne', campaignId);

    if (error) throw error;
    
    alert('✅ Campagne supprimée avec succès !');
    fetchData();
  } catch (error: any) {
    alert("❌ Erreur de suppression : " + error.message);
  }
};

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
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
    { name: 'Mon profil', icon: <Settings size={20} />, href: '/brands//dashboard/profile' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      
      {/* MODAL D'ATTRIBUTION */}
      {selectedCreator && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111827]/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl border border-gray-100">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#111827]">Attribuer une campagne</h3>
              <button 
                onClick={() => setSelectedCreator(null)} 
                className="p-2 text-gray-400 hover:text-[#111827] transition-colors"
              >
                <CloseIcon size={24} />
              </button>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-[#F9FAFB] rounded-[24px] border border-gray-50 mb-8">
              <div className="w-14 h-14 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden shrink-0">
                {selectedCreator.url_photo_profile ? (
                  <img src={selectedCreator.url_photo_profile} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#D4A017]/10 text-[#D4A017] font-bold">
                    {selectedCreator.nom_complet?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[#111827] truncate">{selectedCreator.nom_complet || 'Créateur'}</p>
                <p className="text-[10px] text-[#D4A017] font-black uppercase tracking-widest flex items-center gap-1">
                  <Sparkles size={10} /> {selectedCreator.la_plateforme || 'Influenceur'}
                </p>
              </div>
            </div>

            <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-[0.2em] px-1">
              Sélectionnez la campagne
            </p>
            
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {campaigns.filter(c => !c.assigned_creator_id).length > 0 ? (
                campaigns.filter(c => !c.assigned_creator_id).map((camp) => {
                  const statusDisplay = getStatusDisplay(camp);
                  return (
                    <button
                      key={camp.id_t_campagne}
                      disabled={isAssigning}
                      onClick={() => handleAssignCampaign(camp.id_t_campagne)}
                      className="w-full text-left p-5 rounded-[20px] border border-gray-100 hover:border-[#D4A017]/30 hover:bg-[#D4A017]/5 transition-all flex justify-between items-center group disabled:opacity-50"
                    >
                      <div className="min-w-0">
                        <span className="block font-bold text-[#111827] text-sm truncate group-hover:text-[#D4A017]">
                          {camp.title || 'Sans titre'}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-400 font-medium">
                            Budget: {parseFloat(camp.budget || 0).toLocaleString()} CFA
                          </span>
                          <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold ${statusDisplay.color}`}>
                            {statusDisplay.text}
                          </span>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[#D4A017] shadow-sm group-hover:bg-[#D4A017] group-hover:text-white transition-all">
                        <ArrowRight size={14} />
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-8 px-4 border-2 border-dashed border-gray-50 rounded-[24px]">
                  <p className="text-sm text-gray-400 font-medium italic">
                    Aucune campagne disponible pour le moment.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8">
              <button 
                onClick={() => setSelectedCreator(null)}
                className="w-full py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#111827] transition-colors"
              >
                Annuler
              </button>
            </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
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
                  <div className="inline-block w-8 h-8 border-4 border-[#D4A017] border-t-transparent rounded-full animate-spin mb-4"></div>
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
                          href={`/brands/auth/edit/${camp.id}`} 
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

            {/* MATCHS IA */}
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
                    {creators.map((creator, idx) => (
                      <div 
                        key={creator.id_w || idx} 
                        onClick={() => setSelectedCreator(creator)}
                        className="flex items-center justify-between group cursor-pointer hover:bg-[#D4A017]/5 p-3 -m-3 rounded-2xl transition-all border border-transparent hover:border-[#D4A017]/10"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0 border border-gray-100 overflow-hidden">
                            {creator.url_photo_profile ? (
                              <img src={creator.url_photo_profile} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                                {creator.nom_complet?.charAt(0) || '?'}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-[#111827] truncate">
                              {creator.nom_complet || 'Créateur'}
                            </p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                              {creator.la_plateforme || 'Plateforme'} • {formatNumber(creator.nbre_followers || 0)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="bg-green-50 text-green-600 text-[9px] font-black px-2 py-1 rounded-md border border-green-100">
                            {95 - idx}%
                          </div>
                          <span className="text-[8px] text-[#D4A017] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            CHOISIR
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Link href="/creators/public">
                    <button className="w-full py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#111827] hover:text-white transition-all group uppercase tracking-widest">
                      Parcourir plus
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </>
              ) : (
                <div className="text-center py-8">
                  <Users size={32} className="mx-auto text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">Aucun créateur disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
