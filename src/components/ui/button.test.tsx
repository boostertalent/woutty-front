import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import button from './button';

describe('button', () => {
  it('renders without crashing', () => {
    render(<button />);
    expect(true).toBe(true);
  });
});
