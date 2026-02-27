import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Component from './Hero';

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

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('Hero', () => {
  it('renders without crashing and shows essential hero elements', () => {
    render(<Component />);

    // Vérifie le titre principal avec les éléments en jaune booster
    expect(
      screen.getByText(/transformez votre/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/créativité/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/revenu/i)
    ).toBeInTheDocument();

    // Vérifie le badge de lancement
    expect(
      screen.getByText(/lancement woutty - 2026/i)
    ).toBeInTheDocument();

    // Vérifie les boutons d'action
    expect(
      screen.getByRole('link', { name: /commencer maintenant/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /comment ça marche \?/i })
    ).toBeInTheDocument();
  });
});
