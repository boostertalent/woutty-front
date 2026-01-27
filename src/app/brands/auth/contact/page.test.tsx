import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactPrincipal from './page';
import { useRouter } from 'next/navigation';

// Mock de useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('ContactPrincipal - Informations de contact', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    useRouter.mockReturnValue({ push: mockPush });
  });

  it('affiche correctement les champs de saisie', () => {
    render(<ContactPrincipal />);
    expect(screen.getByLabelText(/Nom complet \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email professionnel \*/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Responsable Marketing/i)).toBeInTheDocument();
  });

  it('le bouton continuer est désactivé si les champs obligatoires sont vides', () => {
    render(<ContactPrincipal />);
    const button = screen.getByRole('button', { name: /Continuer/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('bg-gray-200');
  });

  it('active le bouton quand le nom et l\'email sont remplis', () => {
    render(<ContactPrincipal />);
    
    fireEvent.change(screen.getByLabelText(/Nom complet \*/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email professionnel \*/i), { target: { value: 'john@doe.com' } });
    
    const button = screen.getByRole('button', { name: /Continuer/i });
    expect(button).not.toBeDisabled();
    expect(button).toHaveClass('bg-[#ceaf4a]');
  });

  it('sauvegarde les données dans le localStorage et redirige au clic', async () => {
    render(<ContactPrincipal />);
    
    fireEvent.change(screen.getByLabelText(/Nom complet \*/i), { target: { value: 'Jane Smith' } });
    fireEvent.change(screen.getByLabelText(/Fonction/i), { target: { value: 'CEO' } });
    fireEvent.change(screen.getByLabelText(/Email professionnel \*/i), { target: { value: 'jane@smith.com' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }));

    expect(localStorageMock.getItem('brand_contact_fullname')).toBe('Jane Smith');
    expect(localStorageMock.getItem('brand_contact_function')).toBe('CEO');
    expect(localStorageMock.getItem('brand_contact_professional_email')).toBe('jane@smith.com');
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/brands/auth/password');
    });
  });

  it('restaure les données depuis le localStorage au chargement du composant', () => {
    localStorageMock.setItem('brand_contact_fullname', 'Alice Liddell');
    localStorageMock.setItem('brand_contact_professional_email', 'alice@wonderland.com');

    render(<ContactPrincipal />);

    expect(screen.getByDisplayValue('Alice Liddell')).toBeInTheDocument();
    expect(screen.getByDisplayValue('alice@wonderland.com')).toBeInTheDocument();
  });

  it('affiche un état de chargement lors de la soumission', async () => {
    render(<ContactPrincipal />);
    
    fireEvent.change(screen.getByLabelText(/Nom complet \*/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Email professionnel \*/i), { target: { value: 'test@user.com' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }));

    // Note : Le chargement est très rapide ici car synchrone dans le mock, 
    // mais on vérifie la présence du spinner ou de l'état désactivé
    expect(screen.getByRole('button')).toBeDisabled();
  });
});