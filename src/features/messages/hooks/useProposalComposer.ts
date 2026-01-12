import { useState } from "react";
import type { ProposalStep } from "@/features/messages/types";

type ToastFn = (props: {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "warning";
}) => void;

type UseProposalComposerParams = {
  toast: ToastFn;
};

export const useProposalComposer = ({
  toast,
}: UseProposalComposerParams) => {
  const [proposalSteps, setProposalSteps] = useState<ProposalStep[]>([
    { id: crypto.randomUUID(), title: "", price: 0 },
  ]);
  const [proposalPaymentPreference, setProposalPaymentPreference] = useState<
    "per_step" | "at_end" | "custom"
  >("at_end");
  const [contractFile, setContractFile] = useState<File | null>(null);

  const addProposalStep = () =>
    setProposalSteps((ps) => [
      ...ps,
      { id: crypto.randomUUID(), title: "", price: 0, startDate: "", endDate: "" },
    ]);
  const removeProposalStep = (id: string) =>
    setProposalSteps((ps) => ps.filter((s) => s.id !== id));
  const updateProposalStep = (
    id: string,
    field: "title" | "price" | "startDate" | "endDate",
    value: string | number,
  ) =>
    setProposalSteps((ps) =>
      ps.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );

  const handleContractFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || f.type !== "application/pdf") {
      toast({
        title: "Erro",
        description: "Selecione um PDF válido.",
        variant: "destructive",
      });
      return;
    }
    setContractFile(f);
  };

  return {
    proposalSteps,
    setProposalSteps,
    proposalPaymentPreference,
    setProposalPaymentPreference,
    contractFile,
    setContractFile,
    addProposalStep,
    removeProposalStep,
    updateProposalStep,
    handleContractFileChange,
  };
};
