import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Service } from "../types";

interface ProviderServicesSectionProps {
  services: Service[];
  loading: boolean;
}

export function ProviderServicesSection({ services, loading }: ProviderServicesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Serviços</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
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
  );
}
