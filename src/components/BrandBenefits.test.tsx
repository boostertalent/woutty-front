import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BrandBenefits from './BrandBenefits';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => (props: any) => <div {...props} />
  })
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock icônes lucide-react
jest.mock('lucide-react', () => ({
  Heart: () => <div data-testid="icon" />,
  Target: () => <div data-testid="icon" />,
  Clock: () => <div data-testid="icon" />,
  Scale: () => <div data-testid="icon" />,
  ArrowRight: () => <div data-testid="icon" />,
}));

describe('BrandBenefits', () => {
  it('renders without crashing and shows essential brand benefits elements', () => {
    render(<BrandBenefits />);

    // Vérifie le titre principal
    expect(
      screen.getByText(/boostez votre visibilité avec les talents qui résonnent avec votre audience/i)
    ).toBeInTheDocument();

    // Vérifie le badge "Marques & Entreprises"
    expect(
      screen.getByText(/marques & entreprises/i)
    ).toBeInTheDocument();

    // Vérifie les cartes de bénéfices principaux
    expect(
      screen.getByText(/authenticité maximale/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/matching automatique/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/gain de temps/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/droits inclus/i)
    ).toBeInTheDocument();

    // Vérifie les descriptions des bénéfices
    expect(
      screen.getByText(/l'argent est bloqué en escrow dès que vous êtes sélectionné/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/notre algorithme intelligent connecte votre marque/i)
    ).toBeInTheDocument();

    // Vérifie les boutons d'action
    expect(
      screen.getByRole('link', { name: /lancer ma campagne/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /voir nos marques/i })
    ).toBeInTheDocument();

    // Vérifie qu'au moins une icône est présente
    expect(screen.getAllByTestId('icon').length).toBeGreaterThan(0);
  });
});
