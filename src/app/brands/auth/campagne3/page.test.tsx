import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from './page';

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
  ChevronDown: () => <div />,
  AlertCircle: () => <div />,
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

describe('Step3 page (Campagne Step 3)', () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
  });

  it('affiche le titre et les instructions de l\'etape 3', async () => {
    render(<Page />);
    
    expect(await screen.findByText(/créer une campagne/i)).toBeInTheDocument();
    expect(screen.getByText(/Définissez vos critères/i)).toBeInTheDocument();
  });

  it('affiche les formats de contenu disponibles', async () => {
    render(<Page />);
    
    expect(await screen.findByText(/Post Image/i)).toBeInTheDocument();
    expect(screen.getByText(/Vidéo courte/i)).toBeInTheDocument();
    expect(screen.getByText(/Story/i)).toBeInTheDocument();
  });

  it('affiche les tons disponibles', async () => {
    render(<Page />);
    
    expect(await screen.findByText(/Professionnel/i)).toBeInTheDocument();
    expect(screen.getByText(/Amical/i)).toBeInTheDocument();
    expect(screen.getByText(/Humoristique/i)).toBeInTheDocument();
    expect(screen.getByText(/Inspirant/i)).toBeInTheDocument();
  });

  it('affiche l\'input nombre de publications', async () => {
    render(<Page />);
    
    const nbInput = await screen.findByPlaceholderText(/Ex: 3/i);
    expect(nbInput).toBeInTheDocument();
  });

  it('permet de sélectionner un ton via dropdown', async () => {
    render(<Page />);
    
    const tonSelects = screen.getAllByDisplayValue('Choisissez un ton');
    if (tonSelects.length > 0) {
      fireEvent.change(tonSelects[0], { target: { value: 'Professionnel' } });

      await waitFor(() => {
        const saved = localStorage.getItem('campaign_step_3');
        expect(saved).toBeTruthy();
        const data = JSON.parse(saved || '{}');
        expect(data.ton).toBe('Professionnel');
      });
    }
  });

  it('sauvegarde les données dans localStorage', async () => {
    render(<Page />);
    
    const tonSelects = screen.getAllByDisplayValue('Choisissez un ton');
    if (tonSelects.length > 0) {
      fireEvent.change(tonSelects[0], { target: { value: 'Professionnel' } });
    }

    await waitFor(() => {
      const saved = localStorage.getItem('campaign_step_3');
      expect(saved).toBeTruthy();
      const data = JSON.parse(saved || '{}');
      expect(data.ton).toBeDefined();
      expect(data.nbPublications).toBeDefined();
      expect(data.formats).toBeDefined();
    });
  });
});
