import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Component from './page';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('next/link', () => {
  return ({ children }: { children: React.ReactNode }) => children;
});

jest.mock('lucide-react', () => ({
  ChevronLeft: () => <div />,
  Loader2: () => <div />,
  Target: () => <div />,
}));

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('CreateCampaign page (Campagne Step 1)', () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
  });

  it('affiche le titre et le formulaire de création', async () => {
    render(<Component />);

    expect(await screen.findByRole('heading', { name: /créer une campagne/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/lancement collection été/i)).toBeInTheDocument();
  });

  it('affiche les objectifs disponibles', async () => {
    render(<Component />);

    expect(await screen.findByRole('button', { name: /notoriété/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /engagement/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /conversion/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ventes/i })).toBeInTheDocument();
  });

  it('le bouton Continuer est désactivé sans données', () => {
    render(<Component />);

    const continueBtn = screen.getByRole('button', { name: /continuer/i });
    expect(continueBtn).toBeDisabled();
  });

  it('valide le formulaire avec titre et objectif', async () => {
    render(<Component />);

    const titleInput = screen.getByPlaceholderText(/lancement collection été/i);
    const notorietyBtn = screen.getByRole('button', { name: /notoriété/i });
    const continueBtn = screen.getByRole('button', { name: /continuer/i });

    fireEvent.change(titleInput, { target: { value: 'Ma campagne' } });
    fireEvent.click(notorietyBtn);
    
    const dateInputs = screen.getAllByDisplayValue('');
    if (dateInputs[0]) fireEvent.change(dateInputs[0], { target: { value: '2024-06-01' } });
    if (dateInputs[1]) fireEvent.change(dateInputs[1], { target: { value: '2024-06-30' } });

    await waitFor(() => {
      expect(continueBtn).not.toBeDisabled();
    });
  });

  it('sauvegarde les données en localStorage', async () => {
    render(<Component />);

    const titleInput = screen.getByPlaceholderText(/lancement collection été/i);
    const notorietyBtn = screen.getByRole('button', { name: /notoriété/i });

    fireEvent.change(titleInput, { target: { value: 'Mon titre' } });
    fireEvent.click(notorietyBtn);

    await waitFor(() => {
      const saved = localStorage.getItem('campaign_step_1');
      expect(saved).toBeTruthy();
      const data = JSON.parse(saved || '{}');
      expect(data.title).toBe('Mon titre');
      expect(data.objectives).toContain('Notoriété');
    });
  });

  it('navigue vers campagne2 au clic sur Continuer', async () => {
    render(<Component />);

    const titleInput = screen.getByPlaceholderText(/lancement collection été/i);
    const notorietyBtn = screen.getByRole('button', { name: /notoriété/i });
    const continueBtn = screen.getByRole('button', { name: /continuer/i });

    fireEvent.change(titleInput, { target: { value: 'Ma campagne' } });
    fireEvent.click(notorietyBtn);
    
    const dateInputs = screen.getAllByDisplayValue('');
    if (dateInputs[0]) fireEvent.change(dateInputs[0], { target: { value: '2024-06-01' } });
    if (dateInputs[1]) fireEvent.change(dateInputs[1], { target: { value: '2024-06-30' } });

    await waitFor(() => {
      expect(continueBtn).not.toBeDisabled();
      fireEvent.click(continueBtn);
    });

    expect(mockPush).toHaveBeenCalledWith('/brands/auth/campagne2');
  });
});
