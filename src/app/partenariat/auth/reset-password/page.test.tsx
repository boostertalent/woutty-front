import { render } from '@testing-library/react';
import Component from './page';

describe('page', () => {
  it('renders without crashing', () => {
    render(<Component />);
  });
});
