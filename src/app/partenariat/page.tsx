"use client";
import Link from 'next/link';
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Handshake, 
  Building2, 
  Megaphone, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Mail,
  Globe
} from "lucide-react";

export default function PartnershipPage() {
  const [formState, setFormState] = useState({
    company: "",
    contactName: "",
    email: "",
    type: "agency",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique d'envoi ici (ex: Supabase ou API)
    console.log("Partnership request:", formState);
    alert("Merci ! Votre demande de partenariat a été reçue.");
  };

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
       <nav className="flex justify-between items-center px-8 py-8 max-w-7xl mx-auto relative z-50">
        <div className="text-4xl font-black italic tracking-tighter">W.</div>
        
        <div className="flex items-center gap-4">
           <Link href="/partenariat/auth/login" className="text-sm font-black bg-black text-white px-8 py-3 rounded-full hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all">
            Connexion
          </Link>
          <Link href="/partenariat/auth/register" className="text-sm font-black bg-black text-white px-8 py-3 rounded-full hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all">
            S'inscrire
          </Link>
        </div>
      </nav>
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gray-50 rounded-full blur-3xl -z-10 opacity-60" />
        
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-xs font-bold uppercase tracking-widest text-gray-600 mb-6">
              <Handshake size={14} /> Espace Partenaires
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
              Grandissons <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-600 to-gray-900">
                ensemble.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Woutty n'est pas seulement une plateforme. C'est un écosystème. 
              Nous collaborons avec des agences, des médias et des innovateurs pour façonner l'avenir de la Creator Economy en Afrique.
            </p>
          </motion.div>
        </div>
      </section>
      
    </div>
  );
}