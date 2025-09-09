// src/components/modals/ProposalDetailsDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit2, Trash2, CheckCircle, XCircle, Shield, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import * as React from "react"

type Step = {
  id: number
  ticket_id: number
  title: string
  price: number
  status?: "pending" | "in_progress" | "awaiting_confirmation" | "completed" | "rejected"
  provider_completed?: boolean
  client_confirmed?: boolean
}

export function ProposalDetailsDialog({
  open,
  onOpenChange,
  steps,
  loading,
  userType,
  tickets,
  onMarkProviderCompleted,
  onClientAccept,
  onClientRejectStep,
  onEditStep,
  onDeleteStep,
  editingStepId,
  editStepData,
  onEditStepDataChange,
  onSaveStep,
  onCancelEdit,
  onStartSignature,
  onRejectContract,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  steps: Step[]
  loading: boolean
  userType?: "prestador" | "contratante"
  tickets: any[]
  onMarkProviderCompleted: (stepId: number) => void
  onClientAccept: (stepId: number, ticketId: number, index: number) => void
  onClientRejectStep: (stepId: number, ticketId: number, index: number) => void
  onEditStep: (step: Step) => void
  onDeleteStep: (stepId: number) => void
  editingStepId: number | null
  editStepData: { title: string; price: number }
  onEditStepDataChange: (data: { title: string; price: number }) => void
  onSaveStep: () => void
  onCancelEdit: () => void
  onStartSignature: (ticket: any) => void
  onRejectContract: (ticketId: number) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Proposta</DialogTitle>
          <DialogDescription>Veja o status e as ações disponíveis para cada etapa.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">Carregando…</div>
        ) : steps.length === 0 ? (
          <div className="text-center py-8 text-sm text-gray-600">Nenhuma etapa encontrada para este ticket.</div>
        ) : (
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isSignatureStep = index === 0
              return (
                <div key={step.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Etapa {index + 1}</h4>
                    <Badge variant="outline">
                      {step.status === "completed"
                        ? "Concluída"
                        : step.status === "in_progress"
                          ? "Em Andamento"
                          : step.status === "awaiting_confirmation"
                            ? "Aguardando Confirmação"
                            : step.status === "rejected"
                              ? "Recusada"
                              : "Pendente"}
                    </Badge>
                  </div>

                  <p className="text-gray-700 mb-2">{step.title}</p>
                  <p className="font-semibold text-lg">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(step.price || 0)}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {userType === "prestador" && step.status === "in_progress" && !step.provider_completed && (
                      <Button size="sm" onClick={() => onMarkProviderCompleted(step.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marcar como concluído
                      </Button>
                    )}

                    {userType === "contratante" &&
                      step.provider_completed &&
                      !step.client_confirmed &&
                      step.status === "awaiting_confirmation" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => onClientAccept(step.id, step.ticket_id, index)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Aceitar etapa
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onClientRejectStep(step.id, step.ticket_id, index)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Recusar etapa
                          </Button>
                        </>
                      )}

                    {userType === "contratante" && isSignatureStep && step.status !== "completed" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() => {
                            const t = tickets.find((tk) => tk.id === step.ticket_id)
                            if (t) onStartSignature(t)
                          }}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Assinar contrato
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onRejectContract(step.ticket_id)}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Recusar contrato
                        </Button>
                      </div>
                    )}

                    {userType === "prestador" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => onEditStep(step)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onDeleteStep(step.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </Button>
                      </>
                    )}
                  </div>

                  {editingStepId === step.id && (
                    <div className="mt-3 space-y-2">
                      <Input
                        value={editStepData.title}
                        onChange={(e) => onEditStepDataChange({ ...editStepData, title: e.target.value })}
                        placeholder="Título da etapa"
                      />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editStepData.price}
                        onChange={(e) =>
                          onEditStepDataChange({ ...editStepData, price: parseFloat(e.target.value) || 0 })
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
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                    steps.reduce((s, it) => s + (it.price || 0), 0),
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
