import { render } from '@testing-library/react';
import Component from './Footer';

describe('Footer', () => {
  it('renders without crashing', () => {
    render(<Component />);
  });
});
