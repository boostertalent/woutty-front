import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Component from './page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams('campaign=test-campaign'),
}));

// Mock Supabase
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: 'brand-id', email: 'brand@test.com' } } }
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: {
              id_t_campagne: 'test-campaign',
              title: 'Test Campaign',
              budget: '5000',
              interests: ['Mode', 'Beauté'],
            },
            error: null,
          }),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn().mockResolvedValue({
            data: [
              { creator_status: 'pending', status: 'assigned' }
            ],
            error: null,
          }),
        })),
      })),
    })),
  })),
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => (props: any) => <div {...props} />
  }),
}));

// Mock icônes
jest.mock('lucide-react', () => ({
  Sparkles: () => <div data-testid="sparkles-icon" />,
  ArrowRight: () => <div data-testid="arrow-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  CheckCircle2: () => <div data-testid="check-icon" />,
  Instagram: () => <div data-testid="instagram-icon" />,
  Youtube: () => <div data-testid="youtube-icon" />,
  Music2: () => <div data-testid="music-icon" />,
  TrendingUp: () => <div data-testid="trending-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Star: () => <div data-testid="star-icon" />,
  Zap: () => <div data-testid="zap-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

describe('CampaignMatchResults', () => {
  it('renders without crashing and shows essential campaign results elements', async () => {
    render(<Component />);

    await waitFor(() => {
      // Vérifie le titre principal
      expect(
        screen.getByText(/matches parfaits/i)
      ).toBeInTheDocument();

      // Vérifie le sous-titre avec le nom de la campagne
      expect(
        screen.getByText(/pour votre campagne test campaign/i)
      ).toBeInTheDocument();

      // Vérifie la description
      expect(
        screen.getByText(/triés par pertinence grâce à notre ia/i)
      ).toBeInTheDocument();

      // Vérifie l'en-tête du tableau
      expect(
        screen.getByText(/créateurs recommandés/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/cliquez sur "voir & attribuer" pour voir le profil du créateur/i)
      ).toBeInTheDocument();

      // Vérifie les colonnes du tableau
      expect(
        screen.getByText(/créateur/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/plateforme/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/audience/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/match/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/raisons/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/actions/i)
      ).toBeInTheDocument();

      // Vérifie le bouton de retour au dashboard
      expect(
        screen.getByRole('link', { name: /accéder au dashboard/i })
      ).toBeInTheDocument();

      // Vérifie la présence des icônes principales
      expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
      expect(screen.getByTestId('zap-icon')).toBeInTheDocument();
      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    });
  });

  it('displays creator cards with correct information', async () => {
    render(<Component />);

    await waitFor(() => {
      // Vérifie qu'il y a des cartes de créateurs
      const creatorCards = screen.getAllByTestId(/creator-card/);
      expect(creatorCards.length).toBeGreaterThan(0);

      // Vérifie les informations affichées
      expect(
        screen.getByText(/instagram/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/youtube/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/tiktok/i)
      ).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    render(<Component />);

    // Vérifie l'état de chargement
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  it('navigates back to dashboard when no campaign ID', async () => {
    // Mock useSearchParams pour retourner null
    jest.doMock('next/navigation', () => ({
      useRouter: () => ({
        push: jest.fn(),
      }),
      useSearchParams: () => new URLSearchParams(''),
    }));

    render(<Component />);

    // Vérifie que le router a été appelé pour rediriger
    await waitFor(() => {
      expect(require('next/navigation').useRouter().push).toHaveBeenCalledWith('/brands/dashboard');
    });
  });
});
