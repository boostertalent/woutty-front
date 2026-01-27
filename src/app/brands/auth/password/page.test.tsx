import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BrandFinalStep from './page';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(),
}));

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key) => { delete store[key]; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('BrandFinalStep - Sécurité et Inscription', () => {
  const mockPush = jest.fn();
  const mockSupabase = {
    auth: {
      signUp: jest.fn(),
    },
    from: jest.fn(() => ({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ error: null }),
    })),
  };

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (createBrowserClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('affiche les champs de mot de passe et le bouton désactivé par défaut', () => {
    render(<BrandFinalStep />);
    const button = screen.getByRole('button', { name: /Créer mon compte/i });
    expect(button).toBeDisabled();
  });

  it('valide que les mots de passe sont identiques et font au moins 6 caractères', () => {
    render(<BrandFinalStep />);
    const passInput = screen.getByPlaceholderText(/Créez un mot de passe sécurisé/i);
    const confirmInput = screen.getByPlaceholderText(/Répétez le mot de passe/i);
    const button = screen.getByRole('button', { name: /Créer mon compte/i });

    // Cas : trop court
    fireEvent.change(passInput, { target: { value: '123' } });
    fireEvent.change(confirmInput, { target: { value: '123' } });
    expect(button).toBeDisabled();

    // Cas : différents
    fireEvent.change(passInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password456' } });
    expect(button).toBeDisabled();

    // Cas : OK
    fireEvent.change(confirmInput, { target: { value: 'password123' } });
    expect(button).not.toBeDisabled();
  });

  it('affiche une erreur si les données du localStorage sont manquantes', async () => {
    render(<BrandFinalStep />);
    
    // Remplir les mots de passe pour activer le bouton
    fireEvent.change(screen.getByPlaceholderText(/Créez un mot de passe sécurisé/i), { target: { value: 'valid_pass' } });
    fireEvent.change(screen.getByPlaceholderText(/Répétez le mot de passe/i), { target: { value: 'valid_pass' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Créer mon compte/i }));

    expect(await screen.findByText(/Certaines informations sont manquantes/i)).toBeInTheDocument();
  });

  it('exécute le cycle complet d\'inscription (Auth -> Delete Createur -> Insert Marque)', async () => {
    // Simuler les étapes précédentes
    localStorageMock.setItem('brand_company_email', 'contact@nike.com');
    localStorageMock.setItem('brand_company_name', 'Nike');
    
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: { id: 'user_123' } },
      error: null
    });

    render(<BrandFinalStep />);
    
    fireEvent.change(screen.getByPlaceholderText(/Créez un mot de passe sécurisé/i), { target: { value: 'securepassword' } });
    fireEvent.change(screen.getByPlaceholderText(/Répétez le mot de passe/i), { target: { value: 'securepassword' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Créer mon compte/i }));

    await waitFor(() => {
      // Vérifier l'appel Auth
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith(expect.objectContaining({
        email: 'contact@nike.com',
        password: 'securepassword'
      }));

      // Vérifier le nettoyage de la table créateur (le fix frontend)
      expect(mockSupabase.from).toHaveBeenCalledWith('createur');
      
      // Vérifier l'insertion finale dans marque
      expect(mockSupabase.from).toHaveBeenCalledWith('marque');
      
      // Vérifier le redirect et le nettoyage local
      expect(mockPush).toHaveBeenCalledWith('/brands/auth/success');
    });
  });

  it('permet de basculer la visibilité du mot de passe', () => {
    render(<BrandFinalStep />);
    const passInput = screen.getByPlaceholderText(/Créez un mot de passe sécurisé/i);
    const toggleBtn = screen.getByRole('button', { name: '' }); // Le bouton avec l'icône Eye

    expect(passInput).toHaveAttribute('type', 'password');
    fireEvent.click(toggleBtn);
    expect(passInput).toHaveAttribute('type', 'text');
  });
});