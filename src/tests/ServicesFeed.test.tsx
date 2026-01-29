import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import ServicesFeed from '../pages/ServicesFeed';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as queryClientLib from '@/lib/queryClient'; // To mock apiRequest

// --- Mocks ---

// Wouter
vi.mock('wouter', () => ({
  Link: ({ children, href }: any) => <a href={href}>{children}</a>,
  useLocation: () => ['/services', vi.fn()],
}));

// Auth Hook
vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User' },
    isLoading: false,
  }),
}));

// Mock apiRequest
const mockServices = [
  {
    id_serviceFreelancer: 1,
    title: 'Projeto Mockado',
    description: 'Descrição do serviço de teste',
    price: '1500.00',
    createdAt: new Date().toISOString(),
    ServiceProvider: {
      user_id: 2,
      provider_id: 1,
      profession: 'Arquiteto'
    },
    // Enriched data simulation if needed, but the component fetches users separately
    // Based on component logic, it fetches user 2.
  }
];

const mockUserProvider = {
  user: {
      id: 2,
      name: 'Provider Name',
      email: 'prov@test.com',
      type: 'prestador',
      perfil: 'avatar.png'
  }
};

// We need to mock apiRequest default export or named export?
// The component imports { apiRequest } from ...
// We can use vi.spyOn
vi.spyOn(queryClientLib, 'apiRequest').mockImplementation(async (method, url) => {
  if (url === '/servicesfreelancer/getall') {
    return {
      ok: true,
      json: async () => ({ servicesFreelancer: mockServices })
    } as Response;
  }
  if (url.startsWith('/users/')) {
     return {
         ok: true,
         json: async () => mockUserProvider
     } as Response;
  }
  return { ok: false } as Response;
});

// Query Client
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe('ServicesFeed Component', () => {
  it('renders services list', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ServicesFeed />
      </QueryClientProvider>
    );

    // Initial loading state might be fast
    // Wait for service title to appear
    await waitFor(() => {
      expect(screen.getByText('Projeto Mockado')).toBeInTheDocument();
    });

    // Check price formatting
    expect(screen.getByText(/R\$\s?1\.500,00/)).toBeInTheDocument(); 
    
    // Check provider name (enriched)
    await waitFor(() => {
        expect(screen.getByText('Provider Name')).toBeInTheDocument();
    });
  });
});
