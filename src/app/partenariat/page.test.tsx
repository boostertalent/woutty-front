import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PartnershipPage from './page';

// Mock de Framer Motion pour éviter les problèmes d'animation dans l'environnement de test
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('PartnershipPage - Landing de Partenariat', () => {
  beforeEach(() => {
    // Reset les mocks avant chaque test
    jest.clearAllMocks();
    global.alert = jest.fn();
  });

  it('affiche les éléments visuels clés et le slogan', () => {
    render(<PartnershipPage />);
    
    expect(screen.getByText(/Grandissons ensemble/i)).toBeInTheDocument();
    expect(screen.getByText(/Espace Partenaires/i)).toBeInTheDocument();
  });

  it('contient les liens de navigation corrects vers l\'authentification', () => {
    render(<PartnershipPage />);
    
    const loginLink = screen.getByRole('link', { name: /Connexion/i });
    const registerLink = screen.getByRole('link', { name: /S'inscrire/i });

    expect(loginLink).toHaveAttribute('href', '/partenariat/auth/login');
    expect(registerLink).toHaveAttribute('href', '/partenariat/auth/register');
  });

  it('vérifie la présence du logo minimaliste', () => {
    render(<PartnershipPage />);
    expect(screen.getByText('W.')).toBeInTheDocument();
  });

  it('est optimisée pour la "selection" textuelle (SEO/UX)', () => {
    const { container } = render(<PartnershipPage />);
    // On vérifie que la classe CSS de sélection personnalisée est présente sur le wrapper principal
    expect(container.firstChild).toHaveClass('selection:bg-black');
  });

  // Test futur si vous activez le formulaire
  it('pourrait gérer une soumission de formulaire (simulation)', () => {
    // Note: Actuellement votre formulaire n'est pas rendu dans le JSX retourné 
    // mais la logique est dans le code. Ce test est prêt pour quand vous afficherez le <form>
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(<PartnershipPage />);
    
    // Si le formulaire était présent :
    // fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'partenaire@test.com' } });
    // fireEvent.click(screen.getByRole('button', { name: /Envoyer/i }));
    // expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("reçue"));
    
    consoleSpy.mockRestore();
  });
});