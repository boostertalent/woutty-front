import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import SocialMediaSelection from './page';

// Mock Supabase
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    auth: {
      signUp: jest.fn()
    },
    storage: {
      from: () => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'test-url' } }))
      })
    },
    from: () => ({
      upsert: jest.fn()
    })
  })
}));

// Mock router Next.js
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('SocialMediaSelection Page', () => {
  const mockPush = jest.fn();
  const mockSignUp = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
    
    // Mock des données localStorage
    localStorageMock.getItem.mockImplementation((key) => {
      const data = {
        'onboarding_email': 'test@example.com',
        'user_full_name': 'Test User',
        'signup_phone': '+221771234567',
        'signup_age': '25',
        'signup_niche': JSON.stringify(['Mode', 'Beauté'])
      };
      return data[key as keyof typeof data] || null;
    });
  });

  it('affiche le formulaire réseaux sociaux et mot de passe', () => {
    render(<SocialMediaSelection />);

    expect(screen.getByText('Vos Réseaux')).toBeInTheDocument();
    expect(screen.getByText('Connectez vos plateformes pour finaliser votre profil')).toBeInTheDocument();
    
    // Vérifie les champs de réseaux sociaux
    expect(screen.getByText('Plateforme')).toBeInTheDocument();
    expect(screen.getByText('Pseudo...')).toBeInTheDocument();
    expect(screen.getByText('+ Ajouter un réseau')).toBeInTheDocument();
    
    // Vérifie la section mot de passe
    expect(screen.getByText('Créer votre mot de passe')).toBeInTheDocument();
    expect(screen.getByText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByText('Confirmation')).toBeInTheDocument();
    
    // Vérifie les boutons d'action
    expect(screen.getByRole('link', { name: 'Retour' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Finaliser mon inscription' })).toBeInTheDocument();
  });

  it('permet de sélectionner une plateforme et de saisir un pseudo', () => {
    render(<SocialMediaSelection />);

    const platformSelect = screen.getByDisplayValue('Choisir...');
    fireEvent.change(platformSelect, { target: { value: 'instagram' } });

    expect(platformSelect).toHaveValue('instagram');

    const handleInput = screen.getByPlaceholderText('nom de profil');
    fireEvent.change(handleInput, { target: { value: 'testuser' } });

    expect(handleInput).toHaveValue('testuser');
  });

  it('permet d\'ajouter et supprimer des réseaux sociaux', () => {
    render(<SocialMediaSelection />);

    // Ajouter un réseau
    const addButton = screen.getByText('+ Ajouter un réseau');
    fireEvent.click(addButton);

    // Devrait avoir deux lignes de réseaux sociaux
    expect(screen.getAllByDisplayValue('Choisir...')).toHaveLength(2);

    // Sélectionner une plateforme pour activer la suppression
    const firstSelect = screen.getAllByDisplayValue('Choisir...')[0];
    fireEvent.change(firstSelect, { target: { value: 'instagram' } });

    // Le bouton de suppression devrait apparaître
    expect(screen.getByRole('button')).toBeInTheDocument(); // Bouton trash
  });

  it('permet de définir un mot de passe et de le confirmer', () => {
    render(<SocialMediaSelection />);

    const passwordInput = screen.getByDisplayValue('');
    const confirmPasswordInput = screen.getAllByDisplayValue('')[1]; // Deuxième input de mot de passe

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    expect(passwordInput).toHaveValue('password123');
    expect(confirmPasswordInput).toHaveValue('password123');
  });

  it('affiche les icônes œil pour montrer/cacher les mots de passe', () => {
    render(<SocialMediaSelection />);

    const eyeButtons = screen.getAllByRole('button');
    expect(eyeButtons.length).toBeGreaterThan(0); // Au moins un bouton œil
  });

  it('valide le formulaire avant soumission', () => {
    render(<SocialMediaSelection />);

    const finishButton = screen.getByRole('button', { name: 'Finaliser mon inscription' });
    expect(finishButton).toBeDisabled();

    // Remplir le formulaire partiellement
    const platformSelect = screen.getByDisplayValue('Choisir...');
    fireEvent.change(platformSelect, { target: { value: 'instagram' } });

    const handleInput = screen.getByPlaceholderText('nom de profil');
    fireEvent.change(handleInput, { target: { value: 'testuser' } });

    // Toujours désactivé car le mot de passe est manquant
    expect(finishButton).toBeDisabled();
  });

  it('active le bouton finaliser quand le formulaire est valide', () => {
    render(<SocialMediaSelection />);

    // Remplir les réseaux sociaux
    const platformSelect = screen.getByDisplayValue('Choisir...');
    fireEvent.change(platformSelect, { target: { value: 'instagram' } });

    const handleInput = screen.getByPlaceholderText('nom de profil');
    fireEvent.change(handleInput, { target: { value: 'testuser' } });

    // Remplir les mots de passe
    const passwordInput = screen.getByDisplayValue('');
    const confirmPasswordInput = screen.getAllByDisplayValue('')[1];

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    const finishButton = screen.getByRole('button', { name: 'Finaliser mon inscription' });
    expect(finishButton).not.toBeDisabled();
  });

  it('affiche le lien de retour vers l\'étape 2', () => {
    render(<SocialMediaSelection />);

    const retourLink = screen.getByRole('link', { name: 'Retour' });
    expect(retourLink).toHaveAttribute('href', '/creators/auth/formulaire/etape2');
  });

  it('gère l\'état de chargement pendant la soumission', async () => {
    // Mock pour simuler un chargement long
    const { createBrowserClient } = require('@supabase/ssr');
    createBrowserClient().auth.signUp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<SocialMediaSelection />);

    // Remplir le formulaire
    const platformSelect = screen.getByDisplayValue('Choisir...');
    fireEvent.change(platformSelect, { target: { value: 'instagram' } });

    const handleInput = screen.getByPlaceholderText('nom de profil');
    fireEvent.change(handleInput, { target: { value: 'testuser' } });

    const passwordInput = screen.getByDisplayValue('');
    const confirmPasswordInput = screen.getAllByDisplayValue('')[1];

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

    // Soumettre
    const finishButton = screen.getByRole('button', { name: 'Finaliser mon inscription' });
    fireEvent.click(finishButton);

    // Vérifier l'état de chargement
    expect(finishButton).toBeDisabled();
  });

  it('affiche les bonnes plateformes disponibles', () => {
    render(<SocialMediaSelection />);

    const platformSelect = screen.getByDisplayValue('Choisir...');
    
    // Vérifier que les options principales sont présentes
    expect(screen.getByText('TikTok')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('Snapchat')).toBeInTheDocument();
    expect(screen.getByText('Twitter / X')).toBeInTheDocument();
    expect(screen.getByText('YouTube')).toBeInTheDocument();
  });
});
