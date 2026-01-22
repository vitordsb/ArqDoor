// src/components/modals/ProposalDetailsDialog.tsx
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Shield,
  Check,
  X,
  MoreVertical,
  MessageCircle,
  AlertTriangle,
  QrCode,
  Loader2,
  Lock,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import * as React from "react"
import { Step } from "@/lib/Interfaces"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"
import { useStepFeedbackActions } from "@/hooks/use-actions"
import { Textarea } from "@/components/ui/textarea"
import { SIGNATURE_STEP_TITLE } from "@/constants/contracts"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

type ProposalDetailsDialogProps = {
  open: boolean
  onOpenChange: (v: boolean) => void
  steps: Step[]
  loading: boolean
  userType?: "prestador" | "contratante"
  tickets: any[]
  onMarkProviderCompleted: (stepId: number, ticketId: number) => void
  onEditStep: (step: Step) => void
  onDeleteStep: (stepId: number) => void
  editingStepId: number | null
  editStepData: { title: string; price: number }
  onEditStepDataChange: (data: { title: string; price: number }) => void
  onSaveStep: () => void
  onCancelEdit: () => void;
  onStartPhase: (stepId: number) => Promise<void>;
  onStartSignature: (ticket: any) => void
  onOpenSignature: (ticket: any) => void
  onRejectContract: (ticketId: number) => void
  onClientAccept: (
    step: Step,
    paymentPreference?: "per_step" | "at_end" | "custom" | null
  ) => Promise<void>
  onClientRejectStep: (step: Step) => Promise<boolean>
  onFeedbackCreated?: (step: Step, comment: string, isProblem: boolean) => void
  onPaySteps?: (steps: Step[]) => void
  payingStepId?: number | null
  onConfirmStepPayment?: (stepId: number) => void
  confirmingStepPaymentIds?: Record<number, boolean>
  currentIndex: number
  ticketStatus?: string
  ticketId?: number | null
  onDeleteTicket?: (ticketId: number) => void
  deletingTicket?: boolean
  onRefreshPayment?: (ticketId: number) => void
  onPayDeposit?: (ticketId: number) => void
  paymentPreference?: "per_step" | "at_end" | "custom" | null
  allowGroupedPayment?: boolean
  onToggleGroupedPayment?: (ticketId: number, enabled: boolean) => void
  canPayStep?: (step: Step, allSteps: Step[]) => boolean
}

const normalizeStatus = (status?: string) => {
  if (!status) return '';
  return status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  awaiting_deposit: "Aguardando depósito",
  deposit_pending: "Depósito pendente",
  deposit_paid: "Depósito confirmado",
  awaiting_steps: "Aguardando pagamento",
  partial_steps: "Pagamento parcial",
  steps_paid: "Pagamento finalizado",
};

const PAYMENT_MODE_LABELS: Record<string, string> = {
  per_step: "Pagamento por etapa",
  at_end: "Depósito em garantia",
  custom: "Personalizado",
};

export function ProposalDetailsDialog({
  open,
  onOpenChange,
  steps,
  loading,
  userType,
  tickets,
  onMarkProviderCompleted,
  onEditStep,
  onDeleteStep,
  editingStepId,
  editStepData,
  onEditStepDataChange,
  onSaveStep,
  onCancelEdit,
  onStartPhase,
  onStartSignature: _onStartSignature,
  onOpenSignature: _onOpenSignature,
  onRejectContract,
  onClientAccept,
  onClientRejectStep,
  onFeedbackCreated,
  onPaySteps,
  payingStepId,
  onConfirmStepPayment,
  confirmingStepPaymentIds,
  ticketStatus,
  ticketId,
  onDeleteTicket,
  deletingTicket,
  onRefreshPayment,
  onPayDeposit,
  currentIndex: _currentIndex,
  paymentPreference = null,
  allowGroupedPayment = false,
  onToggleGroupedPayment,
  canPayStep,
}: ProposalDetailsDialogProps) {
  const [feedbackModalStep, setFeedbackModalStep] = React.useState<Step | null>(null);
  const [feedbackModalType, setFeedbackModalType] = React.useState<'feedback' | 'problem'>('feedback');
  const [feedbackModalInput, setFeedbackModalInput] = React.useState("");
  const [editingFeedbackId, setEditingFeedbackId] = React.useState<number | null>(null);
  const [pendingRejectStep, setPendingRejectStep] = React.useState<Step | null>(null);

  const {
    feedbackData,
    isLoadingFeedback,
    createStepFeedback,
    updateStepFeedback,
    deleteStepFeedback,
    isCreatingFeedback,
    isUpdatingFeedback,
    isDeletingFeedback,
  } = useStepFeedbackActions(feedbackModalStep?.id);

  const activeTicket = tickets.find(t => t.id === ticketId);
  const currentTicketStatus = activeTicket?.status || ticketStatus;
  const displayPaymentPreference =
    paymentPreference ||
    (activeTicket as any)?.payment_preference ||
    (activeTicket as any)?.paymentPreference ||
    null;
  const paymentStatusKey = ((activeTicket as any)?.payment_status ||
    (activeTicket as any)?.paymentStatus ||
    "")
    .toString()
    .toLowerCase();
  const paymentStatusLabel = PAYMENT_STATUS_LABELS[paymentStatusKey];
  const paymentModeLabel = displayPaymentPreference
    ? PAYMENT_MODE_LABELS[displayPaymentPreference]
    : null;

  const isCustomPayment = displayPaymentPreference === "custom";
  const isStepPayment =
    displayPaymentPreference === "per_step" || displayPaymentPreference === "custom";
  const requiresSequentialPayment = displayPaymentPreference === "per_step";
  const isProvider = userType === "prestador";

  const groupedSteps = React.useMemo(() => {
    if (steps.length === 0) return [];

    const groups: { id: string; name?: string; steps: Step[]; total: number; paid: boolean }[] = [];
    
    steps.forEach((step) => {
      let groupId = `step-${step.id}`;
      let groupName: string | undefined;

      if (isCustomPayment) {
        const pgId = (step as any).group_id || (step as any).payment_group_id;
        if (pgId) {
          groupId = `group-${pgId}`;
          const rawName = (step as any).payment_group?.name || (step as any).paymentGroup?.name;
          groupName = rawName || `Grupo ${pgId}`;
        } else {
          groupId = `step-${step.id}`;
        }
      }

      let group = groups.find(g => g.id === groupId);
      if (!group) {
        group = { id: groupId, name: groupName, steps: [], total: 0, paid: true };
        groups.push(group);
      }
      group.steps.push(step);
      group.total += Number(step.price || 0);
      
      const stepPaid = Boolean((step as any).is_financially_cleared) || Boolean((step as any).paid);
      if (!stepPaid && Number(step.price || 0) > 0 && step.title !== SIGNATURE_STEP_TITLE) {
        group.paid = false;
      }
    });

    return groups;
  }, [steps, isCustomPayment]);


  const resetFeedbackModal = () => {
    setFeedbackModalStep(null);
    setFeedbackModalInput("");
    setEditingFeedbackId(null);
    setPendingRejectStep(null);
    setFeedbackModalType('feedback');
  };

  const openFeedbackModal = (step: Step, type: 'feedback' | 'problem', rejectAfterSubmit?: boolean) => {
    setFeedbackModalStep(step);
    setFeedbackModalType(type);
    setFeedbackModalInput("");
    setEditingFeedbackId(null);
    setPendingRejectStep(rejectAfterSubmit ? step : null);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackModalStep || !feedbackModalInput.trim()) return;
    const isProblem = feedbackModalType === 'problem';
    let ok = false;
    if (editingFeedbackId) {
      ok = await updateStepFeedback(editingFeedbackId, feedbackModalInput.trim(), { isProblem });
    } else {
      ok = await createStepFeedback(feedbackModalStep.id, feedbackModalInput.trim(), { isProblem });
    }
    if (ok) {
      onFeedbackCreated?.(feedbackModalStep, feedbackModalInput.trim(), isProblem);
      setFeedbackModalInput("");
      setEditingFeedbackId(null);
      if (pendingRejectStep && pendingRejectStep.id === feedbackModalStep.id && isProblem) {
        await onClientRejectStep(pendingRejectStep);
        setPendingRejectStep(null);
      }
    }
  };

  const handleEditFeedback = (fb: any) => {
    setEditingFeedbackId(fb.id);
    setFeedbackModalInput(fb.comment || "");
  };

  const handleDeleteFeedback = async (fb: any) => {
    await deleteStepFeedback(fb.id);
    if (editingFeedbackId === fb.id) {
      setEditingFeedbackId(null);
      setFeedbackModalInput("");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => {
        onOpenChange(v);
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle>Detalhes da Proposta</DialogTitle>
                <DialogDescription>Veja o status e as ações disponíveis para cada etapa.</DialogDescription>
              </div>
              {userType === "prestador" &&
                ticketId &&
                ["pendente", "cancelada"].includes((ticketStatus || "").toLowerCase()) && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    onClick={() => onDeleteTicket?.(ticketId)}
                    disabled={deletingTicket}
                  >
                    <Trash2 className="h-4 w-4" />
                    {deletingTicket ? "Excluindo..." : "Excluir proposta"}
                  </Button>
                )}
            </div>
            {(paymentModeLabel || paymentStatusLabel) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {paymentModeLabel && (
                  <Badge variant="outline">{paymentModeLabel}</Badge>
                )}
                {paymentStatusLabel && (
                  <Badge variant="outline">{paymentStatusLabel}</Badge>
                )}
              </div>
            )}
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2">

          {displayPaymentPreference === "at_end" && currentTicketStatus && (currentTicketStatus as string).toLowerCase() !== "em andamento" && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <div className="flex items-center justify-between gap-3">
                <span>Aguardando pagamento do depósito em garantia para liberar as ações do projeto.</span>
                <div className="flex flex-wrap gap-2">
                  {userType === "contratante" && onPayDeposit && ticketId && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPayDeposit(ticketId)}
                    >
                      Gerar pagamento
                    </Button>
                  )}
                  {onRefreshPayment && ticketId && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onRefreshPayment(ticketId)}
                    >
                      Verificar pagamento
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">Carregando…</div>
          ) : steps.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-600">
              Nenhuma etapa encontrada para este ticket.
            </div>
          ) : (
            <div className="space-y-4">
              {groupedSteps.map((group) => (
                <div
                  key={group.id}
                  className={`space-y-2 ${
                    isCustomPayment
                      ? `border rounded-xl p-4 ${
                          group.paid ? "bg-emerald-50 border-green-200" : "bg-gray-50"
                        }`
                      : ""
                  }`}
                >
                  {isCustomPayment && group.name && (
                    <div className="mb-2 pb-2 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">
                        {group.name.trim().toLowerCase().startsWith("grupo")
                        ? group.name
                        : `Grupo ${group.name}`}
                      </h3>
                      {isCustomPayment && userType === "contratante" && group.paid && (
                        <span className="text-sm text-green-600 flex items-center shrink-0 mt-0.5" title="Etapa Paga">
                          <CheckCircle className="h-4 w-4 mr-1" /> Pagamento realizado
                        </span>
                      )}
                    </div>
                  )}
                  {group.steps.map((step) => {
                const index = steps.findIndex(s => s.id === step.id);
                const isSignatureStep = step.title === SIGNATURE_STEP_TITLE || index === 0
                const signatureSigned =
                  isSignatureStep &&
                  ((step as any)?.confirm_contractor ||
                    (step as any)?.confirmContractor ||
                    ((step.status || "") as string).toLowerCase() === "concluido")
                const ticketIsActive = (currentTicketStatus || "").toLowerCase() === "em andamento"

                const paid =
                  Boolean((step as any).is_financially_cleared) ||
                  Boolean((step as any).paid);
               
              const prev = steps[index - 1];
                const prevIsSignature = !!(prev && (prev.title === SIGNATURE_STEP_TITLE || (index - 1) === 0));
                const prevDone = prev && ((prev.status || '').toLowerCase() === 'concluido' || ((prev as any).confirm_freelancer && (prev as any).confirm_contractor));
                const prevPaid = prevIsSignature
                  ? true
                  : Boolean((prev as any)?.is_financially_cleared || (prev as any)?.paid);             
                const prevBlocking = !!(
                  prev && (!prevDone || (requiresSequentialPayment && !prevPaid))
                );
                let prevBlockReason: string | null = null;
                if (prev && !prevDone) {
                  prevBlockReason = prevIsSignature ? 'Aguardando assinatura do contrato' : 'Aguardando a conclusão da etapa anterior';
                } else if (requiresSequentialPayment && prevDone && !prevPaid && !prevIsSignature) {
                  prevBlockReason = 'Aguardando pagamento do cliente.';
                }

                // helpers para auxiliar
                const isConcluded = (s: any) =>
                  normalizeStatus(s?.status) === 'concluido' ||
                  (s?.confirm_freelancer && s?.confirm_contractor);
                const providerMarkedDone = !!step.confirm_freelancer;

                // variáveis pra controle de bloqueio de botões de feedback/problema
                const reworks = Number((step as any).rework_count) || 0;
                const isRework = reworks > 0;
                
                // padroniza status
                const normalizedStatus = normalizeStatus(step.status);
                const status =
                  isRework && normalizedStatus === 'pendente'
                    ? 'em andamento'
                    : normalizedStatus;

                const stepConcluded = isConcluded(step);
                const stepPrice = Number(step.price || 0);
                const isRejected = status === "recusado";

                const statusLabel = isConcluded(step)
                  ? "Concluído"
                  : status === "em andamento"
                    ? "Em Andamento"
                  : status === "pendente"
                    ? "Pendente"
                    : status === "recusado"
                      ? "Recusado"
                      : "—"

                // adiciona cores de fundo com base no status da etapa
                  const stepBackgroundClass = (() => {
                    if (stepConcluded) return "bg-green-50 border-green-300";
                    if (isRejected) return "bg-red-50 border-red-200";
                    if (status === "em andamento") return "bg-blue-50 border-blue-200";
                    return "bg-white border-gray-200";
                  })();

                // condições de bloqueio
                const needsPaymentToStart =
                  isCustomPayment &&
                  !paid &&
                  !isSignatureStep &&
                  stepPrice > 0;
                const waitingStart =
                  isStepPayment &&
                  !providerMarkedDone &&
                  status !== "recusado" &&
                  !isRework;
                const isBlocked = prevBlocking || waitingStart;

                return (
                  <div key={step.id} className={`border rounded-lg p-4 shadow-sm ${stepBackgroundClass}`}>
                    <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">Etapa {index + 1}</h4>
                      </div>
                      <Badge variant="outline">{statusLabel}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatDate((step as any).start_date)} – {formatDate((step as any).end_date)}
                    </p>
                    <p className="text-gray-700 mb-2">{step.title}</p>
                    <p className="font-semibold text-lg">
                      {isSignatureStep
                        ? "Contrato PDF (sem custo)"
                        : new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL"
                          }).format(step.price || 0)}
                    </p>

                    {userType === "contratante" && paid && !group.paid &&(
                      <span className="mt-[10px] inline-block text-s text-green-600" title="Etapa Paga">
                        <CheckCircle className="inline mr-1" /> Pagamento realizado
                      </span>
                    )}
                      
                    <div className="mt-3 flex flex-wrap gap-2">
                      {userType === "prestador" && !isSignatureStep && (() => {
                        if (requiresSequentialPayment && prev && !prevDone) {
                          return (
                            <div className="w-full">
                              <p className="text-sm text-gray-500 mb-2">
                                {prevIsSignature ? 'Aguardando assinatura do contrato' : 'Aguardando a conclusão da etapa anterior.'}
                              </p>
                            </div>
                          )
                        }

                        if (requiresSequentialPayment && prevDone && !prevPaid && !prevIsSignature) {
                          return (
                            <div className="w-full">
                              <p className="text-sm text-gray-500 mb-2">
                                Aguardando pagamento do cliente.
                              </p>
                            </div>
                          )
                        }

                        if (isCustomPayment && needsPaymentToStart && !providerMarkedDone) {
                          return (
                            <div className="w-full">
                              <p className="text-sm text-gray-500 mb-2">
                                Aguardando pagamento do cliente para iniciar a etapa.
                              </p>
                            </div>
                          )
                        }

                        if (isStepPayment && status === 'em andamento' && !providerMarkedDone) {
                          const endDate = (step as any).end_date ? new Date((step as any).end_date) : null;
                          if (endDate) {
                            const now = new Date();
                            const diffTime = endDate.getTime() - now.getTime();
                            let countdownMessage: string;
                            if (diffTime > 0) {
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              countdownMessage = `${diffDays} dia${diffDays !== 1 ? 's' : ''} até a data de entrega.`;
                            } else {
                              countdownMessage = "Prazo de entrega expirado.";
                            }
                            return (
                              <div className="w-full">
                                <p className="text-sm text-gray-500 mb-2">{countdownMessage}</p>
                              </div>
                            );
                          }
                        }

                        if (providerMarkedDone && !isConcluded(step)) {
                          return (
                            <div className="w-full">
                              <p className="text-sm text-gray-500 mb-2">
                                Aguardando a confirmação do cliente.
                              </p>
                            </div>
                          )
                        }

                        if (requiresSequentialPayment && (step as any).confirm_contractor && !paid) {
                          return (
                            <div className="w-full">
                              <p className="text-sm text-gray-500 mb-2">
                                Aguardando pagamento do cliente.
                              </p>
                            </div>
                          )
                        }

                        return null
                      })()}

                      {userType === "prestador" && !isSignatureStep && (
                        <>
                          {!stepConcluded && !providerMarkedDone && (
                            isStepPayment && status === 'pendente' && !isRework ? (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => onStartPhase(step.id)}
                              disabled={!ticketIsActive || prevBlocking || needsPaymentToStart}
                              title={
                                needsPaymentToStart
                                  ? "Pagamento necessário para iniciar a etapa."
                                  : prevBlockReason || undefined
                              }
                            >
                              {prevBlocking ? <Lock className="h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                              Iniciar fase
                            </Button>
                            ) : (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => onMarkProviderCompleted(step.id, (step as any).ticket_id)}
                                disabled={
                                  !ticketIsActive ||
                                  needsPaymentToStart ||
                                  (status !== 'em andamento' && prevBlocking)
                                }
                                title={
                                  needsPaymentToStart
                                    ? "Pagamento necessário para iniciar a etapa."
                                    : status !== 'em andamento'
                                      ? prevBlockReason || undefined
                                      : undefined
                                }
                              >
                                {status !== 'em andamento' && prevBlocking ? <Lock className="h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                {isRework ? `Concluir novamente (${reworks + 1}ª vez)` : 'Marcar como concluído'}
                              </Button>
                            )
                          )}

                        {/* mostrar os botões de feedback/problema só na etapa ativa ou em etapas já concluídas */}   
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openFeedbackModal(step, 'feedback')}
                              disabled={isBlocked || (!ticketIsActive && !stepConcluded)}
                            >
                              {isBlocked ? (
                                <Lock className="h-4 w-4 mr-2" />
                              ) : (
                                <MessageCircle className="h-4 w-4 mr-2" />
                              )}
                              Feedbacks
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-400 text-red-600 hover:text-red-700 hover:border-red-500 disabled:border-slate-200 disabled:text-slate-400"
                              onClick={() => openFeedbackModal(step, 'problem')}
                              disabled={isBlocked || (!ticketIsActive && !stepConcluded)}
                            >
                              {isBlocked ? (
                                <Lock className="h-4 w-4 mr-2" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 mr-2" />
                              )}
                              Problemas
                            </Button>
                          </>
                         
                         {/* O botão de editar não funciona */}
                          {userType === "prestador" && !isSignatureStep && ["pendente", "cancelada"].includes((currentTicketStatus || "").toLowerCase()) && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => onEditStep(step)}>
                                    <Edit2 className="h-4 w-4 mr-2" /> Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => onDeleteStep(step.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                          )}
                        </>
                      )}

                      {userType === "contratante" &&
                        isStepPayment &&
                        !isSignatureStep &&
                        !isCustomPayment &&
                        !paid &&
                        stepPrice > 0 &&
                        !isRejected &&
                        (isCustomPayment
                          ? true
                          : canPayStep
                            ? canPayStep(step, steps)
                            : stepConcluded) && (
                          <>
                          <Button
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={() => onPaySteps?.([step])}
                            // disabled={!ticketIsActive}
                          >
                            <QrCode className="h-4 w-4 mr-2" /> Pagar esta etapa
                          </Button>
                          <Button
                          className="bg-green-600 hover:bg-green-700 text-white"
                            variant="outline"
                            onClick={() => onConfirmStepPayment?.(step.id)}
                            disabled={!!confirmingStepPaymentIds?.[step.id]}
                          >
                            {confirmingStepPaymentIds?.[step.id] ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Confirmar pagamento
                          </Button>
                          </>
                        )}

                      {userType === "contratante" && !isSignatureStep && (() => {
                        const prev = steps[index - 1]
                        const prevDone = prev && ((prev.status || '').toLowerCase() === "concluido" || (prev.confirm_freelancer && prev.confirm_contractor))

                        if (isRework && !providerMarkedDone && !isConcluded(step)) {
                          return (
                            <p className="text-sm text-gray-500">
                              Aguardando o prestador realizar uma reentrega.
                            </p>
                          );
                        }

                        if (isStepPayment && status === 'em andamento' && !providerMarkedDone) {
                          return (
                            <p className="text-sm text-gray-500">
                              Aguardando finalização do prestador.
                            </p>
                          );
                        }
                        if (prevDone && providerMarkedDone && !isConcluded(step)) {
                          return (
                            <div className="flex flex-col gap-2 w-full">
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => onClientAccept(step, displayPaymentPreference)}
                                  disabled={!ticketIsActive}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Aceitar Etapa
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => openFeedbackModal(step, 'problem', true)}
                                  disabled={!ticketIsActive}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Relatar problema e recusar etapa
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openFeedbackModal(step, 'feedback')}
                                  disabled={!ticketIsActive}
                                >
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Feedbacks
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-red-400 text-red-600 hover:text-red-700 hover:border-red-500"
                                  onClick={() => openFeedbackModal(step, 'problem')}
                                  disabled={!ticketIsActive}
                                >
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Problemas
                                </Button>
                              </div> 
                            </div>
                          );
                        }

                        if (isConcluded(step) && (!isStepPayment || paid)) {
                          const conclusionDate = (step as any).updated_at || (step as any).updatedAt;
                          return (
                            <p className="text-sm text-green-700 font-medium">
                              Fase finalizada em: {conclusionDate ? formatDate(conclusionDate) : 'data indisponível'}.
                            </p>
                          );
                        }
                        
                        if (prevDone && !providerMarkedDone && status !== 'em andamento') {
                          return (
                            <p className="text-sm text-gray-500">
                              Aguardando o prestador iniciar a etapa.
                            </p>
                          );
                        }

                        return null
                      })()}

                      {userType === "prestador" && !isSignatureStep && (() => {
                        const prev = steps[index - 1]
                        const prevDone = prev && ((prev.status || '').toLowerCase() === "concluido" || (prev.confirm_freelancer && prev.confirm_contractor))

                        if (prevDone && providerMarkedDone && !isConcluded(step)) {
                          return null
                        }
                        return null
                      })()}

                      {userType === "contratante" && isSignatureStep && !signatureSigned && (currentTicketStatus || "").toLowerCase() === "pendente" && (() => {
                        const ticketId = (step as any)?.ticket_id;
                        return (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => ticketId && onRejectContract(ticketId)}
                            className="w-full"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Recusar proposta
                          </Button>
                        )
                      })()}

                      {userType === "contratante" && isSignatureStep && signatureSigned && (
                        <p className="text-sm text-gray-600">
                          Contrato assinado. Não é mais possível recusar esta proposta.
                        </p>
                      )}

                    </div>

                    {/* Editor inline */}
                    {editingStepId === step.id && (
                      <div className="mt-3 space-y-2">
                        <Input
                          value={editStepData.title}
                          onChange={(e) =>
                            onEditStepDataChange({
                              ...editStepData,
                              title: e.target.value
                            })
                          }
                          placeholder="Título da etapa"
                        />
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editStepData.price}
                          onChange={(e) =>
                            onEditStepDataChange({
                              ...editStepData,
                              price: parseFloat(e.target.value) || 0
                            })
                          }
                          placeholder="Valor"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={onSaveStep}>
                            <Check className="h-4 w-4 mr-2" /> Salvar
                          </Button>
                          <Button size="sm" variant="outline" onClick={onCancelEdit}>
                            <X className="h-4 w-4 mr-2" /> Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                )
              })}
              
              {/* botão de pagar grupo */}
              {isCustomPayment && userType === "contratante" && group.total > 0 && !group.paid && (
                 <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                    <div className="text-sm">
                       <span className="text-gray-500">Total do grupo:</span>{" "}
                       <span className="font-bold text-gray-900">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL"
                          }).format(group.total)}
                       </span>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                      onClick={() => onPaySteps?.(group.steps)}
                    >
                       <QrCode className="h-4 w-4 mr-2" />
                       Pagar grupo
                    </Button>
                 </div>
              )}
              </div>
              ))}

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="text-xl font-bold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL"
                    }).format(
                      steps.reduce((s, it) => s + (it.price || 0), 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!feedbackModalStep}
        onOpenChange={(open) => {
          if (!open) resetFeedbackModal();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {feedbackModalType === 'problem' ? 'Problemas da etapa' : 'Feedbacks da etapa'}{" "}
              {feedbackModalStep ? steps.findIndex(s => s.id === feedbackModalStep.id) + 1 : ''}
            </DialogTitle>
            <DialogDescription>{feedbackModalStep?.title}</DialogDescription>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
            {isLoadingFeedback ? (
              <p>Carregando...</p>
            ) : (() => {
              const filtered = (feedbackData || []).filter(fb =>
                feedbackModalType === 'problem' ? fb.isProblem : !fb.isProblem
              );
              if (filtered.length === 0) {
                return (
                  <p className="text-sm text-gray-600">
                    {feedbackModalType === 'problem'
                      ? 'Nenhum problema relatado para esta etapa.'
                      : 'Nenhum feedback encontrado para esta etapa.'}
                  </p>
                );
              }
              return filtered.map(fb => (
                <div
                  key={fb.id}
                  className={`border p-3 rounded-lg flex justify-between gap-3 ${
                    fb.isProblem
                      ? 'border-red-300 bg-red-50 text-red-900'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div>
                    <p className="text-sm">{fb.comment}</p>
                    <p className={`text-xs mt-1 ${fb.isProblem ? 'text-red-700/80' : 'text-gray-500'}`}>
                      {formatDate(fb.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!isProvider ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleEditFeedback(fb)}>
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteFeedback(fb)}
                          disabled={isDeletingFeedback}
                        >
                          Excluir
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-gray-500">Somente visualização</span>
                    )}
                  </div>
                </div>
              ));
            })()}
          </div>

          {!isProvider ? (
            <div className="space-y-3 pt-3 border-t">
              <p className="text-sm font-medium">
                {editingFeedbackId
                  ? `Editar ${feedbackModalType === 'problem' ? 'problema' : 'feedback'}`
                  : `Novo ${feedbackModalType === 'problem' ? 'problema' : 'feedback'}`}
              </p>
              <Textarea
                value={feedbackModalInput}
                onChange={(e) => setFeedbackModalInput(e.target.value)}
                placeholder={
                  feedbackModalType === 'problem'
                    ? 'Descreva o problema encontrado nesta etapa...'
                    : 'Deixe seu feedback sobre esta etapa...'
                }
                rows={4}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSubmitFeedback}
                  disabled={isCreatingFeedback || isUpdatingFeedback || !feedbackModalInput.trim()}
                >
                  {editingFeedbackId ? "Salvar alterações" : "Enviar"}
                </Button>
                {editingFeedbackId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingFeedbackId(null);
                      setFeedbackModalInput("");
                    }}
                  >
                    Cancelar edição
                  </Button>
                )}
              </div>
              {pendingRejectStep && feedbackModalType === 'problem' && (
                <p className="text-xs text-red-600">
                  Ao enviar o problema a etapa será recusada automaticamente.
                </p>
              )}
            </div>
          ) : (
            <div className="pt-3 border-t">
              <p className="text-sm text-gray-500">Somente visualização — você não pode adicionar, editar ou excluir feedbacks.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
