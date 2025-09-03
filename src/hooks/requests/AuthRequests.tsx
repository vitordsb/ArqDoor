import React, { createContext, ReactNode, useContext, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { parseJwt } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { User, RegisterInterface, AuthContextType, LoginInterface } from "@/lib/Interfaces";

export const login = async (
  data: LoginInterface,
  setUser: React.Dispatch<React.SetStateAction<User | null>>
) => {
  const loginRes = await apiRequest("POST", "/auth/login", data);
  console.log(loginRes);
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
  const payload = parseJwt<User>(token);
  const expiresAt = Date.now() + 10000 * 60 * 60; // 10h
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("tokenExpiry", expiresAt.toString());
  setUser(payload);
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

