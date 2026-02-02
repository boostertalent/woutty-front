import { render } from '@testing-library/react';
import Component from './FAQ';

describe('FAQ', () => {
  it('renders without crashing', () => {
    render(<Component />);
  });
});
