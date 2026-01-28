import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FAQ from './FAQ';

describe('FAQ', () => {
  it('renders without crashing', () => {
    render(<FAQ />);
    expect(true).toBe(true);
  });
});
