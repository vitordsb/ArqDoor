import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import { apiRequest } from "@/lib/queryClient";
import { parseJwt } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { User, RegisterInterface, AuthContextType, LoginInterface } from "@/lib/Interfaces";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
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

  const login = async (data: LoginInterface) => {
    const loginRes = await apiRequest("POST", "/auth/login", data);
    if (!loginRes.ok) {
      toast({
        title: "Erro no login",
        description: "Erro interno, por favor tente novamente mais tarde",
        variant: "destructive",
      });
      return;
    }
    const body = await loginRes.json() as { data: { token: string } };
    console.log(body);
    const token = body.data.token;
    console.log(token)
    const payload = parseJwt<User>(token);
    const expiresAt = Date.now() + 10000 * 60 * 60; // 10h
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("tokenExpiry", expiresAt.toString());

    setUser(payload);
  };

  const register = async (data: RegisterInterface) => {
    try {
      const userRes = await apiRequest("POST", "/users", data);

      switch (userRes.status) {
        case 409:
          toast({
            title: "Usuário já cadastrado",
            description: "Email ou CPF ja cadastrado",
            variant: "destructive",
          });
          return
        case 500:
          toast({
            title: "Erro no cadastro",
            description: "Erro interno, por favor tente novamente mais tarde",
            variant: "destructive",
          });
          return
      }
      const userResponse = await userRes.json();
      console.log(userResponse)
      const successMessage = data.type === "prestador"
        ? "Seu cadastro como prestador foi realizado com sucesso!"
        : "Seu cadastro como cliente foi realizado com sucesso!";
      toast({
        title: "Cadastro realizado",
        description: successMessage,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro interno, por favor tente novamente mais tarde",
        variant: "destructive",
      });
    }
  };

  const logout = async () => {
    await apiRequest("POST", "/auth/logout");
    sessionStorage.clear();
    setUser(null);
    toast({ title: "Até mais!", description: "Você saiu da sua conta." });
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        login,
        register,
        logout,
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

