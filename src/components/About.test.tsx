import { render } from '@testing-library/react';
import Component from './About';

describe('About', () => {
  it('renders without crashing', () => {
    render(<Component />);
  });
});
