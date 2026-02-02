import { render } from '@testing-library/react';
import Component from './Reveal';

describe('Reveal', () => {
  it('renders without crashing', () => {
    render(<Component />);
  });
});
