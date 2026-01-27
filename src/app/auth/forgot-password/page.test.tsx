import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPasswordPro from './page';
import { createBrowserClient } from '@supabase/ssr';

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(),
}));

describe('ForgotPasswordPro', () => {
  const mockResetPassword = jest.fn();
  const mockSupabase = {
    auth: {
      resetPasswordForEmail: mockResetPassword,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createBrowserClient as jest.Mock).mockReturnValue(mockSupabase);
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    });
  });

  it('affiche les éléments initiaux du formulaire', () => {
    render(<ForgotPasswordPro />);
    expect(screen.getByPlaceholderText('votre@email.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /envoyer/i })).toBeInTheDocument();
  });

  it('appelle resetPasswordForEmail avec les bonnes données lors de la soumission', async () => {
    mockResetPassword.mockResolvedValueOnce({ error: null });
    render(<ForgotPasswordPro />);

    const emailInput = screen.getByPlaceholderText('votre@email.com');
    const submitButton = screen.getByRole('button', { name: /envoyer/i });

    fireEvent.change(emailInput, { target: { value: 'test@woutty.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('test@woutty.com', {
        redirectTo: 'http://localhost:3000/auth/reset-password',
      });
    });

    expect(await screen.findByText(/Un lien sécurisé a été envoyé/i)).toBeInTheDocument();
  });

  it('affiche un message d’erreur en cas d’échec Supabase', async () => {
    const errorMessage = "L'utilisateur n'existe pas";
    mockResetPassword.mockResolvedValueOnce({ error: { message: errorMessage } });
    
    render(<ForgotPasswordPro />);
    
    fireEvent.change(screen.getByPlaceholderText('votre@email.com'), { target: { value: 'wrong@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /envoyer/i }));

    expect(await screen.findByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('votre@email.com')).not.toBeDisabled();
  });

  it('désactive le champ email et le bouton en cas de succès', async () => {
    mockResetPassword.mockResolvedValueOnce({ error: null });
    render(<ForgotPasswordPro />);

    fireEvent.change(screen.getByPlaceholderText('votre@email.com'), { target: { value: 'test@woutty.com' } });
    fireEvent.click(screen.getByRole('button', { name: /envoyer/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('votre@email.com')).toBeDisabled();
      expect(screen.getByRole('button', { name: /envoyer/i })).toBeDisabled();
    });
  });
});