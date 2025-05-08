"use client";

import type React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";

// Modifier les options par défaut du QueryClient pour limiter les requêtes
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Augmenter les temps de cache pour réduire les requêtes API
            staleTime: 5 * 60 * 1000, // 5 minutes (au lieu de 1 minute)
            gcTime: 24 * 60 * 60 * 1000, // 24 heures (au lieu de 5 minutes)
            retry: 1,
            refetchOnWindowFocus: false, // Désactiver le refetch automatique
            refetchOnMount: false, // Désactiver le refetch au montage
            // Ajouter une gestion d'erreur par défaut
            // useErrorBoundary: false,
            throwOnError: false,
          },
        },
      })
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
