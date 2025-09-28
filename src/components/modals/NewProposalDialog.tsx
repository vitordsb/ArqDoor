
// src/components/modals/NewProposalDialog.tsx
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProposalStep = { id: string; title: string; price: number };

interface NewProposalDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  proposalSteps: ProposalStep[];
  onAddStep: () => void;
  onRemoveStep: (id: string) => void;
  onUpdateStep: (id: string, field: "title" | "price", value: string | number) => void;
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
              <div key={step.id} className="flex items-center gap-2 mb-2">
                <Input
                  placeholder={`Título da etapa ${idx + 1}`}
                  value={step.title}
                  onChange={(e) => onUpdateStep(step.id, "title", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Preço"
                  value={step.price}
                  onChange={(e) => onUpdateStep(step.id, "price", parseFloat(e.target.value))}
                  className="w-28"
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

