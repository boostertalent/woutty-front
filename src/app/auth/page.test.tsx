import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Component from './page';

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock icônes
jest.mock('lucide-react', () => ({
  Users: () => <div data-testid="users-icon" />,
  Building2: () => <div data-testid="building-icon" />,
  Handshake: () => <div data-testid="handshake-icon" />,
  ArrowRight: () => <div data-testid="arrow-right" />,
}));

describe('AuthChoicePage', () => {
  it('renders without crashing and shows essential auth choice elements', () => {
    render(<Component />);

    // Vérifie le titre principal
    expect(
      screen.getByText(/bienvenue sur/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/woutty/i)
    ).toBeInTheDocument();

    // Vérifie la description
    expect(
      screen.getByText(/choisissez votre profil pour commencer/i)
    ).toBeInTheDocument();

    // Vérifie les cartes de choix
    expect(
      screen.getByText(/créateur/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/vous créez du contenu sur les réseaux/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/marque\/entreprise/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/vous cherchez des créateurs/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/partenariat/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/développez l'écosystème/i)
    ).toBeInTheDocument();

    // Vérifie les fonctionnalités
    expect(
      screen.getByText(/accès aux opportunités/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/trouvez les profils parfaits/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/projets exclusifs/i)
    ).toBeInTheDocument();

    // Vérifie les boutons d'action
    expect(
      screen.getByRole('link', { name: /je suis créateur/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /je suis une marque\/entreprise/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /devenir partenaire/i })
    ).toBeInTheDocument();

    // Vérifie le lien de connexion
    expect(
      screen.getByText(/déjà inscrit \?/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /se connecter/i })
    ).toBeInTheDocument();

    // Vérifie la présence des icônes
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    expect(screen.getByTestId('building-icon')).toBeInTheDocument();
    expect(screen.getByTestId('handshake-icon')).toBeInTheDocument();
  });
});
