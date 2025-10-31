import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

export const getBaseUrl = () => {
  const rorkApiUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  if (rorkApiUrl) {
    console.log('[tRPC] Using Rork API base URL:', rorkApiUrl);
    return rorkApiUrl;
  }
  
  console.warn('[tRPC] EXPO_PUBLIC_RORK_API_BASE_URL not set, trying to determine automatically');
  
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    console.log('[tRPC] Using window origin:', origin);
    return origin;
  }
  
  console.error('[tRPC] Unable to determine base URL');
  throw new Error('No se puede determinar la URL base del servidor');
};

export const createTrpcClient = () => {
  return trpc.createClient({
    links: [
      httpLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
        headers: () => {
          return {
            "Content-Type": "application/json",
          };
        },
        fetch: async (url, options) => {
          console.log('[tRPC] Fetching:', url);
          console.log('[tRPC] Method:', options?.method);
          
          try {
            const response = await fetch(url, {
              ...options,
              credentials: "include",
            });
            
            console.log('[tRPC] Response status:', response.status);
            console.log('[tRPC] Response OK:', response.ok);
            
            return response;
          } catch (error) {
            console.error('[tRPC] Network error:', error);
            
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
              throw new Error('No se pudo conectar con el servidor. Asegúrate de que la aplicación esté ejecutándose correctamente.');
            }
            
            throw error;
          }
        },
      }),
    ],
  });
};

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
