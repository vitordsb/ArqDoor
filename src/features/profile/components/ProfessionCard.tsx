import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, X, Edit2 } from "lucide-react";

interface ProfessionCardProps {
  profession: string;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  setProfession: (value: string) => void;
  saving: boolean;
  providerProfile?: any;
  onSave: () => void;
  onOpenRatings?: () => void;
  providerProfileId?: number | null;
}

export function ProfessionCard({
  profession,
  isEditing,
  setIsEditing,
  setProfession,
  saving,
  providerProfile,
  onSave,
  onOpenRatings,
  providerProfileId,
}: ProfessionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profissão</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <Input
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="Ex: Arquiteto residencial"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={onSave}
                disabled={saving || !providerProfile}
                className="bg-green-600 text-white"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {saving ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setProfession(providerProfile?.profession || "");
                }}
              >
                <X className="w-4 h-4 mr-1" /> Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-slate-700">
                {profession?.trim() || "Profissão ainda não informada"}
              </p>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-1" /> Editar
              </Button>
            </div>
            {providerProfileId && onOpenRatings && (
              <Button
                size="sm"
                className="w-full bg-orange-600 text-white"
                onClick={onOpenRatings}
              >
                Ver avaliações
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
