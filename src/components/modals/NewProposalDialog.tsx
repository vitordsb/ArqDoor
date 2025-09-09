import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X, Send, Loader2 } from 'lucide-react'

export function NewProposalDialog({
  open, onOpenChange,
  proposalSteps, onAddStep, onRemoveStep, onUpdateStep,
  onContractFileChange, onSendProposal, sendingProposal
}: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Nova Proposta</DialogTitle>
          <DialogDescription>Defina as etapas e anexe o contrato em PDF.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {proposalSteps.map((step: any, idx: number) => (
            <div key={step.id} className="flex items-center gap-2">
              <Input value={step.title} placeholder={`Etapa ${idx + 1}`} onChange={(e) => onUpdateStep(step.id, 'title', e.target.value)} />
              <Input type="number" value={step.price} placeholder="R$" onChange={(e) => onUpdateStep(step.id, 'price', parseFloat(e.target.value) || 0)} />
              {proposalSteps.length > 1 && <Button variant="destructive" size="icon" onClick={() => onRemoveStep(step.id)}><X /></Button>}
            </div>
          ))}
          <Button variant="outline" onClick={onAddStep}><Plus className="mr-1" /> Adicionar Etapa</Button>
          <Label>Contrato (PDF)</Label>
          <Input type="file" accept="application/pdf" onChange={onContractFileChange} />
        </div>

        <DialogFooter>
          <Button onClick={onSendProposal} disabled={sendingProposal} className="bg-orange-600 hover:bg-orange-700 text-white">
            {sendingProposal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="mr-1" />} Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
