import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import DemandsFeed from '../pages/DemandsFeed';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as queryClientLib from '@/lib/queryClient';

// --- Mocks ---

vi.mock('wouter', () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
  useLocation: () => ['/demands', vi.fn()],
}));

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 1 },
    isLoading: false,
  }),
}));

const mockDemands = [
  {
    id_demand: 1,
    title: 'Demanda Mockada',
    description: 'Descrição da demanda de teste',
    price: 3000.00,
    createdAt: new Date().toISOString(),
    id_user: 3,
    User: {
      id: 3,
      name: 'Client Name',
      email: 'client@test.com',
      perfil: 'avatar.png'
    }
  }
];

vi.spyOn(queryClientLib, 'apiRequest').mockImplementation(async (method: string, url: string) => {
  if (url === '/demands/getall') {
    return {
      ok: true,
      json: async () => ({ demands: mockDemands })
    } as Response;
  }
  return { ok: false } as Response;
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe('DemandsFeed Component', () => {
  it('renders demands list', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <DemandsFeed />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Demanda Mockada')).toBeInTheDocument();
    });

    expect(screen.getByText('Client Name')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s?3\.000,00/)).toBeInTheDocument();
  });
});
