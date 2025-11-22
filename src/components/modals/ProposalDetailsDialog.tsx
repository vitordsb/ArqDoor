
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
  onClientAccept,
  onClientRejectStep,
  onFeedbackCreated,
  onClientPayStep,
  payingStepId,
}: {
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
  onClientAccept: (step: Step) => Promise<void>
  onClientRejectStep: (step: Step) => Promise<boolean>,
  onFeedbackCreated?: (step: Step, comment: string, isProblem: boolean) => void,
  onClientPayStep?: (step: Step) => void,
  payingStepId?: number | null,
  currentIndex: number
}) {
  const [viewingFeedbackStep, setViewingFeedbackStep] = React.useState<Step | null>(null);
  const [viewingFeedbackType, setViewingFeedbackType] = React.useState<'normal' | 'problem'>('normal');
  const [addingFeedbackStep, setAddingFeedbackStep] = React.useState<Step | null>(null);
  const [feedbackFormType, setFeedbackFormType] = React.useState<'normal' | 'problem'>('normal');
  const [newFeedbackComment, setNewFeedbackComment] = React.useState("");

  const {
    feedbackData,
    isLoadingFeedback
  } = useStepFeedbackActions(viewingFeedbackStep?.id);

  const {
    createStepFeedback,
    isCreatingFeedback
  } = useStepFeedbackActions();

  const handleSubmitFeedback = async () => {
    if (addingFeedbackStep && newFeedbackComment.trim()) {
      const comment = newFeedbackComment.trim();
      const isProblem = feedbackFormType === 'problem';
      const success = await createStepFeedback(addingFeedbackStep.id, comment, { isProblem });
      if (success) {
        onFeedbackCreated?.(addingFeedbackStep, comment, isProblem);
        setNewFeedbackComment("");
        setAddingFeedbackStep(null);
        setFeedbackFormType('normal');
      }
    }
  };

  const handleRejectStepClick = async (step: Step) => {
    const result = await onClientRejectStep(step);
    if (result) {
      setFeedbackFormType('problem');
      setAddingFeedbackStep(step);
      setNewFeedbackComment("");
    }
  };


  return (

    <>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Proposta</DialogTitle>
            <DialogDescription>Veja o status e as ações disponíveis para cada etapa.</DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="text-center py-8">Carregando…</div>
          ) : steps.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-600">
              Nenhuma etapa encontrada para este ticket.
            </div>
          ) : (
            <div className="space-y-4">

              {steps.map((step, index) => {
                const isSignatureStep = index === 0

                // helpers para auxiliar
                const isConcluded = (s: any) =>
                  (s?.status || '').toLowerCase() === 'concluido' ||
                  (s?.confirm_freelancer && s?.confirm_contractor);

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
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL"
                      }).format(step.price || 0)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {userType === "prestador" && !isSignatureStep && (
                        <>
                          {status === "pendente" && !isConcluded(step) && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => onMarkProviderCompleted(step.id, (step as any).ticket_id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Marcar como concluído
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

                        if (prevDone && !isConcluded(step)) {
                          return (
                            <>
                              <Button size="sm" onClick={() => onClientAccept(step)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Aceitar etapa
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectStepClick(step)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Recusar etapa
                              </Button>
                            </>
                          )
                        }
                        return null
                      })()}

                      {userType === "contratante" && !isSignatureStep && isConcluded(step) && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onClientPayStep?.(step)}
                          disabled={!!payingStepId && payingStepId === step.id}
                        >
                          {payingStepId === step.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <QrCode className="h-4 w-4 mr-2" />
                          )}
                          Gerar pagamento PIX
                        </Button>
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
                    {!isSignatureStep && !isConcluded(step) && userType === "contratante" && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setFeedbackFormType('normal');
                                setAddingFeedbackStep(step);
                              }}
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Feedback avulso
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setViewingFeedbackType('normal');
                                setViewingFeedbackStep(step);
                              }}
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Listar feedbacks
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2 justify-end">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setFeedbackFormType('problem');
                                setAddingFeedbackStep(step);
                              }}
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Relatar problema
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-400 text-red-600 hover:text-red-700 hover:border-red-500"
                              onClick={() => {
                                setViewingFeedbackType('problem');
                                setViewingFeedbackStep(step);
                              }}
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Listar problemas
                            </Button>
                          </div>
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
        open={!!viewingFeedbackStep}
        onOpenChange={(open) => {
          if (!open) {
            setViewingFeedbackStep(null);
            setViewingFeedbackType('normal');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {viewingFeedbackType === 'problem' ? 'Problemas relatados' : 'Feedbacks da etapa'}{' '}
              {viewingFeedbackStep ? steps.findIndex(s => s.id === viewingFeedbackStep.id) + 1 : ''}
            </DialogTitle>
            <DialogDescription>{viewingFeedbackStep?.title}</DialogDescription>
          </DialogHeader>
          <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
            {isLoadingFeedback ? (
              <p>Carregando feedbacks...</p>
            ) : (() => {
              const filteredFeedbacks = (feedbackData || []).filter(fb =>
                viewingFeedbackType === 'problem' ? fb.isProblem : !fb.isProblem
              );
              if (filteredFeedbacks.length === 0) {
                return (
                  <p className="text-sm text-gray-600">
                    {viewingFeedbackType === 'problem'
                      ? 'Nenhum problema relatado para esta etapa.'
                      : 'Nenhum feedback encontrado para esta etapa.'}
                  </p>
                );
              }
              return filteredFeedbacks.map(fb => (
                <div
                  key={fb.id}
                  className={`border p-3 rounded-lg ${
                    fb.isProblem
                      ? 'border-red-300 bg-red-50 text-red-900'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <p className="text-sm">{fb.comment}</p>
                  <p className={`text-xs mt-1 ${fb.isProblem ? 'text-red-700/80' : 'text-gray-500'}`}>
                    {formatDate(fb.createdAt)}
                  </p>
                </div>
              ));
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Modal para Adicionar Feedback (Novo) --- */}
      <Dialog
        open={!!addingFeedbackStep}
        onOpenChange={(open) => {
          if (!open) {
            setAddingFeedbackStep(null);
            setFeedbackFormType('normal');
            setNewFeedbackComment("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {feedbackFormType === 'problem' ? 'Relatar problema' : 'Adicionar feedback'} para etapa{' '}
              {addingFeedbackStep ? steps.findIndex(s => s.id === addingFeedbackStep.id) + 1 : ''}
            </DialogTitle>
            <DialogDescription>{addingFeedbackStep?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {feedbackFormType === 'problem' && (
              <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                <p>
                  Detalhe o problema encontrado nesta etapa. Ele aparecerá destacado para a equipe acompanhar
                  com prioridade.
                </p>
              </div>
            )}
            <Textarea
              value={newFeedbackComment}
              onChange={(e) => setNewFeedbackComment(e.target.value)}
              placeholder={
                feedbackFormType === 'problem'
                  ? 'Descreva o problema encontrado...'
                  : 'Escreva seu feedback aqui...'
              }
              rows={4}
            />
            <Button
              onClick={handleSubmitFeedback}
              disabled={isCreatingFeedback || !newFeedbackComment.trim()}
              className={`w-full ${feedbackFormType === 'problem' ? 'bg-red-600 hover:bg-red-700' : ''}`}
            >
              {isCreatingFeedback
                ? "Enviando..."
                : feedbackFormType === 'problem'
                  ? "Relatar problema"
                  : "Enviar feedback"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
