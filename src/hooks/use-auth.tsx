import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import { parseJwt } from "@/lib/utils";
import { User, AuthContextType } from "@/lib/Interfaces";
import { register, login, logout } from "@/hooks/requests/AuthRequests";
import { logFunc } from "@/lib/logFunc"

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    const token = sessionStorage.getItem("token");
    const expiry = sessionStorage.getItem("tokenExpiry");
    if (token && expiry && Number(expiry) > Date.now()) {
      try {
        const payload = parseJwt<User>(token);
        setUser(payload?.id ? payload : null);
      } catch {
        sessionStorage.clear();
        setUser(null);
      }
    }
    setIsInitialized(true);
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login(data) {
          return login(data, setUser);
        },
        register,
        logout() {
          return logout(setUser);
        },
        isInitialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve estar dentro de AuthProvider");
  return ctx;
}

