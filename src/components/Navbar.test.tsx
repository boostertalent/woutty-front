import { render } from '@testing-library/react';
import Component from './Navbar';

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}));

// Mock framer-motion avec useScroll et useTransform
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => (props: any) => <div {...props} />
  }),
  AnimatePresence: ({ children }: any) => children,
  useScroll: () => ({ scrollY: { value: 0 } }),
  useTransform: (value: any, input: any, output: any) => input[0] === 0 ? output[0] : output[1]
}));

describe('Navbar', () => {
  it('renders without crashing', () => {
    render(<Component />);
  });
});
