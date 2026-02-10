import { render } from '@testing-library/react';
import CampaignDetailDynamic from './page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-id' }),
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn()
  })
}));

// Mock Supabase
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => Promise.resolve({
        data: { session: { user: { id: 'test-user-id' } } }
      }))
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              title: 'Test Campaign',
              budget: 1000,
              start_date: '2024-01-01',
              end_date: '2024-12-31',
              status: 'active',
              assigned_creator_id: 'creator-id',
              id_w: 'test-user-id'
            },
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }))
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: () => (props: any) => <div {...props} />
  })
}));

describe('CampaignDetailDynamic', () => {
  it('renders without crashing', () => {
    render(<CampaignDetailDynamic />);
  });
});
