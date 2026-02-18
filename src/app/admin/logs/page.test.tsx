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
describe('LogsPage', () => {
  it('renders without crashing and shows essential logs elements', async () => {
    render(<Component />);
    
    // On attend que le composant soit prêt
    await waitFor(() => {
      // Titre principal unique à cette page
      expect(screen.getByText('📊 Logs d\'activité')).toBeInTheDocument();
      
      // Sous-titre spécifique
      expect(screen.getByText('Suivi des actions des administrateurs')).toBeInTheDocument();
      
      // Bouton spécifique
      expect(screen.getByText('Actualiser')).toBeInTheDocument();
      
      // Message quand aucune activité
      expect(screen.getByText('Aucune activité enregistrée')).toBeInTheDocument();
    });
  });
});
