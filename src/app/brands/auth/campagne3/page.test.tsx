import { render } from '@testing-library/react';
import Page from './page';

// --- MOCK NEXT/NAVIGATION ---
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// --- MOCK NEXT/LINK ---
jest.mock('next/link', () => {
  return ({ children }: { children: React.ReactNode }) => children;
});

describe('Step3 page', () => {
  it('renders without crashing', () => {
    render(<Page />);
  });
});
