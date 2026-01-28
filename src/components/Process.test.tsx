import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Process from './Process';

describe('Process', () => {
  it('renders without crashing', () => {
    render(<Process />);
    expect(true).toBe(true);
  });
});
