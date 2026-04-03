import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  Info,
  Landmark,
  Plus,
  PlusCircle,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type {
  ProviderReceivingAccount,
  ProviderReceivingMethod,
} from "@/features/messages/types";

type ProposalStep = {
  id: string;
  title: string;
  price: number;
  startDate?: string;
  endDate?: string;
  paymentGroupId?: number;
};

type PaymentGroup = {
  id: number;
  name: string;
};

type ComposerStage = "steps" | "receiving" | "review";

const COMPOSER_STAGES: Array<{
  key: ComposerStage;
  shortLabel: string;
  title: string;
  description: string;
}> = [
  {
    key: "steps",
    shortLabel: "1",
    title: "Etapas e grupos",
    description: "Organize entregas, prazos e grupos de cobrança antes de falar em recebimento.",
  },
  {
    key: "receiving",
    shortLabel: "2",
    title: "Recebimento e contrato",
    description: "Escolha como o prestador vai receber e confirme o PDF do contrato.",
  },
  {
    key: "review",
    shortLabel: "3",
    title: "Revisão final",
    description: "Confira resumo, grupos e forma de recebimento antes de enviar.",
  },
];

export const formatIsoToBr = (iso?: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

export const parseBrToIso = (brDate: string) => {
  const parts = brDate.split("/");
  if (parts.length !== 3) return "";
  const [d, m, y] = parts;
  const year = y.length === 2 ? `20${y}` : y;
  return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
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
  paymentGroups?: PaymentGroup[];
  onPaymentGroupsChange?: (groups: PaymentGroup[]) => void;
  receivingMethod?: ProviderReceivingMethod;
  onReceivingMethodChange?: (value: ProviderReceivingMethod) => void;
  receivingAccounts?: ProviderReceivingAccount[];
  loadingReceivingAccounts?: boolean;
  selectedReceivingAccountId?: number | null;
  onSelectedReceivingAccountIdChange?: (value: number | null) => void;
  hasExistingContractFile?: boolean;
  existingContractLabel?: string | null;
}

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const hasBankDetails = (account?: ProviderReceivingAccount | null) =>
  Boolean(
    account?.bank_code ||
      account?.bank_name ||
      account?.bank_agency ||
      account?.bank_account ||
      account?.bank_document
  );

const formatReceivingAccountLabel = (account?: ProviderReceivingAccount | null) => {
  if (!account) return "Conta não selecionada";
  const bankLabel = [account.bank_code, account.bank_name].filter(Boolean).join(" · ");
  if (bankLabel) return `${account.nickname} · ${bankLabel}`;
  if (account.pix_key) return `${account.nickname} · PIX`;
  return account.nickname;
};

const formatReceivingAccountDetails = (account?: ProviderReceivingAccount | null) => {
  if (!account) return [];

  const lines: string[] = [];
  if (hasBankDetails(account)) {
    lines.push(
      [[account.bank_code, account.bank_name].filter(Boolean).join(" · "), account.bank_agency ? `Agência ${account.bank_agency}` : null, account.bank_account ? `Conta ${account.bank_account}` : null]
        .filter(Boolean)
        .join(" · ")
    );
  }
  if (account.pix_key) {
    lines.push(`PIX: ${account.pix_key}`);
  }

  return lines.filter(Boolean);
};

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
  paymentGroups: externalPaymentGroups,
  onPaymentGroupsChange,
  receivingMethod = "escrow",
  onReceivingMethodChange,
  receivingAccounts = [],
  loadingReceivingAccounts = false,
  selectedReceivingAccountId = null,
  onSelectedReceivingAccountIdChange,
  hasExistingContractFile = false,
  existingContractLabel,
}: NewProposalDialogProps) {
  const [priceDigits, setPriceDigits] = React.useState<Record<string, string>>({});
  const [internalPaymentGroups, setInternalPaymentGroups] = React.useState<PaymentGroup[]>([
    { id: 1, name: "Grupo 1" },
  ]);
  const [newGroupName, setNewGroupName] = React.useState("");
  const [activeStage, setActiveStage] = React.useState<ComposerStage>("steps");
  const [selectedContractFileName, setSelectedContractFileName] = React.useState<string>("");

  const paymentGroups = externalPaymentGroups || internalPaymentGroups;
  const hasReceivingAccounts = receivingAccounts.length > 0;
  const contractReady = Boolean(selectedContractFileName || hasExistingContractFile);

  const projectTotal = React.useMemo(
    () =>
      proposalSteps.reduce((acc, step) => acc + (Number(step.price) || 0), 0),
    [proposalSteps]
  );

  const selectedReceivingAccount = React.useMemo(
    () =>
      receivingAccounts.find((account) => account.id === selectedReceivingAccountId) || null,
    [receivingAccounts, selectedReceivingAccountId]
  );

  const groupedSteps = React.useMemo(
    () =>
      paymentGroups.map((group) => {
        const steps = proposalSteps.filter((step) => (step.paymentGroupId || 1) === group.id);
        return {
          ...group,
          steps,
          total: steps.reduce((acc, step) => acc + (Number(step.price) || 0), 0),
        };
      }),
    [paymentGroups, proposalSteps]
  );

  const updatePaymentGroups = React.useCallback(
    (
      updater:
        | PaymentGroup[]
        | ((prev: PaymentGroup[]) => PaymentGroup[])
    ) => {
      if (onPaymentGroupsChange) {
        if (typeof updater === "function") {
          onPaymentGroupsChange(updater(externalPaymentGroups || internalPaymentGroups));
        } else {
          onPaymentGroupsChange(updater);
        }
        return;
      }

      if (typeof updater === "function") {
        setInternalPaymentGroups(updater);
      } else {
        setInternalPaymentGroups(updater);
      }
    },
    [externalPaymentGroups, internalPaymentGroups, onPaymentGroupsChange]
  );

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    const nextId = paymentGroups.length > 0 ? Math.max(...paymentGroups.map((g) => g.id)) + 1 : 1;
    updatePaymentGroups([...paymentGroups, { id: nextId, name: newGroupName.trim() }]);
    setNewGroupName("");
  };

  const handleRemoveGroup = (id: number) => {
    if (paymentGroups.length <= 1) return;

    updatePaymentGroups((prev) => {
      const filtered = prev.filter((g) => g.id !== id);
      return filtered.map((g, index) => ({ ...g, id: index + 1 }));
    });

    proposalSteps.forEach((step) => {
      const currentGroupId = step.paymentGroupId || 1;
      if (currentGroupId === id) {
        onUpdateStep(step.id, "paymentGroupId", Math.max(1, id - 1));
      } else if (currentGroupId > id) {
        onUpdateStep(step.id, "paymentGroupId", currentGroupId - 1);
      }
    });
  };

  const handleUpdateGroupName = (id: number, name: string) => {
    updatePaymentGroups((prev) => prev.map((g) => (g.id === id ? { ...g, name } : g)));
  };

  React.useEffect(() => {
    if (!open) {
      setActiveStage("steps");
      setSelectedContractFileName("");
      return;
    }
  }, [open]);

  React.useEffect(() => {
    for (let i = 0; i < proposalSteps.length; i++) {
      const step = proposalSteps[i];
      if (!step.paymentGroupId) {
        const prevGroup = i > 0 ? proposalSteps[i - 1].paymentGroupId : 1;
        const targetGroup = prevGroup || 1;
        onUpdateStep(step.id, "paymentGroupId", targetGroup);
        return;
      }
    }
  }, [proposalSteps, onUpdateStep]);

  React.useEffect(() => {
    if (!open) return;

    const usedIds = Array.from(
      new Set(
        proposalSteps
          .map((step) => step.paymentGroupId)
          .filter((id): id is number => Boolean(id))
      )
    ).sort((a, b) => a - b);

    const normalizedIds = usedIds.length > 0 ? usedIds : [1];

    if (onPaymentGroupsChange) {
      const baseGroups = externalPaymentGroups || paymentGroups;
      onPaymentGroupsChange(
        normalizedIds.map((id) => {
          const existing = baseGroups.find((group) => group.id === id);
          return existing || { id, name: `Grupo ${id}` };
        })
      );
      return;
    }

    setInternalPaymentGroups((prev) => {
      const next = normalizedIds.map((id) => {
        const existing = prev.find((group) => group.id === id);
        return existing || { id, name: `Grupo ${id}` };
      });

      const same =
        prev.length === next.length &&
        prev.every(
          (group, index) =>
            group.id === next[index]?.id && group.name === next[index]?.name
        );

      return same ? prev : next;
    });
  }, [externalPaymentGroups, onPaymentGroupsChange, open, paymentGroups, proposalSteps]);

  const getDigitsFromPrice = (price?: number) => {
    if (price == null || Number.isNaN(price)) return "";
    return Math.round(price * 100).toString();
  };

  const formatCurrencyFromDigits = (digits: string) => {
    const numberValue = Number(digits) / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numberValue);
  };

  const handleCurrencyChange = (id: string, rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "").slice(0, 11);
    setPriceDigits((prev) => ({ ...prev, [id]: digits }));
    const parsed = digits ? Number(digits) / 100 : 0;
    onUpdateStep(id, "price", parsed);
  };

  const getDisplayPrice = (step: ProposalStep) => {
    const digits = priceDigits[step.id];
    if (digits !== undefined) {
      return digits === "" ? "" : formatCurrencyFromDigits(digits);
    }
    if (typeof step.price === "number" && step.price > 0) {
      return formatCurrencyFromDigits(getDigitsFromPrice(step.price));
    }
    return "";
  };

  const ensureDateFormat = (value: string) => {
    const digits = value.replace(/[^\d]/g, "").slice(0, 8);
    if (digits.length === 0) return "";
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
    if (!value) return "";
    return ensureDateFormat(value);
  };

  const dateToComparable = (value?: string) => {
    if (!value || value.length < 8) return undefined;
    const [d, m, y] = ensureDateFormat(value).split("/");
    if (!d || !m || !y || y.length < 2) return undefined;
    const iso = `${y.length === 2 ? `20${y}` : y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    const parsed = new Date(iso);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  };

  const showStageError = React.useCallback(
    (title: string, description: string) => {
      showToast?.({ title, description, variant: "destructive" });
    },
    [showToast]
  );

  const validateStepsStage = React.useCallback(() => {
    if (!proposalSteps.length) {
      showStageError("Etapas obrigatórias", "Adicione pelo menos uma etapa antes de continuar.");
      return false;
    }

    const invalidStep = proposalSteps.find((step) => {
      const title = step.title.trim();
      const price = Number(step.price || 0);
      return !title || price <= 0;
    });

    if (invalidStep) {
      showStageError(
        "Etapa incompleta",
        "Preencha título e valor de todas as etapas antes de avançar."
      );
      return false;
    }

    const invalidDateRange = proposalSteps.find((step) => {
      const hasStart = Boolean(step.startDate?.trim());
      const hasEnd = Boolean(step.endDate?.trim());
      if (hasStart !== hasEnd) return true;
      const startComparable = dateToComparable(step.startDate);
      const endComparable = dateToComparable(step.endDate);
      if (startComparable && endComparable && endComparable < startComparable) return true;
      return false;
    });

    if (invalidDateRange) {
      showStageError(
        "Datas inválidas",
        "Revise as datas das etapas. Sempre preencha início e fim juntos, com a data final posterior à inicial."
      );
      return false;
    }

    return true;
  }, [proposalSteps, showStageError]);

  const validateReceivingStage = React.useCallback(() => {
    if (!contractReady) {
      showStageError(
        "Contrato obrigatório",
        "Anexe o PDF do contrato antes de continuar para a revisão final."
      );
      return false;
    }

    if (receivingMethod === "standard") {
      if (loadingReceivingAccounts) {
        showStageError(
          "Carteira em carregamento",
          "Aguarde as contas cadastradas carregarem antes de avançar."
        );
        return false;
      }

      if (!selectedReceivingAccountId) {
        showStageError(
          "Conta obrigatória",
          hasReceivingAccounts
            ? "Selecione uma conta cadastrada na sua carteira para usar o recebimento padrão."
            : "Você não tem bancos cadastrado para selecionar esse método, cadastre um no seu perfil."
        );
        return false;
      }
    }

    return true;
  }, [
    contractReady,
    hasReceivingAccounts,
    loadingReceivingAccounts,
    receivingMethod,
    selectedReceivingAccountId,
    showStageError,
  ]);

  const validateStage = React.useCallback(
    (stage: ComposerStage) => {
      if (stage === "steps") return validateStepsStage();
      if (stage === "receiving") return validateReceivingStage();
      return true;
    },
    [validateReceivingStage, validateStepsStage]
  );

  const activeStageIndex = COMPOSER_STAGES.findIndex((stage) => stage.key === activeStage);

  const goToStage = (targetStage: ComposerStage) => {
    const targetIndex = COMPOSER_STAGES.findIndex((stage) => stage.key === targetStage);
    if (targetIndex <= activeStageIndex) {
      setActiveStage(targetStage);
      return;
    }

    for (let index = activeStageIndex; index < targetIndex; index += 1) {
      const stageToValidate = COMPOSER_STAGES[index]?.key;
      if (stageToValidate && !validateStage(stageToValidate)) {
        return;
      }
    }

    setActiveStage(targetStage);
  };

  const handleNextStage = () => {
    if (!validateStage(activeStage)) return;
    const nextStage = COMPOSER_STAGES[activeStageIndex + 1];
    if (nextStage) {
      setActiveStage(nextStage.key);
    }
  };

  const handlePreviousStage = () => {
    const previousStage = COMPOSER_STAGES[activeStageIndex - 1];
    if (previousStage) {
      setActiveStage(previousStage.key);
    }
  };

  const handleContractInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const isPdf = !file || file.type === "application/pdf";
    setSelectedContractFileName(isPdf ? file?.name || "" : "");
    onContractFileChange(event);
  };

  const summaryBadges = [
    `${proposalSteps.length} etapa(s)`,
    `${paymentGroups.length} grupo(s)`,
    receivingMethod === "escrow" ? "Recebimento via Escrow" : "Recebimento padrão",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92vh] max-h-[92vh] min-h-0 max-w-[96vw] flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 px-6 pt-6">
          <DialogTitle>{dialogTitle}</DialogTitle>
          <p className="text-sm text-muted-foreground">{dialogDescription}</p>
        </DialogHeader>

        <div className="shrink-0 px-6 pt-4">
          <div className="rounded-2xl border bg-muted/20 p-2">
            <div className="grid gap-2 md:grid-cols-3">
              {COMPOSER_STAGES.map((stage, index) => {
                const isActive = activeStage === stage.key;
                const isCompleted = index < activeStageIndex;

                return (
                  <button
                    key={stage.key}
                    type="button"
                    onClick={() => goToStage(stage.key)}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-left transition",
                      isActive
                        ? "border-orange-300 bg-white shadow-sm"
                        : isCompleted
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-transparent bg-transparent hover:border-slate-200 hover:bg-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                          isCompleted
                            ? "bg-emerald-500 text-white"
                            : isActive
                              ? "bg-orange-500 text-white"
                              : "bg-slate-200 text-slate-700"
                        )}
                      >
                        {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : stage.shortLabel}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{stage.title}</p>
                        <p className="text-xs text-slate-500">{stage.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {activeStage === "steps" ? (
            <div className="grid min-h-full gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
              <section className="space-y-4">
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Etapas do contrato
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Quebre o projeto em entregas claras. Cada etapa precisa de título, valor e datas coerentes.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {summaryBadges.map((item) => (
                        <Badge key={item} variant="outline">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pb-2">
                  {proposalSteps.map((step, idx) => (
                    <div key={step.id} className="rounded-2xl border bg-white p-4 shadow-sm space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Etapa {idx + 1}</p>
                          <p className="text-xs text-muted-foreground">
                            Nomeie o entregável e defina a cobrança desta fase.
                          </p>
                        </div>
                        {proposalSteps.length > 1 ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveStep(step.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            Remover
                          </Button>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-muted-foreground">
                          Grupo de cobrança
                        </Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                          value={step.paymentGroupId || 1}
                          onChange={(e) =>
                            onUpdateStep(
                              step.id,
                              "paymentGroupId",
                              parseInt(e.target.value, 10) || 1
                            )
                          }
                        >
                          {paymentGroups.map((group) => (
                            <option key={group.id} value={group.id}>
                              {group.id} - {group.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-muted-foreground">
                          Etapas do mesmo grupo serão cobradas juntas.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs uppercase text-muted-foreground">
                          Título da etapa
                        </Label>
                        <Input
                          placeholder="Ex.: Revisão do layout e envio final"
                          value={step.title}
                          onChange={(event) => onUpdateStep(step.id, "title", event.target.value)}
                        />
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-xs uppercase text-muted-foreground">
                            Valor desta etapa
                          </Label>
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="R$ 0,00"
                            value={getDisplayPrice(step)}
                            onChange={(event) => handleCurrencyChange(step.id, event.target.value)}
                            onFocus={() => {
                              setPriceDigits((prev) => {
                                if (prev[step.id] !== undefined) return prev;
                                return { ...prev, [step.id]: getDigitsFromPrice(step.price) };
                              });
                            }}
                          />
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
                              onChange={(event) =>
                                onUpdateStep(step.id, "startDate", ensureDateFormat(event.target.value))
                              }
                              className="pl-9"
                            />
                          </div>
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
                            onChange={(event) =>
                              onUpdateStep(step.id, "endDate", ensureDateFormat(event.target.value))
                            }
                            className="pl-9"
                            onBlur={() => {
                              const endComparable = dateToComparable(step.endDate);
                              const startComparable = dateToComparable(step.startDate);
                              if (
                                endComparable &&
                                startComparable &&
                                endComparable < startComparable
                              ) {
                                showToast?.({
                                  title: "Data inválida",
                                  description:
                                    "A data final não pode ser anterior à data inicial.",
                                  variant: "destructive",
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

                  <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-4 py-3">
                    <div className="text-sm text-muted-foreground">
                      Total do projeto ({proposalSteps.length} etapas)
                    </div>
                    <div className="text-xl font-semibold text-gray-900">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(projectTotal)}
                    </div>
                  </div>

                  <Button variant="outline" onClick={onAddStep} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar nova etapa
                  </Button>
                </div>
              </section>

              <aside className="space-y-4 xl:sticky xl:top-0">
                <div className="rounded-2xl border bg-white p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Info className="h-4 w-4 text-orange-500" />
                    Como preencher bem
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline">1</Badge>
                      <div>
                        <p className="font-medium">Título objetivo</p>
                        <p className="text-muted-foreground">
                          Ex.: “Entrega do conceito 3D”
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline">2</Badge>
                      <div>
                        <p className="font-medium">Valor associado</p>
                        <p className="text-muted-foreground">
                          Use o preço exato cobrado nesta fase.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline">3</Badge>
                      <div>
                        <p className="font-medium">Datas realistas</p>
                        <p className="text-muted-foreground">
                          A data final deve ser posterior à inicial.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50/50 to-white p-4 space-y-4">
                  <div className="space-y-1">
                    <Label className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500">
                        <span className="text-sm font-semibold text-white">G</span>
                      </div>
                      Grupos de cobrança
                    </Label>
                    <p className="text-xs text-gray-600">
                      Monte a ordem em que o cliente poderá pagar o projeto.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {groupedSteps.map((group) => (
                      <div key={group.id} className="rounded-xl border-2 border-orange-200 bg-white p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="h-6 w-6 shrink-0 p-0 flex items-center justify-center bg-orange-500 text-white text-xs font-semibold">
                            {group.id}
                          </Badge>
                          <Input
                            value={group.name}
                            onChange={(event) => handleUpdateGroupName(group.id, event.target.value)}
                            className="h-8 text-xs flex-1 border-orange-200 focus-visible:ring-orange-500"
                            placeholder={`Grupo ${group.id}`}
                          />
                          {paymentGroups.length > 1 ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500 hover:bg-red-100"
                              onClick={() => handleRemoveGroup(group.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          ) : null}
                        </div>

                        <div className="pl-8 space-y-1">
                          {group.steps.length > 0 ? (
                            <>
                              {group.steps.map((step) => (
                                <div key={step.id} className="flex items-center gap-1 text-xs text-gray-600">
                                  <span className="text-orange-500">•</span>
                                  <span className="truncate flex-1">
                                    {step.title || `Etapa ${proposalSteps.indexOf(step) + 1}`}
                                  </span>
                                  <span className="text-[10px] text-gray-500 font-mono">
                                    {new Intl.NumberFormat("pt-BR", {
                                      style: "currency",
                                      currency: "BRL",
                                    }).format(Number(step.price) || 0)}
                                  </span>
                                </div>
                              ))}
                              <div className="border-t border-orange-100 pt-1 text-xs font-semibold text-orange-600">
                                Total:{" "}
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(group.total)}
                              </div>
                            </>
                          ) : (
                            <p className="text-[10px] text-gray-400 italic">
                              Nenhuma etapa atribuída
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Input
                      placeholder="Nome do novo grupo"
                      value={newGroupName}
                      onChange={(event) => setNewGroupName(event.target.value)}
                      className="h-9 text-sm border-orange-200 focus-visible:ring-orange-500"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleAddGroup();
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={handleAddGroup}
                      className="w-full h-9 bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar grupo
                    </Button>
                  </div>
                </div>
              </aside>
            </div>
          ) : null}

          {activeStage === "receiving" ? (
            <div className="grid min-h-full gap-5 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_440px] xl:items-start">
              <section className="space-y-4">
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-sm font-semibold text-slate-900">Como o prestador vai receber?</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    O contrato continua usando grupos de cobrança. Aqui você define apenas a forma de repasse ao prestador.
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => onReceivingMethodChange?.("escrow")}
                    className={cn(
                      "rounded-2xl border p-5 text-left transition-colors",
                      receivingMethod === "escrow"
                        ? "border-orange-500 bg-white shadow-sm"
                        : "border-orange-200 bg-orange-50/40 hover:bg-white"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-xl bg-orange-100 p-2 text-orange-600">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Escrow</div>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onReceivingMethodChange?.("standard")}
                    className={cn(
                      "rounded-2xl border p-5 text-left transition-colors",
                      receivingMethod === "standard"
                        ? "border-orange-500 bg-white shadow-sm"
                        : "border-orange-200 bg-orange-50/40 hover:bg-white"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-xl bg-orange-100 p-2 text-orange-600">
                        <Landmark className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Padrão</div>
                      </div>
                    </div>
                  </button>
                </div>

                {receivingMethod === "standard" ? (
                  <div className="rounded-2xl border bg-white p-4 space-y-3">
                    <Label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-orange-600" />
                      Conta da carteira
                    </Label>

                    {loadingReceivingAccounts ? (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                        Carregando contas cadastradas...
                      </div>
                    ) : !hasReceivingAccounts ? (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                        Você não tem bancos cadastrado para selecionar esse método, cadastre um no seu perfil.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <select
                          value={selectedReceivingAccountId ? String(selectedReceivingAccountId) : ""}
                          onChange={(event) =>
                            onSelectedReceivingAccountIdChange?.(
                              event.target.value ? Number(event.target.value) : null
                            )
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="">Selecione uma conta cadastrada</option>
                          {receivingAccounts.map((account) => (
                            <option key={account.id} value={account.id}>
                              {formatReceivingAccountLabel(account)}
                            </option>
                          ))}
                        </select>

                        {selectedReceivingAccount ? (
                          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                            <p className="font-medium text-slate-900">
                              {selectedReceivingAccount.nickname}
                            </p>
                            {formatReceivingAccountDetails(selectedReceivingAccount).map((line) => (
                              <p key={line} className="mt-1">
                                {line}
                              </p>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : null}
              </section>

              <aside className="space-y-4 xl:sticky xl:top-0">
                <div className="rounded-2xl border border-dashed bg-white p-4 space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <FileText className="h-4 w-4 text-orange-500" />
                    Contrato em PDF
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    O PDF é obrigatório para enviar a proposta. Anexe o contrato ou memorial descritivo completo com os detalhes combinados.
                  </p>
                  <Input type="file" accept="application/pdf" onChange={handleContractInputChange} />
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">
                    {selectedContractFileName
                      ? `Arquivo selecionado: ${selectedContractFileName}`
                      : hasExistingContractFile
                        ? existingContractLabel || "Um PDF já está vinculado a este fluxo."
                        : "Nenhum arquivo selecionado ainda."}
                  </div>
                </div>

                <div className="rounded-2xl border bg-white p-4 space-y-3">
                  <p className="text-sm font-semibold text-slate-900">Resumo rápido</p>
                  <div className="grid gap-2">
                    <SummaryLine
                      label="Cobrança"
                      value="Em garantia por grupos"
                    />
                    <SummaryLine
                      label="Recebimento"
                      value={receivingMethod === "escrow" ? "Escrow" : "Padrão"}
                    />
                    <SummaryLine
                      label="Grupos"
                      value={`${paymentGroups.length} grupo(s)`}
                    />
                    <SummaryLine
                      label="Valor total"
                      value={new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(projectTotal)}
                    />
                  </div>
                </div>
              </aside>
            </div>
          ) : null}

          {activeStage === "review" ? (
            <div className="grid min-h-full gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
              <section className="space-y-4">
                <div className="rounded-2xl border bg-white p-4">
                  <p className="text-sm font-semibold text-slate-900">Revisão do envio</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Confira o pacote completo antes de enviar a proposta ou salvar o convite.
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <ReviewCard
                    title="Contrato"
                    value={contractReady ? "PDF pronto" : "PDF pendente"}
                    helper={
                      selectedContractFileName ||
                      existingContractLabel ||
                      "Nenhum arquivo selecionado."
                    }
                    tone={contractReady ? "emerald" : "amber"}
                  />
                  <ReviewCard
                    title="Recebimento"
                    value={receivingMethod === "escrow" ? "Escrow" : "Padrão"}
                    helper={
                      receivingMethod === "escrow"
                        ? "Repasse intermediado pela plataforma."
                        : selectedReceivingAccount
                          ? formatReceivingAccountLabel(selectedReceivingAccount)
                          : "Conta da carteira ainda não selecionada."
                    }
                    tone={receivingMethod === "escrow" ? "sky" : "slate"}
                  />
                </div>

                <div className="rounded-2xl border bg-white p-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Etapas por grupo</p>
                      <p className="text-sm text-muted-foreground">
                        O cliente verá este agrupamento para pagamento.
                      </p>
                    </div>
                    <Badge variant="outline">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(projectTotal)}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {groupedSteps.map((group) => (
                      <div key={group.id} className="rounded-2xl border bg-slate-50 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-orange-500 text-white hover:bg-orange-500">
                              Grupo {group.id}
                            </Badge>
                            <p className="text-sm font-semibold text-slate-900">{group.name}</p>
                          </div>
                          <span className="text-sm font-semibold text-slate-700">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(group.total)}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {group.steps.length ? (
                            group.steps.map((step, index) => (
                              <div
                                key={step.id}
                                className="rounded-xl border bg-white px-3 py-3 text-sm"
                              >
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div>
                                    <p className="font-medium text-slate-900">
                                      {step.title || `Etapa ${index + 1}`}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      {step.startDate && step.endDate
                                        ? `${step.startDate} até ${step.endDate}`
                                        : "Sem prazo definido"}
                                    </p>
                                  </div>
                                  <span className="font-semibold text-slate-700">
                                    {new Intl.NumberFormat("pt-BR", {
                                      style: "currency",
                                      currency: "BRL",
                                    }).format(Number(step.price) || 0)}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-xl border border-dashed bg-white px-3 py-3 text-sm text-slate-500">
                              Esse grupo ainda não tem etapas atribuídas.
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <aside className="space-y-4 xl:sticky xl:top-0">
                <div className="rounded-2xl border bg-white p-4 space-y-3">
                  <p className="text-sm font-semibold text-slate-900">Checklist final</p>
                  <ChecklistItem
                    label="Etapas preenchidas"
                    done={proposalSteps.every(
                      (step) => step.title.trim() && Number(step.price || 0) > 0
                    )}
                  />
                  <ChecklistItem label="PDF anexado" done={contractReady} />
                  <ChecklistItem
                    label="Recebimento definido"
                    done={
                      receivingMethod === "escrow" ||
                      (receivingMethod === "standard" && Boolean(selectedReceivingAccountId))
                    }
                  />
                </div>

                <div className="rounded-2xl border bg-white p-4 space-y-2">
                  <p className="text-sm font-semibold text-slate-900">O que acontece depois</p>
                  <p className="text-sm text-slate-600">
                    Assim que você enviar, o cliente verá o contrato com as etapas, os grupos de cobrança e a forma de recebimento configurada.
                  </p>
                </div>
              </aside>
            </div>
          ) : null}
        </div>

        <DialogFooter className="shrink-0 border-t bg-background px-6 py-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            {activeStage !== "steps" ? (
              <Button variant="ghost" onClick={handlePreviousStage}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            ) : null}
          </div>

          {activeStage === "review" ? (
            <Button
              onClick={() => onSendProposal(paymentGroups)}
              disabled={sendingProposal}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {sendingProposal ? "Enviando..." : submitLabel}
            </Button>
          ) : (
            <Button onClick={handleNextStage} className="bg-orange-600 hover:bg-orange-700 text-white">
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-slate-50 px-3 py-2">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function ReviewCard({
  title,
  value,
  helper,
  tone,
}: {
  title: string;
  value: string;
  helper: string;
  tone: "emerald" | "amber" | "sky" | "slate";
}) {
  const toneMap = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    sky: "border-sky-200 bg-sky-50 text-sky-800",
    slate: "border-slate-200 bg-slate-50 text-slate-800",
  };

  return (
    <div className={`rounded-2xl border p-4 ${toneMap[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em]">{title}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
      <p className="mt-2 text-sm opacity-80">{helper}</p>
    </div>
  );
}

function ChecklistItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-slate-50 px-3 py-3">
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full",
          done ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
        )}
      >
        <CheckCircle2 className="h-4 w-4" />
      </div>
      <span className="text-sm text-slate-700">{label}</span>
    </div>
  );
}
