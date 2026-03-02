import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import CreateCreatorProfile from './page';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('CreateCreatorProfile Page', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('affiche le formulaire d\'inscription créateur', () => {
    render(<CreateCreatorProfile />);
    
    expect(screen.getByText(/Créer votre profil/)).toBeInTheDocument();
    expect(screen.getByText('Ton identité')).toBeInTheDocument();
    expect(screen.getByText('Nom complet')).toBeInTheDocument();
    expect(screen.getByText('Email professionnel')).toBeInTheDocument();
    expect(screen.getByText('Téléphone')).toBeInTheDocument();
    expect(screen.getByText('Âge')).toBeInTheDocument();
  });

  it('affiche le bouton de retour vers auth', () => {
    render(<CreateCreatorProfile />);
    
    const retourLink = screen.getByText('Retour');
    expect(retourLink.closest('a')).toHaveAttribute('href', '/auth');
  });

  it('valide les champs du formulaire', async () => {
    render(<CreateCreatorProfile />);
    
    const continueButton = screen.getByText('Continuer');
    fireEvent.click(continueButton);
    
    await waitFor(() => {
      expect(screen.getByText('Vérifiez vos informations')).toBeInTheDocument();
    });
  });

  it('permet la saisie des informations', () => {
    render(<CreateCreatorProfile />);
    
    const nameInput = screen.getByPlaceholderText('exemple: Fall Thiam');
    const emailInput = screen.getByPlaceholderText('exemple:fallthiam@gmail.com');
    const phoneInput = screen.getByPlaceholderText('+221...');
    const ageInput = screen.getByPlaceholderText('25');
    
    fireEvent.change(nameInput, { target: { value: 'Fall Thiam' } });
    fireEvent.change(emailInput, { target: { value: 'fallthiam@gmail.com' } });
    fireEvent.change(phoneInput, { target: { value: '+221771234567' } });
    fireEvent.change(ageInput, { target: { value: '25' } });
    
    expect(nameInput).toHaveValue('Fall Thiam');
    expect(emailInput).toHaveValue('fallthiam@gmail.com');
    expect(phoneInput).toHaveValue('+221771234567');
    expect(ageInput).toHaveValue('25');
  });

  it('gère l\'upload d\'image', () => {
    render(<CreateCreatorProfile />);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement; // Input file caché
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'signup_avatar_file',
      expect.any(String)
    );
  });

  it('sauvegarde les données et navigue vers l\'étape 2', async () => {
    render(<CreateCreatorProfile />);
    
    // Remplir le formulaire
    fireEvent.change(screen.getByPlaceholderText('exemple: Fall Thiam'), {
      target: { value: 'Fall Thiam' }
    });
    fireEvent.change(screen.getByPlaceholderText('exemple:fallthiam@gmail.com'), {
      target: { value: 'fallthiam@gmail.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('+221...'), {
      target: { value: '+221771234567' }
    });
    fireEvent.change(screen.getByPlaceholderText('25'), {
      target: { value: '25' }
    });
    
    // Cliquer sur continuer
    const continueButton = screen.getByText('Continuer');
    fireEvent.click(continueButton);
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('onboarding_email', 'fallthiam@gmail.com');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('user_full_name', 'Fall Thiam');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('signup_phone', '+221771234567');
      // signup_age may be stored as a number or string depending on implementation; coerce to string for assertion
      const ageCall = localStorageMock.setItem.mock.calls.find(c => c[0] === 'signup_age');
      expect(ageCall).toBeDefined();
      expect(String(ageCall ? ageCall[1] : '')).toBe('25');
      expect(mockPush).toHaveBeenCalledWith('/creators/auth/formulaire/etape2');
    });
  });

  it('charge les données sauvegardées au montage', () => {
    localStorageMock.getItem.mockImplementation((key) => {
      const data = {
        'onboarding_email': 'saved@email.com',
        'user_full_name': 'Saved Name',
        'signup_phone': '+22176543210',
        'signup_age': '30'
      };
      return data[key as keyof typeof data] || null;
    });
    
    render(<CreateCreatorProfile />);
    
    expect(screen.getByDisplayValue('saved@email.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Saved Name')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+22176543210')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
  });
});
