import React, { createContext, ReactNode, useContext, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { parseJwt } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { User, RegisterInterface, AuthContextType, LoginInterface } from "@/lib/Interfaces";

export const login = async (
  data: LoginInterface,
  setUser: React.Dispatch<React.SetStateAction<User | null>>
) => {
  try {
    const validate = await apiRequest("POST", "/auth/login", data);
    if (validate.status === 401) {
      toast({
        title: "Credenciais invalidas",
        description: "Email ou senha incorretos",
        variant: "destructive",
      });
      return;
    }
    if (!validate.ok) return;
    console.log(validate);
    const body = await validate.json() as { data: { token: string } };
    console.log(body);
    const token = body.data.token;
    const payload = parseJwt<User>(token);
    const expiresAt = Date.now() + 10000 * 60 * 60; // 10h
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("tokenExpiry", expiresAt.toString());
    setUser(payload);
    toast({
      title: "Login realizado",
      description: "Seja bem vindo!",
      variant: "default",
    })
  } catch (error) {
    console.log(error);
    toast({
      title: "Erro no login",
      description: "Erro interno, por favor tente novamente mais tarde",
      variant: "destructive",
    });
    return;
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
    console.log(error);
    toast({
      title: "Erro do servidor",
      description: "Erro interno, por favor tente novamente mais tarde",
      variant: "destructive",
    });
  }
};

export const logout = async (setUser: React.Dispatch<React.SetStateAction<User | null>>) => {
  await apiRequest("POST", "/auth/logout");
  sessionStorage.clear();
  setUser(null);
  toast({ title: "Até mais!", description: "Você saiu da sua conta." });
};

