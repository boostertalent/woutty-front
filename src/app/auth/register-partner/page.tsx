"use client";

import Link from "next/link";
import { ChevronLeft, Handshake } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPartnerPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">

      <Link
        href="/auth"
        className="fixed top-8 left-8 z-20 flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full font-bold hover:bg-gray-800 transition-colors shadow-md"
      >
        <ChevronLeft size={20} /> Retour
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white border border-gray-100 rounded-[40px] p-12 shadow-lg text-center"
      >
        <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center mx-auto mb-6 text-[#ceaf4a]">
          <Handshake size={36} strokeWidth={1.2} />
        </div>

        <h1 className="text-3xl font-black text-black mb-3" style={{ fontFamily: 'Georgia, serif' }}>
          Devenir partenaire <span className="text-[#ceaf4a]">Woutty</span>
        </h1>

        <p className="text-gray-500 mb-8 leading-relaxed">
          Vous souhaitez développer un partenariat stratégique avec Woutty ? Contactez-nous directement et nous reviendrons vers vous dans les plus brefs délais.
        </p>

        <Link
          href="mailto:contact@woutty.com"
          className="w-full bg-[#ceaf4a] text-black px-8 py-4 rounded-full font-black text-base hover:bg-yellow-400 transition-colors shadow-lg inline-block"
        >
          Nous contacter
        </Link>

        <p className="text-gray-400 text-xs mt-6">
          Ou écrivez-nous à <span className="text-[#ceaf4a] font-bold">contact@woutty.com</span>
        </p>
      </motion.div>
    </div>
  );
}