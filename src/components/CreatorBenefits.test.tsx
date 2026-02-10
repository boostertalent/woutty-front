import { render, screen } from '@testing-library/react';
import CreatorBenefits from './CreatorBenefits';

// --- MOCKS ---

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock Link Next.js
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: any) => <a>{children}</a>,
}));

// Mock icônes lucide-react
jest.mock('lucide-react', () => ({
  ShieldCheck: () => <div data-testid="icon" />,
  TrendingUp: () => <div data-testid="icon" />,
  Users: () => <div data-testid="icon" />,
  Award: () => <div data-testid="icon" />,
  ArrowRight: () => <div data-testid="icon" />,
}));

// Mock framer-motion (pour div et span utilisés dans CreatorBenefits)
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
}));

// --- TEST ---
describe('CreatorBenefits', () => {
  it('renders without crashing', () => {
    render(<CreatorBenefits />);

    // Vérifie que le titre principal est bien rendu
    expect(
      screen.getByText(/votre créativité mérite d'être rémunérée/i)
    ).toBeInTheDocument();

    // Vérifie que le badge Influenceurs & Créateurs est présent
    expect(
      screen.getByText(/influenceurs & créateurs/i)
    ).toBeInTheDocument();

    // Vérifie qu'au moins une icône est présente
    expect(screen.getAllByTestId('icon').length).toBeGreaterThan(0);
  });
});
