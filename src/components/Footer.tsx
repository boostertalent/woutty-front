"use client";
import React from 'react';
import { motion } from "framer-motion";
import { Instagram, Twitter, Linkedin, Github, ArrowUpRight } from "lucide-react";

const footerLinks = [
  {
    title: "Plateforme",
    links: [
      { name: "Marques", href: "#" },
      { name: "Créateurs", href: "#" },
      { name: "Partenariats", href: "#" },
      { name: "Tarifs", href: "#" },
    ],
  },
  {
    title: "Société",
    links: [
      { name: "À propos", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Carrières", href: "#" },
      { name: "Contact", href: "#" },
    ],
  },
  {
    title: "Légal",
    links: [
      { name: "Confidentialité", href: "#" },
      { name: "CGU / CGV", href: "#" },
      { name: "Mentions Légales", href: "#" },
    ],
  },
];

const socialLinks = [
  { icon: <Instagram className="w-5 h-5" />, href: "#", name: "Instagram" },
  { icon: <Twitter className="w-5 h-5" />, href: "#", name: "Twitter" },
  { icon: <Linkedin className="w-5 h-5" />, href: "#", name: "LinkedIn" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background text-foreground border-t border-border pt-20 pb-10 px-6 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
          
          {/* Section Logo & Newsletter */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold tracking-tighter">
                BOOSTER<span className="text-booster-yellow">TALENT</span>
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
                La plateforme nouvelle génération qui connecte les marques visionnaires aux créateurs les plus authentiques.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium">Restez informé</p>
              <div className="flex gap-2 max-w-sm">
                <input 
                  type="email" 
                  placeholder="Votre email" 
                  className="bg-card border border-border rounded-full px-4 py-2 text-sm w-full focus:outline-none focus:border-booster-yellow transition-colors"
                />
                <button className="bg-booster-yellow text-black px-6 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform active:scale-95">
                  OK
                </button>
              </div>
            </div>
          </div>

          {/* Sections de liens */}
          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-widest">{section.title}</h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      className="text-muted-foreground text-sm hover:text-booster-yellow flex items-center group transition-colors"
                    >
                      {link.name}
                      <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Barre inférieure */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-muted-foreground text-xs">
            © {currentYear} Booster Talent. Tous droits réservés.
          </div>

          {/* Réseaux Sociaux */}
          <div className="flex items-center gap-6">
            {socialLinks.map((social) => (
              <motion.a
                key={social.name}
                href={social.href}
                whileHover={{ y: -3 }}
                className="text-muted-foreground hover:text-booster-yellow transition-colors"
                aria-label={social.name}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}