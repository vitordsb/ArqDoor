import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

interface ProfileHeaderProps {
  user: { name: string; email?: string; avatar?: string; type: string };
  onLogout: () => void;
}

export function ProfileHeader({ user, onLogout }: ProfileHeaderProps) {
  return (
    <div className="w-full overflow-hidden rounded-lg border bg-white shadow-sm">
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-400" />
        <div className="absolute -bottom-16 left-8">
          <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
            <AvatarImage src={(user as any)?.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div className="pt-20 pb-8 px-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-slate-600">
            {user.type === "prestador" ? "Prestador de Serviços" : "Cliente"}
          </p>
        </div>
        <Button variant="outline" onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Sair
        </Button>
      </div>
    </div>
  );
}
