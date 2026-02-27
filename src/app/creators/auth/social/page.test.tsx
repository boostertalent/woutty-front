import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Component from './page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn()
  })
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}));

// Mock Supabase
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => Promise.resolve({
        data: { session: { user: { id: 'test-user-id', email: 'test@example.com' } } }
      }))
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({
          data: [],
          error: null
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }))
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => (props: any) => <div {...props} />
  })
}));

describe('CreatorSocialPage', () => {
  it('renders without crashing and shows essential social media elements', () => {
    render(<Component />);

    // Vérifie le titre principal
    expect(
      screen.getByText(/vos réseaux/i)
    ).toBeInTheDocument();

    // Vérifie la description
    expect(
      screen.getByText(/ajoute tes réseaux sociaux pour booster ta visibilité/i)
    ).toBeInTheDocument();

    // Vérifie les champs principaux des réseaux sociaux
    expect(
      screen.getByPlaceholderText(/https:\/\/instagram\.com\/votreprofil/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/https:\/\/tiktok\.com\/@votreprofil/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/https:\/\/youtube\.com\/votrechaîne/i)
    ).toBeInTheDocument();

    // Vérifie le lien de retour
    expect(
      screen.getByRole('link', { name: /retour/i })
    ).toBeInTheDocument();

    // Vérifie le bouton de continuation
    expect(
      screen.getByRole('button', { name: /continuer/i })
    ).toBeInTheDocument();
  });
});
