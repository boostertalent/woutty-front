import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NicheSelection from './page';
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

describe('NicheSelection - Sélection des thématiques', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('affiche les thématiques par défaut', () => {
    render(<NicheSelection />);
    expect(screen.getByText('Mode')).toBeInTheDocument();
    expect(screen.getByText('Tech')).toBeInTheDocument();
    expect(screen.getByText('Business')).toBeInTheDocument();
  });

  it('permet de sélectionner et désélectionner une thématique prédéfinie', () => {
    render(<NicheSelection />);
    const nicheBtn = screen.getByText('Mode');

    // Sélection
    fireEvent.click(nicheBtn);
    expect(nicheBtn).toHaveClass('bg-[#ceaf4a]');
    expect(screen.getByText('1 thématique(s) sélectionnée(s)')).toBeInTheDocument();

    // Désélection
    fireEvent.click(nicheBtn);
    expect(nicheBtn).not.toHaveClass('bg-[#ceaf4a]');
    expect(screen.getByText('0 thématique(s) sélectionnée(s)')).toBeInTheDocument();
  });

  it('permet d\'ajouter une thématique personnalisée via le champ de saisie', () => {
    render(<NicheSelection />);
    const input = screen.getByPlaceholderText(/Ex: Jardinage/i);
    
    fireEvent.change(input, { target: { value: 'Yoga' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // Le tag doit apparaître dans la liste des thématiques sélectionnées
    expect(screen.getByText('Yoga')).toBeInTheDocument();
    expect(screen.getByText('1 thématique(s) sélectionnée(s)')).toBeInTheDocument();
  });

  it('permet de supprimer une thématique sélectionnée via la croix (X)', () => {
    render(<NicheSelection />);
    
    // Sélectionner 'Mode'
    fireEvent.click(screen.getByText('Mode'));
    const removeBtn = screen.getByRole('button', { name: '' }); // Cible le bouton X dans le tag
    
    fireEvent.click(removeBtn);
    expect(screen.getByText('0 thématique(s) sélectionnée(s)')).toBeInTheDocument();
  });

  it('sauvegarde les thématiques en JSON et redirige au clic sur Continuer', () => {
    render(<NicheSelection />);
    
    // Sélectionner deux niches
    fireEvent.click(screen.getByText('Mode'));
    fireEvent.click(screen.getByText('Tech'));
    
    const continueBtn = screen.getByRole('button', { name: /Continuer/i });
    fireEvent.click(continueBtn);

    const savedNiches = JSON.parse(localStorageMock.getItem('signup_niche') || '[]');
    expect(savedNiches).toContain('Mode');
    expect(savedNiches).toContain('Tech');
    expect(mockPush).toHaveBeenCalledWith('/creators/auth/social');
  });

  it('désactive le bouton Continuer si aucune thématique n\'est choisie', () => {
    render(<NicheSelection />);
    const continueBtn = screen.getByRole('button', { name: /Continuer/i });
    
    expect(continueBtn).toBeDisabled();
    expect(continueBtn).toHaveClass('bg-gray-200');
  });
});