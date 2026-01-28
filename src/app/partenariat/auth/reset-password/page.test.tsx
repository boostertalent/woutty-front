import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ResetPasswordPage from './page';
import { supabase } from '../../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      updateUser: jest.fn(),
    },
  },
}));

// Mock Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('ResetPasswordPage - Mise à jour du mot de passe', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    jest.useFakeTimers(); // Pour gérer le setTimeout de redirection
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('affiche les champs de saisie et le bouton', () => {
    render(<ResetPasswordPage />);
    expect(screen.getByLabelText(/Nouveau mot de passe/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmer le mot de passe/i)).toBeInTheDocument();
  });

  it('affiche une erreur si les mots de passe ne correspondent pas', async () => {
    render(<ResetPasswordPage />);
    
    const passInput = screen.getByLabelText(/Nouveau mot de passe/i);
    const confirmInput = screen.getByLabelText(/Confirmer le mot de passe/i);
    const submitBtn = screen.getByRole('button', { name: /Confirmer le changement/i });

    fireEvent.change(passInput, { target: { value: 'NouveauPass123' } });
    fireEvent.change(confirmInput, { target: { value: 'ErreurPass' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Les mots de passe ne correspondent pas/i)).toBeInTheDocument();
    expect(supabase.auth.updateUser).not.toHaveBeenCalled();
  });

  it('met à jour le mot de passe et redirige en cas de succès', async () => {
    (supabase.auth.updateUser as jest.Mock).mockResolvedValue({ error: null });

    render(<ResetPasswordPage />);
    
    fireEvent.change(screen.getByLabelText(/Nouveau mot de passe/i), { target: { value: 'Secret123!' } });
    fireEvent.change(screen.getByLabelText(/Confirmer le mot de passe/i), { target: { value: 'Secret123!' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirmer le changement/i }));

    await waitFor(() => {
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'Secret123!' });
      expect(screen.getByText(/Mot de passe mis à jour/i)).toBeInTheDocument();
    });

    // Avancer le temps pour la redirection
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockPush).toHaveBeenCalledWith('partenariat/auth/login');
  });

  it('bascule la visibilité du mot de passe lors du clic sur l\'œil', () => {
    render(<ResetPasswordPage />);
    const passInput = screen.getByLabelText(/Nouveau mot de passe/i);
    const toggleBtn = screen.getByRole('button', { name: '' }); // Le bouton avec l'icône Eye

    expect(passInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleBtn);
    expect(passInput).toHaveAttribute('type', 'text');
    
    fireEvent.click(toggleBtn);
    expect(passInput).toHaveAttribute('type', 'password');
  });
});