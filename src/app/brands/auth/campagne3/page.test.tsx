import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Step3 from './page';
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

describe('Step3 - Type de contenu', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    window.scrollTo = jest.fn();
  });

  it('affiche les éléments initiaux du formulaire', () => {
    render(<Step3 />);
    expect(screen.getByText(/Type de contenu/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre de publications/i)).toBeInTheDocument();
    expect(screen.getByText(/Ton par publication/i)).toBeInTheDocument();
  });

  it('génère dynamiquement les sélecteurs de format selon le nombre de publications', () => {
    render(<Step3 />);
    const inputNb = screen.getByLabelText(/Nombre de publications/i);
    
    // Changer à 3 publications
    fireEvent.change(inputNb, { target: { value: '3' } });
    
    expect(screen.getByText('Publication 1')).toBeInTheDocument();
    expect(screen.getByText('Publication 2')).toBeInTheDocument();
    expect(screen.getByText('Publication 3')).toBeInTheDocument();
  });

  it('affiche un message d\'erreur si des formats ne sont pas sélectionnés lors de la soumission', () => {
    render(<Step3 />);
    const btnContinue = screen.getByRole('button', { name: /Continuer/i });
    
    fireEvent.click(btnContinue);
    
    expect(screen.getByText(/Veuillez configurer tous les paramètres de contenu/i)).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('sauvegarde et redirige vers l\'étape 4 si le formulaire est complet', () => {
    render(<Step3 />);
    
    // 1 publication (défaut)
    const formatSelect = screen.getByDisplayValue(/Choisir un format/i);
    fireEvent.change(formatSelect, { target: { value: 'Story' } });
    
    const tonSelect = screen.getByDisplayValue(/Choisissez un ton/i);
    fireEvent.change(tonSelect, { target: { value: 'Humoristique' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Continuer/i }));

    const savedData = JSON.parse(localStorageMock.getItem('campaign_step_3') || '{}');
    expect(savedData.nbPublications).toBe(1);
    expect(savedData.formats).toContain('Story');
    expect(savedData.ton).toBe('Humoristique');
    expect(mockPush).toHaveBeenCalledWith('/brands/auth/campagne4');
  });

  it('restaure les données du localStorage au montage', async () => {
    const mockData = {
      nbPublications: 2,
      formats: ['Reel', 'Post Image'],
      ton: 'Professionnel'
    };
    localStorageMock.setItem('campaign_step_3', JSON.stringify(mockData));

    render(<Step3 />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('2')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Professionnel')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Reel')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Post Image')).toBeInTheDocument();
    });
  });

  it('nettoie les formats si le nombre de publications diminue', () => {
    render(<Step3 />);
    const inputNb = screen.getByLabelText(/Nombre de publications/i);
    
    // Monter à 2, puis descendre à 1
    fireEvent.change(inputNb, { target: { value: '2' } });
    expect(screen.queryByText('Publication 2')).toBeInTheDocument();
    
    fireEvent.change(inputNb, { target: { value: '1' } });
    expect(screen.queryByText('Publication 2')).not.toBeInTheDocument();
  });
});