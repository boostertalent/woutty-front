import { render, screen } from '@testing-library/react';
import MatchingAnalysis from './page';

describe('MatchingAnalysis page', () => {
  it('renders without crashing', () => {
    render(<MatchingAnalysis />);
    const page = screen.getByTestId('matching-analysis-page');
    expect(page).toBeInTheDocument();
  });
});
