import { render } from '@testing-library/react';
import { Select } from './select';

// Mock Radix UI components - approche simplifiée
jest.mock('@radix-ui/react-select', () => ({
  Root: ({ children, ...props }: any) => <div data-testid="select-root" {...props}>{children}</div>,
  Group: ({ children, ...props }: any) => <div data-testid="select-group" {...props}>{children}</div>,
  Value: ({ children, ...props }: any) => <span data-testid="select-value" {...props}>{children}</span>,
  Trigger: ({ children, ...props }: any) => <button data-testid="select-trigger" {...props}>{children}</button>,
  Content: ({ children, ...props }: any) => <div data-testid="select-content" {...props}>{children}</div>,
  Item: ({ children, ...props }: any) => <div data-testid="select-item" {...props}>{children}</div>,
  ItemText: ({ children, ...props }: any) => <span data-testid="select-item-text" {...props}>{children}</span>,
  ItemIndicator: ({ children, ...props }: any) => <span data-testid="select-item-indicator" {...props}>{children}</span>,
  ScrollUpButton: ({ children, ...props }: any) => <button data-testid="select-scroll-up" {...props}>{children}</button>,
  ScrollDownButton: ({ children, ...props }: any) => <button data-testid="select-scroll-down" {...props}>{children}</button>,
  Viewport: ({ children, ...props }: any) => <div data-testid="select-viewport" {...props}>{children}</div>,
  Portal: ({ children, ...props }: any) => <div data-testid="select-portal" {...props}>{children}</div>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Check: () => <div data-testid="check-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  ChevronUp: () => <div data-testid="chevron-up-icon" />,
}));

describe('select', () => {
  it('renders without crashing', () => {
    render(
      <Select>
        <div>Simple select test</div>
      </Select>
    );
  });
});
