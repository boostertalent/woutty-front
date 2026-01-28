import React from 'react';
import { render, screen } from '@testing-library/react';
import PublicPage from './page';

// Mock de Next/Link pour tester les redirections sans charger le routeur
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('PublicPage - Page d\'accueil Marketplace', () => {
  
  beforeEach(() => {
    render(<PublicPage />);
  });

  describe('Section Hero', () => {
    it('doit afficher le titre principal accrocheur', () => {
      const title = screen.getByText(/La marketplace ultime pour/i);
      const span = screen.getByText(/le contenu UGC/i);
      
      expect(title).toBeInTheDocument();
      expect(span).toHaveClass('text-indigo-600');
    });

    it('doit proposer deux boutons d\'appel à l\'action (CTA) distincts', () => {
      const creatorBtn = screen.getByRole('link', { name: /Je suis Créateur/i });
      const brandBtn = screen.getByRole('link', { name: /Je suis une Marque/i });

      expect(creatorBtn).toHaveAttribute('href', '/public/creators');
      expect(brandBtn).toHaveAttribute('href', '/public/brands');
    });
  });

  describe('Section Avantages', () => {
    it('doit lister les avantages spécifiques aux créateurs', () => {
      expect(screen.getByText(/Pour les Créateurs/i)).toBeInTheDocument();
      expect(screen.getByText(/Gandez les produits reçus/i)).toBeInTheDocument();
      expect(screen.getByText(/Pas besoin de milliers d'abonnés/i)).toBeInTheDocument();
    });

    it('doit lister les avantages spécifiques aux marques', () => {
      expect(screen.getByText(/Pour les Marques/i)).toBeInTheDocument();
      expect(screen.getByText(/Contenus livrés en < 48h/i)).toBeInTheDocument();
      expect(screen.getByText(/Droits d'utilisation inclus/i)).toBeInTheDocument();
    });

    it('doit contenir les liens "En savoir plus" vers les pages dédiées', () => {
      const moreCreatorLink = screen.getByRole('link', { name: /En savoir plus →/i });
      const moreBrandLink = screen.getByRole('link', { name: /Découvrir l'offre →/i });

      expect(moreCreatorLink).toHaveAttribute('href', '/public/creators');
      expect(moreBrandLink).toHaveAttribute('href', '/public/brands');
    });
  });

  describe('Accessibilité et Sémantique', () => {
    it('doit utiliser des balises de titre hiérarchisées (H1, H3)', () => {
      const h1 = screen.getByRole('heading', { level: 1 });
      const h3s = screen.getAllByRole('heading', { level: 3 });

      expect(h1).toBeInTheDocument();
      expect(h3s.length).toBeGreaterThanOrEqual(2);
    });
  });
});