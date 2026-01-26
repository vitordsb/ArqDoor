// src/components/modals/NewProposalDialog.tsx
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info, CalendarDays, PlusCircle, FileText, X, Plus } from "lucide-react";

type ProposalStep = {
  id: string;
  title: string;
  price: number;
  startDate?: string;
  endDate?: string;
  paymentGroupId?: number;
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
  dialogTitle?: string;
  dialogDescription?: string;
  submitLabel?: string;
  proposalSteps: ProposalStep[];
  onAddStep: () => void;
  onRemoveStep: (id: string) => void;
  onUpdateStep: (
    id: string,
    field: "title" | "price" | "startDate" | "endDate" | "paymentGroupId",
    value: string | number
  ) => void;
  onContractFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendProposal: (groups?: { id: number; name: string }[]) => void;
  sendingProposal: boolean;
  showToast?: (message: { title: string; description?: string; variant?: "default" | "destructive" }) => void;
  paymentPreference?: "per_step" | "at_end" | "custom";
  onPaymentPreferenceChange?: (value: "per_step" | "at_end" | "custom") => void;
  paymentGroups?: { id: number; name: string }[];
  onPaymentGroupsChange?: (groups: { id: number; name: string }[]) => void;
}

export function NewProposalDialog({
  open,
  onOpenChange,
  dialogTitle = "Nova Proposta",
  dialogDescription = "Organize cada etapa do serviço com valores e prazos claros antes de enviar para o cliente.",
  submitLabel = "Enviar proposta para o cliente",
  proposalSteps,
  onAddStep,
  onRemoveStep,
  onUpdateStep,
  onContractFileChange,
  onSendProposal,
  sendingProposal,
  showToast,
  paymentPreference = "at_end",
  onPaymentPreferenceChange,
  paymentGroups: externalPaymentGroups,
  onPaymentGroupsChange,
}: NewProposalDialogProps) {
  const [priceDigits, setPriceDigits] = React.useState<Record<string, string>>({});
  const [internalPaymentGroups, setInternalPaymentGroups] = React.useState<{ id: number; name: string }[]>([{ id: 1, name: "Grupo 1" }]);
  const [newGroupName, setNewGroupName] = React.useState("");

  // Use external state if provided, otherwise use internal
  const paymentGroups = externalPaymentGroups || internalPaymentGroups;
  
  // Wrapper to handle both types of setters
  const updatePaymentGroups = React.useCallback((updater: { id: number; name: string }[] | ((prev: { id: number; name: string }[]) => { id: number; name: string }[])) => {
    if (onPaymentGroupsChange) {
      if (typeof updater === 'function') {
        onPaymentGroupsChange(updater(externalPaymentGroups || internalPaymentGroups));
      } else {
        onPaymentGroupsChange(updater);
      }
    } else {
      if (typeof updater === 'function') {
        setInternalPaymentGroups(updater);
      } else {
        setInternalPaymentGroups(updater);
      }
    }
  }, [onPaymentGroupsChange, externalPaymentGroups, internalPaymentGroups]);

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    const nextId = paymentGroups.length > 0 ? Math.max(...paymentGroups.map(g => g.id)) + 1 : 1;
    updatePaymentGroups([...paymentGroups, { id: nextId, name: newGroupName.trim() }]);
    setNewGroupName("");
  };

  const handleRemoveGroup = (id: number) => {
    if (paymentGroups.length <= 1) return;
    
    updatePaymentGroups((prev: { id: number; name: string }[]) => {
      const filtered = prev.filter((g: { id: number; name: string }) => g.id !== id);
      return filtered.map((g: { id: number; name: string }, index: number) => ({ ...g, id: index + 1 }));
    });

    proposalSteps.forEach(step => {
      const currentGroupId = step.paymentGroupId || 1;
      if (currentGroupId === id) {
        onUpdateStep(step.id, "paymentGroupId", Math.max(1, id - 1));
      } else if (currentGroupId > id) {
        onUpdateStep(step.id, "paymentGroupId", currentGroupId - 1);
      }
    });
  };

  const handleUpdateGroupName = (id: number, name: string) => {
    updatePaymentGroups((prev: { id: number; name: string }[]) => prev.map((g: { id: number; name: string }) => g.id === id ? { ...g, name } : g));
  };

  // Auto-assign payment group based on previous step
  React.useEffect(() => {
    if (paymentPreference === 'custom') {
      for (let i = 0; i < proposalSteps.length; i++) {
        const step = proposalSteps[i];
        if (!step.paymentGroupId) {
          const prevGroup = i > 0 ? proposalSteps[i - 1].paymentGroupId : 1;
          const targetGroup = prevGroup || 1;
          onUpdateStep(step.id, "paymentGroupId", targetGroup);
          return;
        }
      }
    }
  }, [proposalSteps, paymentPreference, onUpdateStep]);

  React.useEffect(() => {
    if (open) {
      const usedIds = new Set(proposalSteps.map(s => s.paymentGroupId).filter((id): id is number => !!id));
      updatePaymentGroups((prev: { id: number; name: string }[]) => {
        const existingIds = prev.map((g: { id: number; name: string }) => g.id);
        const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
        let newGroups = [...prev];
        let changed = false;

        // Add any usedIds that are not already in existingGroups
        usedIds.forEach(id => {
          if (!existingIds.includes(id)) {
            newGroups.push({ id, name: `Grupo ${id}` });
            changed = true;
          }
        });

        // Ensure there's at least one group if none exist after processing usedIds
        if (newGroups.length === 0) {
          newGroups.push({ id: 1, name: "Grupo 1" });
          changed = true;
        }

        return changed ? newGroups.sort((a, b) => a.id - b.id) : prev;
      });
    }
  }, [open]);

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
          <DialogTitle>{dialogTitle}</DialogTitle>
          <p className="text-sm text-muted-foreground">{dialogDescription}</p>
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
            {onPaymentPreferenceChange && (
              <div className="rounded-2xl border border-dashed p-3 bg-white space-y-3">
                <Label className="text-sm font-semibold">Forma de pagamento</Label>
                <RadioGroup
                  value={paymentPreference}
                  onValueChange={(value) =>
                    onPaymentPreferenceChange(
                      value as "per_step" | "at_end" | "custom"
                    )
                  }
                  className="space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <RadioGroupItem value="per_step" id="payment-per-step" />
                    <Label htmlFor="payment-per-step" className="text-sm font-normal">
                      Pagamento por etapa
                      <span className="block text-xs text-muted-foreground">
                        O cliente paga conforme as entregas forem concluídas.
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <RadioGroupItem value="custom" id="payment-custom" />
                    <Label htmlFor="payment-custom" className="text-sm font-normal">
                      Personalizado
                      <span className="block text-xs text-muted-foreground">
                        O cliente escolhe quais etapas pagar e pode agrupar pagamentos.
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        Os prazos passam a contar após a confirmação do pagamento.
                      </span>
                    </Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <RadioGroupItem value="at_end" id="payment-at-end" />
                    <Label htmlFor="payment-at-end" className="text-sm font-normal">
                      Depósito em garantia
                      <span className="block text-xs text-muted-foreground">
                        O cliente paga o valor total ao assinar o contrato.
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}


          </aside>

          <section className="space-y-5 overflow-hidden">
            {/* Payment Groups Section - Prominent and First! */}
            {paymentPreference === "custom" && (
              <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 p-6 space-y-4 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center shrink-0 shadow-lg">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <div className="flex-1">
                    <Label className="text-lg font-bold text-gray-900 block mb-2">Defina os Grupos de Pagamento</Label>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Crie grupos para agrupar etapas em um único pagamento. Exemplo: "Conceito Inicial", "Desenvolvimento", "Finalização".
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3 pl-16">
                  {paymentGroups.map((group) => (
                    <div key={group.id} className="flex items-center gap-3">
                      <Badge className="h-8 w-8 flex items-center justify-center p-0 shrink-0 bg-orange-500 hover:bg-orange-600 text-white font-semibold">
                        {group.id}
                      </Badge>
                      <Input
                        value={group.name}
                        onChange={(e) => handleUpdateGroupName(group.id, e.target.value)}
                        className="h-10 text-sm flex-1 border-2 border-orange-200 focus-visible:ring-orange-500 focus-visible:border-orange-400 bg-white"
                        placeholder={`Nome do grupo ${group.id}`}
                      />
                      {paymentGroups.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100" 
                          onClick={() => handleRemoveGroup(group.id)}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3 pl-16">
                  <Input 
                    placeholder="Digite o nome do novo grupo" 
                    value={newGroupName} 
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="h-10 text-sm border-2 border-orange-200 focus-visible:ring-orange-500 focus-visible:border-orange-400 bg-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddGroup();
                      }
                    }}
                  />
                  <Button 
                    size="default" 
                    onClick={handleAddGroup} 
                    className="h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-md"
                  >
                    <Plus className="h-5 w-5 mr-2" /> Adicionar Grupo
                  </Button>
                </div>
              </div>
            )}

            {/* Steps Section with numbered header when custom */}
            <div className="space-y-3 h-full overflow-y-auto pr-1 pb-4">
              {paymentPreference === "custom" && (
                <div className="flex items-start gap-4 p-5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 shadow-sm">
                  <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center shrink-0 shadow-lg">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900 mb-1">Agora crie as etapas e atribua aos grupos</p>
                    <p className="text-sm text-gray-700">
                      Cada etapa pode ser atribuída a um grupo de pagamento diferente usando o seletor abaixo.
                    </p>
                  </div>
                </div>
              )}
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

                  {paymentPreference === "custom" && (
                    <div className="space-y-2">
                      <Label className="text-xs uppercase text-muted-foreground">Grupo de Pagamento</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={step.paymentGroupId || 1}
                        onChange={(e) => onUpdateStep(step.id, "paymentGroupId", parseInt(e.target.value) || 1)}
                      >
                        {paymentGroups.map(g => (
                          <option key={g.id} value={g.id}>{g.id} - {g.name}</option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground">Etapas com o mesmo número de grupo serão pagas juntas.</p>
                    </div>
                  )}

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
                        Informe o valor bruto desta entrega. Em garantia, o total das etapas é cobrado na assinatura.
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
              <div className="flex items-center justify-between bg-muted/40 border rounded-xl px-4 py-3">
                <div className="text-sm text-muted-foreground">
                  Total do projeto ({proposalSteps.length} etapas)
                </div>
                <div className="text-xl font-semibold text-gray-900">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                    proposalSteps.reduce((acc, step) => acc + (Number(step.price) || 0), 0)
                  )}
                </div>
              </div>
              <Button variant="outline" onClick={onAddStep} className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" /> Adicionar nova etapa
              </Button>
            </div>
          </section>
        </div>

        <DialogFooter className="pt-4">
          <Button
            onClick={() => onSendProposal(paymentPreference === 'custom' ? paymentGroups : undefined)}
            disabled={sendingProposal}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {sendingProposal ? "Enviando..." : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
