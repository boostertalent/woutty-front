import { render } from '@testing-library/react';
import Component from './layout';

describe('layout', () => {
  it('renders without crashing', () => {
    render(<Component />);
  });
});
