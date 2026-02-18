import { render, screen, waitFor } from '@testing-library/react';
import Component from './page';

// --- MOCKS ---

// Mock router Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
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
        eq: jest.fn().mockResolvedValue({ 
          data: { role: 'admin', full_name: 'Admin Test' },
          error: null 
        }),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        }),
      }),
    }),
  }),
}));

// --- TESTS ---
describe('AdminsPage', () => {
  it('renders without crashing and shows essential admin management elements', async () => {
    render(<Component />);
    
    // On attend que le composant soit prêt
    await waitFor(() => {
      // Élément principal unique à cette page
      expect(screen.getByText('🛡️ Gestion des admins')).toBeInTheDocument();
      
      // Colonnes spécifiques au tableau d'admins
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Téléphone')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
      
      // Message quand aucun admin trouvé
      expect(screen.getByText('Aucun admin trouvé')).toBeInTheDocument();
    });
  });
});
