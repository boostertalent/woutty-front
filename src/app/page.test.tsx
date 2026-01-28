import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './page';

// On mock les composants enfants pour isoler le test de la page Home
// Cela évite que des erreurs dans "Process" ou "Hero" ne fassent échouer le test de la structure globale
jest.mock('@/components/Navbar', () => () => <nav data-testid="navbar" />);
jest.mock('@/components/Hero', () => () => <section data-testid="hero" />);
jest.mock('@/components/BrandVisual', () => () => <div data-testid="brand-visual" />);
jest.mock('@/components/Process', () => () => <div data-testid="process-comp" />);
jest.mock('@/components/CreatorBenefits', () => () => <div data-testid="creators-comp" />);
jest.mock('@/components/BrandBenefits', () => () => <div data-testid="brands-comp" />);
jest.mock('@/components/PartnershipBenefits', () => () => <div data-testid="partnership-comp" />);
jest.mock('@/components/FAQ', () => () => <div data-testid="faq" />);
jest.mock('@/components/Footer', () => () => <footer data-testid="footer" />);

describe('Home Page - Orchestration de la Landing Page', () => {

  it('doit rendre la structure de base avec le Navbar et le Footer', () => {
    render(<Home />);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('doit contenir toutes les sections de contenu obligatoires', () => {
    render(<Home />);
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('brand-visual')).toBeInTheDocument();
    expect(screen.getByTestId('faq')).toBeInTheDocument();
  });

  it('doit avoir les IDs de section corrects pour la navigation fluide (Anchor Links)', () => {
    const { container } = render(<Home />);
    
    // Vérification des IDs pour le scroll interne
    const processSection = container.querySelector('#process');
    const creatorsSection = container.querySelector('#creators');
    const brandsSection = container.querySelector('#brands');
    const partnershipSection = container.querySelector('#partenariat');

    expect(processSection).toBeInTheDocument();
    expect(creatorsSection).toBeInTheDocument();
    expect(brandsSection).toBeInTheDocument();
    expect(partnershipSection).toBeInTheDocument();
  });

  it('doit appliquer les classes de défilement (scroll-mt-24) pour éviter que le Navbar fixe ne cache le titre', () => {
    const { container } = render(<Home />);
    const sections = container.querySelectorAll('section.scroll-mt-24');
    
    // On s'attend à au moins 4 sections avec cette classe (process, creators, brands, partenariat)
    expect(sections.length).toBeGreaterThanOrEqual(4);
  });

  it('doit inclure la balise main avec les classes de thème et de sélection', () => {
    const { container } = render(<Home />);
    const mainElement = container.querySelector('main');
    
    expect(mainElement).toHaveClass('bg-background');
    expect(mainElement).toHaveClass('selection:bg-booster-yellow');
  });
});