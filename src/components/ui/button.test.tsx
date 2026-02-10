import { render } from '@testing-library/react';
import { Button } from './button';

describe('button', () => {
  it('renders without crashing', () => {
    render(<Button>Test</Button>);
  });
});
