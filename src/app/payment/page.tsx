"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, Smartphone, Building2, ArrowLeft, Check, 
  Shield, Lock, AlertCircle, Loader2, Zap, Crown
} from 'lucide-react';
import { motion } from 'framer-motion';

type PaymentMethod = 'mobile_money' | 'card' | 'bank_transfer';
type MobileProvider = 'orange_money' | 'wave' | 'free_money' | 'mtn_money';

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
  color: string;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    features: [
      'Accès basique à la plateforme',
      '3 campagnes par mois',
      'Support par email',
      'Statistiques limitées'
    ],
    color: 'gray'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 15000,
    features: [
      'Campagnes illimitées',
      'Matching IA premium',
      'Support prioritaire 24/7',
      'Statistiques avancées',
      'Gestion multi-marques',
      'Export de données'
    ],
    popular: true,
    color: 'gold'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 45000,
    features: [
      'Tout du plan Pro',
      'API dédiée',
      'Account manager personnel',
      'Formations sur mesure',
      'SLA garanti 99.9%',
      'Intégrations personnalisées'
    ],
    color: 'purple'
  }
];

export default function PaymentPage() {
  const router = useRouter();
  
  const [selectedPlan, setSelectedPlan] = useState<Plan>(PLANS[1]); // Pro par défaut
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile_money');
  const [mobileProvider, setMobileProvider] = useState<MobileProvider>('orange_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (selectedPlan.price === 0) {
      router.push('/brands/dashboard');
      return;
    }

    // Validation
    if (paymentMethod === 'mobile_money' && !phoneNumber) {
      setError('Veuillez entrer votre numéro de téléphone');
      return;
    }
    if (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCVV || !cardName)) {
      setError('Veuillez remplir tous les champs de la carte');
      return;
    }

    setIsProcessing(true);

    // Simulation de paiement
    setTimeout(() => {
      setIsProcessing(false);
      alert(`✅ Paiement de ${selectedPlan.price.toLocaleString()} CFA réussi !\n\nPlan activé : ${selectedPlan.name}`);
      router.push('/brands/dashboard');
    }, 3000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <Link href="/brands/dashboard">
            <button className="flex items-center gap-2 text-gray-600 hover:text-[#D4A017] font-bold mb-4 transition-colors">
              <ArrowLeft size={20} />
              Retour au dashboard
            </button>
          </Link>
          <h1 className="text-3xl font-serif font-bold text-[#111827]">
            Choisissez votre plan
          </h1>
          <p className="text-gray-500 mt-2">
            Développez votre activité avec les bons outils
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* SÉLECTION DU PLAN */}
          <div className="lg:col-span-2 space-y-4">
            {PLANS.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedPlan(plan)}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedPlan.id === plan.id
                    ? 'border-[#D4A017] bg-gradient-to-br from-[#D4A017]/5 to-[#FFD700]/5 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan.id === plan.id
                        ? 'border-[#D4A017] bg-[#D4A017]'
                        : 'border-gray-300'
                    }`}>
                      {selectedPlan.id === plan.id && <Check size={14} className="text-white" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#111827] flex items-center gap-2">
                        {plan.name}
                        {plan.popular && (
                          <span className="text-xs bg-[#D4A017] text-white px-2 py-1 rounded-full font-bold">
                            POPULAIRE
                          </span>
                        )}
                      </h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-[#111827]">
                      {plan.price.toLocaleString()}
                      <span className="text-sm font-normal text-gray-500"> CFA</span>
                    </p>
                    <p className="text-xs text-gray-400">par mois</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-2">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check size={14} className="text-green-600 shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* FORMULAIRE DE PAIEMENT */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-8 shadow-lg">
              <h2 className="text-xl font-bold text-[#111827] mb-4">Paiement</h2>

              <form onSubmit={handlePayment} className="space-y-4">

                {/* RÉCAPITULATIF */}
                <div className="p-4 bg-gradient-to-br from-[#D4A017]/5 to-[#FFD700]/5 rounded-xl border border-[#D4A017]/20">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Plan sélectionné</span>
                    <span className="font-bold text-[#111827]">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#D4A017]/20">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-black text-[#D4A017]">
                      {selectedPlan.price.toLocaleString()} CFA
                    </span>
                  </div>
                </div>

                {selectedPlan.price > 0 && (
                  <>
                    {/* MÉTHODE DE PAIEMENT */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        Méthode de paiement
                      </label>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('mobile_money')}
                          className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                            paymentMethod === 'mobile_money'
                              ? 'border-[#D4A017] bg-[#D4A017]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Smartphone size={20} className="text-[#D4A017]" />
                          <span className="font-bold text-[#111827]">Mobile Money</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('card')}
                          className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                            paymentMethod === 'card'
                              ? 'border-[#D4A017] bg-[#D4A017]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <CreditCard size={20} className="text-[#D4A017]" />
                          <span className="font-bold text-[#111827]">Carte bancaire</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod('bank_transfer')}
                          className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${
                            paymentMethod === 'bank_transfer'
                              ? 'border-[#D4A017] bg-[#D4A017]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Building2 size={20} className="text-[#D4A017]" />
                          <span className="font-bold text-[#111827]">Virement bancaire</span>
                        </button>
                      </div>
                    </div>

                    {/* MOBILE MONEY */}
                    {paymentMethod === 'mobile_money' && (
                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700">
                          Opérateur
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'orange_money', name: 'Orange Money', color: 'orange' },
                            { id: 'wave', name: 'Wave', color: 'blue' },
                            { id: 'free_money', name: 'Free Money', color: 'red' },
                            { id: 'mtn_money', name: 'MTN Money', color: 'yellow' }
                          ].map((provider) => (
                            <button
                              key={provider.id}
                              type="button"
                              onClick={() => setMobileProvider(provider.id as MobileProvider)}
                              className={`p-3 rounded-lg border-2 font-bold text-sm transition-all ${
                                mobileProvider === provider.id
                                  ? 'border-[#D4A017] bg-[#D4A017]/5'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {provider.name}
                            </button>
                          ))}
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Numéro de téléphone
                          </label>
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="77 123 45 67"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4A017] focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    {/* CARTE BANCAIRE */}
                    {paymentMethod === 'card' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Nom sur la carte
                          </label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            placeholder="PRENOM NOM"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4A017] focus:outline-none transition-colors uppercase"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Numéro de carte
                          </label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4A017] focus:outline-none transition-colors font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              Expiration
                            </label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                              placeholder="MM/YY"
                              maxLength={5}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4A017] focus:outline-none transition-colors font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              CVV
                            </label>
                            <input
                              type="text"
                              value={cardCVV}
                              onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 3))}
                              placeholder="123"
                              maxLength={3}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#D4A017] focus:outline-none transition-colors font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* VIREMENT BANCAIRE */}
                    {paymentMethod === 'bank_transfer' && (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-sm text-blue-900 font-medium mb-3">
                          Coordonnées bancaires :
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700">Banque :</span>
                            <span className="font-bold text-blue-900">BOA Sénégal</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">IBAN :</span>
                            <span className="font-mono font-bold text-blue-900">SN12 3456 7890 1234 5678</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Titulaire :</span>
                            <span className="font-bold text-blue-900">WOUTTY SARL</span>
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-3">
                          Envoyez la preuve de paiement à : paiements@woutty.com
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* ERREUR */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-600 shrink-0" />
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                )}

                {/* SÉCURITÉ */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield size={14} className="text-green-600" />
                  Paiement 100% sécurisé SSL
                </div>

                {/* BOUTON */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-[#D4A017] to-[#FFD700] text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      {selectedPlan.price === 0 ? 'Commencer gratuitement' : `Payer ${selectedPlan.price.toLocaleString()} CFA`}
                    </>
                  )}
                </button>
              </form>

              {/* INFO */}
              <p className="text-xs text-gray-400 text-center mt-4">
                En confirmant, vous acceptez nos{' '}
                <Link href="/terms" className="text-[#D4A017] hover:underline">
                  conditions d'utilisation
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* TÉMOIGNAGES / GARANTIES */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={24} className="text-green-600" />
            </div>
            <h3 className="font-bold text-[#111827] mb-2">Satisfaction garantie</h3>
            <p className="text-sm text-gray-500">Essai gratuit 14 jours, sans engagement</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={24} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-[#111827] mb-2">Paiement sécurisé</h3>
            <p className="text-sm text-gray-500">Vos données sont protégées SSL 256-bit</p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap size={24} className="text-purple-600" />
            </div>
            <h3 className="font-bold text-[#111827] mb-2">Activation instantanée</h3>
            <p className="text-sm text-gray-500">Accédez immédiatement à toutes les fonctionnalités</p>
          </div>
        </div>
      </div>
    </div>
  );
}
