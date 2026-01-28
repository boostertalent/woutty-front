import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ModeToggle from './ModeToggle';

describe('ModeToggle', () => {
  it('renders without crashing', () => {
    render(<ModeToggle />);
    expect(true).toBe(true);
  });
});
