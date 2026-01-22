
// src/pages/ClientProfile.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "wouter";
import ApplicationLayout from "@/components/layouts/ApplicationLayout";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, API_BASE_URL } from "@/lib/queryClient";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { User, Briefcase, Loader2, MessageCircle, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export interface UserApi {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  perfil_completo?: boolean;
  cpf?: string;
  perfil?: string;
}

export interface Demand {
  id_demand: number;
  id_user: number;
  title: string;
  description: string;
  price: number;
  created_at: string;
}

const buildImageUrl = (path?: string) => {
  if (!path) return "";
  const normalizedPath = path.replace(/\\/g, "/");
  return normalizedPath.startsWith("http")
    ? normalizedPath
    : `${API_BASE_URL}/${normalizedPath.replace(/^\/+/, "")}`;
};

export default function ClientProfile() {
  const { user_id } = useParams<{ user_id: string }>();
  const [location, setLocation] = useLocation();
  const { user: currentUser } = useAuth();

  const { data: usersEnv, isLoading: loadingUsers } = useQuery<{ users: UserApi[] }>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/users");
      return res.json();
    },
  });

  const user = usersEnv?.users.find((u) => String(u.id) === user_id);

  const [demands, setDemands] = useState<Demand[]>([]);
  const [loadingDm, setLoadingDm] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest("GET", "/demands/getall");
        const body = await res.json();
        setDemands(
          (Array.isArray(body.demands) ? body.demands : []).filter(
            (d: Demand) => String(d.id_user) === user_id
          )
        );
      } finally {
        setLoadingDm(false);
      }
    })();
  }, [user_id]);

  if (loadingUsers) {
    return (
      <ApplicationLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="animate-spin w-8 h-8 text-orange-600" />
        </div>
      </ApplicationLayout>
    );
  }

  if (!user) {
    return (
      <ApplicationLayout>
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-slate-600">Contratante não encontrado.</p>
        </div>
      </ApplicationLayout>
    );
  }

  const getInitials = (n: string) =>
    n
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const canShowEmail =
    !currentUser ||
    currentUser.id === user.id ||
    currentUser.type !== "prestador";

  const hasCpf = !!user.cpf?.replace(/\D/g, "").trim();
  const trustPercent = hasCpf && user.perfil_completo ? 100 : 60;
  const trustLabel = hasCpf && user.perfil_completo
    ? "Informações completas"
    : "Informações pendentes";

  return (
    <ApplicationLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <Card className="p-6 flex items-center gap-6">
          <Avatar className="w-24 h-24 border-2 border-orange-500">
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            <AvatarImage src={buildImageUrl(user.perfil)} alt={user.name} className="object-cover" />
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-slate-600">Contratante</p>
            <Badge className="mt-2">Membro desde {new Date(user.createdAt).toLocaleDateString()}</Badge>
          </div>
          <Button size="sm" onClick={() => setLocation(`/messages/${user.id}`)}>
            <MessageCircle className="w-4 h-4 mr-1" /> Enviar mensagem
          </Button>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Esquerda */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {canShowEmail ? (
                  <p><User className="w-4 h-4 inline mr-2" /> {user.email}</p>
                ) : (
                  <p className="text-sm text-slate-500">Email oculto para prestadores.</p>
                )}
                <p><Clock className="w-4 h-4 inline mr-2" /> Desde {new Date(user.createdAt).toLocaleDateString()}</p>
                <div className="pt-2">
                  <p className="text-sm font-medium">Nível de confiança</p>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{trustPercent}%</span>
                    <span>{trustLabel}</span>
                  </div>
                  <Progress value={trustPercent} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Direita */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Demandas Publicadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingDm ? (
                  <Loader2 className="animate-spin w-6 h-6 mx-auto" />
                ) : demands.length === 0 ? (
                  <p className="text-slate-500">Nenhuma demanda publicada.</p>
                ) : (
                  demands.map((d) => (
                    <div key={d.id_demand} className="p-3 border rounded-lg">
                      <h3 className="font-semibold">{d.title}</h3>
                      <p className="text-slate-600">{d.description}</p>
                      <p className="text-green-600 font-bold">R$ {d.price}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ApplicationLayout>
  );
}
