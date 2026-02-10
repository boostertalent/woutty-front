import { render } from '@testing-library/react';
import PublicCreatorProfile from './page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-id' })
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              nom_complet: 'Test Creator',
              url_photo_profile: 'test.jpg',
              la_plateforme: 'Instagram',
              ville: 'Dakar',
              nbre_followers: 10000,
              nbre_poste: 50
            },
            error: null
          }))
        })),
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({
            data: [
              {
                id_poste: 1,
                titre_poste: 'Test Post',
                nbre_like: 100,
                nbre_commentaire: 10,
                date_poste: '2024-01-01'
              }
            ],
            error: null
          }))
        }))
      }))
    }))
  }))
}));

describe('PublicCreatorProfile', () => {
  it('renders without crashing', () => {
    render(<PublicCreatorProfile />);
  });
});
