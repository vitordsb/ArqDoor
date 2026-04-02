import {
  findSignatureContractStep,
  isSignatureContractStep,
} from "@/constants/contracts";

type WorkflowTone = "orange" | "blue" | "emerald" | "slate" | "red";

export type ContractWorkflowSummary = {
  label: string;
  title: string;
  description: string;
  tone: WorkflowTone;
};

const toneClasses: Record<
  WorkflowTone,
  {
    container: string;
    label: string;
    title: string;
  }
> = {
  orange: {
    container: "border-orange-200 bg-orange-50",
    label: "text-orange-700",
    title: "text-orange-900",
  },
  blue: {
    container: "border-blue-200 bg-blue-50",
    label: "text-blue-700",
    title: "text-blue-900",
  },
  emerald: {
    container: "border-emerald-200 bg-emerald-50",
    label: "text-emerald-700",
    title: "text-emerald-900",
  },
  slate: {
    container: "border-slate-200 bg-slate-50",
    label: "text-slate-700",
    title: "text-slate-900",
  },
  red: {
    container: "border-red-200 bg-red-50",
    label: "text-red-700",
    title: "text-red-900",
  },
};

const normalizeStatus = (value?: string) =>
  (value || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const isStepConcluded = (step: any) =>
  normalizeStatus(step?.status) === "concluido" ||
  Boolean(step?.confirm_freelancer && step?.confirm_contractor);

const isStepPaid = (step: any) =>
  Boolean(step?.is_financially_cleared || step?.paid);

export function getWorkflowToneClasses(tone: WorkflowTone) {
  return toneClasses[tone];
}

export function getContractWorkflowSummary({
  ticket,
  steps,
  currentUserType,
}: {
  ticket: any;
  steps: any[];
  currentUserType?: string;
}): ContractWorkflowSummary {
  const normalizedTicketStatus = normalizeStatus(ticket?.status);
  const signatureStep = findSignatureContractStep(steps || []);
  const signatureSigned = Boolean(
    signatureStep?.confirm_contractor ||
      signatureStep?.confirmContractor ||
      signatureStep?.signature ||
      normalizeStatus(signatureStep?.status) === "concluido"
  );

  const workSteps = (steps || []).filter((step) => !isSignatureContractStep(step));
  const payableSteps = workSteps.filter((step) => Number(step?.price || 0) > 0);
  const paidSteps = payableSteps.filter(isStepPaid);
  const allWorkStepsConcluded =
    workSteps.length > 0 && workSteps.every((step) => isStepConcluded(step));

  const reviewStep = workSteps.find(
    (step) =>
      Boolean(step?.confirm_freelancer) &&
      !Boolean(step?.confirm_contractor) &&
      !isStepConcluded(step)
  );
  const activeStep = workSteps.find(
    (step) =>
      normalizeStatus(step?.status) === "em andamento" && !isStepConcluded(step)
  );
  const readyToStartStep = workSteps.find((step) => {
    const status = normalizeStatus(step?.status);
    return status === "pendente" && isStepPaid(step) && !Boolean(step?.confirm_freelancer);
  });

  if (normalizedTicketStatus === "cancelada" || normalizedTicketStatus === "cancelado") {
    return {
      label: "Contrato encerrado",
      title: "Esta proposta foi cancelada",
      description: "Não há novas ações pendentes para este contrato.",
      tone: "red",
    };
  }

  if (allWorkStepsConcluded || normalizedTicketStatus === "concluida" || normalizedTicketStatus === "concluido") {
    return {
      label: "Fluxo concluído",
      title: "Todas as etapas foram finalizadas",
      description:
        currentUserType === "prestador"
          ? "Agora resta apenas acompanhar a liberação final e o repasse, se aplicável."
          : "O contrato foi executado por completo e está encerrado para as partes.",
      tone: "emerald",
    };
  }

  if (!signatureSigned) {
    return currentUserType === "contratante"
      ? {
          label: "Sua vez agora",
          title: "Assine o contrato para liberar o fluxo",
          description:
            "Revise o PDF e confirme os termos. Depois disso, o pagamento poderá ser gerado.",
          tone: "orange",
        }
      : {
          label: "Aguardando cliente",
          title: "O cliente ainda precisa assinar o contrato",
          description:
            "Assim que a assinatura acontecer, o pagamento do primeiro grupo poderá seguir.",
          tone: "slate",
        };
  }

  if (reviewStep) {
    return currentUserType === "contratante"
      ? {
          label: "Sua vez agora",
          title: `Revise a etapa "${reviewStep.title}"`,
          description:
            "O prestador marcou esta entrega como concluída. Aprove ou reporte ajustes para continuar.",
          tone: "orange",
        }
      : {
          label: "Aguardando cliente",
          title: `Cliente precisa validar "${reviewStep.title}"`,
          description:
            "Esta etapa já foi entregue. O próximo avanço depende da aprovação do cliente.",
          tone: "blue",
        };
  }

  if (activeStep) {
    return currentUserType === "prestador"
      ? {
          label: "Sua vez agora",
          title: `Continue a etapa "${activeStep.title}"`,
          description:
            "Esta fase já está em andamento. Atualize a entrega assim que estiver pronta para revisão.",
          tone: "blue",
        }
      : {
          label: "Em execução",
          title: `Prestador está trabalhando em "${activeStep.title}"`,
          description:
            "Você poderá revisar a entrega quando ela for marcada como concluída.",
          tone: "blue",
        };
  }

  if (readyToStartStep) {
    return currentUserType === "prestador"
      ? {
          label: "Sua vez agora",
          title: `Pode iniciar "${readyToStartStep.title}"`,
          description:
            "O pagamento desta fase já foi confirmado. Agora a execução do serviço pode começar.",
          tone: "emerald",
        }
      : {
          label: "Pagamento confirmado",
          title: `O prestador já pode iniciar "${readyToStartStep.title}"`,
          description:
            "Esta fase está liberada financeiramente e pronta para sair do papel.",
          tone: "emerald",
        };
  }

  if (payableSteps.some((step) => !isStepPaid(step))) {
    const nextPaymentLabel = paidSteps.length > 0 ? "o próximo grupo" : "o primeiro grupo";
    return currentUserType === "contratante"
      ? {
          label: "Sua vez agora",
          title: `Pague ${nextPaymentLabel} para seguir`,
          description:
            "Depois da assinatura, o contrato avança sempre pelo próximo grupo financeiro liberado.",
          tone: "orange",
        }
      : {
          label: "Aguardando pagamento",
          title: `Cliente ainda precisa pagar ${nextPaymentLabel}`,
          description:
            "Quando o pagamento for confirmado, a próxima etapa ficará liberada para execução.",
          tone: "slate",
        };
  }

  return {
    label: "Contrato em andamento",
    title: "O fluxo segue ativo",
    description:
      currentUserType === "prestador"
        ? "Acompanhe as etapas liberadas e marque cada entrega quando estiver concluída."
        : "Acompanhe o avanço do prestador e aprove as etapas quando receber as entregas.",
    tone: "slate",
  };
}
