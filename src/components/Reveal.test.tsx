import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Reveal from './Reveal';

describe('Reveal', () => {
  it('renders without crashing', () => {
    render(<Reveal />);
    expect(true).toBe(true);
  });
});
