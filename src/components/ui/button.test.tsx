import { render } from '@testing-library/react';
import Component from './button';

describe('button', () => {
  it('renders without crashing', () => {
    render(<Component />);
  });
});
