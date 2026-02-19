import { render, screen } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import MatchingAnalysis from './page';

// explicitly mock navigation utilities, including router and search params
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn() })),
  useSearchParams: jest.fn(),
}));

describe('MatchingAnalysis page', () => {
  beforeEach(() => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn((key: string) => {
        if (key === 'campaign') return 'test-campaign-id';
        return null;
      }),
    });
  });

  it('renders without crashing', () => {
    render(<MatchingAnalysis />);
    expect(screen.getByTestId('matching-analysis-page')).toBeInTheDocument();
  });
});
