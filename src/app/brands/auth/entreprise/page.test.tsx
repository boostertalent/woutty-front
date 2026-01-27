import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EntrepriseDetails from './page';
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

describe('EntrepriseDetails - Informations Marque', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    useRouter.mockReturnValue({ push: mockPush });
  });

  it('affiche tous les champs du formulaire', () => {
    render(<EntrepriseDetails />);
    expect(screen.getByLabelText(/Nom Marque\/Entreprise\*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tel \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Marque\/Entreprise\*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Domaine \*/i)).toBeInTheDocument();
  });

  it('désactive le bouton si le formulaire est incomplet', () => {
    render(<EntrepriseDetails />);
    const button = screen.getByRole('button', { name: /Continuer/i });
    expect(button).toBeDisabled();
  });

  it('affiche un champ supplémentaire quand "Autre" est sélectionné comme domaine', () => {
    render(<EntrepriseDetails />);
    const select = screen.getByLabelText(/Domaine \*/i);
    
    fireEvent.change(select, { target: { value: 'Autre' } });
    
    expect(screen.getByLabelText(/Précisez votre domaine \*/i)).toBeInTheDocument();
  });

  it('sauvegarde les données et redirige vers l\'étape contact', async () => {
    render(<EntrepriseDetails />);
    
    fireEvent.change(screen.getByLabelText(/Nom Marque\/Entreprise\*/i), { target: { value: 'Test Corp' } });
    fireEvent.change(screen.getByLabelText(/Tel \*/i), { target: { value: '0123456789' } });
    fireEvent.change(screen.getByLabelText(/Email Marque\/Entreprise\*/i), { target: { value: 'corp@test.com' } });
    fireEvent.change(screen.getByLabelText(/Domaine \*/i), { target: { value: 'Immobilier' } });
    
    const button = screen.getByRole('button', { name: /Continuer/i });
    fireEvent.click(button);

    expect(localStorageMock.getItem('brand_company_name')).toBe('Test Corp');
    expect(localStorageMock.getItem('brand_domain')).toBe('Immobilier');
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/brands/auth/contact');
    });
  });

  it('utilise le domaine personnalisé si "Autre" est choisi', async () => {
    render(<EntrepriseDetails />);
    
    fireEvent.change(screen.getByLabelText(/Nom Marque\/Entreprise\*/i), { target: { value: 'Art Studio' } });
    fireEvent.change(screen.getByLabelText(/Tel \*/i), { target: { value: '0123456789' } });
    fireEvent.change(screen.getByLabelText(/Email Marque\/Entreprise\*/i), { target: { value: 'art@studio.com' } });
    fireEvent.change(screen.getByLabelText(/Domaine \*/i), { target: { value: 'Autre' } });
    
    const customInput = screen.getByLabelText(/Précisez votre domaine \*/i);
    fireEvent.change(customInput, { target: { value: 'Sculpture' } });

    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }));

    expect(localStorageMock.getItem('brand_domain')).toBe('Sculpture');
  });
});