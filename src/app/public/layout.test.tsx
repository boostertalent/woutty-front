import { render, screen } from '@testing-library/react';
import Component from './layout';

// simple layout, just render and check main exists

describe('Public layout', () => {
  it('renders and contains a main element', () => {
    render(<Component />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
