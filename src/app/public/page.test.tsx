import { render, screen } from '@testing-library/react';
import Component from './page';

// mock next/link to avoid errors
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}));

describe('Public landing page', () => {
  it('renders hero content and buttons', () => {
    render(<Component />);

    expect(screen.getByText(/La marketplace ultime/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Je suis Créateur/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Je suis une Marque/i })).toBeInTheDocument();
  });
});
