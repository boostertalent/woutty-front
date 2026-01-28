import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreatorBenefits from './CreatorBenefits';

describe('CreatorBenefits', () => {
  it('renders without crashing', () => {
    render(<CreatorBenefits />);
    expect(true).toBe(true);
  });
});
