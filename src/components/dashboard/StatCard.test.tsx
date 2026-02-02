import { render } from '@testing-library/react';
import Component from './StatCard';

describe('StatCard', () => {
  it('renders without crashing', () => {
    render(<Component />);
  });
});
