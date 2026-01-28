import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from './Navbar';

describe('Navbar', () => {
  it('renders without crashing', () => {
    render(<Navbar />);
    expect(true).toBe(true);
  });
});
