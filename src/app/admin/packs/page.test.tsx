import { render, screen, fireEvent, within } from '@testing-library/react';
import AdminPacksView from './page';

const mockData = [
  {
    brand_id: 'brand1',
    pack_id: 'local-starter',
    pack_name: 'Local Starter',
    budget: 100000,
    duration_days: 30,
    expected_posts: 5,
    expected_creators: 3,
    created_at: '2024-01-01T00:00:00Z',
    status: 'draft',
    marque: {
      nom_marque: 'Test Brand 1',
      email_marque: 'test1@brand.com',
      telephone_contact: null
    }
  },
  {
    brand_id: 'brand2',
    pack_id: 'national-scale',
    pack_name: 'National Scale',
    budget: 300000,
    duration_days: 60,
    expected_posts: 10,
    expected_creators: 6,
    created_at: '2024-01-02T00:00:00Z',
    status: 'confirmed',
    marque: {
      nom_marque: 'Test Brand 2',
      email_marque: 'test2@brand.com',
      telephone_contact: '770000000'
    }
  }
];

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    from: () => ({
      select: () => ({
        order: () =>
          Promise.resolve({
            data: mockData,
            error: null
          })
      })
    })
  })
}));

describe('AdminPacksView - version robuste', () => {

  it('affiche les statistiques correctement', async () => {
    render(<AdminPacksView />);

    await screen.findByText('TOTAL MARQUES');

    const totalCard = screen.getByText('TOTAL MARQUES').closest('div')!;
    expect(within(totalCard).getByText('2')).toBeInTheDocument();

    const localCard = screen.getByText('LOCAL STARTER').closest('div')!;
    expect(within(localCard).getByText('1')).toBeInTheDocument();

    const regionalCard = screen.getByText('REGIONAL BUSINESS').closest('div')!;
    expect(within(regionalCard).getByText('0')).toBeInTheDocument();

    const nationalCard = screen.getByText('NATIONAL SCALE').closest('div')!;
    expect(within(nationalCard).getByText('1')).toBeInTheDocument();
  });

  it('calcule correctement le revenu total', async () => {
  render(<AdminPacksView />);

  const revenueSection = await screen.findByText('REVENU POTENTIEL TOTAL');

  const container = revenueSection.closest('div')!;
  
  expect(within(container).getByText(/400 ?000/)).toBeInTheDocument();
  expect(within(container).getByText(/FCFA/)).toBeInTheDocument();
});

  it('affiche correctement les informations des marques', async () => {
    render(<AdminPacksView />);

    expect(await screen.findByText('Test Brand 1')).toBeInTheDocument();
    expect(screen.getByText('test1@brand.com')).toBeInTheDocument();

    expect(screen.getByText('Test Brand 2')).toBeInTheDocument();
    expect(screen.getByText('test2@brand.com')).toBeInTheDocument();
    expect(screen.getByText('770000000')).toBeInTheDocument();
  });

  it('filtre correctement par pack', async () => {
    render(<AdminPacksView />);
    await screen.findByText('Test Brand 1');

    const nationalButton = screen.getByRole('button', { name: /National Scale/i });
    fireEvent.click(nationalButton);

    expect(screen.getByText('Test Brand 2')).toBeInTheDocument();
    expect(screen.queryByText('Test Brand 1')).not.toBeInTheDocument();
  });

  it('affiche le message vide après filtre sans résultat', async () => {
    render(<AdminPacksView />);
    await screen.findByText('Test Brand 1');

    const regionalButton = screen.getByRole('button', { name: /Regional Business/i });
    fireEvent.click(regionalButton);

    expect(
      screen.getByText(/Aucune marque n'a sélectionné le pack/)
    ).toBeInTheDocument();
  });

});