import { render } from '@testing-library/react';
import TalentCatalogue from './page';

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
          order: jest.fn(() => Promise.resolve({
            data: [
              {
                id_w: 'test-id',
                nom_complet: 'Test Creator',
                url_photo_profile: 'test.jpg',
                la_plateforme: 'Instagram',
                ville: 'Dakar',
                nbre_followers: 10000,
                nbre_poste: 50
              }
            ],
            error: null
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

describe('TalentCatalogue', () => {
  it('renders without crashing', () => {
    render(<TalentCatalogue />);
  });
});
