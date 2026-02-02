import { render, screen, fireEvent } from '@testing-library/react';
import RegistrationSuccess from './page';

describe('RegistrationSuccess page', () => {
  beforeEach(() => {
    localStorage.clear(); // Nettoyage avant chaque test
  });

  it('renders without crashing and shows email placeholder', () => {
    localStorage.setItem('signup_email', 'test@domain.com');
    render(<RegistrationSuccess />);
    expect(screen.getByText(/test@domain.com/i)).toBeInTheDocument();
  });

  it('displays default text if no email in localStorage', () => {
    render(<RegistrationSuccess />);
    expect(screen.getByText(/votre adresse email/i)).toBeInTheDocument();
  });

  it('clears localStorage when finalize button is clicked', () => {
    localStorage.setItem('signup_email', 'test@domain.com');
    localStorage.setItem('signup_name', 'Jean');

    render(<RegistrationSuccess />);

    const button = screen.getByText(/aller à la connexion/i);
    fireEvent.click(button); // simule un vrai clic

    expect(localStorage.getItem('signup_email')).toBeNull();
    expect(localStorage.getItem('signup_name')).toBeNull();
  });
});
