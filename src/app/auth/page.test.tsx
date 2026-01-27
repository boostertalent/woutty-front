import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthChoicePage from './page';

describe('AuthChoicePage', () => {
  it('affiche le titre de bienvenue', () => {
    render(<AuthChoicePage />);
    expect(screen.getByText(/Bienvenue sur/i)).toBeInTheDocument();
    expect(screen.getByText(/Woutty !/i)).toBeInTheDocument();
  });

  it('affiche les trois options de profil (Créateur, Marque, Partenariat)', () => {
    render(<AuthChoicePage />);
    
    expect(screen.getByText('Créateur')).toBeInTheDocument();
    expect(screen.getByText('Marque/Entreprise')).toBeInTheDocument();
    expect(screen.getByText('Partenariat')).toBeInTheDocument();
  });

  it('contient les liens de redirection corrects pour chaque profil', () => {
    render(<AuthChoicePage />);
    
    const creatorLink = screen.getByRole('link', { name: /Je suis créateur/i });
    const brandLink = screen.getByRole('link', { name: /Je suis une marque\/Entreprise/i });
    const partnerLink = screen.getByRole('link', { name: /Devenir partenaire/i });

    expect(creatorLink).toHaveAttribute('href', '/creators/auth/profil');
    expect(brandLink).toHaveAttribute('href', '/brands/auth/entreprise');
    expect(partnerLink).toHaveAttribute('href', '/auth/register-partner');
  });

  it('affiche les caractéristiques (features) dans les cartes', () => {
    render(<AuthChoicePage />);
    
    expect(screen.getByText('Accès aux opportunités')).toBeInTheDocument();
    expect(screen.getByText('Lancez vos campagnes')).toBeInTheDocument();
    expect(screen.getByText('Projets exclusifs')).toBeInTheDocument();
  });

  it('affiche le lien vers la page de connexion', () => {
    render(<AuthChoicePage />);
    
    const loginLink = screen.getByRole('link', { name: /Se connecter/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/auth/login');
  });
});