'use client'; 

import { useState } from 'react'; 
import {
  Mail,
  Loader2,
  X,
  AlertCircle,
  CheckCircle2
} from "lucide-react"; 
import { motion, AnimatePresence } from 'framer-motion'; 
import { createBrowserClient } from '@supabase/ssr'; 
import Link from 'next/link'; 

export default function ForgotPasswordPro() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setStatus({ type: 'error', message: error.message });
    } else {
      setStatus({
        type: 'success',
        message: 'Un lien sécurisé a été envoyé. Vérifiez votre boîte mail.'
      });
    }
    setLoading(false);
  };

  return (
    // bg-white ici force l'arrière-plan de toute la page en blanc
    <div className="flex flex-col items-center justify-center w-full min-h-screen bg-white p-4 font-sans">
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] bg-white border border-gray-100 p-8 rounded-[40px] shadow-2xl shadow-gray-200/50"
      >
        {/* En-tête */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-2xl font-black text-black">
              {status?.type === 'success' ? "Lien envoyé !" : "Récupération"}
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-2">
            {status?.type === 'success'
              ? "Vérifiez votre boîte de réception."
              : "Entrez votre email pour réinitialiser votre mot de passe."}
          </p>
          </div>

          <Link href="/auth/login" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </Link>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleReset} className="space-y-6">
          
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              required
              type="email"
              placeholder="votre@email.com"
              className="w-full pl-14 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-[#ceaf4a] focus:ring-2 focus:ring-[#ceaf4a]/10 outline-none transition-all text-gray-900"
              value={email}
              disabled={status?.type === 'success' || loading}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Message animé */}
          <AnimatePresence>
            {status && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold ${
                  status.type === 'success' 
                  ? 'bg-green-50 text-green-600 border border-green-100' 
                  : 'bg-red-50 text-red-600 border border-red-100'
                }`}
              >
                {status.type === 'success'
                  ? <CheckCircle2 size={18} />
                  : <AlertCircle size={18} />}
                {status.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bouton submit */}
          <button 
            type="submit" 
            disabled={loading || status?.type === 'success'}
            className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              status?.type === 'success' ? "Mail envoyé" : "Envoyer le lien"
            )}
          </button>
        </form>
      </motion.div>

      {/* Petit lien de secours en bas */}
      <p className="mt-8 text-sm text-gray-400">
        Vous vous en souvenez ? <Link href="/auth/login" className="text-black font-bold hover:underline">Se connecter</Link>
      </p>
    </div>
  );
}