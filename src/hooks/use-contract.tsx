import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SIGNATURE_STEP_TITLE } from "@/constants/contracts";
import {
  Ticket,
  Step,
  CreateStepRequest,
  UpdateStepRequest,
  Message,
} from "@/lib/Interfaces";

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

export function useContract(conversationId?: number) {
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isVisible, setIsVisible] = useState<boolean>(!document.hidden);

  useEffect(() => {
    const onVisibility = () => setIsVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  /** =================== TICKETS =================== */
  const {
    data: tickets = [],
    isLoading: loadingTickets,
    refetch: refetchTickets,
  } = useQuery<Ticket[]>({
    queryKey: ["tickets", conversationId],
    enabled: !!conversationId && !!isLoggedIn,
    staleTime: 5_000,
    refetchInterval: (data?: Ticket[]) => {
      const list = Array.isArray(data) ? data : [];
      const critical = list.some((t) =>
        ["pendente", "em andamento"].includes((t.status || "").toLowerCase())
      );
      if (!isVisible) return 15_000;
      return critical ? 3_000 : 30_000;
    },
    queryFn: async () => {
      if (!conversationId) return [];
      const res = await apiRequest("GET", `/ticket/conversation/${conversationId}`);
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

    if (!ticketId) {
      return [];
    }
    try {
      const res = await apiRequest("GET", `/tickets/${ticketId}/steps`);
      if (res.status === 404) return []; 
      if (!res.ok) throw new Error(`Erro ao buscar steps: ${res.status}`);
      const json = await res.json();
      
      // Tenta encontrar o array de steps em várias estruturas possíveis
      let rawSteps = json.steps || json.data || (Array.isArray(json) ? json : []);
      
      // Se rawSteps for um objeto (e não array), tenta buscar dentro dele (ex: { data: { steps: [...] } })
      if (!Array.isArray(rawSteps) && rawSteps && typeof rawSteps === 'object') {
         if (Array.isArray(rawSteps.steps)) rawSteps = rawSteps.steps;
         else if (Array.isArray(rawSteps.data)) rawSteps = rawSteps.data;
      }

      if (!Array.isArray(rawSteps)) {
         console.warn(`[getStepsForTicket] Formato inesperado para ticket ${ticketId}:`, json);
         return [];
      }

      const normalized: Step[] = rawSteps.map(normalizeStep);
      return normalized.map((s: any, idx: number) => ({ ...s, indexInTicket: idx }));
    } catch (e) {
      console.error("❌ Erro ao buscar steps:", e);
      return [];
    }
  }, []);

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
      const isConcluded = norm(sNorm.status) === "Concluido";
      const isFree = Number(sNorm.price || 0) <= 0;
      if (bothConfirmed && !isConcluded && isFree) {
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
          const allDone = allSteps.every((st: any) => norm(st.status) === "Concluido");
          if (allDone) {
            await updateTicketStatus(ticketId, "concluída");
          }
        }
        await sendSystemMessage(
          `🎉 Ticket #${ticketId} concluído! Todas as etapas foram finalizadas.`,
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
    [tickets, getStepsForTicket, updateStep, updateTicketStatus, queryClient, conversationId, sendSystemMessage]
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
  const checkAndConcludeTicket = useCallback(
    async (ticketId: number) => {
      try {
        const steps = await getStepsForTicket(ticketId);
        const allDone = steps.every(s => s.status === 'Concluido');
        if (allDone) {
          await updateTicketStatus(ticketId, 'concluída');
        }
        queryClient.invalidateQueries({ queryKey: ['tickets', conversationId] });
      } catch (e) {
        console.warn('checkAndConcludeTicket falhou:', e);
      }
    },
    [getStepsForTicket, updateTicketStatus, queryClient, conversationId]
  );

  // prestador marca etapa como concluída (libera aceite do cliente)
  const markStepCompleted = useCallback(
    async (stepId: number, password: string, ticketId?: number) => {
      try {
        const res = await apiRequest("PATCH", `/step/confirmfreelancer/${stepId}`, {
          confirm_freelancer: true,
          confirmFreelancer: true,
          password,
        });
        if (!res.ok) throw new Error(await res.text());

        // tenta encerrar automaticamente se o cliente já confirmou
        try { await maybeFinishStep(stepId); } catch { }

        try {
          const meta = await getStepMeta(stepId, ticketId);
          if (meta) {
            await sendSystemMessage(
              `🛠️ Prestador marcou concluída a etapa ${meta.index}: _${meta.title}_ (Ticket #${meta.ticketId}).`,
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
        let description = err?.message || "Erro ao marcar etapa como concluída";
        let variant: "destructive" | "warning" | "default" = "destructive";
        try {
          const parsed = JSON.parse(err?.message || "{}");
          if (parsed?.message) description = parsed.message;
        } catch { /* keep original */ }
        if (description.toLowerCase().includes("pagamento pendente")) {
          description = "Cliente não efetuou o pagamento da etapa anterior. Entre em contato com o suporte.";
          variant = "warning";
        }
        toast({ title: "Erro", description, variant });
        return false;
      }
    },
    [conversationId, queryClient, toast, maybeFinishStep, getStepMeta, sendSystemMessage, checkAndConcludeTicket]
  );

  // cliente aceita etapa (rota que confirma o lado do cliente)
  const confirmFreelancerStep = useCallback(
    async (stepId: number, password: string) => {
      try {
        const res = await apiRequest("PATCH", `/step/confirmfreelancer/${stepId}`, {
          confirmFreelancer: true,
          confirm_freelancer: true,
          password,
        });
        if (!res.ok) throw new Error(await res.text());

        // tenta encerrar automaticamente se o prestador já confirmou
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
    },
    [conversationId, queryClient, toast, maybeFinishStep, getStepMeta, sendSystemMessage]
  );

  const confirmStepCompletion = confirmFreelancerStep; // alias compat

  // cliente assina/aceita etapa formalmente (usa /step/signature/{id})
  const preConfirmFirstStepFreelancer = useCallback(
    async (stepId: number, password: string) => {
      const sanitizedPassword = (password || "").trim();
      if (!sanitizedPassword) {
        console.warn("Senha não fornecida para pré-confirmar a primeira etapa.");
        return { ok: false, message: "Senha não informada." };
      }
      try {
        const res = await apiRequest(
          "PATCH",
          `/step/confirmfreelancer/${stepId}`,
          {
            confirm_freelancer: true,
            confirmFreelancer: true,
            password: sanitizedPassword,
          }
        );
        if (!res.ok) {
          const msg = await res.text();
          console.warn("Falha ao pré-confirmar etapa de assinatura:", msg);
          return { ok: false, message: msg || "Falha ao confirmar etapa" };
        }
        return { ok: true };
      } catch (e) {
        console.warn("Não consegui pré-confirmar o contrato pelo freelancer:", e);
        return { ok: false, message: (e as any)?.message || "Erro inesperado ao confirmar etapa" };
      }
    },
    []
  );

  /** =================== PROPOSTA (createProposal) =================== */

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

  const createProposal = useCallback(
    async (
      steps: Omit<CreateStepRequest, "ticket_id">[],
      contractFile?: File | Blob,
      signaturePassword?: string
    ) => {
      if (!conversationId) return false;
      if (!user || user.type !== "prestador") return false;
      if (!contractFile) {
        toast({
          title: "Contrato obrigatório",
          description: "Anexe o PDF do contrato antes de enviar a proposta.",
          variant: "warning",
        });
        return false;
      }
      const sanitizedPassword = (signaturePassword || "").trim();
      if (!sanitizedPassword) {
        toast({
          title: "Senha obrigatória",
          description: "Informe sua senha para confirmar a etapa de assinatura.",
          variant: "warning",
        });
        return false;
      }
      const minPrice = 5;
      const validSteps = steps.filter((s) => s.title?.trim() && s.price >= minPrice);
      if (validSteps.length < 1) {
        toast({
          title: "Erro na Proposta",
          description: `Adicione pelo menos uma etapa com título e preço mínimo de R$ ${minPrice.toFixed(2)}.`,
          variant: "warning",
        });
        return false;
      }

      const toIsoDate = (d: Date) => {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
      const extractIsoDate = (value: string) => value.split("T")[0] || value;

      // usa meio-dia para evitar os saltos de data causados por fusos ao usar toISOString()
      const getFutureDateIso = (daysToAdd: number): string => {
        const date = new Date();
        date.setHours(12, 0, 0, 0);
        date.setDate(date.getDate() + daysToAdd);
        return toIsoDate(date);
      };

      const addDaysToIsoDate = (isoDate: string, days: number): string => {
        const date = new Date(extractIsoDate(isoDate) + "T12:00:00");
        date.setDate(date.getDate() + days);
        return toIsoDate(date);
      };

      const parseBrToIso = (brDate: string): string | null => {
        if (!brDate || !/^\d{2}\/\d{2}\/\d{4}$/.test(brDate)) return null;
        const [d, m, y] = brDate.split('/');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      };

      const normalizeDateInput = (value?: string | null): string | null => {
        if (!value || typeof value !== 'string') return null;
        const trimmed = value.trim();
        if (!trimmed) return null;
        const isoPart = extractIsoDate(trimmed);
        if (/^\d{4}-\d{2}-\d{2}$/.test(isoPart)) return isoPart;
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) return parseBrToIso(trimmed);
        return null;
      };

      const formatIsoToBr = (iso: string) => {
        const [y, m, d] = iso.split('-');
        return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
      };
      const toDateAtNoon = (iso?: string | null): Date | null => {
        if (!iso) return null;
        const datePart = extractIsoDate(iso);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;
        return new Date(`${datePart}T12:00:00`);
      };

      const tomorrowDate = getFutureDateIso(1);
      const dayAfterTomorrowDate = getFutureDateIso(2);
      const SIGN_STEP: Omit<CreateStepRequest, "ticket_id"> & { start_date: string; end_date: string } = {
        title: SIGNATURE_STEP_TITLE,
        price: 0,
        start_date: tomorrowDate,
        end_date: dayAfterTomorrowDate,
      };
      const stepsToCreate = [SIGN_STEP, ...validSteps] as (Omit<CreateStepRequest, "ticket_id"> & { start_date?: string | null, endDate?: string | null })[];
      const totalPrice = stepsToCreate.reduce((acc, s, index) => {
        if (index === 0) return acc; // ignora a etapa de assinatura gratuita
        return acc + (s.price || 0);
      }, 0);

      let createdTicketId: number | null = null;
      const cleanupAndThrow = async (message: string) => {
        if (createdTicketId) {
          try { await deleteTicket(createdTicketId); } catch { /* ignore */ }
          createdTicketId = null;
        }
        throw new Error(message);
      };
      try {
        const tRes = await apiRequest("POST", "/ticket", { conversation_id: conversationId });
        if (!tRes.ok) throw new Error(await tRes.text());
        const tJson = await tRes.json();
        const ticketId: number = tJson.ticketService?.id || tJson.ticket?.id;
        createdTicketId = ticketId;
        if (!ticketId) throw new Error("ID do ticket não retornado pela API");

        const createdSteps: any[] = [];
        let previousEndIso: string | null = null;
        for (let index = 0; index < stepsToCreate.length; index++) {
          const s = stepsToCreate[index];
          const isSignatureStep = index === 0;

          let startIso = normalizeDateInput((s as any).startDate ?? s.start_date ?? null);
          let endIso = normalizeDateInput((s as any).endDate ?? (s as any).end_date ?? null);

          if (isSignatureStep) {
            startIso = SIGN_STEP.start_date;
            endIso = SIGN_STEP.end_date;
          } else {
            const minimumStartIso = previousEndIso || getFutureDateIso(1);
            if (!startIso) {
              startIso = minimumStartIso;
            } else if (
              previousEndIso &&
              new Date(startIso) < new Date(previousEndIso)
            ) {
              toast({
                title: "Sequência de datas inválida",
                description: `A etapa "${s.title}" deve iniciar a partir de ${formatIsoToBr(previousEndIso)}.`,
                variant: "warning",
              });
              await cleanupAndThrow(`Sequência de datas inválida na etapa "${s.title}".`);
            }

            if (!endIso) {
              endIso = addDaysToIsoDate(startIso, 1);
            }
          }

          if (!startIso) {
            startIso = getFutureDateIso(1);
          }
          if (!endIso) {
            endIso = addDaysToIsoDate(startIso, 1);
          }

          let startDateAtNoon = toDateAtNoon(startIso);
          let endDateAtNoon = toDateAtNoon(endIso);

          if (!startDateAtNoon) {
            toast({
              title: "Data de Início Inválida",
              description: `Não foi possível interpretar a data de início da etapa "${s.title}".`,
              variant: "warning",
            });
            await cleanupAndThrow(`Data de início inválida na etapa "${s.title}".`);
          }

          const todayAtStart = new Date();
          todayAtStart.setHours(0, 0, 0, 0);
          if (startDateAtNoon < todayAtStart) {
            toast({
              title: "Data de Início Inválida",
              description: `A data de início da etapa "${s.title}" (${formatIsoToBr(startIso)}) não pode ser anterior a hoje.`,
              variant: "warning",
            });
            await cleanupAndThrow(`Data de início anterior a hoje na etapa "${s.title}".`);
          }

          if (!endDateAtNoon) {
            endIso = addDaysToIsoDate(startIso, 1);
            endDateAtNoon = toDateAtNoon(endIso);
          }

          if (endDateAtNoon && endDateAtNoon < startDateAtNoon) {
            toast({
              title: "Datas inválidas",
              description: `A data final da etapa "${s.title}" não pode ser anterior à data inicial.`,
              variant: "warning",
            });
            await cleanupAndThrow(`Data final anterior à inicial na etapa "${s.title}".`);
          }

          // Cria o payload - agora com start_date e end_date sempre presentes
          const stepPayload: any = {
            ticket_id: ticketId,
            title: s.title,
            price: s.price || 0,
            start_date: startDateAtNoon.toISOString(),
            end_date: (endDateAtNoon ?? startDateAtNoon).toISOString(),
          };

          const sRes = await apiRequest("POST", "/step", stepPayload);
          if (!sRes.ok) {
            const errorBody = await sRes.text();
            console.error("Erro ao criar step:", errorBody, "Payload:", stepPayload);
            throw new Error(`Erro ao criar etapa "${s.title}": ${errorBody || sRes.statusText}`);
          }
          const sJson = await sRes.json();
          createdSteps.push({
            id: sJson.step?.id || sJson.id,
            title: s.title,
            price: s.price || 0,
            start_date: startDateAtNoon.toISOString(),
            end_date: (endDateAtNoon ?? startDateAtNoon).toISOString(),
          });
          previousEndIso = endIso;
        }
        if (createdSteps[0]?.id) {
          const confirmed = await preConfirmFirstStepFreelancer(
            createdSteps[0].id,
            sanitizedPassword
          );
          if (!confirmed) {
            console.warn("Não foi possível confirmar a etapa de assinatura automaticamente, seguindo fluxo mesmo assim.");
          }
        }
        const uploaded = await uploadPDF(ticketId, contractFile);
        if (!uploaded || (uploaded as any)?.success === false) {
          await deleteTicket(ticketId);
          createdTicketId = null;
          throw new Error("Falha ao enviar o contrato PDF. A proposta foi cancelada.");
        }
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
          title: "Erro ao criar proposta",
          description: err?.message || "Verifique os dados e tente novamente.",
          variant: "destructive",
        });
        if (createdTicketId) {
          // Tenta limpar ticket gerado se falhar após criação (ex.: upload não enviado)
          try { await deleteTicket(createdTicketId); } catch (cleanupErr) {
            console.warn("Falha ao remover ticket após erro:", cleanupErr);
          }
        }
        return false;
      }
    },
    [conversationId, user, queryClient, toast, sendSystemMessage, uploadPDF, preConfirmFirstStepFreelancer, deleteTicket] // Adicionei as dependências que faltavam
  );

  /** =================== PDF/CONTRATO =================== */

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
    sendSystemMessage,

    // utils
    getActiveTicket,
    refetchTickets,
    computeCurrentIndex,
  };
}

export default useContract;
