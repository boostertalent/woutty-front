import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import About from './About';

describe('About', () => {
  it('renders without crashing', () => {
    render(<About />);
    expect(true).toBe(true);
  });
});
