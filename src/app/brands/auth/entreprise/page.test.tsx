import { render, fireEvent, screen } from '@testing-library/react';
import EntrepriseDetails from './page';

describe('EntrepriseDetails Page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', () => {
    render(<EntrepriseDetails />);
    expect(
      screen.getByText(/Votre entreprise\/Marque/i)
    ).toBeInTheDocument();
  });

  it('disables continue button if form is incomplete', () => {
    render(<EntrepriseDetails />);
    const button = screen.getByRole('button', { name: /continuer/i });
    expect(button).toBeDisabled();
  });

  it('enables continue button when form is valid', () => {
    render(<EntrepriseDetails />);

    fireEvent.change(
      screen.getByPlaceholderText(/Ex: My Brand Agency/i),
      { target: { value: 'Test Co' } }
    );

    fireEvent.change(
      screen.getByPlaceholderText(/\+221/i),
      { target: { value: '+221000000000' } }
    );

    fireEvent.change(
      screen.getByPlaceholderText(/contact@brand.com/i),
      { target: { value: 'test@brand.com' } }
    );

    fireEvent.change(
      screen.getByRole('combobox'),
      { target: { value: 'Mode & Beauté' } }
    );

    fireEvent.change(
      screen.getByPlaceholderText(/https:\/\/www.monsite.com/i),
      { target: { value: 'https://test.com' } }
    );

    const button = screen.getByRole('button', { name: /continuer/i });
    expect(button).toBeEnabled();
  });
});
