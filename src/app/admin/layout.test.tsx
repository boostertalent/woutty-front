import { render, screen, waitFor } from '@testing-library/react';
import Component from './layout';
import { ReactNode } from 'react';

// --- MOCKS ---

// Mock router Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/admin/dashboard',
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock Supabase
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-admin-id' } },
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: jest.fn().mockResolvedValue({ 
            data: { role: 'admin', full_name: 'Admin Test' },
            error: null 
          }),
        }),
      }),
    }),
  }),
}));

// --- TESTS ---
describe('AdminLayout', () => {
  it('renders without crashing', async () => {
    render(
      <Component>
        <div>Test Content</div>
      </Component>
    );
    
    // On attend que le composant soit prêt
    await waitFor(() => {
      expect(screen.getByText(/woutty/i)).toBeInTheDocument();
    });
  });
});
