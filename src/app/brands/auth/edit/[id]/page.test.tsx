import { render } from '@testing-library/react';
import EditCampaign from './page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-id' }),
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn()
  })
}));

// Mock Supabase
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              title: 'Test Campaign',
              budget: 1000,
              currency: 'CFA',
              description: 'Test description',
              objectives: ['Notoriété'],
              end_date: '2024-12-31'
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

describe('EditCampaign', () => {
  it('renders without crashing', () => {
    render(<EditCampaign />);
  });
});
