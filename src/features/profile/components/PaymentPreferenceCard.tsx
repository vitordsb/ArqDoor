import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard } from "lucide-react";

interface PaymentPreferenceCardProps {
  paymentPreference: "per_step" | "at_end" | null;
  onChange: (value: "per_step" | "at_end") => void;
  loading?: boolean;
  saving?: boolean;
  onSave?: () => void;
}

export function PaymentPreferenceCard({
  paymentPreference,
  onChange,
  loading = false,
  saving = false,
  onSave,
}: PaymentPreferenceCardProps) {
  const displayValue = paymentPreference || "per_step";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          Preferência de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-orange-50"
                onClick={() => onChange("per_step")}
              >
                <RadioGroup value={displayValue} onValueChange={onChange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="per_step" id="per_step" />
                    <div className="flex-1">
                      <Label htmlFor="per_step" className="cursor-pointer font-medium">
                        Pagamento por Etapa
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">
                        Cliente paga cada etapa conforme ela é aceita
                      </p>
                      <p className="text-xs text-orange-600 mt-2 font-medium">
                        ✓ Mais seguro para o prestador
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-orange-50"
                onClick={() => onChange("at_end")}
              >
                <RadioGroup value={displayValue} onValueChange={onChange}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="at_end" id="at_end" />
                    <div className="flex-1">
                      <Label htmlFor="at_end" className="cursor-pointer font-medium">
                        Pagamento na Conclusão
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">
                        Cliente paga apenas quando o projeto está completamente finalizado
                      </p>
                      <p className="text-xs text-blue-600 mt-2 font-medium">
                        ✓ Mais simples, mas requer confiança
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
              <p className="font-medium mb-1">ℹ️ Como funciona:</p>
              {displayValue === "per_step" ? (
                <ul className="list-disc list-inside space-y-1">
                  <li>Cada etapa aceita gera um QR Code para pagamento</li>
                  <li>Cliente paga por cada etapa individualmente</li>
                  <li>Próxima etapa liberada após confirmação de pagamento</li>
                </ul>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  <li>Nenhum pagamento até projeto estar 100% concluído</li>
                  <li>Um único QR Code gerado ao final com valor total</li>
                  <li>Projeto marcado como concluído após pagamento</li>
                </ul>
              )}
            </div>

            {onSave && (
              <Button
                onClick={onSave}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Preferência"
                )}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
