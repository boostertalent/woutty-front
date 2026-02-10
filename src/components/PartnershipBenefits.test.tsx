import { render } from '@testing-library/react';
import Component from './PartnershipBenefits';

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => (props: any) => <div {...props} />
  }),
  AnimatePresence: ({ children }: any) => children
}));

describe('PartnershipBenefits', () => {
  it('renders without crashing', () => {
    render(<Component />);
  });
});
