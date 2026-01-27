import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateCampaign from './page';

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

describe('CreateCampaign', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('affiche les éléments initiaux du formulaire', () => {
    render(<CreateCampaign />);
    expect(screen.getByText('Brief de campagne')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Lancement campagne/i)).toBeInTheDocument();
  });

  it('valide le formulaire uniquement lorsque les champs obligatoires sont remplis', () => {
    render(<CreateCampaign />);
    const nextButton = screen.getByText('continuer').closest('a');

    // Initialement invalide (style gray-100)
    expect(nextButton).toHaveClass('bg-gray-100');

    // Remplir le titre
    fireEvent.change(screen.getByPlaceholderText(/Lancement campagne/i), {
      target: { value: 'Ma Super Campagne' }
    });
    expect(nextButton).toHaveClass('bg-gray-100');

    // Cocher un objectif
    fireEvent.click(screen.getByLabelText('Notoriété'));
    
    // Devrait être valide maintenant
    expect(nextButton).toHaveClass('bg-[#D4A017]');
  });

  it('affiche un champ texte supplémentaire quand "Autre" est sélectionné', () => {
    render(<CreateCampaign />);
    
    expect(screen.queryByPlaceholderText(/Précisez votre objectif/i)).not.toBeInTheDocument();
    
    fireEvent.click(screen.getByLabelText('Autre'));
    
    expect(screen.getByPlaceholderText(/Précisez votre objectif/i)).toBeInTheDocument();
  });

  it('sauvegarde les données dans le localStorage lors de la saisie', () => {
    render(<CreateCampaign />);
    
    const titleInput = screen.getByPlaceholderText(/Lancement campagne/i);
    fireEvent.change(titleInput, { target: { value: 'Test Storage' } });

    const savedData = JSON.parse(localStorageMock.getItem('campaign_step_1') || '{}');
    expect(savedData.title).toBe('Test Storage');
  });

  it('restaure les données du localStorage au montage', () => {
    const mockData = {
      title: 'Campagne Restaurée',
      objectives: ['Engagement'],
      customObjective: '',
      startDate: '2026-06-01',
      endDate: '2026-06-30'
    };
    localStorageMock.setItem('campaign_step_1', JSON.stringify(mockData));

    render(<CreateCampaign />);

    expect(screen.getByDisplayValue('Campagne Restaurée')).toBeInTheDocument();
    expect(screen.getByLabelText('Engagement')).toBeChecked();
  });

  it('empêche la navigation si le formulaire est invalide', () => {
    render(<CreateCampaign />);
    const nextLink = screen.getByText('continuer');
    
    fireEvent.click(nextLink);
    
    // Le href doit être "#" tant que c'est invalide
    expect(nextLink.closest('a')).toHaveAttribute('href', '#');
  });
});