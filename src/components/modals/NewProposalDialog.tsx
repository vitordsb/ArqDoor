
// src/components/modals/NewProposalDialog.tsx
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Info, CalendarDays, PlusCircle, FileText } from "lucide-react";

type ProposalStep = {
  id: string;
  title: string;
  price: number;
  startDate?: string;
  endDate?: string;
};

export const formatIsoToBr = (iso?: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

export const parseBrToIso = (brDate: string) => {
  const parts = brDate.split('/');
  if (parts.length !== 3) return '';
  const [d, m, y] = parts;
  const year = y.length === 2 ? `20${y}` : y;
  return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
};

interface NewProposalDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  proposalSteps: ProposalStep[];
  onAddStep: () => void;
  onRemoveStep: (id: string) => void;
  onUpdateStep: (
    id: string,
    field: "title" | "price" | "startDate" | "endDate",
    value: string | number
  ) => void;
  onContractFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendProposal: () => void;
  sendingProposal: boolean;
  showToast?: (message: { title: string; description?: string; variant?: "default" | "destructive" }) => void;
}

export function NewProposalDialog({
  open,
  onOpenChange,
  proposalSteps,
  onAddStep,
  onRemoveStep,
  onUpdateStep,
  onContractFileChange,
  onSendProposal,
  sendingProposal,
  showToast,
}: NewProposalDialogProps) {
  const [priceDigits, setPriceDigits] = React.useState<Record<string, string>>({});

  const getDigitsFromPrice = (price?: number) => {
    if (price == null || isNaN(price)) return '';
    return Math.round(price * 100).toString();
  };

  const formatCurrencyFromDigits = (digits: string) => {
    const numberValue = Number(digits) / 100;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numberValue);
  };

  const handleCurrencyChange = (id: string, rawValue: string) => {
    const digits = rawValue.replace(/\D/g, '').slice(0, 11);
    setPriceDigits(prev => ({ ...prev, [id]: digits }));
    const parsed = digits ? Number(digits) / 100 : 0;
    onUpdateStep(id, 'price', parsed);
  };

  const getDisplayPrice = (step: ProposalStep) => {
    const digits = priceDigits[step.id];
    if (digits !== undefined) {
      return digits === '' ? '' : formatCurrencyFromDigits(digits);
    }
    if (typeof step.price === 'number' && step.price > 0) {
      return formatCurrencyFromDigits(getDigitsFromPrice(step.price));
    }
    return '';
  };

  const ensureDateFormat = (value: string) => {
    const digits = value.replace(/[^\d]/g, '').slice(0, 8);
    if (digits.length === 0) return '';
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) {
      const d = digits.slice(0, 2);
      const m = digits.slice(2);
      return `${d}/${m}`;
    }
    const d = digits.slice(0, 2);
    const m = digits.slice(2, 4);
    const y = digits.slice(4);
    return `${d}/${m}/${y}`;
  };

  const formatDisplayDate = (value?: string) => {
    if (!value) return '';
    return ensureDateFormat(value);
  };

  const dateToComparable = (value?: string) => {
    if (!value || value.length < 8) return undefined;
    const [d, m, y] = ensureDateFormat(value).split('/');
    if (!d || !m || !y || y.length < 2) return undefined;
    const iso = `${y.length === 2 ? `20${y}` : y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    const parsed = new Date(iso);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Nova Proposta</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Organize cada etapa do serviço com valores e prazos claros antes de enviar para o cliente.
          </p>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-[260px,1fr] overflow-hidden flex-1">
          <aside className="rounded-2xl border bg-muted/30 p-4 space-y-3 overflow-y-auto">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Info className="h-4 w-4 text-orange-500" /> Como preencher
            </div>
            <p className="text-sm text-muted-foreground">
              Cada etapa funciona como um marco de entrega. Utilize descrições objetivas e datas realistas.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-3">
                <Badge variant="outline">1</Badge>
                <div>
                  <p className="font-medium">Título objetivo</p>
                  <p className="text-muted-foreground">Ex.: “Entrega do conceito 3D”</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline">2</Badge>
                <div>
                  <p className="font-medium">Valor associado</p>
                  <p className="text-muted-foreground">Use o preço exato cobrado nesta fase.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline">3</Badge>
                <div>
                  <p className="font-medium">Datas de execução</p>
                  <p className="text-muted-foreground">
                    A data final deve ser posterior à inicial. Ajustamos automaticamente se necessário.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-dashed p-3 bg-white space-y-3">
              <Label className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="h-4 w-4 text-orange-500" /> Contrato em PDF
              </Label>
              <p className="text-sm text-muted-foreground">
                O PDF é obrigatório para enviar a proposta. Anexe o contrato ou memorial descritivo completo com os detalhes combinados.
              </p>
              <Input type="file" accept="application/pdf" onChange={onContractFileChange} />
            </div>
          </aside>

          <section className="space-y-5 overflow-hidden">
            <div className="space-y-3 h-full overflow-y-auto pr-1 pb-4">
              {proposalSteps.map((step, idx) => (
                <div
                  key={step.id}
                  className="rounded-2xl border p-4 shadow-sm space-y-4 bg-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Etapa {idx + 1}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Nomeie o entregável e defina o valor para esta fase.
                      </p>
                    </div>
                    {proposalSteps.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveStep(step.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Remover
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-muted-foreground">
                      Título da etapa
                    </Label>
                    <Input
                      placeholder="Ex.: Revisão do layout e envio final"
                      value={step.title}
                      onChange={(e) => onUpdateStep(step.id, "title", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground">
                        Valor desta etapa
                      </Label>
                      <div className="relative">
                        <Input
                          type="text"
                          inputMode="decimal"
                          className="pl-3"
                          placeholder="R$ 0,00"
                          value={getDisplayPrice(step)}
                          onChange={(e) => handleCurrencyChange(step.id, e.target.value)}
                          onFocus={() => {
                            setPriceDigits(prev => {
                              if (prev[step.id] !== undefined) return prev;
                              return {
                                ...prev,
                                [step.id]: getDigitsFromPrice(step.price),
                              };
                            });
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Informe o valor bruto desta entrega.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground">
                        Data inicial
                      </Label>
                      <div className="relative">
                        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="dd/mm/aaaa"
                          value={formatDisplayDate(step.startDate)}
                          onChange={(e) => {
                            const formatted = ensureDateFormat(e.target.value);
                            onUpdateStep(step.id, 'startDate', formatted);
                          }}
                          className="pl-9"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Quando você pretende iniciar esta etapa.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-muted-foreground">
                      Data final
                    </Label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="dd/mm/aaaa"
                        value={formatDisplayDate(step.endDate)}
                        onChange={(e) => {
                          const formatted = ensureDateFormat(e.target.value);
                          onUpdateStep(step.id, 'endDate', formatted);
                        }}
                        className="pl-9"
                        onBlur={() => {
                          const endComparable = dateToComparable(step.endDate);
                          const startComparable = dateToComparable(step.startDate);
                          if (endComparable && startComparable && endComparable < startComparable) {
                            showToast?.({
                              title: 'Data inválida',
                              description: 'A data final não pode ser anterior à data inicial.',
                              variant: 'destructive',
                            });
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Prazo estimado para concluir esta entrega.
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={onAddStep} className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" /> Adicionar nova etapa
              </Button>
            </div>
          </section>
        </div>

        <DialogFooter className="pt-4">
          <Button
            onClick={onSendProposal}
            disabled={sendingProposal}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {sendingProposal ? "Enviando..." : "Enviar proposta para o cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
