import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BrandVisual from './BrandVisual';

describe('BrandVisual', () => {
  it('renders without crashing', () => {
    render(<BrandVisual />);
    expect(true).toBe(true);
  });
});
