import { QueryClient } from "@tanstack/react-query";
export const API_BASE_URL = "http://localhost:8080";
// export const API_BASE_URL = "https://api.arqdoor.com";

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
