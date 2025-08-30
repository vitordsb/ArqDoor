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
    if (data.email === "") {
      toast({
        title: "Erro",
        description: "Por favor preencha o campo de email",
        variant: "destructive"
      });
      return
    }
    else if (data.password === "") {
      toast({
        title: "Erro",
        description: "Por favor preencha o campo de senha",
        variant: "destructive"
      });
      return
    }
    const loginRes = await apiRequest("POST", "/auth/login", data);
    if (!loginRes.ok) throw new Error("Credenciais inválidas");
    const body = (await loginRes.json()) as { data: { token: string } };
    const token = body.data.token;
    const expiresAt = Date.now() + 10000 * 60 * 60; // 10h
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("tokenExpiry", expiresAt.toString());
    const payload = parseJwt<User>(token);
    setUser(payload);
    toast({ title: "Bem-vindo!", description: "Login realizado com sucesso." });
  };

  const register = async (data: RegisterInterface) => {
    if (data.name === "") {
      toast({
        title: "Erro",
        description: "Campo de nome vazio, por favor preencha",
        variant: "destructive"
      });
      return
    }
    else if (data.email === "") {
      toast({
        title: "Erro",
        description: "Por favor preencha o campo de email",
        variant: "destructive"
      });
      return
    }
    else if (data.gender === "") {
      toast({
        title: "Erro",
        description: "Por favor preencha o campo de sexo",
        variant: "destructive"
      });
      return
    }
    else if (data.birth === "") {
      toast({
        title: "Erro",
        description: "Por favor preencha o campo de data de nascimento",
        variant: "destructive"
      });
      return
    }
    else if (data.password.length < 6) {
      toast({
        title: "Erro",
        description: "Senha muito curta, por favor preencha 6 digitos",
        variant: "destructive"
      });
      return
    }
    else if (data.password !== data.confirmPassword) {
      toast({
        title: "Erro",
        description: "Senhas não coincidem, por favor preencha novamente",
        variant: "destructive"
      });
      return
    }

    else if (data.termos_aceitos === false) {
      toast({
        title: "Erro",
        description: "É necessário aceitar os termos para cadastrar",
        variant: "destructive"
      });
      return
    }
    let userRegistrationPayload: any = { ...data };
    const userRes = await apiRequest("POST", "/users", userRegistrationPayload);
    if (!userRes.ok) {
      toast({
        title: "Erro",
        description: "Erro interno, por favor tente novamente mais tarde",
        variant: "destructive",
      });
      return;
    }
    const successMessage = data.type === "prestador"
      ? "Seu cadastro como prestador foi realizado com sucesso!"
      : "Seu cadastro como cliente foi realizado com sucesso!";

    toast({
      title: "Cadastro realizado",
      description: successMessage
    });
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

