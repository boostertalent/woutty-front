import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Step4 from './page';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

// Mocks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ error: null }),
    })),
  })),
}));

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Step4 - Budget et Soumission Finale', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('affiche les options de budget et la devise par défaut (CFA)', () => {
    render(<Step4 />);
    expect(screen.getByText(/Budget de la campagne/i)).toBeInTheDocument();
    expect(screen.getByText(/Min. 15 000 FCFA/i)).toBeInTheDocument();
  });

  it('interdit la saisie de nombres décimaux quand la devise est CFA', () => {
    render(<Step4 />);
    const input = screen.getByPlaceholderText(/Ex: 50000/i) as HTMLInputElement;
    
    // Simuler la saisie de "50.5"
    fireEvent.change(input, { target: { value: '50.5' } });
    
    // La logique handleInputChange doit bloquer la mise à jour si un point est présent en CFA
    expect(input.value).toBe(""); 
  });

  it('met à jour dynamiquement la conversion lors du changement de devise', () => {
    render(<Step4 />);
    const input = screen.getByPlaceholderText(/Ex: 50000/i);
    
    // Entrer 655957 CFA (équivaut à 1000€ environ)
    fireEvent.change(input, { target: { value: '655957' } });
    
    const eurButton = screen.getByText(/Euro \(€\)/i);
    fireEvent.click(eurButton);
    
    // Vérifier que l'input a été converti (655957 / 655.957 = 1000)
    expect(screen.getByDisplayValue('1000.00')).toBeInTheDocument();
  });

  it('affiche une erreur si le budget est inférieur au minimum (15 000 CFA)', () => {
    render(<Step4 />);
    const input = screen.getByPlaceholderText(/Ex: 50000/i);
    fireEvent.change(input, { target: { value: '5000' } });
    
    fireEvent.click(screen.getByText(/Lancer le matching IA !/i));
    
    expect(screen.getByText(/Le budget minimum est de 15 000 FCFA/i)).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('soumet les données combinées des 4 étapes à Supabase avec succès', async () => {
    // Préparer le mock localStorage pour toutes les étapes
    localStorageMock.setItem('campaign_step_1', JSON.stringify({ title: 'Campagne Test', objectives: ['Engagement'], startDate: '2026-01-01' }));
    localStorageMock.setItem('campaign_step_2', JSON.stringify({ ageRange: { min: 18, max: 35 }, selectedCountry: 'Sénégal', selectedInterests: ['Mode'] }));
    localStorageMock.setItem('campaign_step_3', JSON.stringify({ nbPublications: 2, formats: ['Reel', 'Story'], ton: 'Amical' }));

    render(<Step4 />);
    
    const input = screen.getByPlaceholderText(/Ex: 50000/i);
    fireEvent.change(input, { target: { value: '20000' } });

    fireEvent.click(screen.getByText(/Lancer le matching IA !/i));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/brands/dashboard/success');
    });

    // Vérifier que le localStorage a été nettoyé
    expect(localStorageMock.getItem('campaign_step_1')).toBeNull();
  });

  it('affiche un état de chargement pendant la soumission', async () => {
    render(<Step4 />);
    const input = screen.getByPlaceholderText(/Ex: 50000/i);
    fireEvent.change(input, { target: { value: '20000' } });

    fireEvent.click(screen.getByText(/Lancer le matching IA !/i));

    expect(screen.getByText(/Matching en cours.../i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});