import { render } from '@testing-library/react';
import Component from './Navbar';

describe('Navbar', () => {
  it('renders without crashing', () => {
    render(<Component />);
  });
});
