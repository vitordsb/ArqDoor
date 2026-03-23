import { QueryClient } from "@tanstack/react-query";
const getBaseUrl = () => {
  const v1 = import.meta.env.VITE_API_URL;
  const v2 = import.meta.env.VITE_API_BASE_URL;
  if (v1 && v1 !== "undefined") return v1;
  if (v2 && v2 !== "undefined") return v2;
  return "https://api.arqdoor.com";
};
export const API_BASE_URL = getBaseUrl();

export async function apiRequest(
  method: string,
  path: string,
  data?: unknown,
  extraHeaders?: Record<string, string>,
  timeout: number = 30000 // 30 seconds default
): Promise<Response> {
  const url = API_BASE_URL + path;
  const headers: Record<string, string> = { ...(extraHeaders || {}) };

  let bodyContent: BodyInit | undefined;

  if (data) {
    if (data instanceof FormData) {
      bodyContent = data;
    } else {
      headers["Content-Type"] = "application/json";
      bodyContent = JSON.stringify(data);
    }
  }

  // Implement timeout with AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: bodyContent,
      credentials: "include", // envia o cookie HttpOnly automaticamente
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Tempo de conexão esgotado - verifique sua internet');
    }
    throw error;
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
