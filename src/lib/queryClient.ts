import { QueryClient } from "@tanstack/react-query";
export const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "/api";

export async function apiRequest(
  method: string,
  path: string,
  data?: unknown,
  extraHeaders?: Record<string, string>
): Promise<Response> {
  const url = API_BASE_URL + path;
  const token = sessionStorage.getItem("token");
  const headers: Record<string, string> = { ...(extraHeaders || {}) };

  let bodyContent: BodyInit | undefined;

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (data) {
    if (data instanceof FormData) {
      bodyContent = data;
    } else {
      headers["Content-Type"] = "application/json";
      bodyContent = JSON.stringify(data);
    }
  }

  return fetch(url, {
    method,
    headers,
    body: bodyContent,
  });
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
