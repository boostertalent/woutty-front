import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import theme-provider from './theme-provider';

describe('theme-provider', () => {
  it('renders without crashing', () => {
    render(<theme-provider />);
    expect(true).toBe(true);
  });
});
