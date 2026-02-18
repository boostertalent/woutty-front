import { render, screen, waitFor } from '@testing-library/react';
import Component from './page';

// --- MOCKS ---

// Mock router Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock Supabase
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-admin-id' } },
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: jest.fn().mockResolvedValue({ 
            data: { role: 'admin', full_name: 'Admin Test' },
            error: null 
          }),
        }),
      }),
    }),
  }),
}));

// --- TESTS ---
describe('AssistancePage', () => {
  it('renders without crashing and shows essential assistance elements', async () => {
    render(<Component />);
    
    // On attend que le composant soit prêt
    await waitFor(() => {
      // Titre principal unique à cette page
      expect(screen.getByText('Demandes d\'assistance')).toBeInTheDocument();
      
      // Sous-titre spécifique
      expect(screen.getByText('Marques ayant demandé de l\'aide pour créer une campagne')).toBeInTheDocument();
      
      // Filtres spécifiques
      expect(screen.getByText('Toutes (0)')).toBeInTheDocument();
      expect(screen.getByText('En attente')).toBeInTheDocument();
      expect(screen.getByText('En cours')).toBeInTheDocument();
      expect(screen.getByText('Terminées')).toBeInTheDocument();
      
      // Bouton spécifique
      expect(screen.getByText('Actualiser')).toBeInTheDocument();
      
      // Message quand aucune demande
      expect(screen.getByText('Aucune demande d\'assistance')).toBeInTheDocument();
    });
  });
});
