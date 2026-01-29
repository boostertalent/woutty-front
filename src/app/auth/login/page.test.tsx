import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(),
}));

describe('LoginPage', () => {
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();
  const mockSignInWithPassword = jest.fn();
  const mockSignInWithOAuth = jest.fn();

  const mockSupabase = {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signInWithOAuth: mockSignInWithOAuth,
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, refresh: mockRefresh });
    (createBrowserClient as jest.Mock).mockReturnValue(mockSupabase);
    
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost:3000' },
      writable: true,
    });
  });

  it('devrait afficher le formulaire de connexion', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('nom@exemple.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Accéder à mon espace/i })).toBeInTheDocument();
  });

  it('devrait rediriger vers le dashboard créateur si l\'utilisateur est un créateur', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'user_creator' } },
      error: null,
    });

    // Mock de la recherche créateur réussie
    mockSupabase.maybeSingle.mockResolvedValueOnce({ data: { id_w: 'user_creator' }, error: null });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('nom@exemple.com'), { target: { value: 'creator@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Accéder à mon espace/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/creators/dashboard');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('devrait rediriger vers le dashboard marque si l\'utilisateur est une marque', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'user_brand' } },
      error: null,
    });

    // Mock créateur vide, puis marque trouvé
    mockSupabase.maybeSingle
      .mockResolvedValueOnce({ data: null, error: null }) // créateur
      .mockResolvedValueOnce({ data: { id_w: 'user_brand' }, error: null }); // marque

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('nom@exemple.com'), { target: { value: 'brand@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });