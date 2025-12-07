
// src/components/modals/ProposalDetailsDialog.tsx
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
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
  onCancelEdit: () => void
  onStartSignature: (ticket: any) => void
  onOpenSignature: (ticket: any) => void
  onRejectContract: (ticketId: number) => void
  onClientAccept: (step: Step, paymentPreference?: "per_step" | "at_end" | null) => Promise<void>
  onClientRejectStep: (step: Step) => Promise<boolean>
  onFeedbackCreated?: (step: Step, comment: string, isProblem: boolean) => void
  onClientPayStep?: (step: Step) => void
  onRefreshStepPayment?: (step: Step) => void
  payingStepId?: number | null
  currentIndex: number
  ticketStatus?: string
  ticketId?: number | null
  onDeleteTicket?: (ticketId: number) => void
  deletingTicket?: boolean
  onRefreshPayment?: (ticketId: number) => void
  paymentPreference?: "per_step" | "at_end" | null
}

export function ProposalDetailsDialog({
  open,
  onOpenChange,
  steps,
  loading,
  userType,
  onMarkProviderCompleted,
  onEditStep,
  onDeleteStep,
  editingStepId,
  editStepData,
  onEditStepDataChange,
  onSaveStep,
  onCancelEdit,
  onStartSignature: _onStartSignature,
  onOpenSignature: _onOpenSignature,
  onRejectContract,
  onClientAccept,
  onClientRejectStep,
  onFeedbackCreated,
  onClientPayStep,
  onRefreshStepPayment,
  payingStepId,
  ticketStatus,
  ticketId,
  onDeleteTicket,
  deletingTicket,
  onRefreshPayment,
  currentIndex: _currentIndex,
  paymentPreference = null,
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

  const isPerStepPayment = paymentPreference === "per_step";

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

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
          </DialogHeader>
          {paymentPreference === "at_end" && ticketStatus && (ticketStatus as string).toLowerCase() !== "em andamento" && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <div className="flex items-center justify-between gap-3">
                <span>Aguardando pagamento do depósito em garantia para liberar as ações do projeto.</span>
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
          )}

          {loading ? (
            <div className="text-center py-8">Carregando…</div>
          ) : steps.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-600">
              Nenhuma etapa encontrada para este ticket.
            </div>
          ) : (
            <div className="space-y-4">

              {steps.map((step, index) => {
                const isSignatureStep = step.title === SIGNATURE_STEP_TITLE || index === 0
                const signatureSigned =
                  isSignatureStep &&
                  ((step as any)?.confirm_contractor ||
                    (step as any)?.confirmContractor ||
                    ((step.status || "") as string).toLowerCase() === "concluido")
                const ticketIsActive = (ticketStatus || "").toLowerCase() === "em andamento"
                const paid = Boolean((step as any).paid);

                // helpers para auxiliar
                const isConcluded = (s: any) =>
                  (s?.status || '').toLowerCase() === 'concluido' ||
                  (s?.confirm_freelancer && s?.confirm_contractor);
                const providerMarkedDone = !!step.confirm_freelancer;

                // padroniza status
                const status = (step.status || "").toLowerCase()
                const statusLabel = isConcluded(step)
                  ? "Concluido"
                  : status === "pendente"
                    ? "Pendente"
                    : status === "recusado"
                      ? "Recusado"
                      : "—"

                return (
                  <div key={step.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Etapa {index + 1}</h4>
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

                    <div className="mt-3 flex flex-wrap gap-2">
                      {userType === "prestador" && !isSignatureStep && (() => {
                        const prev = steps[index - 1]
                        const prevDone = prev && ((prev.status || '').toLowerCase() === "concluido" || (prev.confirm_freelancer && prev.confirm_contractor))

                        // Se etapa foi marcada como concluída pelo prestador, mostra mensagem
                        if (prevDone && providerMarkedDone && !isConcluded(step)) {
                          return (
                            <div className="w-full">
                              <p className="text-sm text-gray-500 mb-2">
                                {isPerStepPayment ? "Aguardando pagamento do cliente." : "Aguardando a confirmação do cliente."}
                              </p>
                            </div>
                          )
                        }
                        return null
                      })()}

                      {userType === "prestador" && !isSignatureStep && (
                        <>
                          {!isConcluded(step) && (!providerMarkedDone || status === "recusado") && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => onMarkProviderCompleted(step.id, (step as any).ticket_id)}
                              disabled={!ticketIsActive}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {(() => {
                                const reworks = Number((step as any).rework_count) || 0;
                                const attempt = reworks + 1;
                                return attempt > 1
                                  ? `Concluir novamente (${attempt}ª vez)`
                                  : isPerStepPayment
                                    ? "Iniciar fase"
                                    : "Marcar como concluído";
                              })()}
                            </Button>
                          )}

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
                        </>
                      )}

                      {userType === "contratante" && !isSignatureStep && (() => {
                        const prev = steps[index - 1]
                        const prevDone = prev && ((prev.status || '').toLowerCase() === "concluido" || (prev.confirm_freelancer && prev.confirm_contractor))

                        if (prevDone && providerMarkedDone && !isConcluded(step)) {
                          if (isPerStepPayment && paid) {
                            return (
                              <p className="text-sm text-gray-500">
                                Pagamento desta etapa já foi identificado. Aguarde o fluxo seguir para a próxima etapa.
                              </p>
                            );
                          }
                          return (
                            <div className="flex flex-col gap-2 w-full">
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => onClientAccept(step, paymentPreference)}
                                  disabled={!ticketIsActive}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  {isPerStepPayment ? "Desbloquear pagamento" : "Aceitar etapa"}
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
                        if (prevDone && providerMarkedDone && isConcluded(step)) {
                          return (
                            <p className="text-sm text-gray-500">
                              Aguardando o prestador concluir a próxima etapa.
                            </p>
                          );
                        }
                        if (prevDone && !providerMarkedDone) {
                          return (
                            <p className="text-sm text-gray-500">
                              Aguardando o prestador marcar a etapa como concluída.
                            </p>
                          );
                        }
                        return null
                      })()}

                      {userType === "prestador" && !isSignatureStep && (() => {
                        const prev = steps[index - 1]
                        const prevDone = prev && ((prev.status || '').toLowerCase() === "concluido" || (prev.confirm_freelancer && prev.confirm_contractor))

                        if (prevDone && providerMarkedDone && !isConcluded(step)) {
                          // Mensagem já aparece acima do botão
                          return null
                        }
                        return null
                      })()}

                      {userType === "contratante" && isSignatureStep && !signatureSigned && (() => {
                        // Botão de rejeição para cliente na etapa de assinatura (etapa 0)
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

                      {userType === "contratante" && isPerStepPayment && !isSignatureStep && providerMarkedDone && !paid && (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                            onClick={() => onClientPayStep?.(step)}
                            disabled={!ticketIsActive}
                          >
                            <QrCode className="h-4 w-4 mr-2" />
                            Gerar/abrir pagamento
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => onRefreshStepPayment?.(step)}
                            disabled={!!payingStepId && payingStepId === step.id || !ticketIsActive}
                          >
                            {payingStepId === step.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <QrCode className="h-4 w-4 mr-2" />
                            )}
                            Confirmar pagamento
                          </Button>
                        </div>
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
                  </div>
                </div>
              ));
            })()}
          </div>

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
        </DialogContent>
      </Dialog>
    </>
  )
}
