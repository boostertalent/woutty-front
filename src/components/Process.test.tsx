import { render, screen, fireEvent } from '@testing-library/react';
import Component from './Process';

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => (props: any) => <div {...props} />
  }),
  AnimatePresence: ({ children }: any) => children
}));

describe('Process', () => {
  it('renders without crashing and shows essential process elements', () => {
    render(<Component />);

    // Vérifie le titre principal
    expect(
      screen.getByText(/comment ça marche \?/i)
    ).toBeTruthy();

    // Vérifie le badge "Processus" (utilise le premier élément trouvé)
    expect(
      screen.getAllByText(/processus/i)[0]
    ).toBeTruthy();

    // Vérifie les boutons de toggle (ce sont des div, pas des button)
    // Utilise getAllByText pour prendre le premier élément qui est le bouton toggle
    expect(
      screen.getAllByText(/pour les marques/i)[0]
    ).toBeTruthy();
    expect(
      screen.getAllByText(/pour les créateurs/i)[0]
    ).toBeTruthy();

    // Vérifie les étapes pour les marques (par défaut)
    expect(
      screen.getByText(/postez votre brief/i)
    ).toBeTruthy();
    expect(
      screen.getByText(/matching ia/i)
    ).toBeTruthy();
    expect(
      screen.getByText(/validez et lancez/i)
    ).toBeTruthy();
    expect(
      screen.getByText(/recevez vos contenus/i)
    ).toBeTruthy();

    // Vérifie la description
    expect(
      screen.getByText(/un processus simple, fluide et sécurisé/i)
    ).toBeTruthy();
  });

  it('switches to creators tab when clicked', () => {
    render(<Component />);

    // Clique sur le bouton créateurs (ce sont des div, pas des button)
    const creatorsButton = screen.getAllByText(/pour les créateurs/i)[0];
    fireEvent.click(creatorsButton);

    // Vérifie que les étapes de créateurs apparaissent
    expect(
      screen.getByText(/créez votre profil/i)
    ).toBeTruthy();
    expect(
      screen.getByText(/recevez des offres/i)
    ).toBeTruthy();
    expect(
      screen.getByText(/produisez & livrez/i)
    ).toBeTruthy();
    expect(
      screen.getByText(/paiement rapide/i)
    ).toBeTruthy();
  });
});
