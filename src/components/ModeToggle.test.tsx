import { render } from '@testing-library/react';
import { ModeToggle } from './ModeToggle';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: jest.fn() }),
  ThemeProvider: ({ children }: any) => children,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => (props: any) => <div {...props} />
  }),
  AnimatePresence: ({ children }: any) => children
}));

describe('ModeToggle', () => {
  it('renders without crashing', () => {
    render(<ModeToggle />);
  });
});
