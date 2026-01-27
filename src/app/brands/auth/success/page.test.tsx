import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import RegistrationSuccess from './page';

// Mock de framer-motion pour éviter les problèmes liés aux animations dans l'environnement de test
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock de next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

describe('RegistrationSuccess - Page de confirmation', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; }
    };
  })();

  Object.defineProperty(window, 'localStorage', { value: localStorageMock });

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('affiche l\'email de l\'utilisateur récupéré depuis le localStorage', () => {
    localStorageMock.setItem('signup_email', 'test@woutty.com');
    
    render(<RegistrationSuccess />);
    
    expect(screen.getByText('test@woutty.com')).toBeInTheDocument();
    expect(screen.getByText(/Inscription/i)).toBeInTheDocument();
    expect(screen.getByText(/réussie !/i)).toBeInTheDocument();
  });

  it('affiche un texte par défaut si l\'email est absent du localStorage', () => {
    render(<RegistrationSuccess />);
    
    expect(screen.getByText('votre adresse email')).toBeInTheDocument();
  });

  it('nettoie les données sensibles du localStorage lors du démontage du composant (unmount)', () => {
    localStorageMock.setItem('signup_email', 'test@woutty.com');
    localStorageMock.setItem('signup_name', 'John Doe');
    localStorageMock.setItem('signup_niche', 'Lifestyle');

    const { unmount } = render(<RegistrationSuccess />);
    
    // On démonte le composant pour déclencher la fonction de nettoyage du useEffect
    unmount();

    expect(localStorageMock.getItem('signup_email')).toBeNull();
    expect(localStorageMock.getItem('signup_name')).toBeNull();
    expect(localStorageMock.getItem('signup_niche')).toBeNull();
  });

  it('contient les liens de navigation essentiels', () => {
    render(<RegistrationSuccess />);
    
    const loginLink = screen.getByRole('link', { name: /Aller à la connexion/i });
    const homeLink = screen.getByRole('link', { name: /Retour à l'accueil/i });

    expect(loginLink).toHaveAttribute('href', '/auth/login');
    expect(homeLink).toHaveAttribute('href', '/');
  });
});