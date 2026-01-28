import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPasswordPage from './page';
import { supabase } from '../../../../lib/supabaseClient';

// Mock de Supabase
jest.mock('../../../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: jest.fn(),
    },
  },
}));

// Mock de Framer Motion (nécessaire pour éviter les erreurs d'animation dans l'environnement de test)
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('ForgotPasswordPage - Réinitialisation du mot de passe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche correctement les éléments de base de la page', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText(/Oubli \?/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/votre@email.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Réinitialiser/i })).toBeInTheDocument();
  });

  it('affiche un message de succès après l\'envoi de l\'email', async () => {
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({ error: null });

    render(<ForgotPasswordPage />);
    const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
    const submitBtn = screen.getByRole('button', { name: /Réinitialiser/i });

    // Simulation de la saisie
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitBtn);

    // Vérification de l'appel API
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.objectContaining({
        redirectTo: expect.stringContaining('/auth/reset-password'),
      })
    );

    // Vérification de l'UI
    await waitFor(() => {
      expect(screen.getByText(/Un lien de réinitialisation a été envoyé/i)).toBeInTheDocument();
    });
    
    // Le bouton doit être désactivé en cas de succès
    expect(submitBtn).toBeDisabled();
  });

  it('affiche une erreur si Supabase renvoie une erreur', async () => {
    const errorMessage = "L'adresse email n'existe pas";
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({ 
      error: { message: errorMessage } 
    });

    render(<ForgotPasswordPage />);
    const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
    const submitBtn = screen.getByRole('button', { name: /Réinitialiser/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('affiche le loader pendant le traitement', async () => {
    // On simule une promesse qui ne se résout pas immédiatement
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
    );

    render(<ForgotPasswordPage />);
    const emailInput = screen.getByPlaceholderText(/votre@email.com/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Réinitialiser/i }));

    // On vérifie la présence du loader (SVG animate-spin)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});