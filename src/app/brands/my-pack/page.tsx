"use client";

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Crown, 
  Star, 
  CheckCircle, 
  Calendar, 
  Clock, 
  Users, 
  Image as ImageIcon,
  Video,
  BarChart3,
  Shield,
  Loader2,
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface PackData {
  pack_id: string;
  pack_name: string;
  budget: number;
  original_price: number;
  duration_days: number;
  expected_posts: number;
  expected_creators: number;
  format: string;
  has_videos: boolean;
  has_reporting: boolean;
  has_image_rights: boolean;
  bonus: string | null;
  status: string;
  created_at: string;
}

const PACK_DETAILS = {
  'local-starter': {
    icon: <Package size={32} className="text-green-600" />,
    color: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    features: [
      'Photos professionnelles uniquement',
      'Créateurs locaux engagés',
      'Publication rapide (3 jours)',
      'Preuve de publication simple'
    ]
  },
  'regional-business': {
    icon: <Star size={32} className="text-[#D4A017]" fill="currentColor" />,
    color: 'from-yellow-50 to-amber-50',
    borderColor: 'border-[#D4A017]/30',
    textColor: 'text-[#D4A017]',
    features: [
      'Mix photos et vidéos dynamiques',
      'Format Reels/TikTok optimisé',
      'Statistiques d\'audience détaillées',
      'Bonus : +1 vidéo offerte'
    ]
  },
  'national-scale': {
    icon: <Crown size={32} className="text-purple-600" />,
    color: 'from-purple-50 to-violet-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    features: [
      'Créateurs VIP & influenceurs',
      'Storytelling long format (60-90s)',
      'Analyse démographique + ROI',
      'Droits d\'utilisation publicitaire (3 mois)'
    ]
  }
};

export default function BrandPackView() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [packData, setPackData] = useState<PackData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchMyPack();
  }, []);

  const fetchMyPack = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      // Récupérer le pack de la marque connectée
      const { data, error: fetchError } = await supabase
        .from('campaign_drafts')
        .select('*')
        .eq('brand_id', session.user.id)
        .eq('status', 'draft')
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setPackData(null);
        } else {
          throw fetchError;
        }
      } else {
        setPackData(data as PackData);
        console.log('✅ Pack chargé:', data.pack_name);
      }

    } catch (err: any) {
      console.error('❌ Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 text-[#D4A017] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-3">
          <AlertCircle className="text-red-600 shrink-0" size={24} />
          <div>
            <p className="font-bold text-red-800 mb-1">Erreur</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!packData) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-12 text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Aucun pack sélectionné
          </h2>
          <p className="text-gray-600 mb-6">
            Vous n'avez pas encore choisi de pack pour votre campagne
          </p>
          <button
            onClick={() => router.push('/brands/campaign-choice')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4A017] text-white rounded-xl font-bold hover:bg-[#B88A14] transition-all"
          >
            Choisir un pack
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  const packDetails = PACK_DETAILS[packData.pack_id as keyof typeof PACK_DETAILS];
  const savings = packData.original_price - packData.budget;
  const savingsPercent = Math.round((savings / packData.original_price) * 100);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* HEADER */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full font-bold mb-4 text-sm">
          <CheckCircle size={16} />
          Pack sélectionné avec succès
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Votre Pack Actuel
        </h1>
        <p className="text-gray-600">
          Récapitulatif de votre sélection
        </p>
      </div>

      {/* CARTE PRINCIPALE DU PACK */}
      <div className={`bg-gradient-to-r ${packDetails.color} rounded-3xl border-2 ${packDetails.borderColor} p-8 mb-8 shadow-xl`}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center">
              {packDetails.icon}
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900">{packData.pack_name}</h2>
              <p className={`text-sm font-bold ${packDetails.textColor} mt-1`}>
                Sélectionné le {new Date(packData.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500 font-bold mb-1">INVESTISSEMENT</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-gray-900">
                {packData.budget.toLocaleString('fr-FR')}
              </span>
              <span className="text-lg font-bold text-gray-600">FCFA</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm line-through text-gray-400">
                {packData.original_price.toLocaleString('fr-FR')} FCFA
              </span>
              <span className="text-xs font-bold bg-green-500 text-white px-2 py-1 rounded-full">
                -{savingsPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* ÉCONOMIE */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="text-green-600" size={24} />
            <div>
              <p className="text-sm text-gray-600 font-medium">Économie réalisée</p>
              <p className="text-2xl font-black text-green-600">
                {savings.toLocaleString('fr-FR')} FCFA
              </p>
            </div>
          </div>
        </div>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 text-center">
            <Clock size={20} className="mx-auto text-gray-400 mb-2" />
            <p className="text-2xl font-black text-gray-900">{packData.duration_days}</p>
            <p className="text-xs text-gray-500 font-bold uppercase">Jours</p>
          </div>

          <div className="bg-white rounded-xl p-4 text-center">
            <ImageIcon size={20} className="mx-auto text-gray-400 mb-2" />
            <p className="text-2xl font-black text-gray-900">{packData.expected_posts}</p>
            <p className="text-xs text-gray-500 font-bold uppercase">Posts</p>
          </div>

          <div className="bg-white rounded-xl p-4 text-center">
            <Users size={20} className="mx-auto text-gray-400 mb-2" />
            <p className="text-2xl font-black text-gray-900">{packData.expected_creators}</p>
            <p className="text-xs text-gray-500 font-bold uppercase">Créateurs</p>
          </div>

          <div className="bg-white rounded-xl p-4 text-center">
            <BarChart3 size={20} className="mx-auto text-gray-400 mb-2" />
            <p className="text-2xl font-black text-gray-900">{packData.format}</p>
            <p className="text-xs text-gray-500 font-bold uppercase">Format</p>
          </div>
        </div>
      </div>

      {/* CARACTÉRISTIQUES */}
      <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <CheckCircle size={24} className="text-green-600" />
          Ce qui est inclus
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packDetails.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
              <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}

          {packData.has_videos && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
              <Video size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <span className="text-sm text-blue-700 font-medium">Vidéos incluses</span>
            </div>
          )}

          {packData.has_reporting && (
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
              <BarChart3 size={18} className="text-purple-600 shrink-0 mt-0.5" />
              <span className="text-sm text-purple-700 font-medium">Rapports détaillés</span>
            </div>
          )}

          {packData.has_image_rights && (
            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
              <Shield size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <span className="text-sm text-amber-700 font-medium">Droits d'image (3 mois)</span>
            </div>
          )}

          {packData.bonus && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl border-2 border-yellow-200">
              <Sparkles size={18} className="text-yellow-600 shrink-0 mt-0.5" />
              <span className="text-sm text-yellow-800 font-bold">{packData.bonus}</span>
            </div>
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => router.push('/brands/campaign-choice')}
          className="py-4 px-6 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
        >
          Changer de pack
        </button>

        <button
          onClick={() => router.push('/brands/campaign-choice')}
          className="py-4 px-6 bg-[#D4A017] text-white rounded-xl font-bold hover:bg-[#B88A14] transition-all flex items-center justify-center gap-2"
        >
          Créer ma campagne
          <ArrowRight size={20} />
        </button>
      </div>

      {/* INFO */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-bold mb-1">Prêt à lancer votre campagne ?</p>
            <p className="text-blue-700">
              Votre pack est enregistré. Vous pouvez maintenant créer votre campagne et 
              sélectionner vos créateurs. Notre équipe validera votre demande sous 24h.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
