import { render, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import EntrepriseDetails from './page';

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

describe('EntrepriseDetails', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('affiche le formulaire entreprise', () => {
    render(<EntrepriseDetails />);
    expect(screen.getByText('Votre entreprise/Marque')).toBeInTheDocument();
    expect(screen.getByText('Nom Marque/Entreprise*')).toBeInTheDocument();
    expect(screen.getByText('Tel*')).toBeInTheDocument();
    expect(screen.getByText('Email Marque/Entreprise*')).toBeInTheDocument();
    expect(screen.getByText('Domaine*')).toBeInTheDocument();
    expect(screen.getByText('Site web*')).toBeInTheDocument();
  });

  it('valide le formulaire', () => {
    render(<EntrepriseDetails />);
    const button = screen.getByRole('button', { name: 'Continuer' });
    expect(button).toBeDisabled();
  });

  it('active le bouton quand formulaire valide', () => {
    render(<EntrepriseDetails />);
    
    fireEvent.change(screen.getByPlaceholderText('Ex: My Brand Agency'), {
      target: { value: 'Test Brand' }
    });
    fireEvent.change(screen.getByPlaceholderText('+221...'), {
      target: { value: '+221771234567' }
    });
    fireEvent.change(screen.getByPlaceholderText('contact@brand.com'), {
      target: { value: 'test@brand.com' }
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Mode & Beauté' }
    });
    fireEvent.change(screen.getByPlaceholderText('https://www.monsite.com'), {
      target: { value: 'https://test.com' }
    });

    const button = screen.getByRole('button', { name: 'Continuer' });
    expect(button).not.toBeDisabled();
  });

  it('sauvegarde et navigue', async () => {
    render(<EntrepriseDetails />);
    
    fireEvent.change(screen.getByPlaceholderText('Ex: My Brand Agency'), {
      target: { value: 'Test Brand' }
    });
    fireEvent.change(screen.getByPlaceholderText('contact@brand.com'), {
      target: { value: 'test@brand.com' }
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Mode & Beauté' }
    });
    fireEvent.change(screen.getByPlaceholderText('https://www.monsite.com'), {
      target: { value: 'https://test.com' }
    });

    const button = screen.getByRole('button', { name: 'Continuer' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('brand_company_name', 'Test Brand');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('brand_company_email', 'test@brand.com');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('brand_domain', 'Mode & Beauté');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('brand_website', 'https://test.com');
      expect(mockPush).toHaveBeenCalledWith('/brands/auth/formulaire/etape2');
    });
  });

  it('gère le domaine personnalisé', async () => {
    render(<EntrepriseDetails />);
    
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Autre' }
    });
    expect(screen.getByText('Précisez votre domaine*')).toBeInTheDocument();
  });
});
