import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Page from './page';

// --- MOCK NEXT/NAVIGATION ---
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// --- MOCK NEXT/LINK ---
jest.mock('next/link', () => {
  return ({ children }: { children: React.ReactNode }) => children;
});

// --- MOCK LOCALSTORAGE ---
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// --- MOCK SUPABASE ---
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: 'test-user-id' },
          },
        },
      }),
    },
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ error: null }),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { id_w: 'test-brand-id' },
            error: null
          })
        }))
      }))
    })),
  })),
}));

// --- MOCK ENV VARS ---
beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
});

describe('Step4 page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  it('renders without crashing and displays header and subtitle', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { name: /Créer une campagne/ })).toBeInTheDocument();
    expect(screen.getByText('Définissez votre enveloppe budgétaire')).toBeInTheDocument();
    // budget section title
    expect(screen.getByText('Budget de la campagne')).toBeInTheDocument();
  });

  it('displays navigation buttons', () => {
    render(<Page />);
    expect(screen.getByText('Retour')).toBeInTheDocument();
    expect(screen.getByText(/Lancer le matching IA/)).toBeInTheDocument();
  });
});
