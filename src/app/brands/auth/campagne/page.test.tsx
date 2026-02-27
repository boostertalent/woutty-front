import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Component from './page';

// Mock du router Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => (props: any) => <div {...props} />
  }),
  AnimatePresence: ({ children }: any) => children
}));

// Mock icônes
jest.mock('lucide-react', () => ({
  ChevronLeft: () => <div />,
  Loader2: () => <div />,
}));

describe('CreateCampaign page', () => {
  it('renders without crashing and shows essential campaign creation elements', async () => {
    render(<Component />);

    await waitFor(() => {
      // Vérifie le titre principal de la page
      expect(
        screen.getByRole('heading', { name: /créer une campagne/i })
      ).toBeTruthy();
    });

    // Vérifie les champs principaux du formulaire
    expect(
      screen.getByPlaceholderText(/lancement collection été/i)
    ).toBeTruthy();

    // Vérifie les boutons d'action principaux
    expect(
      screen.getByRole('button', { name: /continuer/i })
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /notoriété/i })
    ).toBeTruthy();
  });
});
