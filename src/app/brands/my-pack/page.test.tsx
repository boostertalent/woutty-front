import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import BrandPackView from './page';

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    auth: {
      getSession: () => Promise.resolve({
        data: { session: { user: { id: 'test-user-id' } } }
      })
    },
    from: () => ({
      select: () => {
        // return an object that supports chained `eq` calls and ends with single()
        const chain: any = {
          eq: () => chain,
          single: () => Promise.resolve({
            data: {
              pack_id: 'local-starter',
              pack_name: 'Local Starter',
              budget: 100000,
              original_price: 150000,
              duration_days: 30,
              expected_posts: 5,
              expected_creators: 3,
              format: 'Photos',
              has_reporting: true,
              has_videos: false,
              has_image_rights: false,
              bonus: null,
              status: 'draft',
              created_at: '2024-01-01T00:00:00Z'
            },
            error: null
          })
        };
        return chain;
      }
    })
  })
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

describe('BrandPackView', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('affiche le pack sélectionné', async () => {
    render(<BrandPackView />);

    // attendre le titre principal
    expect(await screen.findByText('Votre Pack Actuel')).toBeInTheDocument();
    // nom du pack
    expect(screen.getByText(/Local Starter/)).toBeInTheDocument();
    // investissement avec ou sans espace insécable
    expect(screen.getByText(/100 ?000/)).toBeInTheDocument();
    // plusieurs éléments FCFA existent dans la page, vérifier qu'il en existe au moins un
    const fcfaEls = screen.getAllByText(/FCFA/);
    expect(fcfaEls.length).toBeGreaterThan(0);
  });

  it('affiche l\'économie réalisée', async () => {
    render(<BrandPackView />);

    const ecoHeader = await screen.findByText('Économie réalisée');
    expect(ecoHeader).toBeInTheDocument();
    const ecoContainer = ecoHeader.closest('div')!;
    expect(within(ecoContainer).getByText(/50 ?000/)).toBeInTheDocument();
    expect(within(ecoContainer).getByText(/FCFA/)).toBeInTheDocument();
  });

  it('affiche le pourcentage de réduction', async () => {
    render(<BrandPackView />);
    const percent = await screen.findByText(/-33%/);
    expect(percent).toBeInTheDocument();
  });

  it('affiche les caractéristiques', async () => {
    render(<BrandPackView />);
    
    await waitFor(() => {
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Photos')).toBeInTheDocument();
    });
  });

  it('affiche les fonctionnalités incluses', async () => {
    render(<BrandPackView />);
    
    await waitFor(() => {
      expect(screen.getByText('Ce qui est inclus')).toBeInTheDocument();
      expect(screen.getByText('Rapports détaillés')).toBeInTheDocument();
    });
  });

  it('permet de changer de pack', async () => {
    render(<BrandPackView />);
    
    await waitFor(() => {
      const button = screen.getByText('Changer de pack');
      fireEvent.click(button);
      expect(mockPush).toHaveBeenCalledWith('/brands/campaign-choice');
    });
  });

  it('permet de créer une campagne', async () => {
    render(<BrandPackView />);
    
    await waitFor(() => {
      const button = screen.getByText('Créer ma campagne');
      fireEvent.click(button);
      expect(mockPush).toHaveBeenCalledWith('/brands/auth/campagne');
    });
  });
});
