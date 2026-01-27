import { render, screen, cleanup } from '@testing-library/react';
import RegistrationSuccess from './RegistrationSuccess';
import { useRouter } from 'next/navigation';

// Mock de Framer Motion pour éviter les erreurs d'animation en test
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe('RegistrationSuccess Component', () => {
  beforeEach(() => {
    // On vide le localStorage avant chaque test
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('devrait afficher l\'email stocké dans le localStorage', () => {
    const testEmail = 'test@woutty.com';
    localStorage.setItem('signup_email', testEmail);

    render(<RegistrationSuccess />);

    expect(screen.getByText(testEmail)).toBeInTheDocument();
  });

  it('devrait afficher un texte de secours si aucun email n\'est trouvé', () => {
    render(<RegistrationSuccess />);
    
    expect(screen.getByText('votre adresse email')).toBeInTheDocument();
  });

  it('devrait nettoyer le localStorage lors du démontage du composant', () => {
    // Initialisation avec des données
    localStorage.setItem('signup_email', 'test@woutty.com');
    localStorage.setItem('signup_name', 'Jean Dupont');
    localStorage.setItem('signup_phone', '770000000');

    const { unmount } = render(<RegistrationSuccess />);
    
    // Le nettoyage se fait dans la fonction de retour du useEffect (unmount)
    unmount();

    expect(localStorage.getItem('signup_email')).toBeNull();
    expect(localStorage.getItem('signup_name')).toBeNull();
    expect(localStorage.getItem('signup_phone')).toBeNull();
  });

  it('devrait contenir les liens vers la connexion et l\'accueil', () => {
    render(<RegistrationSuccess />);
    
    const loginLink = screen.getByRole('link', { name: /aller à la connexion/i });
    const homeLink = screen.getByRole('link', { name: /retour à l'accueil/i });

    expect(loginLink).toHaveAttribute('href', '/auth/login');
    expect(homeLink).toHaveAttribute('href', '/');
  });
});