import { render, screen, fireEvent } from '@testing-library/react';
import BrandFinalStep from './page';

// MOCK de createBrowserClient pour les tests
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    auth: {
      signUp: jest.fn(() => ({ data: { user: { id: '123' } }, error: null })),
    },
    from: jest.fn(() => ({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn(async () => ({ error: null })),
    })),
  }),
}));

describe('BrandFinalStep page', () => {
  beforeEach(() => {
    localStorage.clear(); // nettoyage avant chaque test
  });

  it('renders without crashing', () => {
    render(<BrandFinalStep />);
    expect(screen.getByText(/Sécurisez l'accès à votre espace marque/i)).toBeInTheDocument();
  });

  it('disables submit when passwords are invalid', () => {
    render(<BrandFinalStep />);
    const button = screen.getByRole('button', { name: /Créer mon compte/i });
    expect(button).toBeDisabled();
  });

  it('enables submit when passwords match and are valid', () => {
    localStorage.setItem('brand_company_email', 'test@brand.com');
    localStorage.setItem('brand_company_name', 'MyBrand');

    render(<BrandFinalStep />);
    fireEvent.change(screen.getByPlaceholderText(/Créez un mot de passe sécurisé/i), {
      target: { value: '123456' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Répétez le mot de passe/i), {
      target: { value: '123456' },
    });

    const button = screen.getByRole('button', { name: /Créer mon compte/i });
    expect(button).not.toBeDisabled();
  });
});
