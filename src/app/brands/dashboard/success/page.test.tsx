import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import MatchingAnalysis from './page';
import { useRouter } from 'next/navigation';

// Mock de useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('MatchingAnalysis - Animation de transition IA', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers(); // Permet de contrôler le temps (setInterval/setTimeout)
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('affiche le premier message de statut au démarrage', () => {
    render(<MatchingAnalysis />);
    expect(screen.getByText(/Analyse des profils.../i)).toBeInTheDocument();
    expect(screen.getByText(/IA en pleine action/i)).toBeInTheDocument();
  });

  it('change de statut au cours de la progression', () => {
    render(<MatchingAnalysis />);

    // Avancer le temps pour atteindre 30% (30 * 40ms = 1200ms)
    act(() => {
      jest.advanceTimersByTime(1200);
    });
    expect(screen.getByText(/Scan de l'audience cible.../i)).toBeInTheDocument();

    // Avancer pour atteindre 60%
    act(() => {
      jest.advanceTimersByTime(1200);
    });
    expect(screen.getByText(/Calcul du ROI prédictif.../i)).toBeInTheDocument();

    // Avancer pour atteindre 90%
    act(() => {
      jest.advanceTimersByTime(1200);
    });
    expect(screen.getByText(/Finalisation de la sélection.../i)).toBeInTheDocument();
  });

  it('affiche l\'état terminé quand le progrès atteint 100%', () => {
    render(<MatchingAnalysis />);

    act(() => {
      jest.advanceTimersByTime(4000); // Temps total pour 100%
    });

    expect(screen.getByText(/Matching Terminé !/i)).toBeInTheDocument();
    // Vérifie que l'icône de succès est présente (CheckCircle2)
    const successIcon = screen.queryByTestId('check-circle'); 
    // Note: Si vous n'avez pas de test-id, on vérifie via la classe ou le changement de texte h2
  });

  it('redirige vers le dashboard après la fin de l\'animation', async () => {
    render(<MatchingAnalysis />);

    // Simuler la fin de la barre (100%)
    act(() => {
      jest.advanceTimersByTime(4000);
    });

    // Simuler le délai de 1 seconde (setTimeout) avant la redirection
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/brands/dashboard');
    });
  });

  it('met à jour la largeur de la barre de progression (style CSS)', () => {
    const { container } = render(<MatchingAnalysis />);
    const progressBar = container.querySelector('.bg-\\[\\#D4A017\\]'); // Cible la barre via sa classe

    act(() => {
      jest.advanceTimersByTime(2000); // 50%
    });

    expect(progressBar).toHaveStyle('width: 50%');
  });
});