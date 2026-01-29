'use client';

import { jest } from '@jest/globals';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboard from './page';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(),
}));

jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}));

describe('AdminDashboard', () => {
  let mockPush: jest.Mock<any>;
  let mockRefresh: jest.Mock<any>;
  let mockSignOut: jest.Mock<any>;
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockPush = jest.fn();
    mockRefresh = jest.fn();
    mockSignOut = jest.fn();

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
        signOut: mockSignOut,
      },
      from: jest.fn(),
    };

    (useRouter as jest.Mock).mockReturnValue({ 
      push: mockPush, 
      refresh: mockRefresh 
    });
    
    (createBrowserClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('redirige vers login si non authentifié', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ 
      data: { user: null }
    });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login');
    });
  });

  it('charge les données de l\'admin', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'admin-123', email: 'admin@woutty.com' } }
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { full_name: 'Admin Test', role: 'admin' }
          })
        })
      })
    });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    });
  });
});