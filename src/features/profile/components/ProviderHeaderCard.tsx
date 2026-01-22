import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, MessageCircle, Star } from "lucide-react";
import { ProviderApi, UserApi } from "../types";
import { API_BASE_URL } from "@/lib/queryClient";

const buildImageUrl = (path?: string) => {
  if (!path) return "";
  const normalizedPath = path.replace(/\\/g, "/");
  return normalizedPath.startsWith("http")
    ? normalizedPath
    : `${API_BASE_URL}/${normalizedPath.replace(/^\/+/, "")}`;
};

interface ProviderHeaderCardProps {
  user: UserApi;
  provider: ProviderApi;
  ratings: { average: number; count: number };
  onMessage: () => void;
  viewerAvatar?: string | null;
}

export function ProviderHeaderCard({
  user,
  provider,
  ratings,
  onMessage,
}: ProviderHeaderCardProps) {
  const getInitials = (n: string) =>
    n
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <Card className="p-6 flex items-center gap-6">
      <Avatar className="w-24 h-24 border-2 border-orange-500">
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        <AvatarImage src={buildImageUrl((user as any)?.perfil)} alt={user.name} className="object-cover" />
      </Avatar>
      <div className="flex-1">
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-slate-600">{provider.profession}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          <Badge className="gap-1">
            <Star className="w-3 h-3" />
            {ratings.count > 0 ? `${ratings.average.toFixed(1)} (${ratings.count})` : "Sem avaliações"}
          </Badge>
          <Badge className="gap-1">
            <Eye className="w-3 h-3" />
            {provider.views_profile || 0} visualizações
          </Badge>
        </div>
      </div>
      <Button size="sm" onClick={onMessage}>
        <MessageCircle className="w-4 h-4 mr-1" /> Enviar mensagem
      </Button>
    </Card>
  );
}
