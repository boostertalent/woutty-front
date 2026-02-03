"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UserCheck, ArrowLeft, Loader2, Calendar, 
  Mail, Instagram, ExternalLink, CheckCircle
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function BrandCollaborations() {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [loading, setLoading] = useState(true);
  const [collaborations, setCollaborations] = useState<any[]>([]);

  const fetchCollaborations = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const USER_ID = session.user.id;

      // Récupérer les campagnes ACCEPTÉES par les créateurs
      // On filtre pour ne garder que : 'accepted', 'ongoing', 'completed'
      // On EXCLUT 'assigned' (qui veut dire en attente de réponse)
      const { data: campaignsData, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id_w', USER_ID)
        .not('assigned_creator_id', 'is', null) // Il y a un créateur
        .in('status', ['accepted', 'ongoing', 'completed']) // Il a accepté
        .order('updated_at', { ascending: false });

      if (error) {
        console.error("Erreur récupération campagnes:", error);
        return;
      }

      console.log("📋 Campagnes acceptées:", campaignsData);

      if (campaignsData && campaignsData.length > 0) {
        // Pour chaque campagne, récupérer les infos du créateur
        const collaborationsWithCreators = await Promise.all(
          campaignsData.map(async (campaign) => {
            // Récupérer le créateur depuis info_profile (infos publiques)
            const { data: creatorProfile } = await supabase
              .from('info_profile')
              .select('*')
              .eq('id_w', campaign.assigned_creator_id)
              .single();

            // Récupérer aussi depuis la table createur (email, nom complet)
            // Note: On utilise try/catch ici au cas où l'id ne correspondrait pas parfaitement
            let creatorInfo = null;
            try {
                const { data } = await supabase
                .from('createur')
                .select('*')
                .eq('id_w', campaign.assigned_creator_id) // Assure-toi que la clé étrangère est bonne
                .single();
                creatorInfo = data;
            } catch (e) {
                console.warn("Info créateur non trouvée dans la table 'createur'");
            }

            return {
              campaign,
              creatorProfile,
              creatorInfo
            };
          })
        );

        setCollaborations(collaborationsWithCreators);
      } else {
        setCollaborations([]);
      }

    } catch (error) {
      console.error("❌ Erreur générale:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#D4A017] animate-spin mx-auto mb-4" />
          <p className="font-bold text-[#D4A017]">Chargement des collaborations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <Link href="/brands/dashboard">
            <button className="flex items-center gap-2 text-gray-400 hover:text-[#D4A017] font-bold mb-4 transition-colors">
              <ArrowLeft size={20} />
              Retour au dashboard
            </button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#111827] flex items-center gap-3">
                <CheckCircle size={32} className="text-green-600" />
                Collaborations Confirmées
              </h1>
              <p className="text-gray-400 text-sm mt-2">
                Liste des créateurs qui ont accepté vos campagnes
              </p>
            </div>
            
            <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Actives</p>
              <p className="text-2xl font-black text-[#D4A017]">{collaborations.length}</p>
            </div>
          </div>
        </div>

        {/* LISTE DES COLLABORATIONS */}
        {collaborations.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserCheck size={40} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-600 mb-2">Aucune collaboration confirmée</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Les créateurs n'ont pas encore accepté vos demandes d'attribution. 
              Dès qu'un créateur accepte une mission, il apparaîtra ici.
            </p>
            <Link href="/brands/dashboard">
              <button className="bg-[#D4A017] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#B88A14] transition-all">
                Retour aux opportunités
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {collaborations.map((collab) => {
              const { campaign, creatorProfile, creatorInfo } = collab;
              // Utilisation de id_t_campagne (UUID) pour la clé et les liens
              const campaignKey = campaign.id_t_campagne || campaign.id; 
              
              return (
                <div 
                  key={campaignKey}
                  className="bg-white rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="grid md:grid-cols-2 gap-8">
                    
                    {/* CRÉATEUR */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-black text-green-600 uppercase tracking-wider flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md">
                          <CheckCircle size={12} /> Acceptée
                        </p>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border-2 border-[#D4A017] shrink-0">
                          {creatorProfile?.url_photo_profile ? (
                            <img 
                              src={creatorProfile.url_photo_profile} 
                              alt={creatorProfile.nom_complet}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#D4A017]/10 text-[#D4A017] font-bold text-xl">
                              {creatorProfile?.nom_complet?.charAt(0) || creatorInfo?.full_name?.charAt(0) || '?'}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-[#111827] mb-1">
                            {creatorProfile?.nom_complet || creatorInfo?.full_name || 'Créateur inconnu'}
                          </h3>
                          
                          {creatorInfo?.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                              <Mail size={14} />
                              {creatorInfo.email}
                            </div>
                          )}
                          
                          {creatorProfile && (
                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-1 text-xs">
                                <Instagram size={14} className="text-[#D4A017]" />
                                <span className="font-bold">{creatorProfile.la_plateforme || 'Réseau'}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <span className="text-gray-400">Followers:</span>
                                <span className="font-bold text-[#D4A017]">
                                  {formatNumber(creatorProfile.nbre_followers || 0)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* CAMPAGNE */}
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">
                        Mission en cours
                      </p>
                      
                      <div className="bg-[#F9FAFB] rounded-2xl p-4 border border-gray-100 group-hover:border-[#D4A017]/30 transition-colors">
                        <h4 className="font-bold text-[#111827] mb-3 truncate">
                          {campaign.title || 'Sans titre'}
                        </h4>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Budget</span>
                            <span className="font-bold text-[#D4A017]">
                              {parseFloat(campaign.budget || 0).toLocaleString('fr-FR')} CFA
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Dates</span>
                            <span className="font-medium text-gray-700 flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
                    <Link 
                      href={`/brands/dashboard/details/${campaignKey}`}
                      className="flex-1 py-3 bg-[#D4A017] text-white rounded-xl font-bold text-sm hover:bg-[#B88A14] transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-[#D4A017]/20"
                    >
                      <ExternalLink size={16} />
                      Suivre la campagne
                    </Link>
                    
                    {creatorInfo?.email && (
                      <a
                        href={`mailto:${creatorInfo.email}?subject=Collaboration: ${campaign.title}`}
                        className="flex-1 py-3 bg-white text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all text-center flex items-center justify-center gap-2 border border-gray-200"
                      >
                        <Mail size={16} />
                        Envoyer un email
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}