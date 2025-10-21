'use client';

import { useState } from 'react';
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

type ProvidersProps = {
  children: React.ReactNode;
  state?: unknown;
};

export function Providers({ children, state }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={state}>{children}</HydrationBoundary>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
