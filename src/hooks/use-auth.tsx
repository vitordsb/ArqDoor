import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import { parseJwt } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
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
  // Guarda apenas metadados do usuário — o token fica no cookie HttpOnly
  if (payload?.id) {
    sessionStorage.setItem("user_id", String(payload.id));
  }
  if (payload?.signature_password_set !== undefined && payload?.signature_password_set !== null) {
    sessionStorage.setItem(
      "signature_password_set",
      payload.signature_password_set ? "true" : "false"
    );
  }
  if (payload?.type) {
    sessionStorage.setItem("user_type", payload.type);
  }
  setUser(payload);
  return payload;
};

const fetchUserProfile = async (userId?: number) => {
  if (!userId) return null;
  const res = await apiRequest("GET", `/users/${userId}`);
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return data?.user || null;
};

const fetchAndMergeProfile = async (
  user: User,
  setUser: React.Dispatch<React.SetStateAction<User | null>>
) => {
  if (!user.id) return null;
  try {
    const profile = await fetchUserProfile(user.id);
    if (!profile) return null;
    if (profile.type) {
      sessionStorage.setItem("user_type", profile.type);
    }
    setUser((prev) => (prev ? { ...prev, ...profile } : prev));
    return profile;
  } catch (err) {
    console.error("Erro ao atualizar dados do usuário:", err);
    return null;
  }
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
    if (payload?.id) {
      const freshProfile = await fetchUserProfile(payload.id);
      if (freshProfile) {
        if (freshProfile.type) {
          sessionStorage.setItem("user_type", freshProfile.type);
        }
        setUser((prev) => (prev ? { ...prev, ...freshProfile } : prev));
      }
    }
    return true;
  } catch (error) {
    console.error(error);
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

    // Check if this was a registration (status 201)
    if (res.status === 201 && payload.mode === "register") {
      const body = await res.json();
      toast({
        title: "Conta criada com sucesso!",
        description: body?.message || "Faça login com Google para continuar",
      });
      return { status: "registered" as const };
    }

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

    const needsOnboarding = !!body?.data?.needs_onboarding;
    setNeedsOnboarding(needsOnboarding);
    setOnboardingOptional(false);
    toast({
      title: "Login via Google realizado",
      description: body?.message || "Seja bem vindo!",
    });
    const sessionPayload = persistSession(body.data.token, setUser);
    if (sessionPayload?.id) {
      const freshProfile = await fetchUserProfile(sessionPayload.id);
      if (freshProfile) {
        if (freshProfile.type) {
          sessionStorage.setItem("user_type", freshProfile.type);
        }
        setUser((prev) => (prev ? { ...prev, ...freshProfile } : prev));
      }
    }
    return {
      status: needsOnboarding ? "logged_in_needs_onboarding" as const : "logged_in" as const,
    };
  } catch (error) {
    console.error(error);
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
    switch (userRes.status) {
      case 409:
        toast({
          title: "Usuário já cadastrado",
          description: "Email ou CPF ja cadastrado",
          variant: "destructive",
        });
        return false;
    }
    await userRes.json();
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
    console.error(error);
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
  try {
    await apiRequest("POST", "/auth/logout");
  } catch {
    // ignora falha de rede — o sessionStorage é limpo de qualquer forma
  }
  sessionStorage.clear();
  setUser(null);
  setNeedsOnboarding?.(false);
  setOnboardingOptional?.(false);
  toast({ title: "Até mais!", description: "Você saiu da sua conta." });
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
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
    if (typeof data.signature_password_set === "boolean") {
      sessionStorage.setItem(
        "signature_password_set",
        data.signature_password_set ? "true" : "false"
      );
    }
    if (data.type) {
      sessionStorage.setItem("user_type", data.type);
    }
    setUser((prev) => (prev ? { ...prev, ...data } : prev));
  };
  useEffect(() => {
    const userId = sessionStorage.getItem("user_id");
    const storedOnboarding = sessionStorage.getItem("needs_onboarding") === "true";
    const storedOptional = sessionStorage.getItem("onboarding_optional") === "true";
    const storedSignature = sessionStorage.getItem("signature_password_set");
    const storedUserType = sessionStorage.getItem("user_type");

    if (!userId) {
      setIsInitialized(true);
      return;
    }

    setIsLoading(true);
    fetchUserProfile(Number(userId))
      .then((profile) => {
        if (!profile) {
          sessionStorage.clear();
          setUser(null);
          return;
        }
        if (storedSignature === "true") profile.signature_password_set = true;
        else if (storedSignature === "false") profile.signature_password_set = false;
        if (storedUserType === "prestador" || storedUserType === "contratante") {
          profile.type = storedUserType;
        }
        if (profile.type) sessionStorage.setItem("user_type", profile.type);
        setUser(profile);
        setNeedsOnboardingState(storedOnboarding);
        setOnboardingOptionalState(storedOptional);
      })
      .catch(() => {
        sessionStorage.clear();
        setUser(null);
      })
      .finally(() => {
        setIsInitialized(true);
        setIsLoading(false);
      });
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
          const result = logout(setUser, setNeedsOnboarding, setOnboardingOptional);
          queryClient.clear(); // Limpa todo o cache do React Query
          return result;
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
