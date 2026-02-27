import { render, screen, fireEvent } from '@testing-library/react';
import Component from './page';

// Mock router Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock icônes
jest.mock('lucide-react', () => ({
  Sparkles: () => <div data-testid="sparkles" />,
  X: () => <div data-testid="x-icon" />,
  Plus: () => <div data-testid="plus" />,
  ChevronRight: () => <div data-testid="chevron-right" />,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('NicheSelection', () => {
  beforeEach(() => {
    localStorageMock.setItem.mockClear();
  });

  it('renders without crashing and shows essential niche selection elements', () => {
    render(<Component />);

    // Vérifie le titre principal
    expect(
      screen.getByText(/tes thèmes/i)
    ).toBeInTheDocument();

    // Vérifie la description
    expect(
      screen.getByText(/sélectionnez vos thématiques/i)
    ).toBeInTheDocument();

    // Vérifie les niches principales
    expect(
      screen.getByRole('button', { name: /mode/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /beauté/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /lifestyle/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /tech/i })
    ).toBeInTheDocument();

    // Vérifie le champ de saisie personnalisé
    expect(
      screen.getByPlaceholderText(/ex: jardinage, yoga\.\.\./i)
    ).toBeInTheDocument();

    // Vérifie le compteur de sélections
    expect(
      screen.getByText(/0 thématique\(s\) sélectionnée\(s\)/i)
    ).toBeInTheDocument();

    // Vérifie les boutons d'action
    expect(
      screen.getByRole('link', { name: /retour/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /continuer/i })
    ).toBeInTheDocument();

    // Vérifie la présence des icônes
    expect(screen.getByTestId('sparkles')).toBeInTheDocument();
    expect(screen.getByTestId('chevron-right')).toBeInTheDocument();
  });

  it('allows niche selection and updates counter', () => {
    render(<Component />);

    const modeButton = screen.getByRole('button', { name: /mode/i });
    fireEvent.click(modeButton);

    // Vérifie que la niche est sélectionnée
    expect(modeButton).toHaveClass('border-[#ceaf4a]', 'bg-[#ceaf4a]', 'text-white');

    // Vérifie le compteur mis à jour
    expect(
      screen.getByText(/1 thématique\(s\) sélectionnée\(s\)/i)
    ).toBeInTheDocument();
  });

  it('enables continue button when niches are selected', () => {
    render(<Component />);

    const continueButton = screen.getByRole('button', { name: /continuer/i });
    expect(continueButton).toBeDisabled();

    // Sélectionner une niche
    const modeButton = screen.getByRole('button', { name: /mode/i });
    fireEvent.click(modeButton);

    expect(continueButton).not.toBeDisabled();
  });

  it('allows custom niche addition', () => {
    render(<Component />);

    const customInput = screen.getByPlaceholderText(/ex: jardinage, yoga\.\.\./i);
    const addButton = screen.getByText(/ajouter un réseau/i);

    fireEvent.change(customInput, { target: { value: 'Jardinage' } });
    fireEvent.click(addButton);

    // Vérifie que la niche personnalisée est ajoutée
    expect(
      screen.getByText(/jardinage/i)
    ).toBeTruthy();
    expect(customInput).toHaveValue('');
  });
});
