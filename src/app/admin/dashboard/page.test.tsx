import { render, screen, waitFor } from '@testing-library/react';
import Component from './page';

// --- MOCKS ---

// Mock router Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock Supabase
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-admin-id', email: 'admin@test.com' } },
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: jest.fn().mockResolvedValue({ 
            data: { role: 'admin', full_name: 'Admin Test' },
            error: null 
          }),
        }),
        neq: () => ({
          maybeSingle: jest.fn().mockResolvedValue({
            data: [],
            error: null
          }),
        }),
      }),
    }),
  }),
}));

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />
}));

// --- TESTS ---
describe('DashboardPage', () => {
  it('renders without crashing and shows essential dashboard elements', async () => {
    render(<Component />);
    
    // On attend que le composant soit prêt
    await waitFor(() => {
      // Message de bienvenue unique
      expect(screen.getByText('Ravi de vous revoir,')).toBeInTheDocument();
      
      // Cartes de statistiques spécifiques
      expect(screen.getByText('Total Créateurs')).toBeInTheDocument();
      expect(screen.getByText('Total Marques')).toBeInTheDocument();
      expect(screen.getByText('Campagnes Actives')).toBeInTheDocument();
      
      // Graphique spécifique
      expect(screen.getByText('📈 Croissance cumulative des inscriptions')).toBeInTheDocument();
      expect(screen.getByText('Évolution mensuelle (total cumulé d\'inscriptions)')).toBeInTheDocument();
      
      // Raccourcis spécifiques
      expect(screen.getByText('Assistance')).toBeInTheDocument();
      expect(screen.getByText('Demandes en attente')).toBeInTheDocument();
    });
  });
});
