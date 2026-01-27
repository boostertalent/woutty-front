import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(),
}));

jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => (
      <div style={{ width: 800, height: 400 }}>{children}</div>
    ),
  };
});

describe('AdminDashboard', () => {
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();
  const mockSignOut = jest.fn();
  
  const mockSupabase = {
    auth: {
      getUser: jest.fn(),
      signOut: mockSignOut,
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, refresh: mockRefresh });
    (createBrowserClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('affiche le skeleton loader initialement', () => {
    mockSupabase.auth.getUser.mockReturnValue(new Promise(() => {}));
    render(<AdminDashboard />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('redirige vers login si non authentifié', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
    render(<AdminDashboard />);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/auth/login'));
  });

  it('charge et affiche les données de l\'admin et les compteurs', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-123', email: 'admin@woutty.com' } },
      error: null
    });

    mockSupabase.single.mockResolvedValue({
      data: { full_name: 'Woutty Admin', role: 'admin' }
    });

    mockSupabase.eq.mockImplementation((column, value) => {
      if (value === 'creator') return Promise.resolve({ count: 150 });
      if (value === 'brand') return Promise.resolve({ count: 45 });
      return mockSupabase;
    });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Woutty Admin/i)).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
    });
  });

  it('gère la déconnexion correctement', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: '123' } },
      error: null
    });

    render(<AdminDashboard />);

    const logoutBtn = await screen.findByText(/Se déconnecter/i);
    fireEvent.click(logoutBtn);

    expect(mockSignOut).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login');
      expect(mockRefresh).toHaveBeenCalled();
    });
  });
});