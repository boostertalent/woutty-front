"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Sparkles, HeadphonesIcon, CheckCircle2, ArrowRight,
  Users, MessageCircle, Rocket, Loader2, X, AlertCircle, Info
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

  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

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

  // Fonction appelée au clic sur le bouton "Demander de l'aide"
  const handleRequestClick = () => {
    setShowConfirmModal(true);
  };

  // Fonction pour annuler la demande
  const handleCancelRequest = () => {
    setShowConfirmModal(false);
  };

  // Fonction pour confirmer et envoyer la demande
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-white to-[#FEF9E7] relative overflow-hidden flex items-center justify-center p-4">
      
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
      <div className="relative z-10 w-full max-w-5xl">
        
        {/* HEADER COMPACT */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-[#D4A017]/10 text-[#D4A017] px-4 py-2 rounded-full font-bold mb-4 border border-[#D4A017]/20 text-sm">
            <Rocket size={16} />
            Nouvelle campagne
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-[#111827] mb-2">
            Comment souhaitez-vous créer votre campagne ?
          </h1>
          <p className="text-base text-gray-600">
            Choisissez l'option qui vous convient le mieux
          </p>
        </motion.div>

        {/* CARTES COMPACTES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          {/* OPTION 1 : LANCER SOI-MÊME */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
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
            transition={{ delay: 0.2 }}
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

        {/* RASSURANCE COMPACTE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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

        {/* LIEN RETOUR */}
        <div className="text-center mt-6">
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
