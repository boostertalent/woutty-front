import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatCard from './StatCard';

describe('StatCard', () => {
  it('renders without crashing', () => {
    render(<StatCard />);
    expect(true).toBe(true);
  });
});
