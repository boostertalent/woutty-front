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
  ChevronDown: () => <div />,
  ChevronLeft: () => <div />,
  AlertCircle: () => <div />,
  Shirt: () => <div />,
  Monitor: () => <div />,
  Heart: () => <div />,
  Utensils: () => <div />,
  Trophy: () => <div />,
  Sparkles: () => <div />,
  Plane: () => <div />,
  Plus: () => <div />,
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

describe('Step2 page (Campagne Step 2)', () => {
  beforeEach(() => {
    localStorage.clear();
    mockPush.mockClear();
  });

  it('affiche le titre de l\'etape 2', async () => {
    render(<Page />);
    expect(await screen.findByText(/créer une campagne/i)).toBeInTheDocument();
  });

  it('affiche les intérêts disponibles', async () => {
    render(<Page />);
    await screen.findByText(/créer une campagne/i);

    expect(screen.getByText(/Mode/)).toBeInTheDocument();
    expect(screen.getByText(/Tech/)).toBeInTheDocument();
    expect(screen.getByText(/Lifestyle/)).toBeInTheDocument();
    expect(screen.getByText(/Food/)).toBeInTheDocument();
  });

  it('permet de sélectionner des intérêts', async () => {
    render(<Page />);
    
    const modeBtn = await screen.findByRole('button', { name: /Mode/i });
    fireEvent.click(modeBtn);

    await waitFor(() => {
      const saved = localStorage.getItem('campaign_step_2');
      expect(saved).toBeTruthy();
      const data = JSON.parse(saved || '{}');
      expect(data.selectedInterests).toContain('Mode');
    });
  });

  it('affiche la liste des pays', async () => {
    render(<Page />);
    
    const countryElements = screen.getByText(/France/i);
    expect(countryElements).toBeTruthy();
  });



  it('sauvegarde les données dans localStorage', async () => {
    render(<Page />);
    
    const modeBtn = await screen.findByRole('button', { name: /Mode/i });
    fireEvent.click(modeBtn);

    await waitFor(() => {
      const saved = localStorage.getItem('campaign_step_2');
      expect(saved).toBeTruthy();
      const data = JSON.parse(saved || '{}');
      expect(data.ageRange).toBeDefined();
      expect(data.selectedInterests).toBeDefined();
    });
  });
});
