import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import NicheSelection from './page';

// Mock router Next.js
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('NicheSelection Page', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush
    });
  });

  it('affiche la sélection de niches', () => {
    render(<NicheSelection />);

    expect(screen.getByText('Tes thèmes')).toBeInTheDocument();
    expect(screen.getByText('Sélectionnez vos thématiques')).toBeInTheDocument();
    
    // Vérifie les niches principales
    expect(screen.getByRole('button', { name: 'Mode' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Beauté' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lifestyle' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tech' })).toBeInTheDocument();

    // Vérifie le champ de saisie personnalisé
    expect(screen.getByPlaceholderText('Ex: Jardinage, Yoga...')).toBeInTheDocument();

    // Vérifie le compteur de sélections
    expect(screen.getByText('0 thématique(s) sélectionnée(s)')).toBeInTheDocument();

    // Vérifie les boutons d'action
    expect(screen.getByRole('link', { name: 'Retour' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuer' })).toBeInTheDocument();
  });

  it('permet la sélection de niches et met à jour le compteur', () => {
    render(<NicheSelection />);

    const modeButton = screen.getByRole('button', { name: 'Mode' });
    fireEvent.click(modeButton);

    // Vérifie que la niche est sélectionnée (apparence changée)
    expect(modeButton).toHaveClass('border-[#ceaf4a]', 'bg-[#ceaf4a]', 'text-white');

    // Vérifie le compteur mis à jour
    expect(screen.getByText('1 thématique(s) sélectionnée(s)')).toBeInTheDocument();
  });

  it('active le bouton continuer quand des niches sont sélectionnées', () => {
    render(<NicheSelection />);

    const continueButton = screen.getByRole('button', { name: 'Continuer' });
    expect(continueButton).toBeDisabled();

    // Sélectionner une niche
    const modeButton = screen.getByRole('button', { name: 'Mode' });
    fireEvent.click(modeButton);

    expect(continueButton).not.toBeDisabled();
  });

  it('permet d\'ajouter une niche personnalisée', () => {
    render(<NicheSelection />);

    const customInput = screen.getByPlaceholderText('Ex: Jardinage, Yoga...');
    
    fireEvent.change(customInput, { target: { value: 'Jardinage' } });
    
    // Cliquer sur le bouton plus
    const addButton = screen.getByRole('button');
    fireEvent.click(addButton);

    // Vérifie que la niche personnalisée est ajoutée
    expect(screen.getByText('Jardinage')).toBeInTheDocument();
    expect(customInput).toHaveValue('');
  });

  it('permet d\'ajouter une niche personnalisée avec la touche Entrée', () => {
    render(<NicheSelection />);

    const customInput = screen.getByPlaceholderText('Ex: Jardinage, Yoga...');
    
    fireEvent.change(customInput, { target: { value: 'Yoga' } });
    fireEvent.keyDown(customInput, { key: 'Enter' });

    // Vérifie que la niche personnalisée est ajoutée
    expect(screen.getByText('Yoga')).toBeInTheDocument();
    expect(customInput).toHaveValue('');
  });

  it('permet de désélectionner une niche', () => {
    render(<NicheSelection />);

    const modeButton = screen.getByRole('button', { name: 'Mode' });
    fireEvent.click(modeButton);

    // Vérifie que la niche est sélectionnée
    expect(screen.getByText('1 thématique(s) sélectionnée(s)')).toBeInTheDocument();

    // Cliquer à nouveau pour désélectionner
    fireEvent.click(modeButton);

    // Vérifie que la niche est désélectionnée
    expect(screen.getByText('0 thématique(s) sélectionnée(s)')).toBeInTheDocument();
  });

  it('permet de supprimer une niche avec la croix', () => {
    render(<NicheSelection />);

    const modeButton = screen.getByRole('button', { name: 'Mode' });
    fireEvent.click(modeButton);

    // Trouver et cliquer sur le bouton X dans le tag (aucun label accessible)
    const modeTag = screen.getByText('Mode');
    const removeButton = modeTag.closest('div')?.querySelector('button');
    expect(removeButton).toBeDefined();
    if (removeButton) fireEvent.click(removeButton as HTMLElement);

    // Vérifie que la niche est supprimée
    expect(screen.getByText('0 thématique(s) sélectionnée(s)')).toBeInTheDocument();
  });

  it('sauvegarde les niches et navigue vers l\'étape 3', async () => {
    render(<NicheSelection />);

    // Sélectionner quelques niches
    fireEvent.click(screen.getByRole('button', { name: 'Mode' }));
    fireEvent.click(screen.getByRole('button', { name: 'Beauté' }));

    // Cliquer sur continuer
    const continueButton = screen.getByRole('button', { name: 'Continuer' });
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'signup_niche',
        JSON.stringify(['Mode', 'Beauté'])
      );
      expect(mockPush).toHaveBeenCalledWith('/creators/auth/formulaire/etape3');
    });
  });

  it('empêche la navigation si aucune niche n\'est sélectionnée', () => {
    render(<NicheSelection />);

    const continueButton = screen.getByRole('button', { name: 'Continuer' });
    fireEvent.click(continueButton);

    // Ne devrait pas naviguer
    expect(mockPush).not.toHaveBeenCalled();
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('affiche le lien de retour vers l\'étape 1', () => {
    render(<NicheSelection />);

    const retourLink = screen.getByRole('link', { name: 'Retour' });
    expect(retourLink).toHaveAttribute('href', '/creators/auth/formulaire/etape1');
  });
});
