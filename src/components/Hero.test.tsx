import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Hero from './Hero';

describe('Hero', () => {
  it('renders without crashing', () => {
    render(<Hero />);
    expect(true).toBe(true);
  });
});
