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
            data: { role: 'admin' },
            error: null 
          }),
        }),
      }),
    }),
  }),
}));

// --- TESTS ---
describe('BrandsPage', () => {
  it('renders without crashing and shows essential brands elements', async () => {
    render(<Component />);
    
    // On attend que le composant soit prêt
    await waitFor(() => {
      // Titre principal unique à cette page
      expect(screen.getByText('🏢 Gestion des marques')).toBeInTheDocument();
      
      // Boutons spécifiques
      expect(screen.getByText('Créer une marque')).toBeInTheDocument();
      expect(screen.getByText(/Toutes \(\d+\)/)).toBeInTheDocument();
      expect(screen.getByText('⚡ Actives')).toBeInTheDocument();
      expect(screen.getByText('🏆 Top 10')).toBeInTheDocument();
      
      // Message quand aucune marque
      expect(screen.getByText('Aucune marque trouvée')).toBeInTheDocument();
    });
  });
});
