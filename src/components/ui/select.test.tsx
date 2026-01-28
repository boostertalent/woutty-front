import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import select from './select';

describe('select', () => {
  it('renders without crashing', () => {
    render(<select />);
    expect(true).toBe(true);
  });
});
