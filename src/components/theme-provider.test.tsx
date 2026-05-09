import { render } from '@testing-library/react';
import { ThemeProvider } from './theme-provider';

describe('ThemeProvider', () => {
  it('renders without crashing', () => {
    render(
      <ThemeProvider>
        <div>test</div>
      </ThemeProvider>
    );
  });
});