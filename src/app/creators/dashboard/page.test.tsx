import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreatorDashboard from './page';
import { createClient } from '@supabase/supabase-js';

// Mock de Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

// Mock du composant StatCard
jest.mock('@/components/dashboard/StatCard', () => ({
  StatCard: ({ title, value }: any) => (
    <div data-testid="stat-card">
      <p>{title}</p>
      <p>{value}</p>
    </div>
  ),
}));

describe('CreatorDashboard - Studio d\'Analyse et Business', () => {
  const mockProfile = {
    id_w: 'votre-uuid-test',
    nom_complet: 'Fall Thiam',
    nom_plateforme: 'Instagram',
    nbre_followers: 150000,
    nbre_poste: 42,
    url_photo_profile: 'https://avatar.url'
  };

  const mockPosts = [
    { id_w: 'p1', titre_poste: 'Post Test 1', nbre_like: 100, nbre_vue: 1000, type_poste: 'Reel' },
    { id_w: 'p2', titre_poste: 'Post Test 2', nbre_like: 200, nbre_vue: 2000, type_poste: 'Photo' }
  ];

  const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    
    // Configuration des réponses Supabase
    mockSupabase.single.mockResolvedValue({ data: mockProfile, error: null });
    mockSupabase.limit.mockResolvedValue({ data: mockPosts, error: null });
  });

  it('affiche l\'état de chargement initialement', () => {
    render(<CreatorDashboard />);
    expect(screen.getByText(/Chargement du studio/i)).toBeInTheDocument();
  });

  it('charge et affiche les données du profil et des stats', async () => {
    render(<CreatorDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Fall Thiam')).toBeInTheDocument();
      expect(screen.getByText('150 000')).toBeInTheDocument(); // nbre_followers formaté
    });
  });

  it('navigue entre les différentes sections via le menu latéral', async () => {
    render(<CreatorDashboard />);
    await waitFor(() => screen.getByText('Analytics Studio'));

    // Aller sur Opportunités
    const oppBtn = screen.getByText('Opportunités');
    fireEvent.click(oppBtn);
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.getByText('Lancement Cosmétique Bio')).toBeInTheDocument();

    // Aller sur Mes Campagnes
    const campBtn = screen.getByText('Mes Campagnes');
    fireEvent.click(campBtn);
    expect(screen.getByText('Suivi Contrats')).toBeInTheDocument();
    expect(screen.getByText('Partenariat Tech 2026')).toBeInTheDocument();
  });

  it('calcule correctement la moyenne des likes sur les posts', async () => {
    render(<CreatorDashboard />);
    
    await waitFor(() => {
      // (100 + 200) / 2 = 150
      expect(screen.getByText('150')).toBeInTheDocument();
    });
  });

  it('affiche les PostCards avec les bonnes informations de performance', async () => {
    render(<CreatorDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Post Test 1')).toBeInTheDocument();
      expect(screen.getByText('Post Test 2')).toBeInTheDocument();
      expect(screen.getAllByText('1 000')).toHaveLength(1); // Vues du post 1
    });
  });

  it('gère les erreurs de récupération Supabase gracieusement', async () => {
    console.error = jest.fn(); // Mock console.error
    mockSupabase.single.mockResolvedValue({ data: null, error: { message: 'DB Error' } });

    render(<CreatorDashboard />);
    
    await waitFor(() => {
      expect(loadingFinished()).toBe(true);
    });
  });
});

// Helper pour vérifier la fin du chargement
const loadingFinished = () => !screen.queryByText(/Chargement du studio/i);