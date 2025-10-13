import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Ticket,
  Step,
  CreateStepRequest,
  UpdateStepRequest,
  Message,
} from "@/lib/Interfaces";

export function useContract(conversationId?: number) {
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const norm = (v?: string) => (v || "").toLowerCase();
  const truthy = (v: any) => v === true || v === 1 || v === "1" || v === "true";

  const normalizeStep = (s: any): Step & {
    confirm_freelancer?: boolean;
    confirmFreelancer?: boolean;
    confirm_contractor?: boolean;
    confirmContractor?: boolean;
    indexInTicket?: number;
  } => {
    const cf = truthy(
      s?.confirm_freelancer ??
      s?.confirmFreelancer ??
      s?.freelancer_confirm ??
      s?.confirmed_by_freelancer
    );
    const cc = truthy(
      s?.confirm_contractor ??
      s?.confirmContractor ??
      s?.contractor_confirm ??
      s?.confirmed_by_contractor
    );
    return {
      ...s,
      confirm_freelancer: cf,
      confirmFreelancer: cf,
      confirm_contractor: cc,
      confirmContractor: cc,
    };
  };


  /** =================== TICKETS =================== */
  const {
    data: tickets = [],
    isLoading: loadingTickets,
    refetch: refetchTickets,
  } = useQuery<Ticket[]>({
    queryKey: ["tickets", conversationId],
    enabled: !!conversationId && !!isLoggedIn,
    staleTime: 30_000,
    queryFn: async () => {
      if (!conversationId) return [];
      const res = await apiRequest(
        "GET",
        `/ticket/conversation/${conversationId}`
      );
      if (!res.ok) throw new Error(`Erro ao buscar tickets: ${res.status}`);
      const json = await res.json();
      return json.tickets || [];
    },
  });

  /** =================== MENSAGEM DE SISTEMA =================== */
  const sendSystemMessage = useCallback(
    async (
      content: string,
      type: Message["type"] = "text",
      proposal_data?: any
    ) => {
      if (!conversationId) return;
      try {
        const res = await apiRequest("POST", "/message", {
          conversation_id: conversationId,
          content,
          type,
          proposal_data,
        });
        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
        } else {
          console.error("❌ Erro ao enviar mensagem de sistema:", await res.text());
        }
      } catch (e) {
        console.error("❌ Erro de rede ao enviar mensagem:", e);
      }
    },
    [conversationId, queryClient]
  );

  /** =================== STEPS =================== */
  const getStepsForTicket = useCallback(async (ticketId: number): Promise<Step[]> => {
    const res = await apiRequest("GET", `/step/${ticketId}`);
    if (!res.ok) throw new Error(`Erro ao buscar steps: ${res.status}`);
    const json = await res.json();
    const steps: Step[] = (json.steps || []).map(normalizeStep);
    console.log("Steps do ticket", steps)
    return steps.map((s: any, idx: number) => ({ ...s, indexInTicket: idx }));
  }, []);

  const updateStep = useCallback(
    async (stepId: number, updateData: UpdateStepRequest) => {
      try {
        const res = await apiRequest("PATCH", `/step/${stepId}`, updateData);
        const data = await res.json();
        console.log("Atualização de step geral pelo PATCH", data)
        queryClient.invalidateQueries({ queryKey: ["tickets", conversationId] });
        return true;
      } catch (err: any) {
        console.error("❌ Erro ao atualizar step:", err);
        return false;
      }
    },
    [conversationId, queryClient]
  );

  const deleteStep = useCallback(
    async (stepId: number) => {
      try {
        const res = await apiRequest("DELETE", `/step/${stepId}`);
        const data = await res.json();
        console.log("Step removido pelo DELETE", data)
        queryClient.invalidateQueries({ queryKey: ["tickets", conversationId] });
        return true;
      } catch (err: any) {
        console.error("❌ Erro ao deletar step:", err);
        return false;
      }
    },
    [conversationId, queryClient]
  );

  /** =================== TICKET: STATUS =================== */
  const updateTicketStatus = useCallback(
    async (
      ticketId: number,
      status: "pendente" | "em andamento" | "concluída" | "cancelada"
    ) => {
      try {
        const res = await apiRequest("PATCH", `/ticket/${ticketId}`, { status });
        const data = await res.json();
        console.log("Atualização de ticket geral pelo PATCH", data)
        queryClient.invalidateQueries({ queryKey: ["tickets", conversationId] });
        queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
        return true;
      } catch (err: any) {
        console.error("❌ Erro ao atualizar status do ticket:", err);
        toast({
          title: "Erro",
          description: err?.message || "Erro ao atualizar proposta",
          variant: "destructive",
        });
        return false;
      }
    },
    [conversationId, queryClient, toast]
  );

  const maybeFinishStep = useCallback(
    async (stepOrId: number | any) => {
      let step = stepOrId as any;
      let ticketId: number | undefined =
        Number(step?.ticket_id ?? step?.ticketId) || undefined;
      const sNorm = normalizeStep(step);
      const bothConfirmed =
        (truthy(sNorm.confirmContractor) || truthy(sNorm.confirm_contractor)) &&
        (truthy(sNorm.confirmFreelancer) || truthy(sNorm.confirm_freelancer));
      const isConcluded = norm(sNorm.status) === "concluido";
      if (bothConfirmed && !isConcluded) {
        await updateStep(sNorm.id, { status: "Concluido" } as any);
      }
      try {
        if (!ticketId) {
          for (const tk of tickets || []) {
            const sts = await getStepsForTicket(tk.id);
            if (sts.some((st: any) => st.id === sNorm.id)) {
              ticketId = tk.id;
              break;
            }
          }
        }
        if (ticketId) {
          const allSteps = await getStepsForTicket(ticketId);
          const allDone = allSteps.every((st: any) => norm(st.status) === "concluido");
          if (allDone) {
            await updateTicketStatus(ticketId, "concluída");
          }
        }
        await sendSystemMessage(
          `🎉 Ticket #${ticketId} **concluído**! Todas as etapas foram finalizadas.`,
          "text",
          { ticket_id: ticketId, action: "ticket_concluded" }
        );
        queryClient.invalidateQueries({ queryKey: ["tickets", conversationId] });
        return bothConfirmed && !isConcluded; // true se acabamos de concluir a etapa
      } catch (e) {
        console.warn("Falha ao avaliar conclusão de ticket:", e);
        return false;
      }
    },
    [tickets, getStepsForTicket, updateStep, updateTicketStatus, queryClient, conversationId]
  );

  const deleteTicket = useCallback(
    async (ticketId: number) => {
      try {
        const res = await apiRequest("DELETE", `/ticket/${ticketId}`);
        const data = await res.json();
        console.log("Ticket removido pelo DELETE", data)
        queryClient.invalidateQueries({ queryKey: ["tickets", conversationId] });
        return true;
      } catch (err: any) {
        console.error("❌ Erro ao deletar ticket:", err);
        return false;
      }
    },
    [conversationId, queryClient]
  );

  /** =================== FLUXOS DE ETAPAS =================== */
  // prestador marca etapa como concluída (libera aceite do cliente)
  const markStepCompleted = useCallback(
    async (stepId: number, password: string, ticketId?: number) => {
      try {
        const res = await apiRequest("PATCH", `/step/confirmfreelancer/${stepId}`, {
          confirm_freelancer: true,
          password,
        });
        if (!res.ok) throw new Error(await res.text());

        // tenta encerrar automaticamente se o cliente já confirmou
        try { await maybeFinishStep(stepId); } catch { }

        try {
          const meta = await getStepMeta(stepId, ticketId);
          if (meta) {
            await sendSystemMessage(
              `🛠️ Prestador marcou **concluída** a etapa ${meta.index}: _${meta.title}_ (Ticket #${meta.ticketId}).`,
              "text",
              { ticket_id: meta.ticketId, step_id: stepId, action: "freelancer_concluded" }
            );
          }
        } catch { }

        if (ticketId) {
          await checkAndConcludeTicket(ticketId);
        }
        toast({ title: "Etapa marcada como concluída", description: "Aguardando aprovação do cliente." });
        queryClient.invalidateQueries({ queryKey: ["tickets", conversationId] });
        return true;
      } catch (err: any) {
        console.error("❌ Erro ao marcar etapa como concluída:", err);
        toast({
          title: "Erro",
          description: err?.message || "Erro ao marcar etapa como concluída",
          variant: "destructive",
        });
        return false;
      }
    },
    [conversationId, queryClient, toast, maybeFinishStep]
  );

  // cliente aceita etapa (rota que confirma o lado do cliente)
  async function confirmFreelancerStep(stepId: number, password: string) {
    try {
      const res = await apiRequest("PATCH", `/step/confirmfreelancer/${stepId}`, {
        confirmFreelancer: true,
        password,
      });
      if (!res.ok) throw new Error(await res.text());

      // tenta encerrar automaticamente se o prestador já confirmou
      try { await maybeFinishStep(stepId); } catch { }

      try { await maybeFinishStep(stepId); } catch { }
      try {
        const meta = await getStepMeta(stepId);
        if (meta) {
          await sendSystemMessage(
            `✅ Cliente aceitou a etapa ${meta.index}: _${meta.title}_ (Ticket #${meta.ticketId}).`,
            "text",
            { ticket_id: meta.ticketId, step_id: stepId, action: "client_accepted" }
          );
        }
      } catch { }

      toast({ title: "Etapa aceita", description: "A próxima etapa foi liberada." });
      queryClient.invalidateQueries({ queryKey: ["tickets", conversationId] });
      return true;
    } catch (err: any) {
      console.error("❌ Erro ao aceitar etapa:", err);
      toast({
        title: "Erro",
        description: err?.message || "Erro ao aceitar a etapa",
        variant: "destructive",
      });
      return false;
    }
  }

  const confirmStepCompletion = confirmFreelancerStep; // alias compat

  // cliente assina/aceita etapa formalmente (usa /step/signature/{id})
  const preConfirmFirstStepFreelancer = async (stepId: number) => {
    try {
      const setPassword = window.prompt("Por favor, digite a senha para confirmar o contrato");
      const res = await apiRequest("PATCH", `/step/confirmfreelancer/${stepId}`, {
        confirm_freelancer: true,
        password: setPassword,
      });
      if (res.ok) return true;
      return true;
    } catch (e) {
      console.warn("Não consegui pré-confirmar o contrato pelo freelancer:", e);
      return false;
    }
  }
  // ⬇️ cole perto dos outros useCallback helpers
  const checkAndConcludeTicket = useCallback(
    async (ticketId: number) => {
      try {
        const steps = await getStepsForTicket(ticketId);
        const allDone = steps.every(s => (String(s.status || '').toLowerCase() === 'concluido'));
        if (allDone) {
          await updateTicketStatus(ticketId, 'concluída');
        }
        // manter UI fresca
        queryClient.invalidateQueries({ queryKey: ['tickets', conversationId] });
      } catch (e) {
        console.warn('checkAndConcludeTicket falhou:', e);
      }
    },
    [getStepsForTicket, updateTicketStatus, queryClient, conversationId]
  );

  /** =================== PROPOSTA (createProposal) =================== */
  const createProposal = useCallback(
    async (
      steps: Omit<CreateStepRequest, "ticket_id">[],
      contractFile?: File | Blob
    ) => {
      if (!conversationId) return false;
      if (!user || user.type !== "prestador") return false;

      const validSteps = steps.filter((s) => s.title?.trim() && s.price > 0);
      if (validSteps.length < 1) return false

      const SIGN_STEP: Omit<CreateStepRequest, "ticket_id"> = {
        title: "Assinatura do contrato (PDF)",
        price: 1,
      };
      const stepsToCreate = [SIGN_STEP, ...validSteps];
      const totalPrice = validSteps.reduce((acc, s) => acc + s.price, 0);

      try {
        // cria ticket
        const tRes = await apiRequest("POST", "/ticket", {
          conversation_id: conversationId,
        });
        if (!tRes.ok) throw new Error(await tRes.text());
        const tJson = await tRes.json();
        const ticketId: number = tJson.ticketService?.id || tJson.ticket?.id;
        if (!ticketId) throw new Error("ID do ticket não retornado pela API");

        // cria steps
        const createdSteps: any[] = [];
        for (const s of stepsToCreate) {
          const sRes = await apiRequest("POST", "/step", {
            ticket_id: ticketId,
            title: s.title,
            price: s.price,
            start_date: (s as any).startDate ?? null,
            end_date: (s as any).endDate ?? null,
          });
          if (!sRes.ok) throw new Error(await sRes.text());
          const sJson = await sRes.json();
          createdSteps.push({
            id: sJson.step?.id || sJson.id,
            title: s.title,
            price: s.price,
            start_date: (s as any).startDate ?? null,
            end_date: (s as any).endDate ?? null,
          });
        }
        if (createdSteps[0]?.id) {
          await preConfirmFirstStepFreelancer(createdSteps[0].id);
        }
        // anexa contrato (PDF) se houver
        if (contractFile) await uploadPDF(ticketId, contractFile);

        // mensagem de sistema
        await sendSystemMessage(
          `📋 Nova proposta enviada! Ticket #${ticketId} - Etapas: ${stepsToCreate.length} - Total: R$ ${totalPrice.toFixed(2)}`,
          "proposal",
          { ticket_id: ticketId, steps: createdSteps, total: totalPrice, status: "pendente" }
        );

        queryClient.invalidateQueries({ queryKey: ["tickets", conversationId] });
        toast({
          title: "Proposta enviada",
          description: "Etapa 1 (assinatura) foi adicionada automaticamente.",
        });
        return true;
      } catch (err: any) {
        console.error("❌ Erro ao criar proposta:", err);
        toast({
          title: "Erro",
          description: err?.message || "Erro ao criar proposta",
          variant: "destructive",
        });
        return false;
      }
    },
    [conversationId, user, queryClient, toast, sendSystemMessage]
  );

  /** =================== PDF/CONTRATO =================== */
  const uploadPDF = useCallback(
    async (ticketId: number, file: File | Blob) => {
      try {
        const fd = new FormData();
        fd.append("file", file, (file as File).name || `ticket-${ticketId}.pdf`);
        const res = await apiRequest("POST", `/upload/pdf/${ticketId}`, fd);
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        queryClient.invalidateQueries({ queryKey: ["tickets", conversationId] });
        toast({ title: "Contrato enviado", description: "Contrato PDF enviado com sucesso!" });
        return json;
      } catch (err: any) {
        console.error("❌ Erro no upload do PDF:", err);
        toast({
          title: "Erro no upload",
          description: err?.message || "Erro ao enviar contrato PDF",
          variant: "destructive",
        });
        return null;
      }
    },
    [conversationId, queryClient, toast]
  );

  // --- Cliente recusa etapa ---
  const rejectStep = useCallback(
    async (stepId: number, ticketId: number, indexInTicket: number) => {
      try {
        await updateStep(stepId, { status: "Recusado" } as any);
        const steps = await getStepsForTicket(ticketId);
        if (indexInTicket > 1) {
          const prev = steps[indexInTicket - 1];
          await updateStep(prev.id, {
            status: "Pendente",
            confirm_freelancer: false,
            confirm_contractor: false,
          } as any);
        } else if (indexInTicket === 1) {
          await updateStep(stepId, {
            status: "Pendente",
            confirm_freelancer: false,
            confirm_contractor: false,
          } as any);
        }

        queryClient.invalidateQueries({ queryKey: ["tickets", conversationId] });
        return true;
      } catch (err: any) {
        console.error("❌ Erro ao recusar etapa:", err);
        toast({
          title: "Erro",
          description: err?.message || "Erro ao recusar a etapa",
          variant: "destructive",
        });
        return false;
      }
    },
    [conversationId, getStepsForTicket, updateStep, queryClient, toast]
  );

  const getStepMeta = useCallback(
    async (stepId: number, hintedTicketId?: number) => {
      // tenta pelo ticket informado (mais barato)
      if (hintedTicketId) {
        const steps = await getStepsForTicket(hintedTicketId);
        const idx = steps.findIndex(s => s.id === stepId);
        if (idx >= 0) {
          const s = steps[idx];
          return {
            ticketId: hintedTicketId,
            index: idx + 1, // 1-based
            title: s.title,
            price: s.price,
          };
        }
      }
      // fallback: varre tickets carregados
      for (const tk of tickets || []) {
        const steps = await getStepsForTicket(tk.id);
        const idx = steps.findIndex(s => s.id === stepId);
        if (idx >= 0) {
          const s = steps[idx];
          return {
            ticketId: tk.id,
            index: idx + 1,
            title: s.title,
            price: s.price,
          };
        }
      }
      return null;
    },
    [tickets, getStepsForTicket]
  );

  const computeCurrentIndex = useCallback((steps: Step[]) => {
    const refused = steps.findIndex((s: any) => norm(s.status) === "recusado");
    if (refused > 0) return refused - 1;
    const firstNotDone = steps.findIndex((s: any) => norm(s.status) !== "concluido");
    return firstNotDone === -1 ? Math.max(steps.length - 1, 0) : firstNotDone;
  }, []);

  const getActiveTicket = useCallback(() => {
    if (!conversationId || !tickets?.length) return null;
    return tickets.find((tk) => tk.conversation_id === conversationId) || null;
  }, [conversationId, tickets]);

  return {
    tickets,
    loadingTickets,
    getStepsForTicket,
    updateStep,
    deleteStep,
    markStepCompleted,
    confirmFreelancerStep,
    confirmStepCompletion, // alias
    rejectStep,

    createProposal,
    updateTicketStatus,
    deleteTicket,

    // utils
    getActiveTicket,
    refetchTickets,
    computeCurrentIndex,
  };
}

export default useContract;

