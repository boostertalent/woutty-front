import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ContactPrincipal from './page';

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

describe('ContactPrincipal', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('affiche le formulaire contact', () => {
    render(<ContactPrincipal />);
    expect(screen.getByText('Contact principal')).toBeInTheDocument();
    expect(screen.getByText('Nom complet*')).toBeInTheDocument();
    expect(screen.getByText('Fonction')).toBeInTheDocument();
    expect(screen.getByText('Email professionnel*')).toBeInTheDocument();
    expect(screen.getByText('Téléphone')).toBeInTheDocument();
  });

  it('valide le formulaire', () => {
    render(<ContactPrincipal />);
    const button = screen.getByRole('button', { name: 'Continuer' });
    expect(button).toBeDisabled();
  });

  it('active le bouton quand formulaire valide', () => {
    render(<ContactPrincipal />);
    
    fireEvent.change(screen.getByPlaceholderText('Ex: Jean Dupont'), {
      target: { value: 'Jean Dupont' }
    });
    fireEvent.change(screen.getByPlaceholderText('jean@entreprise.com'), {
      target: { value: 'jean@entreprise.com' }
    });

    const button = screen.getByRole('button', { name: 'Continuer' });
    expect(button).not.toBeDisabled();
  });

  it('sauvegarde et navigue', async () => {
    render(<ContactPrincipal />);
    
    fireEvent.change(screen.getByPlaceholderText('Ex: Jean Dupont'), {
      target: { value: 'Jean Dupont' }
    });
    fireEvent.change(screen.getByPlaceholderText('jean@entreprise.com'), {
      target: { value: 'jean@entreprise.com' }
    });

    const button = screen.getByRole('button', { name: 'Continuer' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('brand_contact_fullname', 'Jean Dupont');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('brand_contact_professional_email', 'jean@entreprise.com');
      expect(mockPush).toHaveBeenCalledWith('/brands/auth/formulaire/etape3');
    });
  });

  it('affiche le lien de retour', () => {
    render(<ContactPrincipal />);
    const retourLink = screen.getByRole('link', { name: 'Retour' });
    expect(retourLink).toHaveAttribute('href', '/brands/auth/formulaire/etape1');
  });
});
