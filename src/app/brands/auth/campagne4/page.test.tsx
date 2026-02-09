import { render } from '@testing-library/react';
import Page from './page';

// --- MOCK NEXT/NAVIGATION ---
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// --- MOCK NEXT/LINK ---
jest.mock('next/link', () => {
  return ({ children }: { children: React.ReactNode }) => children;
});

// --- MOCK SUPABASE ---
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: {
          session: {
            user: { id: 'test-user-id' },
          },
        },
      }),
    },
    from: () => ({
      insert: jest.fn().mockResolvedValue({ error: null }),
    }),
  }),
}));

// --- MOCK ENV VARS ---
beforeAll(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
});

describe('Step4 page', () => {
  it('renders without crashing', () => {
    render(<Page />);
  });
});
