import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import BrandFinalStep from './page';

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    auth: {
      signUp: jest.fn(() => ({ data: { user: { id: '123' } }, error: null })),
    },
    from: () => ({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn(async () => ({ error: null })),
    }),
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('BrandFinalStep', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    localStorageMock.getItem.mockImplementation((key) => {
      const data = {
        'brand_company_email': 'test@brand.com',
        'brand_company_name': 'TestBrand'
      };
      return data[key as keyof typeof data] || null;
    });
  });

  it('affiche le formulaire final', () => {
    render(<BrandFinalStep />);
    expect(screen.getByText('Woutty Business')).toBeInTheDocument();
    expect(screen.getByText('Sécurisez l\'accès à votre espace marque')).toBeInTheDocument();
    expect(screen.getByText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByText('Confirmer le mot de passe')).toBeInTheDocument();
  });

  it('valide le formulaire', () => {
    render(<BrandFinalStep />);
    const button = screen.getByRole('button', { name: 'Créer mon compte' });
    expect(button).toBeDisabled();
  });

  it('active le bouton quand mots de passe valides', () => {
    render(<BrandFinalStep />);
    
    fireEvent.change(screen.getByPlaceholderText('Créez un mot de passe sécurisé'), {
      target: { value: '123456' }
    });
    fireEvent.change(screen.getByPlaceholderText('Répétez le mot de passe'), {
      target: { value: '123456' }
    });

    const button = screen.getByRole('button', { name: 'Créer mon compte' });
    expect(button).not.toBeDisabled();
  });

  it('crée le compte et navigue', async () => {
    render(<BrandFinalStep />);
    
    fireEvent.change(screen.getByPlaceholderText('Créez un mot de passe sécurisé'), {
      target: { value: '123456' }
    });
    fireEvent.change(screen.getByPlaceholderText('Répétez le mot de passe'), {
      target: { value: '123456' }
    });

    const form = screen.getByRole('button', { name: 'Créer mon compte' }).closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(localStorageMock.clear).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/brands/auth/success');
    });
  });

  it('affiche le lien de retour', () => {
    render(<BrandFinalStep />);
    const retourLink = screen.getByRole('link', { name: 'Retour' });
    expect(retourLink).toHaveAttribute('href', '/brands/auth/formulaire/etape2');
  });
});
