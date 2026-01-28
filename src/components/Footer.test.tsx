import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from './Footer';

describe('Footer', () => {
  it('renders without crashing', () => {
    render(<Footer />);
    expect(true).toBe(true);
  });
});
