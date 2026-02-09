import { render } from '@testing-library/react';
import BrandBenefits from './BrandBenefits';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => (props: any) => <div {...props} />
  })
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}));

describe('BrandBenefits', () => {
  it('renders without crashing', () => {
    render(<BrandBenefits />);
  });
});
