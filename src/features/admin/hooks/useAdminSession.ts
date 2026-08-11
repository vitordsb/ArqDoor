import { useCallback, useEffect, useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/queryClient";

const SESSION_EXPIRED_MESSAGE = "Sessão administrativa expirada.";

export function useAdminSession() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const expireSession = useCallback((message: string = SESSION_EXPIRED_MESSAGE) => {
    sessionStorage.removeItem("csrf_token");
    setPassword("");
    setIsAuthenticated(false);
    setAuthSubmitting(false);
    setAuthChecked(true);
    setAuthError(message);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadAdminSession = async () => {
      try {
        const response = await apiRequest("GET", "/admin/auth/session");

        if (!response.ok) {
          if (!cancelled) {
            setIsAuthenticated(false);
          }
          return;
        }

        const payload = (await response.json()) as {
          data?: { csrfToken?: string | null };
        };

        if (!cancelled) {
          if (payload?.data?.csrfToken) {
            sessionStorage.setItem("csrf_token", payload.data.csrfToken);
          }
          setIsAuthenticated(true);
          setAuthError(null);
        }
      } catch (sessionError) {
        if (!cancelled) {
          console.error(sessionError);
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) {
          setAuthChecked(true);
        }
      }
    };

    void loadAdminSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      setAuthSubmitting(true);
      setAuthError(null);

      try {
        const response = await apiRequest("POST", "/admin/auth/login", {
          email: email.trim(),
          password,
        });

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          setAuthError(payload?.message || "Não foi possível iniciar a sessão administrativa.");
          return;
        }

        if (payload?.data?.csrfToken) {
          sessionStorage.setItem("csrf_token", payload.data.csrfToken);
        }

        setPassword("");
        setIsAuthenticated(true);
        setAuthError(null);
      } catch (loginError) {
        console.error(loginError);
        setAuthError("Não foi possível iniciar a sessão administrativa.");
      } finally {
        setAuthSubmitting(false);
        setAuthChecked(true);
      }
    },
    [email, password]
  );

  const logout = useCallback(async () => {
    try {
      await apiRequest("POST", "/admin/auth/logout");
    } catch (logoutError) {
      console.error(logoutError);
    }

    sessionStorage.removeItem("csrf_token");
    setPassword("");
    setIsAuthenticated(false);
    setAuthChecked(true);
    setAuthError(null);
  }, []);

  return {
    email,
    password,
    isAuthenticated,
    authChecked,
    authSubmitting,
    authError,
    setEmail,
    setPassword,
    login,
    logout,
    expireSession,
  };
}
