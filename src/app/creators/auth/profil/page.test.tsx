import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateCreatorProfile from './page';
import { useRouter } from 'next/navigation';

// Mock de useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock de FileReader pour le test d'upload d'image
class MockFileReader {
  onloadend: () => void = () => {};
  result: string = 'data:image/png;base64,mock_data';
  readAsDataURL() {
    setTimeout(() => this.onloadend(), 10);
  }
}
(window as any).FileReader = MockFileReader;

describe('CreateCreatorProfile - Identité Créateur', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('affiche tous les champs de saisie vides par défaut', () => {
    render(<CreateCreatorProfile />);
    expect(screen.getByPlaceholderText(/exemple: Fall Thiam/i)).toHaveValue('');
    expect(screen.getByPlaceholderText(/exemple:fallthiam@gmail.com/i)).toHaveValue('');
    expect(screen.getByPlaceholderText(/25/i)).toHaveValue(null);
  });

  it('charge les données depuis le localStorage si elles existent', () => {
    localStorage.setItem('user_full_name', 'Jean Créateur');
    localStorage.setItem('onboarding_email', 'jean@studio.com');
    
    render(<CreateCreatorProfile />);
    
    expect(screen.getByPlaceholderText(/exemple: Fall Thiam/i)).toHaveValue('Jean Créateur');
    expect(screen.getByPlaceholderText(/exemple:fallthiam@gmail.com/i)).toHaveValue('jean@studio.com');
  });

  it('valide le formulaire et affiche une erreur si les champs sont incorrects', () => {
    render(<CreateCreatorProfile />);
    const continueBtn = screen.getByRole('button', { name: /Continuer/i });

    // Clic sans remplir
    fireEvent.click(continueBtn);
    
    expect(screen.getByText(/Vérifiez vos informations/i)).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('empêche la saisie d\'un âge négatif', () => {
    render(<CreateCreatorProfile />);
    const ageInput = screen.getByPlaceholderText(/25/i);

    fireEvent.change(ageInput, { target: { name: 'age', value: '-5' } });
    
    // Le composant a une protection contre les valeurs < 0 dans handleChange
    expect(ageInput).toHaveValue(null);
  });

  it('gère l\'aperçu de l\'image lors de l\'upload', async () => {
    render(<CreateCreatorProfile />);
    const fileInput = screen.getByLabelText('', { selector: 'input[type="file"]' }) as HTMLInputElement;
    const file = new File(['hello'], 'profile.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      const img = screen.getByAltText('Aperçu');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'data:image/png;base64,mock_data');
    });
  });

  it('sauvegarde les données et redirige vers l\'étape niche si tout est valide', async () => {
    render(<CreateCreatorProfile />);
    
    fireEvent.change(screen.getByPlaceholderText(/exemple: Fall Thiam/i), { target: { name: 'fullName', value: 'Alice Smith' } });
    fireEvent.change(screen.getByPlaceholderText(/exemple:fallthiam@gmail.com/i), { target: { name: 'email', value: 'alice@pro.com' } });
    fireEvent.change(screen.getByPlaceholderText(/\+221/i), { target: { name: 'phone', value: '771234567' } });
    fireEvent.change(screen.getByPlaceholderText(/25/i), { target: { name: 'age', value: '28' } });

    const continueBtn = screen.getByRole('button', { name: /Continuer/i });
    fireEvent.click(continueBtn);

    expect(localStorage.getItem('user_full_name')).toBe('Alice Smith');
    expect(localStorage.getItem('onboarding_email')).toBe('alice@pro.com');
    expect(mockPush).toHaveBeenCalledWith('/creators/auth/niche');
  });
});