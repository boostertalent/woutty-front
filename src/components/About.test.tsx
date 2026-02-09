import { render } from '@testing-library/react';
import About from './About';

// Mock framer-motion comme dans les tests qui fonctionnent
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => (props: any) => <div {...props} />
  })
}));

describe('About', () => {
  it('renders without crashing', () => {
    render(<About />);
  });
});
