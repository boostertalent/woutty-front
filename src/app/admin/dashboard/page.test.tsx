import { render, screen } from '@testing-library/react';
import Component from './page';

// Mock router Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock Supabase
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-id' } },
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: () => Promise.resolve({ data: { id_w: 'test-id', role: 'admin', full_name: 'Admin' }, error: null }) }),
        order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }),
      }),
      update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
      insert: () => Promise.resolve({ data: null, error: null }),
    }),
  }),
}));

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
}));

// --- TESTS ---
describe('DashboardPage', () => {
  it('renders without crashing and shows essential dashboard elements', async () => {
    render(<Component />);

    // Vérifier le titre/heading principal (unique)
    const heading = await screen.findByRole('heading', { name: /Ravi de vous revoir/ }, { timeout: 3000 });
    expect(heading).toBeInTheDocument();

    // Vérifier les 3 cartes de statistiques principales
    expect(screen.getByText('Total Créateurs')).toBeInTheDocument();
    expect(screen.getByText('Total Marques')).toBeInTheDocument();
    expect(screen.getByText('Campagnes Actives')).toBeInTheDocument();

    // Vérifier le titre du graphique de croissance
    expect(screen.getByText('📈 Croissance cumulative des inscriptions')).toBeInTheDocument();
    expect(screen.getByText(/Évolution mensuelle/)).toBeInTheDocument();
  });
});
