import { render, fireEvent, screen } from '@testing-library/react';
import Step4 from './Step4';

// Mock du router Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

// Mock du client Supabase pour éviter les appels réels
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    auth: { getSession: jest.fn(() => Promise.resolve({ data: { session: { user: { id: 'user1' } } } })) },
    from: () => ({ insert: jest.fn(() => Promise.resolve({ error: null })) })
  })
}));

describe('Step4', () => {
  beforeEach(() => localStorage.clear());

  it('renders without crashing', () => {
    render(<Step4 />);
    expect(screen.getByText(/Créer une campagne/i)).toBeInTheDocument();
  });

  it('validates the budget input', () => {
    render(<Step4 />);
    const input = screen.getByPlaceholderText(/Ex: 50000/i);

    // Saisie invalide
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(input).toHaveValue('');

    // Saisie valide
    fireEvent.change(input, { target: { value: '20000' } });
    expect(input).toHaveValue('20000');
  });
});
