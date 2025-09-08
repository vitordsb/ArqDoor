import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { FileText, Loader2, AlertTriangle, Shield, CheckCircle, XCircle, Edit2, Trash2, Check, X, Maximize2, Download } from 'lucide-react'
import * as React from 'react'
import type { Step } from '@/lib/Interfaces'
import { money } from '@/lib/money'

/* ---------------- PDF VIEWER ---------------- */
export function PdfViewerDialog({
  open, onOpenChange,
  pdfUrl, pdfBlob, pdfFilename,
  loading, error,
  onReload, onOpenNew, onDownload,
  fullscreen, setFullscreen,
}: {
  open: boolean; onOpenChange: (v: boolean) => void
  pdfUrl?: string; pdfBlob?: Blob | null; pdfFilename?: string
  loading: boolean; error?: string
  onReload: () => void
  onOpenNew: () => void
  onDownload: () => void
  fullscreen: boolean; setFullscreen: (v: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${fullscreen ? 'max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh]' : 'max-w-4xl max-h-[80vh] w-full h-[80vh]'} p-0`}>
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <DialogTitle className="flex items-center gap-2 truncate">
                <FileText className="h-5 w-5 shrink-0" />
                <span className="truncate">{pdfFilename ?? 'Contrato'}</span>
              </DialogTitle>
              <DialogDescription id="pdf-desc" className="sr-only">
                Visualizador de PDF do contrato.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onReload} disabled={loading}>
                <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Recarregar
              </Button>
              <Button variant="outline" size="sm" onClick={onOpenNew} disabled={!pdfUrl}>
                <Download className="h-4 w-4 mr-2" /> Nova aba
              </Button>
              <Button variant="outline" size="sm" onClick={onDownload} disabled={!pdfBlob}>
                <Download className="h-4 w-4 mr-2" /> Baixar
              </Button>
              <Button variant="outline" size="sm" onClick={() => setFullscreen(!fullscreen)}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Carregando PDF...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-lg">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium">Erro ao carregar PDF</p>
                <p className="text-gray-600 mt-2 break-words">{error}</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe src={pdfUrl} className="w-full h-full border-0 rounded-lg" title="Contrato" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-600">Nenhum PDF disponível</div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ---------------- SIGNATURE ---------------- */
export function SignatureDialog({
  open, onOpenChange,
  ackChecked, setAckChecked,
  password, setPassword,
  onContinue, onConfirm, signing
}: {
  open: boolean; onOpenChange: (v: boolean) => void
  ackChecked: boolean; setAckChecked: (v: boolean) => void
  password: string; setPassword: (v: string) => void
  onContinue: () => void
  onConfirm: () => void
  signing: boolean
}) {
  const [askPassword, setAskPassword] = React.useState(false)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assinatura Digital</DialogTitle>
          <DialogDescription>Confirme os termos e insira sua senha para assinar.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
              <p className="text-sm text-purple-800">Seu nome será inserido no documento e o registro ficará associado à sua conta.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="ack" checked={!!ackChecked} onCheckedChange={(c) => setAckChecked(!!c)} />
            <label htmlFor="ack" className="text-sm">Eu assino e confirmo os termos desse contrato.</label>
          </div>

          {!askPassword ? (
            <Button className="w-full bg-purple-600 hover:bg-purple-700" disabled={!ackChecked} onClick={() => { onContinue(); setAskPassword(true) }}>
              Prosseguir
            </Button>
          ) : (
            <>
              <div>
                <label htmlFor="signature-password" className="text-sm">Sua senha</label>
                <Input id="signature-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha de acesso" />
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" disabled={signing || !ackChecked || !password.trim()} onClick={onConfirm}>
                {signing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Assinando...</> : <><Shield className="h-4 w-4 mr-2" /> Assinar documento</>}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* --------------- PROPOSAL DETAILS --------------- */
export function ProposalDetailsDialog({
  open, onOpenChange,
  steps, loading,
  isClient, isProvider,
  onSignContract, onRejectContract,
  onProviderDone, onClientAccept, onClientReject,
  editingStepId, editStepData, onStartEdit, onChangeEdit, onSaveEdit, onCancelEdit, onDeleteStep,
}: {
  open: boolean; onOpenChange: (v: boolean) => void
  steps: Step[]; loading: boolean
  isClient: boolean; isProvider: boolean
  onSignContract: (ticketId: number) => void
  onRejectContract: (ticketId: number) => void
  onProviderDone: (step: Step) => void
  onClientAccept: (step: Step, index: number) => void
  onClientReject: (step: Step, index: number) => void
  editingStepId: number | null
  editStepData: { title: string; price: number }
  onStartEdit: (s: Step) => void
  onChangeEdit: (patch: Partial<Step>) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDeleteStep: (id: number) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Proposta</DialogTitle>
          <DialogDescription>Veja o status e as ações para cada etapa.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-sm text-gray-600">Carregando…</div>
        ) : steps.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-600">Nenhuma etapa encontrada.</div>
        ) : (
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isSignature = index === 0
              const label =
                step.status === 'completed' ? 'Concluída' :
                  step.status === 'in_progress' ? 'Em Andamento' :
                    step.status === 'awaiting_confirmation' ? 'Aguardando Confirmação' :
                      step.status === 'rejected' ? 'Recusada' : 'Pendente'

              return (
                <div key={step.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Etapa {index + 1}</h4>
                    <Badge variant="outline">{label}</Badge>
                  </div>

                  <p className="text-gray-700 mb-2">{step.title}</p>
                  <p className="font-semibold text-lg">{money(step.price)}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {isProvider && step.status === 'in_progress' && !step.provider_completed && (
                      <Button size="sm" onClick={() => onProviderDone(step)}>
                        <CheckCircle className="h-4 w-4 mr-2" /> Marcar como concluído
                      </Button>
                    )}

                    {isClient && step.provider_completed && !step.client_confirmed && step.status === 'awaiting_confirmation' && (
                      <>
                        <Button size="sm" onClick={() => onClientAccept(step, index)}>
                          <CheckCircle className="h-4 w-4 mr-2" /> Aceitar etapa
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onClientReject(step, index)}>
                          <XCircle className="h-4 w-4 mr-2" /> Recusar etapa
                        </Button>
                      </>
                    )}

                    {isClient && isSignature && step.status !== 'completed' && (
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => onSignContract(step.ticket_id)}>
                          <Shield className="h-4 w-4 mr-2" /> Assinar contrato
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onRejectContract(step.ticket_id)}>
                          <XCircle className="h-4 w-4 mr-2" /> Recusar contrato
                        </Button>
                      </div>
                    )}

                    {isProvider && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => onStartEdit(step)}>
                          <Edit2 className="h-4 w-4 mr-2" /> Editar
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onDeleteStep(step.id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Excluir
                        </Button>
                      </>
                    )}
                  </div>

                  {editingStepId === step.id && (
                    <div className="mt-3 space-y-2">
                      <Input
                        value={editStepData.title}
                        onChange={(e) => onChangeEdit({ title: e.target.value })}
                        placeholder="Título"
                      />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={editStepData.price}
                        onChange={(e) => onChangeEdit({ price: parseFloat(e.target.value) || 0 })}
                        placeholder="Valor"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={onSaveEdit}><Check className="h-4 w-4 mr-2" />Salvar</Button>
                        <Button size="sm" variant="outline" onClick={onCancelEdit}><X className="h-4 w-4 mr-2" />Cancelar</Button>
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
                  {money(steps.reduce((s, st) => s + (st.price || 0), 0))}
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
