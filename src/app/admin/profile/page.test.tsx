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
        data: { user: { id: 'test-admin-id', email: 'admin@test.com' } },
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
describe('ProfilePage', () => {
  it('renders without crashing and shows essential profile elements', async () => {
    render(<Component />);
    
    // On attend que le composant soit prêt
    await waitFor(() => {
      // Élément principal unique à cette page
      expect(screen.getByText('👤 Mon profil administrateur')).toBeInTheDocument();
      
      // Note informative spécifique
      expect(screen.getByText(/Ceci est votre profil administrateur/)).toBeInTheDocument();
      
      // Badges spécifiques au profil admin
      expect(screen.getByText('⭐ Administrateur Principal')).toBeInTheDocument();
      expect(screen.getByText('🛡️ Accès complet')).toBeInTheDocument();
      
      // Champs spécifiques du profil
      expect(screen.getByText('Nom complet')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Téléphone')).toBeInTheDocument();
      
      // Bouton spécifique
      expect(screen.getByText('Modifier')).toBeInTheDocument();
    });
  });
});
