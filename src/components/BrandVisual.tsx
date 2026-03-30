"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Process from "@/components/Process";
import CreatorBenefits from "@/components/CreatorBenefits";
import BrandBenefits from "@/components/BrandBenefits";
import PartnershipBenefits from "@/components/PartnershipBenefits";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative z-10 bg-transparent text-foreground selection:bg-booster-yellow selection:text-black transition-colors duration-500">
      <Navbar />
      
      {/* 1. Hero */}
      <Hero />

      {/* 2. Section Comment ça marche */}
      <section id="process" className="scroll-mt-24">
        <Process />
      </section>

      {/* 3. Section Créateurs */}
      <section id="creators" className="scroll-mt-32">
        <CreatorBenefits />
      </section>

      {/* 4. Section Marques */}
      <section id="brands" className="scroll-mt-24">
        <BrandBenefits />
      </section>

      {/* 5. Section Partenariats */}
      <section id="partenariat" className="scroll-mt-24">
        <PartnershipBenefits />
      </section>

      {/* Questionnaire */}
      <FAQ />

      {/* Footer */}
      <Footer />
      
    </main>
  );
}