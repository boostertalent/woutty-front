import React from 'react';
import { render, screen } from '@testing-library/react';
import PublicLayout from './layout';

// Mock du composant Link de Next.js pour éviter les erreurs de navigation
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('PublicLayout - Squelette de l\'application', () => {
  
  it('doit rendre le contenu enfant (children) à l\'intérieur du main', () => {
    render(
      <PublicLayout>
        <div data-testid="test-child">Contenu de la page</div>
      </PublicLayout>
    );

    const child = screen.getByTestId('test-child');
    expect(child).toBeInTheDocument();
    expect(child.textContent).toBe('Contenu de la page');
  });

  it('doit afficher le nom de la plateforme dans le header', () => {
    render(<PublicLayout><div></div></PublicLayout>);
    expect(screen.getByText(/UGC Platform/i)).toBeInTheDocument();
  });

  it('doit contenir les liens de navigation principaux', () => {
    render(<PublicLayout><div></div></PublicLayout>);
    
    expect(screen.getByRole('link', { name: /Pour les Créateurs/i })).toHaveAttribute('href', '/public/creators');
    expect(screen.getByRole('link', { name: /Pour les Marques/i })).toHaveAttribute('href', '/public/brands');
    expect(screen.getByRole('link', { name: /Campagnes/i })).toHaveAttribute('href', '/public/campaigns');
  });

  it('doit afficher les boutons d\'authentification avec les bons liens', () => {
    render(<PublicLayout><div></div></PublicLayout>);
    
    expect(screen.getByRole('link', { name: /Se connecter/i })).toHaveAttribute('href', '/auth/login');
    expect(screen.getByRole('link', { name: /S'inscrire/i })).toHaveAttribute('href', '/auth/register');
  });

  it('doit afficher l\'année en cours dans le footer', () => {
    render(<PublicLayout><div></div></PublicLayout>);
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
  });

  it('vérifie que le header est "sticky"', () => {
    render(<PublicLayout><div></div></PublicLayout>);
    const header = screen.getByRole('banner'); // <header> par défaut
    expect(header).toHaveClass('sticky');
    expect(header).toHaveClass('top-0');
  });
});