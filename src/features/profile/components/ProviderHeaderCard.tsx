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

  const bannerUrl = buildImageUrl((user as any)?.banner);

  return (
    <Card className="overflow-hidden">
      {/* Banner */}
      <div 
        className="h-32 sm:h-48 w-full bg-slate-100 bg-cover bg-center"
        style={{ 
          backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined,
          backgroundColor: !bannerUrl ? '#FEF8C3' : undefined // Fallback color
        }} 
      />
      
      <div className="p-6 flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-12 md:-mt-16">
        <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white shadow-md z-10">
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          <AvatarImage src={buildImageUrl((user as any)?.perfil)} alt={user.name} className="object-cover" />
        </Avatar>
        
        <div className="flex-1 text-center sm:text-left pt-2 sm:pt-0">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-slate-600 font-medium">{provider.profession}</p>
          <div className="flex gap-2 mt-2 justify-center sm:justify-start flex-wrap">
            <Badge className="gap-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
              <Star className="w-3 h-3" />
              {ratings.count > 0 ? `${ratings.average.toFixed(1)} (${ratings.count})` : "Nova"}
            </Badge>
            <Badge className="gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
              <Eye className="w-3 h-3" />
              {provider.views_profile || 0} visualizações
            </Badge>
          </div>
        </div>
        
        <Button size="sm" onClick={onMessage} className="mt-4 sm:mt-0 mb-2">
          <MessageCircle className="w-4 h-4 mr-1" /> Enviar mensagem
        </Button>
      </div>
    </Card>
  );
}
