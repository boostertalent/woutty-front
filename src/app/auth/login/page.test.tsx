import { render, screen } from '@testing-library/react';
// Utilitaires de test React

import Component from './page';
// Page testée

// --- MOCKS ---

// Mock router Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: any) => <a>{children}</a>,
}));

// Mock Supabase
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: { id: '1' } },
        error: null,
      }),
      signInWithOAuth: jest.fn(),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: jest.fn().mockResolvedValue({ data: null }),
        }),
      }),
    }),
  }),
}));

// Mock icônes
jest.mock('lucide-react', () => ({
  Loader2: () => <div />,
  AlertCircle: () => <div />,
  Mail: () => <div />,
  Eye: () => <div />,
  EyeOff: () => <div />,
  ChevronLeft: () => <div />,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: any) => <div>{children}</div>,
  },
}));

// --- TEST ---
describe('LoginPage', () => {
  it('renders without crashing', () => {
    render(<Component />);
    expect(screen.getByText(/Woutty/i)).toBeInTheDocument();
  });
});
