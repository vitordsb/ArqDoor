
// src/hooks/use-contract.tsx
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
import { stampPdfWithName } from "@/lib/stampPdfWithName";
// --- Assinatura visual no PDF (carimbo com nome + data) ---

export function useContract(conversationId?: number) {
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const norm = (v?: string) => (v || "").toLowerCase();
  const truthy = (v: any) => v === true || v === 1 || v === "1" || v === "true";

  // normaliza diferenças de nome de chave vindas da API
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

  /** =================== ASSINATURA DO CONTRATO (etapa 1) =================== */
  async function signContract(ticketId: number, password: string) {
    try {
      const res = await apiRequest("PATCH", `/attchment/ticket/${ticketId}`, {
        signature: true,
        password,
      });
      if (!res.ok) throw new Error(await res.text());

      // garante step 0 concluído e ticket "em andamento"
      try {
        const steps = await getStepsForTicket(ticketId);
        if (steps.length > 0) {
          const step0 = steps[0] as any;
          if (norm(step0.status) !== "concluido" || !step0.confirm_contractor) {
            await updateStep(step0.id, {
              status: "Concluido",
              confirm_contractor: true,
            } as any);
          }
        }
        await updateTicketStatus(ticketId, "em andamento");
        console.log("Assinou e sincronizou step/ticket");
      } catch (e) {
        console.warn("Assinou, porém falhou ao sincronizar step/ticket:", e);
      }

      try {
        const pdf = await buscarPDF(ticketId)
        if (pdf?.blob) {
          const signedBlob = await stampPdfWithName(
            await pdf.blob.arrayBuffer(),
            user?.name || "Cliente",
            { role: "cliente", page: "last" }
          )
          await uploadPDF(ticketId, signedBlob)
          // mensagem de sistema (opcional)
          await sendSystemMessage(
            `🖊️ Contrato do Ticket #${ticketId} assinado por **${user?.name || "Cliente"}**.`,
            "text",
            { ticket_id: ticketId, action: "contract_stamped" }
          )
        }
      } catch (e) {
        console.warn("Falhou ao carimbar/reanexar contrato:", e)
      }
      console.log("Assinou com sucesso");
      queryClient.invalidateQueries({ queryKey: ["tickets", conversationId] });
      return true;
    } catch (err: any) {
      console.error("❌ Erro ao assinar contrato:", err);
      return false;
    }
  }

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

  /**
   * Auto-conclusão: se confirmContractor && confirmFreelancer forem true,
   * seta status = "Concluido".
   * Aceita tanto um objeto Step quanto o ID.
   */

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

      // Se vier só o id, tentamos descobrir o ticket percorrendo os tickets carregados
      let ticketId: number | undefined =
        Number(step?.ticket_id ?? step?.ticketId) || undefined;

      // Normaliza flags/status
      const sNorm = normalizeStep(step);
      const bothConfirmed =
        (truthy(sNorm.confirmContractor) || truthy(sNorm.confirm_contractor)) &&
        (truthy(sNorm.confirmFreelancer) || truthy(sNorm.confirm_freelancer));
      const isConcluded = norm(sNorm.status) === "concluido";

      // Se ambos confirmaram e ainda não está concluído, conclui a etapa
      if (bothConfirmed && !isConcluded) {
        await updateStep(sNorm.id, { status: "Concluido" } as any);
      }

      // --- Descobrir ticketId (se não veio no objeto) e checar se todas as etapas concluíram ---
      try {
        if (!ticketId) {
          // percorre tickets da conversa até achar a qual esse step pertence
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

        // atualiza caches da UI
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
  async function signStepContract(stepId: number, password: string) {
    try {
      const res = await apiRequest("PATCH", `/step/signature/${stepId}`, {
        signature: true,
        password,
      });
      if (!res.ok) throw new Error(await res.text());
      try { await maybeFinishStep(stepId); } catch { }
      await updateStep(stepId, { status: "Concluido" } as any);

      try {
        const meta = await getStepMeta(stepId);
        if (meta) {
          await sendSystemMessage(
            `✅ Cliente aceitou/assinou a etapa ${meta.index}: _${meta.title}_ (Ticket #${meta.ticketId}).`,
            "text",
            { ticket_id: meta.ticketId, step_id: stepId, action: "client_signed" }
          );
        }
      } catch { }

      try {
        // varremos tickets carregados e achamos o que contém o step
        for (const tk of tickets || []) {
          const sts = await getStepsForTicket(tk.id);
          if (sts.some(s => s.id === stepId)) {
            await checkAndConcludeTicket(tk.id);
            break;
          }
        }
      } catch { }
      toast({
        title: "Etapa assinada",
        description: "O cliente aprovou a etapa e a próxima foi liberada."
      });

      queryClient.invalidateQueries({ queryKey: ["tickets", conversationId] });
      return true;
    } catch (err: any) {
      console.error("❌ Erro ao assinar step:", err);
      toast({
        title: "Erro",
        description: err?.message || "Erro ao assinar etapa",
        variant: "destructive",
      });
      return false;
    }
  }
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
          });
          if (!sRes.ok) throw new Error(await sRes.text());
          const sJson = await sRes.json();
          createdSteps.push({
            id: sJson.step?.id || sJson.id,
            title: s.title,
            price: s.price,
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

  const buscarPDF = useCallback(async (ticketId: number) => {
    try {
      const listRes = await apiRequest("GET", `/attchment/ticket/${ticketId}`);
      if (!listRes.ok) throw new Error(await listRes.text());
      const listJson = await listRes.json();
      const attachments:
        | Array<{ id: number; ticket_id: number; pdf_path: string; date?: string }>
        = listJson?.attachments || listJson?.attchments || [];
      if (!attachments.length) throw new Error("Nenhum PDF anexado a este ticket.");

      const chosen = attachments
        .sort(
          (a, b) =>
            new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
        )[0];
      const pdfUrlAbs = chosen.pdf_path.startsWith("https")
        ? chosen.pdf_path
        : `${import.meta.env.VITE_API_BASE_URL}/${chosen.pdf_path.replace(/^\/+/, "")}`;

      const fileRes = await fetch(pdfUrlAbs, { method: "GET" });
      if (!fileRes.ok) throw new Error(await fileRes.text());
      const blob = await fileRes.blob();
      const blobUrl = URL.createObjectURL(blob);

      return { blob, blobUrl, filename: `contrato-ticket-${ticketId}.pdf` };
    } catch (err) {
      console.error("❌ Erro ao buscar PDF:", err);
      return null;
    }
  }, []);

  // --- Cliente aceita etapa usando assinatura formal ---
  const acceptStep = useCallback(
    async (stepId: number, password: string) => {
      const ok = await signStepContract(stepId, password);
      if (ok) {
        try { await maybeFinishStep(stepId); } catch { }
      }
      return ok;
    },
    [signStepContract, maybeFinishStep]
  );

  // --- Cliente recusa etapa ---
  const rejectStep = useCallback(
    async (stepId: number, ticketId: number, indexInTicket: number) => {
      try {
        // marca a etapa atual como recusada
        await updateStep(stepId, { status: "Recusado" } as any);

        // volta o ponteiro 1 etapa (ou reabre a própria etapa 2)
        const steps = await getStepsForTicket(ticketId);
        if (indexInTicket > 1) {
          const prev = steps[indexInTicket - 1];
          await updateStep(prev.id, {
            status: "Pendente",
            confirm_freelancer: false,
            confirm_contractor: false,
          } as any);
        } else if (indexInTicket === 1) {
          // etapa 2 vira pendente novamente
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

  /** =================== FSM: índice corrente =================== */
  const computeCurrentIndex = useCallback((steps: Step[]) => {
    const refused = steps.findIndex((s: any) => norm(s.status) === "recusado");
    if (refused > 0) return refused - 1;
    const firstNotDone = steps.findIndex((s: any) => norm(s.status) !== "concluido");
    return firstNotDone === -1 ? Math.max(steps.length - 1, 0) : firstNotDone;
  }, []);

  /** =================== HELPERS =================== */
  const getActiveTicket = useCallback(() => {
    if (!conversationId || !tickets?.length) return null;
    return tickets.find((tk) => tk.conversation_id === conversationId) || null;
    // se tiver múltiplos tickets na mesma conversa, ajuste conforme sua regra
  }, [conversationId, tickets]);

  return {
    tickets,
    loadingTickets,

    // steps
    getStepsForTicket,
    updateStep,
    deleteStep,
    markStepCompleted,
    confirmFreelancerStep,
    confirmStepCompletion, // alias
    signStepContract,      // legado

    acceptStep,
    rejectStep,

    // proposta / ticket
    createProposal,
    updateTicketStatus,
    deleteTicket,

    // assinatura e pdf
    signContract,
    uploadPDF,
    buscarPDF,

    // utils
    getActiveTicket,
    refetchTickets,
    computeCurrentIndex,
  };
}

export default useContract;

