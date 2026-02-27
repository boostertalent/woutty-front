import { render, screen } from '@testing-library/react';
import ContactPrincipal from './page';

// mock du router Next
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('ContactPrincipal page', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', () => {
    render(<ContactPrincipal />);
    expect(
      screen.getByText('Contact principal')
    ).toBeInTheDocument();
  });

  it('disables continue button when form is invalid', () => {
    render(<ContactPrincipal />);
    const button = screen.getByRole('button', { name: /continuer/i });
    expect(button).toBeDisabled();
  });
});
