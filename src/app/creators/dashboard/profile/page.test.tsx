import { render } from '@testing-library/react';
import CreatorProfile from './page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
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
      getSession: jest.fn(() => Promise.resolve({
        data: { session: { user: { id: 'test-user-id', email: 'test@example.com' } } }
      }))
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({ error: null })),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'test-url' } }))
      }))
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              full_name: 'Test Creator',
              email: 'test@example.com',
              phone: '+221771234567',
              age: 25,
              niche: ['Mode', 'Beauté'],
              avatar_url: 'test-avatar.jpg',
              instagram_username: 'testcreator',
              youtube_username: 'testchannel',
              tiktok_username: 'testtiktok'
            },
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      })),
      insert: jest.fn(() => Promise.resolve({ error: null }))
    }))
  }))
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => (props: any) => <div {...props} />
  })
}));

describe('CreatorProfile', () => {
  it('renders without crashing', () => {
    render(<CreatorProfile />);
  });
});
