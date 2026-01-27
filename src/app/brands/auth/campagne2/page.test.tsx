import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Step2 from './page';
import { useRouter } from 'next/navigation';

// Mock de useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Step2 - Audience Cible', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    // Mock scroll pour éviter les erreurs JSDOM
    window.scrollTo = jest.fn();
  });

  it('affiche les éléments initiaux de l\'audience cible', () => {
    render(<Step2 />);
    expect(screen.getByText(/Audience cible/i)).toBeInTheDocument();
    expect(screen.getByText(/Tranche d'âge/i)).toBeInTheDocument();
    expect(screen.getByText('Mode')).toBeInTheDocument();
  });

  it('affiche un message d\'erreur si le formulaire est soumis vide', () => {
    render(<Step2 />);
    const btnContinue = screen.getByRole('button', { name: /Continuer/i });
    
    fireEvent.click(btnContinue);
    
    expect(screen.getByText(/Veuillez remplir tous les champs obligatoires/i)).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('permet de sélectionner et désélectionner des centres d\'intérêt', () => {
    render(<Step2 />);
    const modeBtn = screen.getByRole('button', { name: /Mode/i });
    
    // Sélection
    fireEvent.click(modeBtn);
    expect(modeBtn).toHaveClass('bg-[#D4A017]');
    
    // Désélection
    fireEvent.click(modeBtn);
    expect(modeBtn).not.toHaveClass('bg-[#D4A017]');
  });

  it('affiche les champs "Autre" dynamiquement pour la localisation et les intérêts', () => {
    render(<Step2 />);
    
    // Pays
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Autre' } });
    expect(screen.getByPlaceholderText(/Saisissez une localisation précise/i)).toBeInTheDocument();
    
    // Intérêt
    fireEvent.click(screen.getByRole('button', { name: /Autre/i }));
    expect(screen.getByPlaceholderText(/Précisez votre centre d'intérêt/i)).toBeInTheDocument();
  });

  it('sauvegarde les données et redirige vers l\'étape 3 si le formulaire est valide', () => {
    render(<Step2 />);
    
    // Remplissage valide
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'France' } });
    fireEvent.click(screen.getByRole('button', { name: /Lifestyle/i }));
    
    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }));

    const savedData = JSON.parse(localStorageMock.getItem('campaign_step_2') || '{}');
    expect(savedData.selectedCountry).toBe('France');
    expect(savedData.selectedInterests).toContain('Lifestyle');
    expect(mockPush).toHaveBeenCalledWith('/brands/auth/campagne3');
  });

  it('restaure les données du localStorage au chargement', async () => {
    const mockData = {
      ageRange: { min: 20, max: 40 },
      selectedInterests: ['Tech'],
      selectedCountry: 'Belgique'
    };
    localStorageMock.setItem('campaign_step_2', JSON.stringify(mockData));

    render(<Step2 />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Belgique')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Tech/i })).toHaveClass('bg-[#D4A017]');
      expect(screen.getByText(/20 – 40 ans/i)).toBeInTheDocument();
    });
  });
});