import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import About from './About';

// Mock framer-motion comme dans les tests qui fonctionnent
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => (props: any) => <div {...props} />
  })
}));

describe('About', () => {
  it('renders without crashing and shows essential about elements', () => {
    render(<About />);

    // Vérifie le titre principal de la section
    expect(
      screen.getByText(/c'est quoi woutty \?/i)
    ).toBeInTheDocument();

    // Vérifie le sous-titre "À propos"
    expect(
      screen.getByText(/à propos/i)
    ).toBeInTheDocument();

    // Vérifie les cartes de fonctionnalités principales
    expect(
      screen.getByText(/matching ia/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/gagnez en créant/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/zéro barrière/i)
    ).toBeInTheDocument();

    // Vérifie les descriptions des fonctionnalités
    expect(
      screen.getByText(/notre algorithme analyse l'adn de votre marque/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/monétisez votre contenu authentique/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/aucun minimum d'abonnés requis/i)
    ).toBeInTheDocument();
  });
});
