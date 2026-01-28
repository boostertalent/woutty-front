import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';
import { supabase } from '../../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

// Mock de useRouter et de Supabase
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  },
}));

describe('LoginPage - Authentification et Routage', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('affiche les champs email, mot de passe et le bouton de connexion', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText(/thiam.alioune@gmail.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('redirige vers le dashboard admin si le rôle est "admin"', async () => {
    // 1. Mock succès de l'auth
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: { id: 'admin-123' } },
      error: null,
    });

    // 2. Mock récupération du profil admin
    (supabase.single as jest.Mock).mockResolvedValue({
      data: { role: 'admin' },
      error: null,
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText(/thiam.alioune@gmail.com/i), {
      target: { value: 'admin@woutty.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('redirige vers le dashboard creator si le rôle est "creator"', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user-456' } },
      error: null,
    });

    (supabase.single as jest.Mock).mockResolvedValue({
      data: { role: 'creator' },
      error: null,
    });

    render(<LoginPage />);

    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/creators/dashboard');
    });
  });

  it('affiche un message d\'erreur si les identifiants sont invalides', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Email ou mot de passe incorrect' },
    });

    render(<LoginPage />);

    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    await waitFor(() => {
      expect(screen.getByText(/Email ou mot de passe incorrect/i)).toBeInTheDocument();
    });
  });

  it('affiche le loader et désactive le bouton pendant la connexion', async () => {
    // Simulation d'une promesse lente
    (supabase.auth.signInWithPassword as jest.Mock).mockReturnValue(
      new Promise((resolve) => setTimeout(() => resolve({ data: { user: null }, error: null }), 100))
    );

    render(<LoginPage />);
    const submitBtn = screen.getByRole('button', { name: /se connecter/i });
    
    fireEvent.click(submitBtn);

    expect(submitBtn).toBeDisabled();
    expect(screen.getByText(/Vérification.../i)).toBeInTheDocument();
  });
});