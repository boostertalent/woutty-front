import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Page from './page';

// --- MOCK NEXT/NAVIGATION ---
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// --- MOCK NEXT/LINK ---
jest.mock('next/link', () => {
  return ({ children }: { children: React.ReactNode }) => children;
});

// --- MOCK LOCALSTORAGE ---
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// --- MOCK SUPABASE ---
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: 'test-user-id' },
          },
        },
      }),
    },
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ error: null }),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { id_w: 'test-brand-id' },
            error: null
          })
        }))
      }))
    })),
  })),
}));

// --- MOCK ENV VARS ---
beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
});

describe('Step4 page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  it('renders without crashing', () => {
    render(<Page />);
  });

  it('displays the step indicator correctly', () => {
    render(<Page />);
    expect(screen.getByText('Étape 4')).toBeInTheDocument();
    expect(screen.getByText('Budget')).toBeInTheDocument();
  });

  it('shows budget input field', () => {
    render(<Page />);
    expect(screen.getByPlaceholderText('Entrez votre budget')).toBeInTheDocument();
  });

  it('loads saved budget from localStorage', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ budget: '50000' }));
    
    render(<Page />);
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('campaign_step_4');
  });

  it('saves budget to localStorage on change', () => {
    render(<Page />);
    
    const budgetInput = screen.getByPlaceholderText('Entrez votre budget');
    fireEvent.change(budgetInput, { target: { value: '75000' } });
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'campaign_step_4',
      JSON.stringify({ budget: '75000', currency: 'CFA' })
    );
  });

  it('only accepts numeric input', () => {
    render(<Page />);
    
    const budgetInput = screen.getByPlaceholderText('Entrez votre budget');
    
    fireEvent.change(budgetInput, { target: { value: 'abc' } });
    expect(budgetInput).toHaveValue('');
    
    fireEvent.change(budgetInput, { target: { value: '12345' } });
    expect(budgetInput).toHaveValue('12345');
  });

  it('shows minimum budget information', () => {
    render(<Page />);
    expect(screen.getByText('15 000 CFA')).toBeInTheDocument();
  });

  it('displays navigation buttons', () => {
    render(<Page />);
    
    expect(screen.getByText('Retour')).toBeInTheDocument();
    expect(screen.getByText('Finaliser la campagne')).toBeInTheDocument();
  });

  it('shows error for budget below minimum', async () => {
    render(<Page />);
    
    const budgetInput = screen.getByPlaceholderText('Entrez votre budget');
    const submitButton = screen.getByText('Finaliser la campagne');
    
    fireEvent.change(budgetInput, { target: { value: '10000' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Le budget minimum est de 15 000 CFA')).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    render(<Page />);
    
    const budgetInput = screen.getByPlaceholderText('Entrez votre budget');
    const submitButton = screen.getByText('Finaliser la campagne');
    
    fireEvent.change(budgetInput, { target: { value: '50000' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Finalisation...')).toBeInTheDocument();
  });
});
