import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Component from './page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
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
      insert: jest.fn().mockResolvedValue({ error: null }),
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
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// Mock icônes
jest.mock('lucide-react', () => ({
  Zap: () => <div data-testid="zap-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
  HeadphonesIcon: () => <div data-testid="headphones-icon" />,
  CheckCircle2: () => <div data-testid="check-icon" />,
  ArrowRight: () => <div data-testid="arrow-icon" />,
  Users: () => <div data-testid="users-icon" />,
  MessageCircle: () => <div data-testid="message-icon" />,
  Rocket: () => <div data-testid="rocket-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  X: () => <div data-testid="x-icon" />,
  AlertCircle: () => <div data-testid="alert-icon" />,
  Info: () => <div data-testid="info-icon" />,
}));

describe('CampaignChoice', () => {
  it('renders without crashing and shows essential campaign choice elements', async () => {
    render(<Component />);

    await waitFor(() => {
      // Vérifie le titre principal
      expect(
        screen.getByText(/comment souhaitez-vous créer votre campagne \?/i)
      ).toBeInTheDocument();

      // Vérifie les deux options principales
      expect(
        screen.getByText(/lancer une campagne/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/demander de l'assistance/i)
      ).toBeInTheDocument();

      // Vérifie les descriptions des options
      expect(
        screen.getByText(/interface intuitive avec suggestions ia automatiques/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/accompagnement personnalisé par nos experts/i)
      ).toBeInTheDocument();

      // Vérifie les fonctionnalités mises en avant
      expect(
        screen.getByText(/formulaire guidé pas à pas/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/matching ia instantané/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/expert dédié à votre projet/i)
      ).toBeInTheDocument();

      // Vérifie les boutons d'action
      expect(
        screen.getByRole('link', { name: /commencer/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /demander de l'aide/i })
      ).toBeInTheDocument();

      // Vérifie le lien de retour
      expect(
        screen.getByRole('link', { name: /retour au dashboard/i })
      ).toBeInTheDocument();

      // Vérifie les éléments de rassurance
      expect(
        screen.getByText(/100% sécurisé/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/qualité garantie/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/support 7j\/7/i)
      ).toBeInTheDocument();

      // Vérifie la présence des icônes principales
      expect(screen.getByTestId('rocket-icon')).toBeInTheDocument();
      expect(screen.getByTestId('headphones-icon')).toBeInTheDocument();
      expect(screen.getByTestId('zap-icon')).toBeInTheDocument();
      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    });
  });

  it('opens confirmation modal when assistance is requested', async () => {
    render(<Component />);

    const assistanceButton = screen.getByRole('button', { name: /demander de l'aide/i });
    fireEvent.click(assistanceButton);

    // Vérifie que la modale s'ouvre
    await waitFor(() => {
      expect(
        screen.getByText(/demander de l'assistance \?/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/vous êtes sur le point de demander l'accompagnement/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/ce qui va se passer :/i)
      ).toBeInTheDocument();
    });
  });

  it('shows success message when campaign option is selected', async () => {
    render(<Component />);

    const campaignLink = screen.getByRole('link', { name: /commencer/i });
    expect(campaignLink).toHaveAttribute('href', '/brands/auth/campagne');
  });
});
