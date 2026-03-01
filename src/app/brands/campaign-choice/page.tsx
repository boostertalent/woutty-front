"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Sparkles, HeadphonesIcon, CheckCircle2, ArrowRight,
  Users, MessageCircle, Rocket, Loader2, X, AlertCircle, Info,
  Package, Crown, Check, Star
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

// Composant Toast personnalisé
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: -50, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -20, scale: 0.9 }}
    className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border-2 ${
      type === 'success' 
        ? 'bg-green-50 border-green-200 text-green-800' 
        : 'bg-red-50 border-red-200 text-red-800'
    }`}
  >
    {type === 'success' ? (
      <CheckCircle2 size={24} className="shrink-0" />
    ) : (
      <AlertCircle size={24} className="shrink-0" />
    )}
    <p className="font-bold text-sm">{message}</p>
    <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
      <X size={18} />
    </button>
  </motion.div>
);

// Composant Modal de confirmation
const ConfirmModal = ({ 
  onConfirm, 
  onCancel, 
  isLoading,
  brandName 
}: { 
  onConfirm: () => void; 
  onCancel: () => void; 
  isLoading: boolean;
  brandName: string;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    onClick={onCancel}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl"
    >
      <div className="flex items-center justify-center mb-6">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
          <HeadphonesIcon size={32} className="text-blue-600" />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-center text-[#111827] mb-3">
        Demander de l'assistance ?
      </h3>

      <p className="text-center text-gray-600 mb-6">
        Vous êtes sur le point de demander l'accompagnement de notre équipe pour créer votre campagne.
      </p>

      <div className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-100">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-bold mb-2">Ce qui va se passer :</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Votre demande sera envoyée à notre équipe</li>
              <li>• Nous vous contacterons sous 24 heures</li>
              <li>• Un expert vous accompagnera personnellement</li>
              <li>• Aucun engagement financier à ce stade</li>
            </ul>
          </div>
        </div>
      </div>

      {brandName && (
        <p className="text-xs text-gray-500 text-center mb-6">
          Demande pour : <span className="font-bold text-gray-700">{brandName}</span>
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Envoi...
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />
              Confirmer
            </>
          )}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

export default function CampaignChoice() {
  const router = useRouter();
  const [requestingSupport, setRequestingSupport] = useState(false);
  const [brandInfo, setBrandInfo] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hasReadContract, setHasReadContract] = useState(false);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);

  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  // Données des packs
  const PACKS_DATA = {
    'local-starter': {
      id: 'local-starter',
      name: 'Local Starter',
      price: 15000,
      originalPrice: 30000,
      duration: 3,
      posts: 4,
      creators: 2,
      format: '100% photos',
      videos: false,
      reporting: false
    },
    'regional-business': {
      id: 'regional-business',
      name: 'Regional Business',
      price: 60000,
      originalPrice: 80000,
      duration: 7,
      posts: 7,
      creators: 3,
      format: '4 photos + 3 vidéos',
      videos: true,
      reporting: true,
      bonus: '+1 vidéo offerte'
    },
    'national-scale': {
      id: 'national-scale',
      name: 'National Scale',
      price: 100000,
      originalPrice: 150000,
      duration: 15,
      posts: 15,
      creators: 5,
      format: '9 vidéos + 6 photos',
      videos: true,
      reporting: true,
      imageRights: true
    }
  };

  React.useEffect(() => {
    loadBrandInfo();
  }, []);

  const loadBrandInfo = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data: brand } = await supabase
        .from('marque')
        .select('*')
        .eq('id_w', session.user.id)
        .single();

      if (brand) {
        setBrandInfo(brand);
      }
    } catch (error) {
      console.error('❌ Erreur chargement marque:', error);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleRequestClick = () => {
    setShowConfirmModal(true);
  };

  const handleCancelRequest = () => {
    setShowConfirmModal(false);
  };

  const handleConfirmRequest = async () => {
    setRequestingSupport(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast('Votre session a expiré. Veuillez vous reconnecter.', 'error');
        setShowConfirmModal(false);
        router.push('/auth/login');
        return;
      }

      const { error: requestError } = await supabase
        .from('campaign_assistance_requests')
        .insert({
          brand_id: session.user.id,
          brand_name: brandInfo?.nom_marque || 'Marque',
          brand_email: brandInfo?.email_marque || session.user.email,
          brand_phone: brandInfo?.phone || null,
          status: 'pending',
          requested_at: new Date().toISOString()
        });

      if (requestError) {
        console.error('❌ Erreur création demande:', requestError);
        showToast('Impossible d\'envoyer votre demande. Veuillez réessayer ou contacter le support.', 'error');
        throw requestError;
      }

      setShowConfirmModal(false);
      showToast('Demande envoyée avec succès ! Notre équipe vous contactera sous 24 heures.', 'success');
      
      setTimeout(() => {
        router.push('/brands/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('❌ Erreur:', error);
      setShowConfirmModal(false);
    } finally {
      setRequestingSupport(false);
    }
  };

  const handleSelectPack = async (packId: string) => {
    setSelectedPack(packId);
    setHasReadContract(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast('Veuillez vous connecter pour continuer', 'error');
        return;
      }

      const packData = PACKS_DATA[packId as keyof typeof PACKS_DATA];

      // 💾 SAUVEGARDER LE PACK DANS SUPABASE
await supabase
  .from('campaign_drafts')
  .delete()
  .eq('brand_id', session.user.id)
  .eq('status', 'draft');
const { error } = await supabase
  .from('campaign_drafts')
  .insert({
    brand_id: session.user.id,
    pack_id: packData.id,
    pack_name: packData.name,
    budget: packData.price,
    original_price: packData.originalPrice,
    duration_days: packData.duration,
    expected_posts: packData.posts,
    expected_creators: packData.creators,
    format: packData.format,
    has_videos: packData.videos,
    has_reporting: packData.reporting,
    bonus: packData.bonus || null,
    has_image_rights: packData.imageRights || false,
    status: 'draft'
  });

      if (error) {
        console.error('❌ Erreur sauvegarde pack:', error);
        showToast('Erreur lors de la sauvegarde. Veuillez réessayer.', 'error');
      } else {
        console.log('✅ Pack sauvegardé:', packData.name);
        showToast('Pack sélectionné avec succès !', 'success');
      }

    } catch (error) {
      console.error('❌ Erreur:', error);
      showToast('Une erreur est survenue', 'error');
    }
    
    setTimeout(() => {
      document.getElementById('campaign-options')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-white to-[#FEF9E7] relative overflow-hidden">
      
      {/* Toast notifications */}
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>

      {/* Modal de confirmation */}
      <AnimatePresence>
        {showConfirmModal && (
          <ConfirmModal
            onConfirm={handleConfirmRequest}
            onCancel={handleCancelRequest}
            isLoading={requestingSupport}
            brandName={brandInfo?.nom_marque || 'Votre marque'}
          />
        )}
      </AnimatePresence>

      {/* Arrière-plan animé */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-[#D4A017] to-[#FFD700] rounded-full blur-3xl"
        />
      </div>

      {/* CONTENU */}
      <div className="relative z-10 w-full max-w-7xl mx-auto p-4 py-12">
        
        {/* TITRE */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-[#D4A017]/10 text-[#D4A017] px-4 py-2 rounded-full font-bold mb-4 border border-[#D4A017]/20 text-sm"
          >
            <Package size={16} />
            Choisissez votre pack
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-[#111827] mb-4"
          >
            Nos Packs
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg max-w-2xl mx-auto"
          >
            Sélectionnez le pack qui correspond à vos besoins
          </motion.p>
        </div>

        {/* GRILLE DES 3 PACKS - côte à côte, largeur limitée */}
        <div className="flex justify-center mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          
          {/* PACK 1 : LOCAL STARTER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => handleSelectPack('local-starter')}
            className={`group cursor-pointer bg-white rounded-3xl border-2 transition-all shadow-lg hover:shadow-2xl p-6 flex flex-col ${
              selectedPack === 'local-starter' 
                ? 'border-green-500 ring-4 ring-green-100' 
                : 'border-gray-200 hover:border-green-400'
            }`}
          >
            {/* En-tête */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Package size={24} className="text-green-600" />
              </div>
              {selectedPack === 'local-starter' && (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check size={18} className="text-white" />
                </div>
              )}
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-2">
              Local Starter
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Idéal pour commerces de quartier, restaurants, salons
            </p>

            {/* Prix */}
            <div className="mb-6">
              
              <div className="flex items-center gap-2">
                <span className="text-sm line-throughtext-lg text-m font-black text-gray-900 mb-2">30 000~ 15 000 FCFA</span>
                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                 Économisez 35% 
                </span>
                
              </div>
            </div>

            {/* Caractéristiques */}
            <div className="flex-1 space-y-3 mb-6">
              <p className="text-x font-black text-gray-900 mb-2">
            Ce que vous obtenez :
            </p>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Durée : <strong>3 jours flash</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Volume : <strong>4 posts garantis</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Format : <strong>100% photos</strong>-  (Mise en valeur visuelle)
</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Créateurs : <strong>2 créateurs</strong> (Fort taux d'engagement local)</span>
              </div>
              <div className="flex items-start gap-2">
                <X size={16} className=" text-gray-300 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Vidéo : <strong>Non incluse</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <X size={16} className="text-gray-300 shrink-0 mt-0.5" />
               <span className="text-sm text-gray-700"> Rapport détaillé  : <strong>Non inclus</strong>(Preuve de publication simple)
</span>
              </div>
            </div>

            {/* Bouton */}
            <button className={`w-full py-3 rounded-xl font-bold transition-all ${
              selectedPack === 'local-starter'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}>
              {selectedPack === 'local-starter' ? 'Sélectionné' : 'Choisir ce pack'}
            </button>
          </motion.div>

          {/* PACK 2 : REGIONAL BUSINESS (RECOMMANDÉ) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => handleSelectPack('regional-business')}
            className={`group cursor-pointer bg-white rounded-3xl border-2 transition-all shadow-2xl p-6 flex flex-col relative ${
              selectedPack === 'regional-business' 
                ? 'border-[#D4A017] ring-4 ring-[#D4A017]/20 scale-105' 
                : 'border-[#D4A017] hover:scale-105'
            }`}
          >
            {/* Badge Recommandé */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="bg-[#D4A017] text-white px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                <Star size={12} fill="currentColor" />
                Recommandé
              </div>
            </div>

            {/* En-tête */}
            <div className="flex items-center justify-between mb-4 mt-2">
              <div className="w-12 h-12 bg-gradient-to-br from-[#D4A017] to-[#FFD700] rounded-xl flex items-center justify-center">
                <Star size={24} className="text-white" fill="currentColor" />
              </div>
              {selectedPack === 'regional-business' && (
                <div className="w-8 h-8 bg-[#D4A017] rounded-full flex items-center justify-center">
                  <Check size={18} className="text-white" />
                </div>
              )}
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-2">
              Regional Business
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Idéal pour PME, lancement produit, startups
            </p>

            {/* Prix */}
            <div className="mb-6">

              <div className="flex items-center gap-2">
                <span className="text-sm line-throughtext-lg text-m font-black text-gray-900 mb-2">80 000 ~ 60 000 FCFA</span>
                <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                  Le choix le plus populaire
                </span>
              </div>
            </div>

            {/* Caractéristiques */}
            <div className="flex-1 space-y-3 mb-6">
              <p className="text-x font-black text-gray-900 mb-2">
           Tout ce qu'il y a dans Starter, plus :
            </p>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-[#D4A017] shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Durée : <strong>7 jours impact</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-[#D4A017] shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Volume : <strong>7 posts répartis</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-[#D4A017] shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Format : <strong>4 photos + 3 vidéos</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-[#D4A017] shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Créateurs : <strong>3 créateurs</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-[#D4A017] shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Spécificité Vidéo :<strong>Format "Reels/TikTok"  dynamique</strong>(15-30 seconde) </span>
              </div>
                            <div className="flex items-start gap-2">
                <Check size={16} className="text-[#D4A017] shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Reporting :<strong>Statistiques d'audience </strong> (Vues, Likes, Portée)</span>
              </div>
              <div className="flex items-start gap-2">
                <Sparkles size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                <span className="text-sm font-bold text-yellow-700">+1 vidéo bonus offerte</span>
              </div>
            </div>

            {/* Bouton */}
            <button className={`w-full py-3 rounded-xl font-bold transition-all ${
              selectedPack === 'regional-business'
                ? 'bg-[#D4A017] text-white shadow-2xl'
                : 'bg-[#D4A017]/10 text-[#D4A017] hover:bg-[#D4A017]/20'
            }`}>
              {selectedPack === 'regional-business' ? 'Sélectionné' : 'Choisir ce pack'}
            </button>
          </motion.div>

          {/* PACK 3 : NATIONAL SCALE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={() => handleSelectPack('national-scale')}
            className={`group cursor-pointer bg-white rounded-3xl border-2 transition-all shadow-lg hover:shadow-2xl p-6 flex flex-col ${
              selectedPack === 'national-scale' 
                ? 'border-purple-500 ring-4 ring-purple-100' 
                : 'border-gray-200 hover:border-purple-400'
            }`}
          >
            {/* En-tête */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Crown size={24} className="text-purple-600" />
              </div>
              {selectedPack === 'national-scale' && (
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Check size={18} className="text-white" />
                </div>
              )}
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-2">
              National Scale
            </h3>
            
            <p className="text-sm text-gray-600 mb-4">
              Pour grandes marques et campagnes nationales
            </p>

            {/* Prix */}
            <div className="mb-6">
             
              <div className="flex items-center gap-2">
                <span className="text-sm line-throughtext-lg text-m font-black text-gray-900 mb-2">150 000 ~ 100 000 FCFA</span>
                <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  Performance maximale & Contenu riche
                </span>
              </div>
            </div>

            {/* Caractéristiques */}
            <div className="flex-1 space-y-3 mb-6">
                            <p className="text-x font-black text-gray-900 mb-2">
        Tout ce qu'il y a dans Business, plus :
            </p>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-purple-600 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Durée : <strong>15 jours dominance</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-purple-600 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Volume : <strong>15 posts garantis</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-purple-600 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Format : <strong>9 vidéos + 6 photos</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-purple-600 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Créateurs : <strong>Sélection VIP</strong>(Influenceurs à forte notoriété + créateurs de contenu)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check size={16} className="text-purple-600 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Spécificité Vidéo : <strong>Storytelling long (jusqu'à 60-90 sec) + Unboxing</strong></span>
              </div>
               <div className="flex items-start gap-2">
                <Check size={16} className="text-purple-600 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Reporting :<strong>Analyse démographique complète + ROI estimé</strong></span>
              </div>
               <div className="flex items-start gap-2">
                <Check size={16} className="text-purple-600 shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">Droits d'image :<strong> Utilisation publicitaire (Ads) incluse pour 3 mois</strong></span>
              </div>
            </div>

            {/* Bouton */}
            <button className={`w-full py-3 rounded-xl font-bold transition-all ${
              selectedPack === 'national-scale'
                ? 'bg-purple-500 text-black shadow-lg'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}>
              {selectedPack === 'national-scale' ? 'Sélectionné' : 'Choisir ce pack'}
            </button>
          </motion.div>
          </div>
        </div>

        {/* SECTION OPTIONS DE CRÉATION - Visible après sélection */}
        {hasReadContract && selectedPack && (
          <motion.div
            id="campaign-options"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* HEADER */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-[#D4A017]/10 text-[#D4A017] px-4 py-2 rounded-full font-bold mb-4 border border-[#D4A017]/20 text-sm">
                <Rocket size={16} />
                Nouvelle campagne
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-[#111827] mb-2">
                Comment souhaitez-vous créer votre campagne ?
              </h1>
              <p className="text-base text-gray-600">
                Pack sélectionné : <span className="font-bold text-[#D4A017]">
                  {selectedPack === 'local-starter' && 'Local Starter'}
                  {selectedPack === 'regional-business' && 'Regional Business'}
                  {selectedPack === 'national-scale' && 'National Scale'}
                </span>
              </p>
            </div>

            {/* CARTES OPTIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              
              {/* OPTION 1 : LANCER SOI-MÊME */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="group"
              >
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-[#D4A017] transition-all shadow-lg hover:shadow-xl h-full flex flex-col">
                  
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D4A017] to-[#FFD700] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap size={24} className="text-white" fill="currentColor" />
                  </div>

                  <h2 className="text-xl font-bold text-[#111827] mb-2">
                    Lancer une campagne
                  </h2>
                  <p className="text-sm text-gray-600 mb-4 flex-1">
                    Interface intuitive avec suggestions IA automatiques
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                      <span className="text-gray-700">Formulaire guidé pas à pas</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                      <span className="text-gray-700">Matching IA instantané</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                      <span className="text-gray-700">5 minutes chrono</span>
                    </div>
                  </div>

                  <Link href="/brands/auth/campagne" className="w-full">
                    <button className="w-full py-3 bg-[#D4A017] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#B88A14] transition-all shadow-lg group-hover:scale-105">
                      Commencer
                      <ArrowRight size={18} />
                    </button>
                  </Link>
                </div>
              </motion.div>

              {/* OPTION 2 : ASSISTANCE */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="group"
              >
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-blue-500 transition-all shadow-lg hover:shadow-xl h-full flex flex-col">
                  
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <HeadphonesIcon size={24} className="text-white" />
                  </div>

                  <h2 className="text-xl font-bold text-[#111827] mb-2">
                    Demander de l'assistance
                  </h2>
                  <p className="text-sm text-gray-600 mb-4 flex-1">
                    Accompagnement personnalisé par nos experts
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                      <span className="text-gray-700">Expert dédié à votre projet</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                      <span className="text-gray-700">Optimisation ROI garantie</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                      <span className="text-gray-700">Sélection sur-mesure</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleRequestClick}
                    className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg group-hover:scale-105"
                  >
                    Demander de l'aide
                    <MessageCircle size={18} />
                  </button>
                </div>
              </motion.div>
            </div>

            {/* RASSURANCE */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-200"
            >
              <div className="flex items-center justify-center gap-8 text-center flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                    <Sparkles size={16} className="text-green-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 text-sm">100% sécurisé</p>
                    <p className="text-xs text-gray-500">Données protégées</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-purple-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 text-sm">Qualité garantie</p>
                    <p className="text-xs text-gray-500">Créateurs vérifiés</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Users size={16} className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 text-sm">Support 7j/7</p>
                    <p className="text-xs text-gray-500">Équipe à l'écoute</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* LIEN RETOUR */}
        <div className="text-center mt-8">
          <Link href="/brands/dashboard">
            <button className="text-gray-500 hover:text-gray-900 font-medium text-sm transition-colors">
              ← Retour au dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
