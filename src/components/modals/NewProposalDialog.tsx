
// src/components/modals/NewProposalDialog.tsx
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  // Incluímos startDate e endDate como opções válidas de atualização
  onUpdateStep: (
    id: string,
    field: "title" | "price" | "startDate" | "endDate",
    value: string | number
  ) => void;
  onContractFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendProposal: () => void;
  sendingProposal: boolean;
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
}: NewProposalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Proposta</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label className="block mb-2">Etapas da proposta</Label>
            {proposalSteps.map((step, idx) => (
              <div key={step.id} className="flex flex-wrap items-center gap-2 mb-2">
                <Input
                  placeholder={`Título da etapa ${idx + 1}`}
                  value={step.title}
                  onChange={(e) =>
                    onUpdateStep(step.id, "title", e.target.value)
                  }
                />
                <Input
                  type="number"
                  placeholder="Preço"
                  value={step.price}
                  onChange={(e) =>
                    onUpdateStep(step.id, "price", parseFloat(e.target.value))
                  }
                  className="w-28"
                />
                <Input
                  type="date"
                  lang="pt-BR"
                  value={step.startDate ?? ''}
                  onChange={(e) => {
                    const startIso = e.target.value;
                    // Se a data final já existir e for anterior, atualiza-a para a nova data de início
                    if (step.endDate && new Date(step.endDate) < new Date(startIso)) {
                      onUpdateStep(step.id, 'endDate', startIso);
                    }
                    onUpdateStep(step.id, 'startDate', startIso);
                  }}
                  className="w-36"
                  // impede selecionar uma data de início posterior à data final (se definida)
                  max={step.endDate ?? undefined}
                />

                {/* Data de término: usa type="date" com locale pt-BR */}
                <Input
                  type="date"
                  lang="pt-BR"
                  value={step.endDate ?? ''}
                  onChange={(e) => {
                    const endIso = e.target.value;
                    // Verificação: se a data inicial existir e a data final for anterior, mostra alerta
                    if (
                      step.startDate &&
                      new Date(endIso) < new Date(step.startDate)
                    ) {
                      alert('A data final não pode ser anterior à data inicial.');
                      return;
                    }
                    onUpdateStep(step.id, 'endDate', endIso);
                  }}
                  className="w-36"
                  // impede selecionar uma data final menor que a inicial
                  min={step.startDate ?? undefined}
                />
                {proposalSteps.length > 1 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemoveStep(step.id)}
                  >
                    Remover
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" onClick={onAddStep}>
              + Adicionar etapa
            </Button>
          </div>

          <div>
            <Label className="block mb-2">Contrato (PDF opcional)</Label>
            <Input type="file" accept="application/pdf" onChange={onContractFileChange} />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={onSendProposal}
            disabled={sendingProposal}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {sendingProposal ? "Enviando..." : "Enviar Proposta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
