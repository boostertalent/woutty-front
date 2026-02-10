import { render } from '@testing-library/react';
import PublicCampaigns from './page';

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: any) => children,
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          not: jest.fn(() => ({
            ilike: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({
                data: [
                  {
                    id_t_campagne: 'test-id',
                    title: 'Test Campaign',
                    budget: 1000,
                    start_date: '2024-01-01',
                    end_date: '2024-12-31',
                    status: 'active',
                    assigned_creator_id: 'creator-id',
                    marque: {
                      nom_marque: 'Test Brand',
                      domaine: 'Tech'
                    }
                  }
                ],
                error: null
              }))
            }))
          }))
        }))
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

describe('PublicCampaigns', () => {
  it('renders without crashing', () => {
    render(<PublicCampaigns />);
  });
});
