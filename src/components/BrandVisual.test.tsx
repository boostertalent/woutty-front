import { render } from '@testing-library/react';
import Component from './BrandVisual';

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock framer-motion avec useScroll et useTransform
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => (props: any) => <div {...props} />
  }),
  AnimatePresence: ({ children }: any) => children,
  useScroll: () => ({ scrollYProgress: { value: 0 } }),
  useTransform: (value: any, input: any, output: any) => input[0] === 0 ? output[0] : output[1]
}));

describe('BrandVisual', () => {
  it('renders without crashing', () => {
    render(<Component />);
  });
});
