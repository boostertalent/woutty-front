import { render } from '@testing-library/react';
import { ThemeProvider } from './theme-provider';

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: any) => children,
}));

describe('theme-provider', () => {
  it('renders without crashing', () => {
    render(<ThemeProvider><div>Test</div></ThemeProvider>);
  });
});
