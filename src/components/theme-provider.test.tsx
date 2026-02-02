import { render } from '@testing-library/react';
import Component from './theme-provider';

describe('theme-provider', () => {
  it('renders without crashing', () => {
    render(<Component />);
  });
});
