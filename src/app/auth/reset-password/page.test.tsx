import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPasswordPage from './page';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(),
}));

describe('ResetPasswordPage', () => {
  const mockReplace = jest.fn();
  const mockUpdateUser = jest.fn();
  const mockSignOut = jest.fn();
  const mockOnAuthStateChange = jest.fn();

  const mockSupabase = {
    auth: {
      getSession: jest.fn(),
      updateUser: mockUpdateUser,
      signOut: mockSignOut,
      onAuthStateChange: mockOnAuthStateChange,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockReplace });
    (createBrowserClient as jest.Mock).mockReturnValue(mockSupabase);
    
    mockOnAuthStateChange.mockReturnValue({
      data: { listener: { subscription: { unsubscribe: jest.fn() } } },
    });
  });

  it('affiche le loader de vérification initialement', () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    render(<ResetPasswordPage />);
    expect(screen.getByText(/Vérification de la session sécurisée/i)).toBeInTheDocument();
  });

  it('affiche le formulaire quand la session est prête', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: { user: {} } } });
    
    render(<ResetPasswordPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Minimum 8 caractères/i)).toBeInTheDocument();
    });
  });

  it('met à jour le mot de passe et redirige en cas de succès', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: { user: {} } } });
    mockUpdateUser.mockResolvedValue({ error: null });

    render(<ResetPasswordPage />);

    // Attendre que le formulaire soit chargé
    const input = await screen.findByPlaceholderText(/Minimum 8 caractères/i);
    const button = screen.getByRole('button', { name: /Confirmer le changement/i });

    fireEvent.change(input, { target: { value: 'newpassword123' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'newpassword123' });
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/auth/login?reset=success');
    });
  });

  it('affiche une erreur si la mise à jour échoue', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: { user: {} } } });
    mockUpdateUser.mockResolvedValue({ error: { message: 'Le mot de passe est trop faible' } });

    render(<ResetPasswordPage />);

    const input = await screen.findByPlaceholderText(/Minimum 8 caractères/i);
    const button = screen.getByRole('button', { name: /Confirmer le changement/i });

    fireEvent.change(input, { target: { value: '123' } });
    fireEvent.click(button);

    expect(await screen.findByText('Le mot de passe est trop faible')).toBeInTheDocument();
  });
});