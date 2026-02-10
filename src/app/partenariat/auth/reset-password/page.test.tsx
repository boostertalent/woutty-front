// Mock du client Supabase partagé (doit être avant l'import)
jest.mock('@/lib/supabaseClient', () => ({
  getSupabaseBrowserClient: jest.fn(() => ({
    auth: {
      updateUser: jest.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id' } },
        error: null
      })),
      getSession: jest.fn(() => Promise.resolve({
        data: { session: { user: { id: 'test-user-id' } } }
      }))
    }
  })),
  supabase: {
    auth: {
      updateUser: jest.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id' } },
        error: null
      })),
      getSession: jest.fn(() => Promise.resolve({
        data: { session: { user: { id: 'test-user-id' } } }
      }))
    }
  }
}));

import { render } from '@testing-library/react';
import Component from './page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn()
  })
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}));

// Mock Supabase
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      updateUser: jest.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id' } },
        error: null
      })),
      getSession: jest.fn(() => Promise.resolve({
        data: { session: { user: { id: 'test-user-id' } } }
      }))
    }
  }))
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => (props: any) => <div {...props} />
  }),
  AnimatePresence: ({ children }: any) => children
}));

describe('page', () => {
  it('renders without crashing', () => {
    render(<Component />);
  });
});
