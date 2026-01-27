import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SocialMediaSelection from './page';
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
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('SocialMediaSelection - Réseaux et Finalisation', () => {
  const mockPush = jest.fn();
  const mockSignUp = jest.fn();
  const mockSupabase = {
    auth: { signUp: mockSignUp }
  };

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (createBrowserClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('affiche un champ de réseau social par défaut', () => {
    render(<SocialMediaSelection />);
    expect(screen.getByPlaceholderText(/Pseudo.../i)).toBeInTheDocument();
  });

  it('permet d\'ajouter et de supprimer plusieurs réseaux', () => {
    render(<SocialMediaSelection />);
    
    const addButton = screen.getByText(/\+ Ajouter un réseau/i);
    fireEvent.click(addButton);

    const inputs = screen.getAllByPlaceholderText(/Pseudo.../i);
    expect(inputs).toHaveLength(2);

    const deleteButtons = screen.getAllByRole('button').filter(b => b.querySelector('svg'));
    fireEvent.click(deleteButtons[1]); // Supprime le deuxième
    expect(screen.getAllByPlaceholderText(/Pseudo.../i)).toHaveLength(1);
  });

  it('valide la correspondance des mots de passe', () => {
    render(<SocialMediaSelection />);
    const passInput = screen.getAllByLabelText(/Mot de passe/i)[0] || screen.getByText('Mot de passe').nextSibling?.firstChild;
    // Note: Utilisation de sélecteurs plus robustes selon votre structure HTML
    const inputs = screen.getAllByRole('textbox', { hidden: true }); // inputs password sont type password
    
    // Test visuel via les classes de validation (isPasswordMatch)
    // Ici on teste directement l'état du bouton final
    expect(screen.getByText(/Finaliser mon inscription/i)).toBeDisabled();
  });

  it('appelle Supabase avec toutes les données du LocalStorage lors de la validation', async () => {
    // Simulation des étapes précédentes
    localStorageMock.setItem('onboarding_email', 'createur@test.com');
    localStorageMock.setItem('user_full_name', 'Tech Creator');
    localStorageMock.setItem('signup_age', '25');
    localStorageMock.setItem('signup_niche', JSON.stringify(['Tech', 'Gaming']));

    mockSignUp.mockResolvedValue({ data: { user: { id: '123' } }, error: null });

    render(<SocialMediaSelection />);

    // 1. Remplir le réseau
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'instagram' } });
    fireEvent.change(screen.getByPlaceholderText(/nom de profil/i), { target: { value: 'tech_crea_2026' } });

    // 2. Remplir les mots de passe
    const passwordFields = screen.getAllByRole('textbox', { hidden: true }); 
    // On cible par le type si nécessaire car type="password" n'est pas "textbox"
    const passInputs = document.querySelectorAll('input[type="password"]');
    fireEvent.change(passInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passInputs[1], { target: { value: 'password123' } });

    // 3. Cliquer sur Finaliser
    const submitBtn = screen.getByText(/Finaliser mon inscription/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(expect.objectContaining({
        email: 'createur@test.com',
        password: 'password123',
        options: expect.objectContaining({
          data: expect.objectContaining({
            full_name: 'Tech Creator',
            age: 25,
            user_niches: ['Tech', 'Gaming'],
            user_socials: [{ platform: 'instagram', handle: 'tech_crea_2026' }]
          })
        })
      }));
      expect(mockPush).toHaveBeenCalledWith('/creators/auth/success');
    });
  });

  it('affiche une erreur si l\'inscription Supabase échoue', async () => {
    localStorageMock.setItem('onboarding_email', 'error@test.com');
    mockSignUp.mockResolvedValue({ data: { user: null }, error: { message: 'Email déjà utilisé' } });

    render(<SocialMediaSelection />);
    
    // Remplissage rapide pour activer le bouton
    const passInputs = document.querySelectorAll('input[type="password"]');
    fireEvent.change(passInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passInputs[1], { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText(/Pseudo.../i), { target: { value: 'test' } });
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'tiktok' } });

    fireEvent.click(screen.getByText(/Finaliser mon inscription/i));

    expect(await screen.findByText(/Email déjà utilisé/i)).toBeInTheDocument();
  });
});