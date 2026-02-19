import { render, screen } from '@testing-library/react';
import Component from './page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-id' } },
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: () => Promise.resolve({ data: { id_w: 'test-id', role: 'admin', full_name: 'Admin', phone: '+221', avatar_url: null }, error: null }) }),
      }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      insert: () => Promise.resolve({ data: null, error: null }),
    }),
  }),
}));

describe('ProfilePage', () => {
  it('renders without crashing and shows essential profile elements', async () => {
    render(<Component />);

    // Vérifier le titre principal par rôle
    const heading = await screen.findByRole('heading', { name: /Mon profil administrateur/ }, { timeout: 3000 });
    expect(heading).toBeInTheDocument();

    // Vérifier les badges essentiels
    expect(screen.getByText('⭐ Administrateur Principal')).toBeInTheDocument();
    expect(screen.getByText('🛡️ Accès complet')).toBeInTheDocument();

    // Vérifier les champs de profil
    expect(screen.getByText('Nom complet')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Téléphone')).toBeInTheDocument();

    // Vérifier le bouton Modifier
    expect(screen.getByText('Modifier')).toBeInTheDocument();
  });
});
