import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from './page';
import { supabase } from '../../../../lib/supabaseClient';
import { useRouter } from 'next/navigation';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    upsert: jest.fn(),
  },
}));

describe('RegisterPage - Inscription Utilisateur', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    // Mock global de l'alerte
    global.alert = jest.fn();
  });

  it('affiche tous les champs du formulaire', () => {
    render(<RegisterPage />);
    expect(screen.getByPlaceholderText(/Thiam Alioune/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/thiam.alioune@gmail.com/i)).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/••••••••/i)).toHaveLength(2);
  });

  it('valide que les mots de passe doivent correspondre pour activer le bouton', () => {
    render(<RegisterPage />);
    const passInput = screen.getAllByPlaceholderText(/••••••••/i)[0];
    const confirmInput = screen.getAllByPlaceholderText(/••••••••/i)[1];
    const submitBtn = screen.getByRole('button', { name: /Créer mon compte/i });

    fireEvent.change(passInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmInput, { target: { value: 'DifferentPass' } });

    expect(submitBtn).toBeDisabled();
    expect(screen.getByText(/Les mots de passe ne correspondent pas/i)).toBeInTheDocument();
  });

  it('effectue l\'inscription Auth et l\'insertion Profil avec succès', async () => {
    const mockUser = { id: 'new-user-uuid', email: 'test@woutty.com' };
    
    // Mock Auth SignUp
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock Profile Upsert
    (supabase.upsert as jest.Mock).mockResolvedValue({ error: null });

    render(<RegisterPage />);

    // Remplissage du formulaire
    fireEvent.change(screen.getByPlaceholderText(/Thiam Alioune/i), { target: { value: 'Alioune' } });
    fireEvent.change(screen.getByPlaceholderText(/thiam.alioune@gmail.com/i), { target: { value: 'test@woutty.com' } });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[0], { target: { value: 'Woutty2026' } });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[1], { target: { value: 'Woutty2026' } });

    fireEvent.click(screen.getByRole('button', { name: /Créer mon compte/i }));

    await waitFor(() => {
      // Vérifie l'appel Auth
      expect(supabase.auth.signUp).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@woutty.com',
        password: 'Woutty2026'
      }));
      
      // Vérifie l'appel Profil (Upsert)
      expect(supabase.upsert).toHaveBeenCalledWith(expect.objectContaining({
        id: 'new-user-uuid',
        role: 'creator'
      }));

      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining("succès"));
      expect(mockPush).toHaveBeenCalledWith('partenariat/auth/login');
    });
  });

  it('affiche une erreur si l\'inscription Auth échoue', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: "Cet utilisateur existe déjà" },
    });

    render(<RegisterPage />);
    
    // On remplit pour débloquer le bouton
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[0], { target: { value: 'Pass123' } });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[1], { target: { value: 'Pass123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Créer mon compte/i }));

    await waitFor(() => {
      expect(screen.getByText(/Cet utilisateur existe déjà/i)).toBeInTheDocument();
    });
  });
});