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
describe('CreatorsPage', () => {
  it('renders without crashing and shows essential creators elements', async () => {
    render(<Component />);
    
    // On attend que le composant soit prêt
    await waitFor(() => {
      // Titre principal unique à cette page
      expect(screen.getByText('👥 Gestion des créateurs')).toBeInTheDocument();
      
      // Boutons spécifiques
      expect(screen.getByText('Créer un créateur')).toBeInTheDocument();
      expect(screen.getByText(/Tous \(\d+\)/)).toBeInTheDocument();
      expect(screen.getByText('⚡ Actifs')).toBeInTheDocument();
      expect(screen.getByText('🏆 Top 10')).toBeInTheDocument();
      
      // Message quand aucun créateur
      expect(screen.getByText('Aucun créateur trouvé')).toBeInTheDocument();
    });
  });
});
