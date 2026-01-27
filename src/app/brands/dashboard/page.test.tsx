import React from 'react';
import { render, screen } from '@testing-library/react';
import BrandDashboard from './page';

// Mock du composant StatCard pour simplifier le test
jest.mock('@/components/dashboard/StatCard', () => ({
  StatCard: ({ title, value, trend }: any) => (
    <div data-testid="stat-card">
      <span>{title}</span>
      <span>{value}</span>
      {trend && <span>{trend}</span>}
    </div>
  ),
}));

// Mock de next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe('BrandDashboard - Vue d\'ensemble', () => {
  
  it('affiche le titre et le sous-titre du dashboard', () => {
    render(<BrandDashboard />);
    expect(screen.getByText('Dashboard Marque')).toBeInTheDocument();
    expect(screen.getByText(/Gérez vos campagnes/i)).toBeInTheDocument();
  });

  it('affiche les 4 cartes de statistiques principales (KPIs)', () => {
    render(<BrandDashboard />);
    const statCards = screen.getAllByTestId('stat-card');
    
    expect(statCards).toHaveLength(4);
    expect(screen.getByText('Budget Total')).toBeInTheDocument();
    expect(screen.getByText('1,250,000 CFA')).toBeInTheDocument();
    expect(screen.getByText('Score IA Moyen')).toBeInTheDocument();
  });

  it('rend la liste des campagnes actives', () => {
    render(<BrandDashboard />);
    // On vérifie la présence des titres de campagnes (mockés par 1 et 2 dans votre map)
    expect(screen.getByText('Campagne Été 2026 #1')).toBeInTheDocument();
    expect(screen.getByText('Campagne Été 2026 #2')).toBeInTheDocument();
    
    const detailsButtons = screen.getAllByText('Détails');
    expect(detailsButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('affiche la section des suggestions IA avec les scores de matching', () => {
    render(<BrandDashboard />);
    expect(screen.getByText('Matchs suggérés (IA)')).toBeInTheDocument();
    
    // Vérification des badges de match (91%, 92%, 93% selon votre boucle)
    expect(screen.getByText('91% MATCH')).toBeInTheDocument();
    expect(screen.getByText('92% MATCH')).toBeInTheDocument();
    expect(screen.getByText('93% MATCH')).toBeInTheDocument();
  });

  it('contient un bouton fonctionnel pour créer une nouvelle campagne', () => {
    render(<BrandDashboard />);
    const createButtonLink = screen.getByRole('link', { name: /Créer une campagne/i });
    
    expect(createButtonLink).toHaveAttribute('href', '/brands/auth/campagne');
  });

  it('est responsive (vérification sommaire des classes grid)', () => {
    const { container } = render(<BrandDashboard />);
    const mainGrid = container.querySelector('.grid-cols-1.lg\\:grid-cols-3');
    
    expect(mainGrid).toBeInTheDocument();
  });
});