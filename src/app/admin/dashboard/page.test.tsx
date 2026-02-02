import { render, screen } from '@testing-library/react';
import AdminDashboard from './page';

// --- MOCKS ---

// Mock de useRouter pour Jest (évite l'erreur sur push/refresh)
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() })
}));

// Mock Supabase pour éviter les appels réseau réels
const mockSupabase = {
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: { id: '123', email: 'admin@test.com' } }, error: null }),
    signOut: jest.fn().mockResolvedValue({})
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ full_name: 'Admin Test', role: 'admin' }),
  count: jest.fn().mockResolvedValue({ count: 5 })
};

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: () => mockSupabase
}));

// Mock des composants Recharts pour Jest
jest.mock('recharts', () => ({
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>
}));

// Mock des icônes lucide-react pour Jest
jest.mock('lucide-react', () => {
  const React = require('react');
  return {
    Users: (props: any) => <div {...props} />,
    Building2: (props: any) => <div {...props} />,
    BarChart3: (props: any) => <div {...props} />,
    ShieldCheck: (props: any) => <div {...props} />,
    Search: (props: any) => <div {...props} />,
    Bell: (props: any) => <div {...props} />,
    MoreVertical: (props: any) => <div {...props} />,
    TrendingUp: (props: any) => <div {...props} />,
    Calendar: (props: any) => <div {...props} />,
    User: (props: any) => <div {...props} />,
    LogOut: (props: any) => <div {...props} />,
    Loader2: (props: any) => <div {...props} />,
    ArrowUpRight: (props: any) => <div {...props} />
  };
});

// --- TEST PRINCIPAL ---
describe('AdminDashboard page', () => {
  it('renders without crashing', async () => {
    render(<AdminDashboard />); // Rend le composant
    expect(screen.getByText(/Administration/i)).toBeInTheDocument(); // Vérifie qu'un texte clé existe
  });
});
