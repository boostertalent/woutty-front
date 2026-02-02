import { render } from '@testing-library/react';
import Component from './Process';

describe('Process', () => {
  it('renders without crashing', () => {
    render(<Component />);
  });
});
