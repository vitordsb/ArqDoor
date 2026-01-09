import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import { parseJwt } from "@/lib/utils";
import {
  User,
  AuthContextType,
  RegisterInterface,
  LoginInterface,
  GoogleLoginPayload,
} from "@/lib/Interfaces";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

const persistSession = (
  token: string,
  setUser: React.Dispatch<React.SetStateAction<User | null>>
) => {
  const payload = parseJwt<User>(token);
  const expiresAt = Date.now() + 10000 * 60 * 60; // 10h
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("tokenExpiry", expiresAt.toString());
  setUser(payload);
  return payload;
};

export const login = async (
  data: LoginInterface,
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setNeedsOnboarding: (value: boolean) => void,
  setOnboardingOptional: (value: boolean) => void
) => {
  try {
    const sanitized = {
      email: data.email?.trim().toLowerCase() || "",
      password: data.password?.trim() || "",
    };
    const validate = await apiRequest("POST", "/auth/login", sanitized);
    if (validate.status === 401) {
      toast({
        title: "Credenciais invalidas",
        description: "Email ou senha incorretos",
        variant: "destructive",
      });
      return false;
    }
    if (!validate.ok) return false;
    const body = (await validate.json()) as { data: { token: string } };
    const token = body.data.token;
    const payload = persistSession(token, setUser);
    const needsOnboarding = !payload?.perfil_completo;
    setNeedsOnboarding(needsOnboarding);
    setOnboardingOptional(needsOnboarding);
    toast({
      title: "Login realizado",
      description: "Seja bem vindo!",
      variant: "default",
    });
    return true;
  } catch (error) {
    console.log(error);
    toast({
      title: "Erro no login",
      description: "Erro interno, por favor tente novamente mais tarde",
      variant: "destructive",
    });
    return false;
  }
};

export const loginWithGoogleRequest = async (
  payload: GoogleLoginPayload,
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setNeedsOnboarding: (value: boolean) => void,
  setOnboardingOptional: (value: boolean) => void
) => {
  try {
    if (!payload.idToken && !payload.accessToken) {
      toast({
        title: "Falha no login com Google",
        description: "Token não encontrado.",
        variant: "destructive",
      });
      return;
    }

    const res = await apiRequest("POST", "/auth/google", {
      idToken: payload.idToken,
      accessToken: payload.accessToken,
      type: payload.type,
      mode: payload.mode || "login",
    });

    if (res.status === 409) {
      const errorBody = await res.json().catch(() => null);
      toast({
        title: "Conta já conectada",
        description: errorBody?.message || "Usuário já conectado com Google, por favor faça login.",
        variant: "destructive",
      });
      return { status: "already_connected" as const };
    }

    if (res.status === 401 || res.status === 400) {
      const errorBody = await res.json().catch(() => null);
      toast({
        title: "Erro no login com Google",
        description: errorBody?.message || "Credenciais inválidas",
        variant: "destructive",
      });
      return { status: "failed" as const };
    }

    if (!res.ok) {
      toast({
        title: "Erro no login com Google",
        description: "Falha inesperada, tente novamente.",
        variant: "destructive",
      });
      return { status: "failed" as const };
    }

    const body = (await res.json()) as {
      data: { token: string; needs_onboarding?: boolean };
      message?: string;
    };
    persistSession(body.data.token, setUser);
    const needsOnboarding = !!body?.data?.needs_onboarding;
    setNeedsOnboarding(needsOnboarding);
    setOnboardingOptional(false);
    toast({
      title: "Login via Google realizado",
      description: body?.message || "Seja bem vindo!",
    });
    return {
      status: needsOnboarding ? "logged_in_needs_onboarding" as const : "logged_in" as const,
    };
  } catch (error) {
    console.log(error);
    toast({
      title: "Erro no login com Google",
      description: "Erro interno, por favor tente novamente mais tarde",
      variant: "destructive",
    });
    return { status: "failed" as const };
  }
};

export const register = async (data: RegisterInterface) => {
  try {
    const userRes = await apiRequest("POST", "/users", data);
    console.log(userRes)
    switch (userRes.status) {
      case 409:
        toast({
          title: "Usuário já cadastrado",
          description: "Email ou CPF ja cadastrado",
          variant: "destructive",
        });
        return false;
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
    return true;
  } catch (error) {
    console.log(error);
    toast({
      title: "Erro do servidor",
      description: "Erro interno, por favor tente novamente mais tarde",
      variant: "destructive",
    });
    return false;
  }
};

export const logout = async (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setNeedsOnboarding?: (value: boolean) => void,
  setOnboardingOptional?: (value: boolean) => void
) => {
  // Muitos backends com JWT não precisam de rota de logout;
  // limpar o token local já é suficiente.
  try {
    // Se no futuro existir uma rota /auth/logout, você pode reativar:
    // const res = await apiRequest("POST", "/auth/logout");
    // ignorar 404 ou falhas não críticas
  } catch {
    // silenciosamente ignora erros de logout remoto
  }
  sessionStorage.clear();
  setUser(null);
  setNeedsOnboarding?.(false);
  setOnboardingOptional?.(false);
  toast({ title: "Até mais!", description: "Você saiu da sua conta." });
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [needsOnboarding, setNeedsOnboardingState] = useState(false);
  const [onboardingOptional, setOnboardingOptionalState] = useState(false);

  const setNeedsOnboarding = (value: boolean) => {
    setNeedsOnboardingState(value);
    sessionStorage.setItem("needs_onboarding", value ? "true" : "false");
  };

  const setOnboardingOptional = (value: boolean) => {
    setOnboardingOptionalState(value);
    sessionStorage.setItem("onboarding_optional", value ? "true" : "false");
  };

  const updateUserLocal = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  };
  useEffect(() => {
    setIsLoading(true);
    const token = sessionStorage.getItem("token");
    const expiry = sessionStorage.getItem("tokenExpiry");
    const storedOnboarding = sessionStorage.getItem("needs_onboarding") === "true";
    const storedOptional = sessionStorage.getItem("onboarding_optional") === "true";
    if (token && expiry && Number(expiry) > Date.now()) {
      try {
        const payload = parseJwt<User>(token);
        setUser(payload?.id ? payload : null);
        setNeedsOnboardingState(storedOnboarding);
        setOnboardingOptionalState(storedOptional);
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
          return login(data, setUser, setNeedsOnboarding, setOnboardingOptional);
        },
        loginWithGoogle(payload) {
          return loginWithGoogleRequest(
            payload,
            setUser,
            setNeedsOnboarding,
            setOnboardingOptional
          );
        },
        register,
        logout() {
          return logout(setUser, setNeedsOnboarding, setOnboardingOptional);
        },
        isInitialized,
        needsOnboarding,
        setNeedsOnboarding,
        onboardingOptional,
        setOnboardingOptional,
        updateUserLocal,
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
