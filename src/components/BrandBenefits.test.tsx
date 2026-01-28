import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BrandBenefits from './BrandBenefits';

describe('BrandBenefits', () => {
  it('renders without crashing', () => {
    render(<BrandBenefits />);
    expect(true).toBe(true);
  });
});
