import { render, screen, fireEvent } from '@testing-library/react';
import Component from './page';

// Mock router Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock icônes
jest.mock('lucide-react', () => ({
  Upload: () => <div data-testid="upload-icon" />,
  ChevronLeft: () => <div data-testid="chevron-left" />,
  ChevronRight: () => <div data-testid="chevron-right" />,
  AlertCircle: () => <div data-testid="alert-circle" />,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('CreateCreatorProfile', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  it('renders without crashing and shows essential profile creation elements', () => {
    render(<Component />);

    // Vérifie le titre principal
    expect(
      screen.getByText(/créer votre profil/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/créateur !/i)
    ).toBeInTheDocument();

    // Vérifie la section "Ton identité"
    expect(
      screen.getByText(/ton identité/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/présente-toi aux marques/i)
    ).toBeInTheDocument();

    // Vérifie les champs du formulaire
    expect(
      screen.getByPlaceholderText(/exemple: Fall Thiam/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/exemple:fallthiam@gmail.com/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/\+221\.\.\./i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/25/i)
    ).toBeInTheDocument();

    // Vérifie le bouton de continuation
    expect(
      screen.getByRole('button', { name: /continuer/i })
    ).toBeInTheDocument();

    // Vérifie le lien de retour
    expect(
      screen.getByRole('link', { name: /retour/i })
    ).toBeInTheDocument();

    // Vérifie la présence de l'icône d'upload
    expect(screen.getAllByTestId('upload-icon').length).toBeGreaterThan(0);
  });

  it('shows error when form is invalid and continue is clicked', () => {
    render(<Component />);

    const continueButton = screen.getByRole('button', { name: /continuer/i });
    fireEvent.click(continueButton);

    // Vérifie l'affichage du message d'erreur
    expect(
      screen.getByText(/vérifiez vos informations/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId('alert-circle')).toBeInTheDocument();
  });

  it('enables continue button when form is valid', () => {
    render(<Component />);

    // Remplir le formulaire
    fireEvent.change(screen.getByPlaceholderText(/exemple: Fall Thiam/i), {
      target: { name: 'fullName', value: 'Fall Thiam' }
    });
    fireEvent.change(screen.getByPlaceholderText(/exemple:fallthiam@gmail.com/i), {
      target: { name: 'email', value: 'fall@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/\+221\.\.\./i), {
      target: { name: 'phone', value: '+221771234567' }
    });
    fireEvent.change(screen.getByPlaceholderText(/25/i), {
      target: { name: 'age', value: '25' }
    });

    const continueButton = screen.getByRole('button', { name: /continuer/i });
    expect(continueButton).not.toBeDisabled();
  });
});
