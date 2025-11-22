
// src/pages/ProviderProfile.tsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import ApplicationLayout from "@/components/layouts/ApplicationLayout";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Briefcase,
  Grid3X3,
  Loader2,
  MessageCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useLocation } from "wouter";

export interface ProviderApi {
  provider_id: number;
  user_id: number;
  profession: string;
  views_profile: number;
  about: string | null;
  rating_mid: string;
  created_at: string;
}

export interface UserApi {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Service {
  id_serviceFreelancer: number;
  id_provider: number;
  title: string;
  description: string;
  price: string;
  created_at: string;
}

export interface PortfolioItem {
  id: number;
  image_id: number;
  user_id: number;
  title: string;
  description: string;
  created_at: string;
}

export default function ProviderProfile() {
  const { provider_id } = useParams<{ provider_id: string }>();
  const [location, setLocation] = useLocation();

  const { data: providerEnv, isLoading: loadingProvider } = useQuery<{ provider: ProviderApi }>({
    queryKey: ["provider", provider_id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/providers/${provider_id}`);
      return res.json();
    },
  });

  const provider = providerEnv?.provider;

  const { data: userEnv, isLoading: loadingUser } = useQuery<{ user: UserApi }>({
    queryKey: ["user", provider?.user_id],
    enabled: !!provider,
    queryFn: async () => {
      const res = await apiRequest("GET", `/users/${provider?.user_id}`);
      return res.json();
    },
  });

  const user = userEnv?.user;

  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(true);

  useEffect(() => {
    if (provider_id) {
      loadExtras();
    }
  }, [provider_id]);

  const loadExtras = async () => {
    setLoadingExtra(true);
    try {
      const res = await apiRequest("GET", "/servicesfreelancer/getall");
      const body = await res.json();
      setServices((body.servicesFreelancer || []).filter((s: Service) => String(s.id_provider) === provider_id));

      const portRes = await apiRequest("GET", `/portfolio?user=${user?.id}`);
      if (portRes.ok) {
        const portBody = await portRes.json();
        setPortfolio(portBody.posts || []);
      }
    } finally {
      setLoadingExtra(false);
    }
  };

  if (loadingProvider || loadingUser) {
    return (
      <ApplicationLayout>
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="animate-spin w-8 h-8 text-orange-600" />
        </div>
      </ApplicationLayout>
    );
  }

  if (!provider || !user) {
    return (
      <ApplicationLayout>
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-slate-600">Prestador não encontrado.</p>
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

  return (
    <ApplicationLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <Card className="p-6 flex items-center gap-6">
          <Avatar className="w-24 h-24 border-2 border-orange-500">
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-slate-600">{provider.profession}</p>
            <div className="flex gap-2 mt-2">
              <Badge>{provider.rating_mid} estrelas</Badge>
              <Badge>{provider.views_profile} views</Badge>
            </div>
          </div>
          <Button size="sm" onClick={() => setLocation(`/messages/${user.id}`)}>
            <MessageCircle className="w-4 h-4 mr-1" /> Enviar mensagem
          </Button>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Esquerda */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><Clock className="w-4 h-4 inline mr-2" /> Desde {new Date(user.createdAt).toLocaleDateString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Sobre mim</CardTitle>
              </CardHeader>
              <CardContent>
                {provider.about || "Este prestador ainda não adicionou uma descrição."}
              </CardContent>
            </Card>
          </div>

          {/* Direita */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Serviços</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingExtra ? (
                  <Loader2 className="animate-spin w-6 h-6 mx-auto" />
                ) : services.length === 0 ? (
                  <p className="text-slate-500">Nenhum serviço cadastrado.</p>
                ) : (
                  services.map((s) => (
                    <div key={s.id_serviceFreelancer} className="p-3 border rounded-lg">
                      <h3 className="font-semibold">{s.title}</h3>
                      <p className="text-slate-600">{s.description}</p>
                      <p className="text-orange-600 font-bold">R$ {s.price}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfólio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loadingExtra ? (
                  <Loader2 className="animate-spin w-6 h-6 mx-auto" />
                ) : portfolio.length === 0 ? (
                  <p className="text-slate-500">Nenhum projeto no portfólio.</p>
                ) : (
                  portfolio.map((p) => (
                    <div key={p.id} className="p-3 border rounded-lg">
                      <h3 className="font-semibold">{p.title}</h3>
                      <p className="text-slate-600">{p.description}</p>
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

