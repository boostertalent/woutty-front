import { render } from '@testing-library/react';
import Component from './Hero';

describe('Hero', () => {
  it('renders without crashing', () => {
    render(<Component />);
  });
});
