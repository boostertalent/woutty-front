import { render, screen } from '@testing-library/react';
// Utilitaires de test React

import Component from './page';
// Import de la page testée

// --- MOCKS NÉCESSAIRES ---

// Mock des icônes lucide-react
jest.mock('lucide-react', () => ({
  Mail: () => <div />,
  Loader2: () => <div />,
  X: () => <div />,
  AlertCircle: () => <div />,
  CheckCircle2: () => <div />,
}));

// Mock framer-motion (évite erreurs d’animation)
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: any) => <div>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// Mock Supabase
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    auth: {
      resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
    },
  }),
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: any) => <a>{children}</a>,
}));

// --- TEST ---
describe('ForgotPasswordPro page', () => {
  it('renders without crashing', () => {
    render(<Component />); // Rendu du composant
    expect(
      screen.getByText(/Récupération/i)
    ).toBeInTheDocument(); // Vérifie que la page est bien montée
  });
});
