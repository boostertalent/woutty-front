import { render, screen } from "@testing-library/react";
// Utilitaires de test React

import Component from "./page";
// Page à tester

// --- MOCK NEXT ROUTER ---
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// --- MOCK SUPABASE ---
jest.mock("@supabase/ssr", () => ({
  createBrowserClient: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: "test" } } },
      }),
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: { unsubscribe: jest.fn() },
        },
      })),
      updateUser: jest.fn().mockResolvedValue({ error: null }),
      signOut: jest.fn(),
    },
  }),
}));

// --- MOCK FRAMER MOTION ---
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children }: any) => <div>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// --- MOCK LUCIDE ICONS ---
jest.mock("lucide-react", () => ({
  Lock: () => <div />,
  Loader2: () => <div />,
  CheckCircle2: () => <div />,
  AlertCircle: () => <div />,
  ShieldCheck: () => <div />,
}));

describe("ResetPasswordPage", () => {
  it("renders without crashing", async () => {
    render(<Component />); // Rendu du composant

    // Vérifie qu’un texte clé est présent
    expect(
      await screen.findByText(/Confirmer/i)
    ).toBeInTheDocument();
  });
});
