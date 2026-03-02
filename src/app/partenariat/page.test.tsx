import { render, screen } from '@testing-library/react';
import Component from './page';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}));

jest.mock('framer-motion', () => ({
  motion: new Proxy({}, { get: () => (props: any) => <div {...props} /> })
}));

describe('Partnership page', () => {
  it('renders hero heading and navigation links', () => {
    render(<Component />);
    expect(screen.getByText(/Grandissons/i)).toBeInTheDocument();
    expect(screen.getByText(/Connexion/i)).toBeInTheDocument();
    expect(screen.getByText(/S'inscrire/i)).toBeInTheDocument();
  });
});
