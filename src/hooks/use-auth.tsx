import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
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
  sessionUser: User,
  csrfToken: string | null,
  setUser: React.Dispatch<React.SetStateAction<User | null>>
) => {
  // Guarda apenas metadados do usuário — o token fica no cookie HttpOnly
  if (sessionUser?.id) {
    sessionStorage.setItem("user_id", String(sessionUser.id));
  }
  if (
    sessionUser?.signature_password_set !== undefined &&
    sessionUser?.signature_password_set !== null
  ) {
    sessionStorage.setItem(
      "signature_password_set",
      sessionUser.signature_password_set ? "true" : "false"
    );
  }
  if (sessionUser?.type) {
    sessionStorage.setItem("user_type", sessionUser.type);
  }
  if (csrfToken) {
    sessionStorage.setItem("csrf_token", csrfToken);
  }
  setUser(sessionUser);
  return sessionUser;
};

const fetchSession = async () => {
  const res = await apiRequest("GET", "/auth/session");
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return {
    user: data?.data?.user || null,
    csrfToken: data?.data?.csrfToken || null,
  };
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
      password: data.password || "",
    };
    const validate = await apiRequest("POST", "/auth/login", sanitized);
    if (!validate.ok) {
      // Tenta extrair mensagem do backend (formato { error: { message }, message }).
      // Antes só 401 mostrava toast — qualquer outro erro (403, 500, etc) caía
      // silenciosamente. Resultado: conta Google tentando logar com senha não
      // mostrava feedback algum.
      let backendMessage: string | null = null;
      try {
        const body = await validate.clone().json();
        backendMessage = body?.error?.message || body?.message || null;
      } catch {
        // resposta não-JSON, ignora
      }
      const fallback =
        validate.status === 401
          ? "Email ou senha incorretos"
          : "Não foi possível fazer login. Tente novamente.";
      toast({
        title:
          validate.status === 401 ? "Credenciais inválidas" : "Erro no login",
        description: backendMessage || fallback,
        variant: "destructive",
      });
      return false;
    }
    const sessionData = await fetchSession();
    if (!sessionData?.user) {
      throw new Error("Sessão não pôde ser carregada após o login.");
    }
    const payload = persistSession(sessionData.user, sessionData.csrfToken, setUser);
    const needsOnboarding = !payload.perfil_completo;
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
      data: { needs_onboarding?: boolean };
      message?: string;
    };

    const sessionData = await fetchSession();
    if (!sessionData?.user) {
      throw new Error("Sessão não pôde ser carregada após o login com Google.");
    }

    const needsOnboarding =
      body?.data?.needs_onboarding !== undefined
        ? !!body.data.needs_onboarding
        : !sessionData.user.perfil_completo;
    setNeedsOnboarding(needsOnboarding);
    setOnboardingOptional(false);
    toast({
      title: "Login via Google realizado",
      description: body?.message || "Seja bem vindo!",
    });
    const sessionPayload = persistSession(sessionData.user, sessionData.csrfToken, setUser);
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
    const sanitized = {
      ...data,
      name: data.name?.trim() || "",
      email: data.email?.trim().toLowerCase() || "",
      password: data.password || "",
      confirmPassword: data.confirmPassword || "",
    };

    const userRes = await apiRequest("POST", "/users", sanitized);
    const body = await userRes.json().catch(() => null);

    if (userRes.status === 409) {
      toast({
        title: "Usuário já cadastrado",
        description:
          body?.error?.details?.[0]?.message ||
          body?.message ||
          "Email ou CPF já cadastrado.",
        variant: "destructive",
      });
      return false;
    }

    if (!userRes.ok || body?.success === false) {
      toast({
        title: "Não foi possível concluir o cadastro",
        description:
          body?.error?.details?.[0]?.message ||
          body?.message ||
          "Revise os dados informados e tente novamente.",
        variant: "destructive",
      });
      return false;
    }

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
    const storedOnboarding = sessionStorage.getItem("needs_onboarding") === "true";
    const storedOptional = sessionStorage.getItem("onboarding_optional") === "true";
    const storedSignature = sessionStorage.getItem("signature_password_set");
    const storedUserType = sessionStorage.getItem("user_type");

    setIsLoading(true);
    fetchSession()
      .then(async (sessionData) => {
        if (!sessionData?.user) {
          sessionStorage.clear();
          setUser(null);
          return;
        }
        sessionStorage.setItem("csrf_token", sessionData.csrfToken || "");
        let profile = sessionData.user;
        if (sessionData.user.id) {
          const freshProfile = await fetchUserProfile(sessionData.user.id);
          if (freshProfile) {
            profile = { ...sessionData.user, ...freshProfile };
          }
        }
        if (storedSignature === "true") profile.signature_password_set = true;
        else if (storedSignature === "false") profile.signature_password_set = false;
        if (storedUserType === "prestador" || storedUserType === "contratante") {
          profile.type = storedUserType;
        }
        if (profile.type) sessionStorage.setItem("user_type", profile.type);
        sessionStorage.setItem("user_id", String(profile.id));
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
