
// src/components/modals/ProposalDetailsDialog.tsx
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Edit2, Trash2, CheckCircle, XCircle, Shield, Check, X, MoreVertical
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
  onStartSignature,
  onRejectContract,
  onClientAccept,
  onClientRejectStep
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
  onRejectContract: (ticketId: number) => void
  onClientAccept: (step: Step) => Promise<void>
  onClientRejectStep: (step: Step) => Promise<void>
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

                  <p className="text-gray-700 mb-2">{step.title}</p>
                  <p className="font-semibold text-lg">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL"
                    }).format(step.price || 0)}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {/* Prestador: marcar concluído + menu flutuante */}
                    {userType === "prestador" && !isSignatureStep && ( // 👈 não renderiza ações do prestador no step 1
                      <>
                        {/* Marcar como concluído */}
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

                        {/* Menu flutuante para editar/excluir */}
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

                    {/* Cliente: contrato (primeiro step) */}
                    {userType === "contratante" && isSignatureStep && (
                      <>
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
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onRejectContract(step.ticket_id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Recusar contrato
                        </Button>
                      </>
                    )}

                    {/* Cliente: steps > 1 (aceitar/recusar etapa) */}

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
                              onClick={() => onClientRejectStep(step)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Recusar etapa
                            </Button>
                          </>
                        )
                      }
                      return null
                    })()}

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
  )
}

