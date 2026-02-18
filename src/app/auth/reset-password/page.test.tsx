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
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: 'test' } } },
      }),
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: { unsubscribe: jest.fn() },
        },
      })),
      updateUser: jest.fn().mockResolvedValue({ error: null }),
    },
  }),
}));

// Mock icônes
jest.mock('lucide-react', () => ({
  Lock: () => <div />,
  Loader2: () => <div />,
  Eye: () => <div />,
  EyeOff: () => <div />,
  ShieldCheck: () => <div />,
  CheckCircle2: () => <div />,
  AlertCircle: () => <div />,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: any) => <div>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// --- TESTS ---
describe('ResetPasswordPage', () => {
  it('renders without crashing', async () => {
    render(<Component />);
    
    // On attend que le composant soit prêt et on cible le H1
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /nouveau mot de passe/i })
      ).toBeInTheDocument();
    });
  });
});
