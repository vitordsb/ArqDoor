import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useLocation, useParams } from 'wouter';
import { useMessaging } from '@/hooks/use-messaging';
import { useContract } from '@/hooks/use-contract';
import { useSignature } from '@/hooks/use-signature';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { SIGNATURE_STEP_TITLE } from "@/constants/contracts";
import { Button } from '@/components/ui/button';
import MessagesLayout from '@/components/layouts/MessagesLayout';
import { EmptyConversationState } from "@/features/messages/components/EmptyConversationState";
import { apiRequest, API_BASE_URL } from '@/lib/queryClient';
import type { Step } from '@/lib/Interfaces';
import { ConversationsSidebar } from '@/features/messages/components/ConversationsSidebar';
import { ConversationHeader } from '@/features/messages/components/ConversationHeader';
import { ChatPanel } from '@/features/messages/components/ChatPanel';
import { ContractsPanel } from '@/features/messages/components/ContractsPanel';
import { ProposalCard } from '@/features/messages/components/ProposalCard';
import { sortTicketsDesc } from '@/features/messages/utils';
import { PdfViewerDialog } from '@/components/modals/PdfViewerDialog';
import { ProposalDetailsDialog } from '@/components/modals/ProposalDetailsDialog';
import { GroupedPaymentDialog } from '@/components/modals/GroupedPaymentDialog';
import { SignatureDialog } from '@/components/modals/SignatureDialog';
import { NewProposalDialog } from '@/components/modals/NewProposalDialog';
import { OlderContractsDialog } from '@/components/modals/OlderContractsDialog';
import { StepPaymentDialog } from "@/features/messages/components/StepPaymentDialog";
import { usePdfViewer } from "@/features/messages/hooks/usePdfViewer";
import { useProposalComposer } from "@/features/messages/hooks/useProposalComposer";
import type {
  GroupedPaymentDialogState,
  PaymentDialogState,
  PaymentMethod,
  ProposalStep,
  ProposalStepPayload,
} from "@/features/messages/types";

type SignatureDialogOverrides = {
  title?: string;
  description?: string;
  confirmLabel?: string;
  agreeLabel?: string;
  passwordPlaceholder?: string;
  requireAck?: boolean;
};

type SignatureFlow =
  | ({ type: 'contract'; ticket: any } & SignatureDialogOverrides)
  | ({ type: 'step-complete'; stepId: number; ticketId: number } & SignatureDialogOverrides)
  | ({
      type: 'step-accept';
      step: any;
      paymentPreference?: 'per_step' | 'at_end' | 'custom' | null;
    } & SignatureDialogOverrides)
  | ({ type: 'proposal-first-step' } & SignatureDialogOverrides);

const buildImageUrl = (path?: string | null) => {
  if (!path) return "";
  const normalizedPath = path.replace(/\\/g, "/");
  return normalizedPath.startsWith("http")
    ? normalizedPath
    : `${API_BASE_URL}/${normalizedPath.replace(/^\/+/, "")}`;
};

export default function Messages() {
  const [location, setLocation] = useLocation();
  const search = window.location.search; // wouter doesn't have useSearch hook built-in easily accessible 
  const { userId } = useParams<{ userId?: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const initialPartnerId = userId;


  const {
    conversations,
    currentConversation,
    messages,
    newMessage,
    unreadMessageCount,
    loadingConversations,
    sendingMessage,
    setNewMessage,
    sendMessage,
    selectConversation,
    conversationsError,
  } = useMessaging(initialPartnerId);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const text = params.get("text");
    if (text) {
      if (!newMessage) {
        setNewMessage(text);
      }
      // Limpar o parametro da URL visualmente e para evitar re-uso
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [search, newMessage]);

  const {
    tickets,
    loadingTickets,
    createProposal,
    getStepsForTicket,
    updateTicketStatus,
    updateStep,
    deleteStep,
    deleteTicket,
    markStepCompleted,
    confirmFreelancerStep,
    rejectStep,
    sendSystemMessage,
    refetchTickets,
  } = useContract(currentConversation?.id);

  const {
    signContract,
    acceptStep,
    buscarPDF,
  } = useSignature(currentConversation?.id);

  const canCreateProposal = () =>
    user?.type === 'prestador' && currentConversation?.otherUser.type !== 'prestador';

  const ensureSignaturePasswordConfigured = useCallback(() => {
    if (user?.signature_password_set !== true) {
      toast({
        title: "Senha de assinatura",
        description: "Você não configurou sua senha de assinatura.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  }, [toast, user?.signature_password_set]);

  const signaturePasswordHint =
    "Use a senha do login (contas com e-mail/senha) ou a senha de assinatura do perfil (contas Google).";

  // ---------- state ----------
  const [showProposalModal, setShowProposalModal] = useState(false);
  const {
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
  } = useProposalComposer({ toast });
  const [pendingProposalData, setPendingProposalData] = useState<{
    steps: ProposalStepPayload[];
    contractFile?: File | null;
    paymentPreference?: 'per_step' | 'at_end' | 'custom';
    paymentGroups?: { id: number; name: string }[];
  } | null>(null);
  const [sendingProposal, setSendingProposal] = useState(false);

  const [showProposalDetails, setShowProposalDetails] = useState(false);
  const [selectedTicketSteps, setSelectedTicketSteps] = useState<any[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [ticketStepsMap, setTicketStepsMap] = useState<Record<number, any[]>>({});
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [editStepData, setEditStepData] = useState({ title: '', price: 0 });

  const {
    showPdfViewer,
    pdfBlob,
    pdfUrl,
    pdfFilename,
    selectedTicketForPdf,
    loadingPdf,
    pdfError,
    fullscreenPdf,
    setFullscreenPdf,
    handleViewPdf,
    closePdfViewer,
    downloadPdf,
  } = usePdfViewer({ fetchPdf: buscarPDF });
  const [deletingTicket, setDeletingTicket] = useState(false);

  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedTicketForSignature, setSelectedTicketForSignature] = useState<any>(null);
  const [signatureTicketPaymentPref, setSignatureTicketPaymentPref] = useState<
    "per_step" | "at_end" | "custom" | null
  >(null);
  const [signaturePassword, setSignaturePassword] = useState('');
  const [ackChecked, setAckChecked] = useState(false);
  const [signingDocument, setSigningDocument] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [signatureFlow, setSignatureFlow] = useState<SignatureFlow | null>(null);

  const [showOlderTickets, setShowOlderTickets] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState<PaymentDialogState | null>(null);
  const [groupedPaymentDialog, setGroupedPaymentDialog] = useState<GroupedPaymentDialogState | null>(null);
  const [groupedPaymentEnabledByTicket, setGroupedPaymentEnabledByTicket] = useState<Record<number, boolean>>({});
  const [payingStepId, setPayingStepId] = useState<number | null>(null);
  const [lastPaymentMethod, setLastPaymentMethod] = useState<PaymentMethod>("PIX");
  const [providerPaymentPreference, setProviderPaymentPreference] = useState<
    "per_step" | "at_end" | "custom"
  >("at_end");
  const [providerPreferenceCache, setProviderPreferenceCache] = useState<
    Record<number, "per_step" | "at_end" | "custom">
  >({});
  const [confirmingStepPaymentIds, setConfirmingStepPaymentIds] = useState<Record<number, boolean>>({});
  const confirmingStepPaymentRef = useRef<Record<number, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const paymentMethodLabels = useMemo<Record<PaymentMethod, string>>(
    () => ({
      PIX: "PIX",
      BOLETO: "Boleto",
      CREDIT_CARD: "Cartão de crédito",
      DEBIT_CARD: "Cartão de débito",
    }),
    []
  );

  const getGroupedPaymentEnabled = (ticket: any) => {
    if (!ticket) return undefined;
    if (typeof ticket.allow_grouped_payment === "boolean") return ticket.allow_grouped_payment;
    if (typeof ticket.allowGroupedPayment === "boolean") return ticket.allowGroupedPayment;
    if (typeof ticket.grouped_payment === "boolean") return ticket.grouped_payment;
    if (typeof ticket.groupedPayment === "boolean") return ticket.groupedPayment;
    if (typeof ticket.grouped_payment_enabled === "boolean") return ticket.grouped_payment_enabled;
    if (typeof ticket.groupedPaymentEnabled === "boolean") return ticket.groupedPaymentEnabled;
    return undefined;
  };

  const processedConversations = useMemo(() => (conversations || []).map((c: any) => {
    const otherUser = c.otherUser || {};
    const img = otherUser.perfil || otherUser.avatar;
    const url = buildImageUrl(img);
    return {
      ...c,
      otherUser: {
        ...otherUser,
        perfil: url,
        avatar: url,
      }
    };
  }), [conversations]);

  const processedCurrentConversation = useMemo(() => {
    if (!currentConversation) return null;
    const otherUser = currentConversation.otherUser || {};
    const img = otherUser.perfil || otherUser.avatar;
    const url = buildImageUrl(img);
    return {
      ...currentConversation,
      otherUser: {
        ...otherUser,
        perfil: url,
        avatar: url,
      }
    };
  }, [currentConversation]);

  const processedMessages = useMemo(() => (messages || []).map((m: any) => {
    if (!m.sender) return m;
    const sender = m.sender;
    const img = sender.perfil || sender.avatar;
    const url = buildImageUrl(img);
    return {
      ...m,
      sender: {
        ...sender,
        perfil: url,
        avatar: url,
      }
    };
  }), [messages]);

  // ---------- efeitos ----------
  useEffect(() => {
    const loadPaymentPreference = async () => {
      if (user?.type !== "prestador") return;
      try {
        const res = await apiRequest("GET", `/providers/user/${user.id}`);
        if (res.ok) {
          const body = await res.json();
          const preference = body.provider?.payment_preference || "at_end";
          setProviderPaymentPreference(preference);
        }
      } catch (error) {
        console.error("Erro ao carregar preferência de pagamento:", error);
      }
    };
    loadPaymentPreference();
  }, [user?.id, user?.type]);

  useEffect(() => {
    if (!showProposalModal) return;
    setProposalPaymentPreference(providerPaymentPreference);
  }, [providerPaymentPreference, showProposalModal]);

  useEffect(() => {
    const loadAllTicketSteps = async () => {
      if (tickets.length === 0) return;
      const map: Record<number, any[]> = {};
      for (const t of tickets) {
        try {
          map[t.id] = await getStepsForTicket(t.id);
        } catch {
          map[t.id] = [];
        }
      }
      setTicketStepsMap(map);
    };
    loadAllTicketSteps();
  }, [tickets, getStepsForTicket]);

  useEffect(() => {
    const ticketId = (selectedTicketSteps[0] as any)?.ticket_id;
    if (!ticketId) return;
    const ticket = tickets.find((t: any) => t.id === ticketId);
    if (!ticket) return;
    const enabled = getGroupedPaymentEnabled(ticket);
    if (typeof enabled !== "boolean") return;
    setGroupedPaymentEnabledByTicket((prev) => {
      if (prev[ticketId] === enabled) return prev;
      return { ...prev, [ticketId]: enabled };
    });
  }, [selectedTicketSteps, tickets]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ---------- handlers: chat ----------
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentConversation?.id) return;
    await sendMessage();
  };
  const handleConversationClick = (conversation: any) => {
    if (!conversation.id) return;
    selectConversation(conversation);
    setLocation(`/messages/${conversation.otherUser.id}`);
  };

  // ---------- handlers: proposta nova ----------
  const handleSendProposal = (groups?: { id: number; name: string }[]) => {
    if (!currentConversation || !user || !canCreateProposal()) return;
    if (!contractFile) {
      toast({
        title: 'Contrato obrigatório',
        description: 'Anexe o PDF do contrato para enviar a proposta.',
        variant: 'destructive',
      });
      return;
    }

    let valid: ProposalStep[] = [];
    if (proposalPaymentPreference !== "at_end") {
      valid = proposalSteps.filter(s => s.title.trim() && s.price > 0);
    } else {
      valid = proposalSteps.filter(s => s.title.trim());
      const hasPrice = proposalSteps.some(s => s.price > 0);
      if (!hasPrice) {
        toast({
          title: 'Erro',
          description: 'Informe o valor total para depósito em garantia.',
          variant: 'destructive',
        });
        return;
      }
    }

    if (valid.length < 1) {
      toast({
        title: 'Erro',
        description: 'Adicione pelo menos 1 etapa com título.',
        variant: 'destructive',
      });
      return;
    }
    const toIso = (value?: string) => {
      if (!value) return undefined;
      const parts = value.split('/');
      if (parts.length === 3) {
        const [d, m, y] = parts;
        return `${y.length === 2 ? `20${y}` : y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      }
      return value;
    };

    const payloadSteps: ProposalStepPayload[] = valid.map(step => ({
      title: step.title.trim(),
      price: step.price,
      startDate: toIso(step.startDate),
      endDate: toIso(step.endDate),
      payment_group_id: (step as any).paymentGroupId,
    }));
    setPendingProposalData({
      steps: payloadSteps,
      contractFile,
      paymentPreference: proposalPaymentPreference,
      paymentGroups: groups,
    });
    openProposalSignatureDialog();
  };

  // ---------- handlers: detalhes / steps ----------
  const handleViewProposalDetails = async (ticketId: number) => {
    setShowProposalDetails(true);
    setLoadingSteps(true);
    setSelectedTicketSteps([]);
    try {
      const withPayments = await getStepsWithPayment(ticketId);
      setSelectedTicketSteps(withPayments);
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e?.message || 'Não foi possível carregar os detalhes.',
        variant: 'destructive',
      });
    } finally {
      setLoadingSteps(false);
    }
  };
  const getStepsWithPayment = useCallback(
    async (ticketId: number) => {
      const steps = await getStepsForTicket(ticketId);
      return await Promise.all(
        (Array.isArray(steps) ? steps : []).map(async (s: any) => {
          try {
            const payRes = await apiRequest("GET", `/payments/steps/${s.id}`);
            if (!payRes.ok) return s;
            const payJson = await payRes.json();
            const paid = !!payJson?.data?.summary?.has_successful_payment;
            return { ...s, paid };
          } catch {
            return s;
          }
        })
      );
    },
    [getStepsForTicket]
  );

  useEffect(() => {
    if (!showProposalDetails || !selectedTicketSteps.length) return;
    const allPaid = selectedTicketSteps.every((s: any) => s.paid);
    if (allPaid) {
      void refetchTickets();
    }
  }, [selectedTicketSteps, showProposalDetails, refetchTickets]);

  const handleEditStep = (step: any) => {
    if (!step) return;
    const isSignatureStep =
      step.title === SIGNATURE_STEP_TITLE ||
      (selectedTicketSteps[0] && selectedTicketSteps[0].id === step.id);
    if (isSignatureStep) {
      toast({
        title: "Etapa protegida",
        description: "A etapa de assinatura não pode ser editada.",
        variant: "warning",
      });
      return;
    }
    setEditingStep(step.id);
    setEditStepData({ title: step.title, price: step.price });
  };
  const handleSaveStep = async () => {
    if (!editingStep) return;
    const ok = await updateStep(editingStep, {
      title: editStepData.title,
      price: editStepData.price,
    });
    if (ok) {
      setEditingStep(null);
      const updated = await getStepsForTicket(selectedTicketSteps[0]?.ticket_id);
      setSelectedTicketSteps(updated);
    }
  };
  const handleDeleteStep = async (stepId: number) => {
    const target = selectedTicketSteps.find((s) => s.id === stepId);
    const isSignatureStep =
      target?.title === SIGNATURE_STEP_TITLE ||
      (selectedTicketSteps[0] && selectedTicketSteps[0].id === stepId);
    if (isSignatureStep) {
      toast({
        title: "Etapa protegida",
        description: "A etapa de assinatura não pode ser excluída.",
        variant: "warning",
      });
      return;
    }
    const ok = await deleteStep(stepId);
    if (ok) {
      const updated = await getStepsForTicket(selectedTicketSteps[0]?.ticket_id);
      setSelectedTicketSteps(updated);
    }
  };
  
  const handleMarkStepCompleted = async (
    stepId: number,
    password: string,
    ticketId: number,
  ) => markStepCompleted(stepId, password, ticketId);

  const handleStartPhase = async (stepId: number) => {
    const step = selectedTicketSteps.find((s: any) => s.id === stepId);
    const ticket = tickets.find(
      (t: any) => t.id === (step as any)?.ticket_id
    );
    const pref =
      ticket?.payment_preference ||
      ticket?.paymentPreference ||
      providerPaymentPreference;
    if (
      pref === "custom" &&
      step &&
      !step.is_financially_cleared &&
      !step.paid &&
      Number(step.price || 0) > 0
    ) {
      toast({
        title: "Pagamento obrigatório",
        description: "A etapa só pode iniciar após a confirmação do pagamento.",
        variant: "warning",
      });
      return;
    }
    const ok = await updateStep(stepId, { status: 'em andamento' });
    if (ok) {
      const ticketId = selectedTicketSteps.find((s: any) => s.id === stepId)?.ticket_id;
      if (ticketId) {
        setSelectedTicketSteps(currentSteps =>
          currentSteps.map(s => (s.id === stepId ? { ...s, status: 'em andamento' } : s))
        );
        const updated = await getStepsWithPayment(ticketId);
        setSelectedTicketSteps(updated);
      }
    }
  };

  // Cliente REJEITA um step especifico
  const handleRejectStep = async (step: any) => {
    try {
      const ok = await rejectStep(step.id, step.ticket_id, step.indexInTicket);
      if (ok) {
        const updated = await getStepsForTicket(step.ticket_id);
        setSelectedTicketSteps(updated);
      }
      return ok;
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e?.message || 'Não foi possível recusar a etapa.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleFeedbackCreated = async (step: Step, comment: string, isProblem: boolean) => {
    if (!currentConversation?.id) return;
    const steps = selectedTicketSteps || [];
    const index = steps.findIndex((s: any) => s.id === step.id);
    const stepNumber = index >= 0 ? index + 1 : undefined;
    const title = step?.title?.trim();
    const snippet = comment.length > 160 ? `${comment.slice(0, 157)}...` : comment;
    const stepLabel = stepNumber ? `na etapa ${stepNumber}` : 'em uma etapa';
    const titleLabel = title ? ` (${title})` : '';
    const icon = isProblem ? '­ƒÜ¿' : '­ƒôØ';
    const contextLabel = isProblem ? 'problema relatado' : 'feedback adicionado';
    const messageContent = `${icon} Novo ${contextLabel} ${stepLabel}${titleLabel}: "${snippet}"`;
    void sendSystemMessage(messageContent);

    // se for problema, atualiza a lista de etapas para refletir rollback
    if (isProblem) {
      const ticketId =
        (step as any).ticket_id ??
        (step as any).ticketId ??
        selectedTicketSteps[0]?.ticket_id;

      // atualização otimista local: libera o botão pro prestador refazer
      setSelectedTicketSteps((prev = []) =>
        prev.map((s: any) =>
          s.id === step.id
            ? {
                ...s,
                confirm_freelancer: false,
                confirm_contractor: false,
                status: 'em andamento',
              }
            : s
        )
      );

      if (ticketId) {
        try {
          const updated = await getStepsForTicket(ticketId);
          setSelectedTicketSteps(updated);
        } catch (e) {
          console.warn('Falha ao atualizar etapas após problema relatado', e);
        }
      }
    }
  };

  // Cliente ACEITA step (precisa da senha vinda do Dialog)
  const handleAcceptStep = async (step: any, password: string) => {
    if (!step?.confirm_freelancer) {
      toast({
        title: 'Aguardando prestador',
        description: 'O prestador precisa marcar a etapa como concluída antes da sua aprovação.',
        variant: 'warning',
      });
      return false;
    }
    try {
      const ok = await acceptStep(step.id, password);
      if (ok) {
        const updated = await getStepsWithPayment(step.ticket_id);
        setSelectedTicketSteps(updated);
        const refreshed = updated.find((s: any) => s.id === step.id) || step;
        const isPaid = (refreshed as any).paid || (refreshed as any).is_financially_cleared;
        toast({
          title: 'Etapa aceita',
          description: isPaid ? 'Etapa concluída com sucesso.' : 'Gere o pagamento para liberar a próxima etapa.',
        });
      }
      return ok;
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e?.message || 'Não foi possível aceitar a etapa.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleCopyPaymentCode = useCallback(
    async (code?: string, label: string = 'C¢digo copiado') => {
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code);
        toast({ title: label, description: 'Copiado para a  rea de transferˆncia.' });
      } catch {
        toast({
          title: 'NÆo foi poss¡vel copiar',
          description: 'Copie manualmente o c¢digo exibido.',
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  const openPaymentModal = useCallback(
    (step: Step, type: 'step' | 'deposit' = 'step') => {
      setPaymentDialog({
        step,
        type,
        data: null,
        method: lastPaymentMethod,
        loading: false,
      });
    },
    [lastPaymentMethod]
  );

  const openGroupedPaymentModal = useCallback(
    (steps: Step[]) => {
      const uniqueSteps = (steps || []).filter(
        (step, index, list) =>
          step?.id &&
          list.findIndex((item) => item?.id === step.id) === index
      );
      if (!uniqueSteps.length) return;
      setGroupedPaymentDialog({
        steps: uniqueSteps,
        data: null,
        method: lastPaymentMethod,
        loading: false,
      });
    },
    [lastPaymentMethod]
  );

  const requestPayment = useCallback(
    async (target: PaymentDialogState) => {
      const endpoint =
        target.type === "deposit"
          ? `/payments/tickets/${target.step.ticket_id}`
          : `/payments/steps/${target.step.id}`;

      const response = await apiRequest("POST", endpoint, {
        description:
          target.type === "deposit"
            ? `Dep¢sito em garantia do ticket #${target.step.ticket_id}`
            : `Pagamento da etapa "${target.step.title}"`,
        method: target.method,
      });

      let payload: any = {};
      try {
        payload = await response.json();
      } catch {
        payload = {};
      }

      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.message || "NÆo foi poss¡vel gerar o pagamento.");
      }

      return payload.data;
    },
    []
  );

  const requestGroupedPayment = useCallback(
    async (target: GroupedPaymentDialogState) => {
      const stepIds = (target.steps || []).map((step) => step?.id).filter(Boolean);
      if (stepIds.length === 0) {
        throw new Error("Selecione ao menos uma etapa para pagamento.");
      }

      const ticketId = (target.steps[0] as any)?.ticket_id;
      const groupId = target.groupId || (target.steps[0] as any)?.group_id || (target.steps[0] as any)?.payment_group_id;

      let response;
      if (groupId) {
         response = await apiRequest("POST", `/payments/groups/${groupId}`, {
          description: `Pagamento do Grupo ${groupId}`,
          method: target.method,
        });
      } else {
        response = await apiRequest("POST", "/payments", {
          description: ticketId
            ? `Pagamento agrupado do ticket #${ticketId}`
            : "Pagamento agrupado de etapas",
          method: target.method,
          step_ids: stepIds,
        });
      }

      let payload: any = {};
      try {
        payload = await response.json();
      } catch {
        payload = {};
      }

      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.message || "Nao foi possivel gerar o pagamento.");
      }

      return payload.data;
    },
    []
  );

  const handleGeneratePayment = useCallback(async () => {
    if (!paymentDialog) return;
    const current = paymentDialog;
    setPaymentDialog({ ...current, loading: true });
    try {
      const data = await requestPayment(current);
      setPaymentDialog((prev) => (prev ? { ...prev, data, loading: false } : prev));
      toast({
        title: `${paymentMethodLabels[current.method]} gerado`,
        description: "Exibindo os dados para pagamento.",
      });
    } catch (error: any) {
      setPaymentDialog((prev) => (prev ? { ...prev, loading: false } : prev));
      toast({
        title: "Erro ao gerar pagamento",
        description: error?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  }, [paymentDialog, requestPayment, toast, paymentMethodLabels]);

  const handleChangePaymentMethod = useCallback((method: PaymentMethod) => {
    setLastPaymentMethod(method);
    setPaymentDialog((prev) => (prev ? { ...prev, method, data: null } : prev));
  }, []);

  const handleGroupedPaymentMethodChange = useCallback((method: PaymentMethod) => {
    setLastPaymentMethod(method);
    setGroupedPaymentDialog((prev) => (prev ? { ...prev, method, data: null } : prev));
  }, []);

  const handleGenerateGroupedPayment = useCallback(async () => {
    if (!groupedPaymentDialog) return;
    const current = groupedPaymentDialog;
    setGroupedPaymentDialog({ ...current, loading: true });
    try {
      const data = await requestGroupedPayment(current);
      setGroupedPaymentDialog((prev) => (prev ? { ...prev, data, loading: false } : prev));
      toast({
        title: `${paymentMethodLabels[current.method]} gerado`,
        description: "Exibindo os dados para pagamento.",
      });
    } catch (error: any) {
      setGroupedPaymentDialog((prev) => (prev ? { ...prev, loading: false } : prev));
      toast({
        title: "Erro ao gerar pagamento",
        description: error?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  }, [groupedPaymentDialog, requestGroupedPayment, toast, paymentMethodLabels]);

  const handleClientPayStep = useCallback(
    async (step: Step) => {
      if (!step?.id) return;
      if (user?.type !== 'contratante') {
        toast({
          title: 'Acesso negado',
          description: 'Somente contratantes podem gerar pagamentos.',
          variant: 'destructive',
        });
        return;
      }

      const ticket = tickets.find((t: any) => t.id === (step as any)?.ticket_id);
      const pref =
        ticket?.payment_preference ||
        ticket?.paymentPreference ||
        providerPaymentPreference;
      const isCustomPayment = pref === "custom";
      if (pref === "at_end") {
        toast({
          title: "Pagamento j  em garantia",
          description: "Vocˆ j  depositou o total na assinatura. NÆo ‚ necess rio pagar por etapa.",
        });
        return;
      }

      if (!isCustomPayment && !step.confirm_freelancer) {
        toast({
          title: 'Aguardando prestador',
          description: 'O prestador precisa marcar a etapa como conclu¡da antes do pagamento.',
          variant: 'warning',
        });
        return;
      }
      if (!isCustomPayment && !step.confirm_contractor) {
        toast({
          title: "Aceite necessário",
          description: "Aceite a etapa antes de gerar o pagamento.",
          variant: "warning",
        });
        return;
      }
      if (isCustomPayment) {
        const status = (step.status || "").toLowerCase();
        if (status === "recusado") {
          toast({
            title: "Etapa recusada",
            description: "Esta etapa não pode receber pagamento.",
            variant: "warning",
          });
          return;
        }
      }

      let freshUser: any = user;
      try {
        if (user?.id) {
          const userRes = await apiRequest("GET", `/users/${user.id}`);
          if (userRes.ok) {
            const body = await userRes.json();
            freshUser = body?.user || freshUser;
          }
        }
      } catch {
        /* se falhar, usa os dados atuais */
      }

      const hasDocs =
        !!(freshUser as any)?.cpf?.trim?.() ||
        !!(freshUser as any)?.cnpj?.trim?.();
      if (!hasDocs) {
        toast({
          title: 'CPF/CNPJ obrigatório',
          description: 'Cadastre CPF ou CNPJ no seu perfil antes de gerar pagamento.',
          variant: 'destructive',
        });
        return;
      }

      openPaymentModal(step, "step");
      toast({
        title: "Gerar pagamento",
        description: "Escolha PIX, boleto ou cartão para finalizar o pagamento.",
      });
    },
    [openPaymentModal, providerPaymentPreference, tickets, toast, user]
  );

  const handlePaySteps = useCallback(
    async (steps: Step[]) => {
      const cleaned = Array.isArray(steps) ? steps.filter(Boolean) : [];
      if (!cleaned.length) return;

      const ticketIdForPref = (cleaned[0] as any)?.ticket_id;
      const ticketForPref = tickets.find((t: any) => t.id === ticketIdForPref);
      const pref =
        ticketForPref?.payment_preference ||
        ticketForPref?.paymentPreference ||
        providerPaymentPreference;
      const isCustomPayment = pref === "custom";

      const payableSteps = cleaned.filter((step: any) => {
        const isSignature = step?.title === SIGNATURE_STEP_TITLE;
        const paid = Boolean(step?.paid) || Boolean(step?.is_financially_cleared);
        const concluded =
          (step?.status || "").toLowerCase() === "concluido" ||
          (step?.confirm_freelancer && step?.confirm_contractor);
        const price = Number(step?.price) || 0;
        const rejected = (step?.status || "").toLowerCase() === "recusado";
        if (isSignature || paid || price <= 0 || rejected) return false;
        return isCustomPayment ? true : concluded;
      });

      if (payableSteps.length !== cleaned.length) {
        toast({
          title: "Etapas inválidas",
          description: isCustomPayment
            ? "Selecione apenas etapas pendentes e ainda não pagas."
            : "Selecione apenas etapas concluídas e ainda não pagas.",
          variant: "warning",
        });
        return;
      }

      if (cleaned.length === 1 && !isCustomPayment) {
        await handleClientPayStep(cleaned[0]);
        return;
      }

      if (user?.type !== "contratante") {
        toast({
          title: "Acesso negado",
          description: "Somente contratantes podem gerar pagamentos.",
          variant: "destructive",
        });
        return;
      }

      const ticketId = (cleaned[0] as any)?.ticket_id;
      const mixedTickets = cleaned.some(
        (step) => (step as any)?.ticket_id !== ticketId
      );
      if (mixedTickets) {
        toast({
          title: "Etapas invalidas",
          description: "Selecione etapas do mesmo ticket.",
          variant: "destructive",
        });
        return;
      }

      const ticket = tickets.find((t: any) => t.id === ticketId);
      if (pref === "at_end") {
        toast({
          title: "Pagamento ja em garantia",
          description: "Este projeto usa deposito em garantia.",
        });
        return;
      }

      let freshUser: any = user;
      try {
        if (user?.id) {
          const userRes = await apiRequest("GET", `/users/${user.id}`);
          if (userRes.ok) {
            const body = await userRes.json();
            freshUser = body?.user || freshUser;
          }
        }
      } catch {
        /* se falhar, usa os dados atuais */
      }

      const hasDocs =
        !!(freshUser as any)?.cpf?.trim?.() ||
        !!(freshUser as any)?.cnpj?.trim?.();
      if (!hasDocs) {
        toast({
          title: "CPF/CNPJ obrigatorio",
          description: "Cadastre CPF ou CNPJ no seu perfil antes de gerar pagamento.",
          variant: "destructive",
        });
        return;
      }

      openGroupedPaymentModal(payableSteps);
      toast({
        title: "Gerar pagamento",
        description: "Escolha PIX, boleto ou cartao para finalizar o pagamento.",
      });
    },
    [handleClientPayStep, openGroupedPaymentModal, providerPaymentPreference, tickets, toast, user]
  );

  const handleRefreshStepPayment = useCallback(
    async (step: Step) => {
      if (!step?.id) return;
      if (user?.type !== 'contratante') {
        toast({
          title: 'Acesso negado',
          description: 'Somente contratantes podem confirmar o pagamento.',
          variant: 'destructive',
        });
        return;
      }
      try {
        setPayingStepId(step.id);
        const response = await apiRequest('GET', `/payments/steps/${step.id}/refresh`);
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload?.success === false) {
          throw new Error(payload?.message || 'NÆo foi poss¡vel atualizar o pagamento.');
        }
        const ticketId = (step as any)?.ticket_id || (step as any)?.ticketId;
        if (ticketId) {
          const steps = await getStepsWithPayment(ticketId);
          setSelectedTicketSteps(steps);
          const allPaid = Array.isArray(steps) && steps.length > 0 && steps.every((s: any) => s.paid);
          if (allPaid) {
            await refetchTickets();
          }
        }
        toast({
          title: payload?.data?.paid ? 'Pagamento confirmado' : 'Pagamento ainda pendente',
          description: payload?.message || '',
        });
      } catch (error: any) {
        toast({
          title: 'Erro ao atualizar pagamento',
          description: error?.message || 'Tente novamente mais tarde.',
          variant: 'destructive',
        });
      } finally {
        setPayingStepId(null);
      }
    },
    [getStepsWithPayment, refetchTickets, toast, user]
  );

  const handleConfirmStepPayment = useCallback(
    async (stepId: number) => {
      if (!stepId) return;
      if (confirmingStepPaymentRef.current[stepId]) return;
      const step = selectedTicketSteps.find((s: any) => s.id === stepId);
      if (!step) return;

      confirmingStepPaymentRef.current = {
        ...confirmingStepPaymentRef.current,
        [stepId]: true,
      };
      setConfirmingStepPaymentIds((prev) => ({ ...prev, [stepId]: true }));

      try {
        await handleRefreshStepPayment(step);
      } finally {
        confirmingStepPaymentRef.current = {
          ...confirmingStepPaymentRef.current,
          [stepId]: false,
        };
        setConfirmingStepPaymentIds((prev) => ({ ...prev, [stepId]: false }));
      }
    },
    [handleRefreshStepPayment, selectedTicketSteps]
  );

  const handleDeleteTicket = useCallback(
    async (ticketId: number) => {
      const ticket = tickets.find((t: any) => t.id === ticketId);
      if (!ticket) {
        toast({
          title: 'Ticket não encontrado',
          description: 'Reabra a tela e tente novamente.',
          variant: 'destructive',
        });
        return;
      }
      const status = (ticket.status || '').toLowerCase();
      if (status === 'em andamento' || status === 'concluída') {
        toast({
          title: 'Ação não permitida',
          description: 'Não é possível excluir propostas já aceitas ou em andamento.',
          variant: 'destructive',
        });
        return;
      }
      try {
        setDeletingTicket(true);
        const ok = await deleteTicket(ticketId);
        if (ok) {
          toast({
            title: 'Proposta excluída',
            description: 'Ela não aparecerá mais na lista.',
          });
          setShowProposalDetails(false);
          setSelectedTicketSteps([]);
          await refetchTickets();
        }
      } catch (error: any) {
        toast({
          title: 'Erro ao excluir',
          description: error?.message || 'Não foi possível excluir a proposta.',
          variant: 'destructive',
        });
      } finally {
        setDeletingTicket(false);
      }
    },
    [deleteTicket, refetchTickets, tickets, toast]
  );

  const handleRefreshTicketPayment = useCallback(
    async (ticketId: number) => {
      try {
        const res = await apiRequest("GET", `/payments/tickets/${ticketId}/refresh`);
        const body = await res.json().catch(() => ({}));
        if (!res.ok || body?.success === false) {
          throw new Error(body?.message || "NÆo foi poss¡vel verificar o pagamento.");
        }
        await refetchTickets();
        const steps = await getStepsWithPayment(ticketId);
        setSelectedTicketSteps(steps);
        toast({
          title: body?.data?.paid ? "Pagamento confirmado" : "Pagamento pendente",
          description: body?.message || "",
        });
      } catch (error: any) {
        toast({
          title: "Pagamento nÆo encontrado",
          description: error?.message || "Nenhum pagamento registrado ainda. Tente novamente mais tarde.",
          variant: "warning",
        });
      }
    },
    [getStepsForTicket, refetchTickets, toast]
  );

  const handleToggleGroupedPayment = useCallback(
    async (ticketId: number, enabled: boolean) => {
      const previousValue = groupedPaymentEnabledByTicket[ticketId] ?? false;
      setGroupedPaymentEnabledByTicket((prev) => ({ ...prev, [ticketId]: enabled }));
      try {
        const res = await apiRequest("PATCH", `/ticket/${ticketId}`, {
          allow_grouped_payment: enabled,
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok || body?.success === false) {
          throw new Error(body?.message || "Nao foi possivel atualizar.");
        }
        await refetchTickets();
      } catch (error: any) {
        setGroupedPaymentEnabledByTicket((prev) => ({
          ...prev,
          [ticketId]: previousValue,
        }));
        toast({
          title: "Erro ao atualizar permissao",
          description: error?.message || "Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
    },
    [groupedPaymentEnabledByTicket, refetchTickets, toast]
  );

  useEffect(() => {
    if (!showProposalDetails || !selectedTicketSteps.length) return;
    const ticketId = (selectedTicketSteps[0] as any)?.ticket_id;
    if (!ticketId) return;
    const hasUnpaid = selectedTicketSteps.some((s: any) => !s.paid);
    if (!hasUnpaid) return;

    const interval = setInterval(async () => {
      try {
        // força sincronizar pagamentos no backend antes de ler
        await apiRequest("GET", `/payments/tickets/${ticketId}/refresh`);
        const steps = await getStepsWithPayment(ticketId);
        setSelectedTicketSteps(steps);
        const allPaid = Array.isArray(steps) && steps.length > 0 && steps.every((s: any) => s.paid);
        if (allPaid) {
          await refetchTickets();
        }
      } catch {
        /* ignore polling errors */
      }
    }, 5000);

    return () => clearInterval(interval); // Cleanup to prevent memory leaks
  }, [showProposalDetails, selectedTicketSteps, getStepsWithPayment, refetchTickets]);

  const getProviderPaymentPreference = useCallback(
    async (providerId?: number | null) => {
      if (!providerId) return null;
      if (providerPreferenceCache[providerId]) return providerPreferenceCache[providerId];
      try {
        const res = await apiRequest("GET", `/providers/${providerId}`);
        if (!res.ok) return null;
        const body = await res.json();
        const pref =
          body?.provider?.payment_preference ||
          body?.payment_preference ||
          null;
        if (pref) {
          setProviderPreferenceCache((prev) => ({ ...prev, [providerId]: pref }));
        }
        return pref;
      } catch (error) {
        console.error("Erro ao carregar preferência do prestador:", error);
        return null;
      }
    },
    [providerPreferenceCache]
  );

  const generateTicketDepositPayment = useCallback(
    async (ticketId: number) => {
      if (user?.type !== "contratante") return;

      const ticket = tickets.find((t: any) => t.id === ticketId);
      const ticketPref =
        ticket?.payment_preference || ticket?.paymentPreference || null;
      let pref = ticketPref;

      if (!pref) {
        pref = await getProviderPaymentPreference(ticket?.provider_id);
      }

      if (!pref && currentConversation?.otherUser?.type === "prestador") {
        try {
          const res = await apiRequest(
            "GET",
            `/providers/user/${currentConversation.otherUser.id}`
          );
          if (res.ok) {
            const body = await res.json();
            pref =
              body?.provider?.payment_preference ||
              body?.payment_preference ||
              null;
            if (body?.provider?.provider_id) {
              setProviderPreferenceCache((prev) => ({
                ...prev,
                [body.provider.provider_id]: pref as any,
              }));
            }
          }
        } catch (error) {
          console.error("Erro ao buscar preferência (user/provider):", error);
        }
      }

      const effectivePref = pref || providerPaymentPreference;

      if (effectivePref !== "at_end") return;
      if (ticket?.payment === true) {
        return;
      }

      let stepsForTicket = ticketStepsMap[ticketId] || [];
      if (!stepsForTicket.length) {
        try {
          stepsForTicket = await getStepsForTicket(ticketId);
        } catch {
          stepsForTicket = [];
        }
      }
      if (!stepsForTicket.length) {
        toast({
          title: "Etapas indisponíveis",
          description: "Não foi possível calcular o valor do contrato.",
          variant: "destructive",
        });
        return;
      }
      const amount = stepsForTicket.reduce(
        (total, s) => total + (Number((s as any)?.price) || 0),
        0
      );

      const depositStep: Step = {
        id: -Math.abs(ticketId || 1),
        ticket_id: ticketId,
        title: "Depósito em garantia do contrato",
        price: amount,
        status: "Pendente",
      };

      openPaymentModal(depositStep, "deposit");
      toast({
        title: "Depósito em garantia",
        description: "Escolha PIX, boleto ou cartão para pagar o depósito.",
      });
    },
    [
      currentConversation,
      getProviderPaymentPreference,
      getStepsForTicket,
      openPaymentModal,
      providerPaymentPreference,
      ticketStepsMap,
      tickets,
      toast,
      user?.type,
    ]
  );

  // ---------- handlers: recusar contrato ----------
  const handleRejectContract = async (ticketId: number) => {
    try {
      const steps = await getStepsForTicket(ticketId);
      const signatureStep = steps[0];
      const alreadySigned =
        signatureStep?.confirm_contractor ||
        (signatureStep?.status || '').toLowerCase() === 'concluido';

      if (alreadySigned) {
        toast({
          title: 'Contrato já assinado',
          description: 'Após a assinatura não é possível recusar a proposta.',
          variant: 'destructive',
        });
        return;
      }

      // Apenas cancela o ticket, não deleta - permite que seja refeito
      await updateTicketStatus(ticketId, 'cancelada');
      
      await sendSystemMessage(
        'Proposta recusada. O prestador pode enviar uma nova proposta.',
        'text',
        { ticket_id: ticketId, action: 'proposal_rejected' }
      );
      
      toast({
        title: 'Proposta recusada',
        description: 'O prestador pode enviar uma nova proposta.',
      });
      setShowProposalDetails(false);
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e?.message || 'Não foi possível recusar a proposta.',
        variant: 'destructive',
      });
    }
  };

  const resetSignatureDialogState = () => {
    setSignaturePassword('');
    setAckChecked(false);
    setShowPasswordField(false);
    setSignatureFlow(null);
    setSelectedTicketForSignature(null);
    setSignatureTicketPaymentPref(null);
  };

  const openContractSignatureDialog = (ticket: any) => {
    if (!ensureSignaturePasswordConfigured()) return;
    if (!ticket) return;
    resetSignatureDialogState();
    setSelectedTicketForSignature(ticket);
    setSignatureTicketPaymentPref(null);
    const directPref = ticket?.payment_preference || ticket?.paymentPreference;
    if (directPref) {
      setSignatureTicketPaymentPref(directPref as any);
    } else {
      (async () => {
        const pref = await getProviderPaymentPreference(ticket?.provider_id);
        if (pref) setSignatureTicketPaymentPref(pref as any);
      })();
    }
    setSignatureFlow({
      type: 'contract',
      ticket,
      title: 'Assinatura Digital',
      description: `Confirme os termos e insira sua senha. ${signaturePasswordHint}`,
      confirmLabel: 'Assinar',
      agreeLabel: 'Prosseguir',
      passwordPlaceholder: 'Digite sua senha',
      requireAck: true,
    });
    setSignaturePassword('');
    setAckChecked(false);
    setShowPasswordField(false);
    setShowSignatureModal(true);
  };

  const openFreelancerStepSignature = (stepId: number, ticketId: number) => {
    if (!ensureSignaturePasswordConfigured()) return;
    resetSignatureDialogState();
    setSignatureFlow({
      type: 'step-complete',
      stepId,
      ticketId,
      title: 'Concluir etapa',
      description: `Confirme sua senha para concluir esta etapa. ${signaturePasswordHint}`,
      confirmLabel: 'Concluir etapa',
      passwordPlaceholder: 'Digite sua senha',
      requireAck: false,
    });
    setSignaturePassword('');
    setAckChecked(true);
    setShowPasswordField(true);
    setShowSignatureModal(true);
  };

  const openClientStepSignature = (
    step: any,
    paymentPreference?: 'per_step' | 'at_end' | 'custom' | null
  ) => {
    if (!ensureSignaturePasswordConfigured()) return;
    resetSignatureDialogState();
    setSignatureFlow({
      type: 'step-accept',
      step,
      paymentPreference,
      title: 'Aceitar etapa',
      description: `Informe sua senha para aceitar esta etapa. ${signaturePasswordHint}`,
      confirmLabel: 'Aceitar etapa',
      passwordPlaceholder: 'Digite sua senha',
      requireAck: false,
    });
    setSignaturePassword('');
    setAckChecked(true);
    setShowPasswordField(true);
    setShowSignatureModal(true);
  };

  const openProposalSignatureDialog = () => {
    if (!ensureSignaturePasswordConfigured()) return;
    resetSignatureDialogState();
    setSignatureFlow({
      type: 'proposal-first-step',
      title: 'Confirmar envio',
      description: `Informe sua senha para validar o contrato em PDF. ${signaturePasswordHint}`,
      confirmLabel: 'Enviar proposta',
      passwordPlaceholder: 'Digite sua senha',
      requireAck: false,
    });
    setAckChecked(true);
    setShowPasswordField(true);
    setShowSignatureModal(true);
  };

  const handleSignatureModalChange = (open: boolean) => {
    setShowSignatureModal(open);
    if (!open) {
      resetSignatureDialogState();
      setSigningDocument(false);
      setPendingProposalData(null);
      setSendingProposal(false);
    }
  };

  // ---------- handlers: assinatura (contrato) ----------
  const handleStartSignature = (ticket: any) => {
    if (!ticket) return;
    if (['concluída', 'concluida'].includes((ticket.status || '').toLowerCase())) {
      toast({
        title: 'Documento já assinado',
        description: 'Este documento já foi assinado.',
        variant: 'destructive',
      });
      return;
    }
    openContractSignatureDialog(ticket);
  };
  const handleAgreeAndAskPassword = () => {
    const requireAck = signatureFlow
      ? signatureFlow.requireAck ?? (signatureFlow.type === 'contract')
      : true;
    if (requireAck && !ackChecked) {
      toast({
        title: 'Confirmação necessária',
        description: 'Você deve concordar com os termos.',
        variant: 'destructive',
      });
      return;
    }
    setShowPasswordField(true);
  };
  const handleConfirmSignature = async () => {
    if (!signatureFlow) return;

    const requireAck =
      signatureFlow.requireAck ?? (signatureFlow.type === 'contract');
    const password = signaturePassword.trim();

    if (requireAck && !ackChecked) {
      toast({
        title: 'Confirmação necessária',
        description: 'Você deve concordar com os termos.',
        variant: 'destructive',
      });
      return;
    }

    if (!password) {
      toast({
        title: 'Senha obrigatória',
        description: 'Digite sua senha para continuar.',
        variant: 'destructive',
      });
      return;
    }

    if (signatureFlow.type === 'contract' && !selectedTicketForSignature) {
      toast({
        title: 'Contrato inválido',
        description: 'Não foi possível identificar o contrato para assinatura.',
        variant: 'destructive',
      });
      return;
    }

    setSigningDocument(true);

    try {
      if (signatureFlow.type === 'proposal-first-step') {
        if (!pendingProposalData || pendingProposalData.steps.length === 0) {
          toast({
            title: 'Dados inválidos',
            description: 'Não foi possível recuperar as etapas da proposta.',
            variant: 'destructive',
          });
          return;
        }
        setSendingProposal(true);
        try {
          const ok = await createProposal(
            pendingProposalData.steps,
            pendingProposalData.contractFile || undefined,
            password,
            pendingProposalData.paymentPreference || proposalPaymentPreference,
            pendingProposalData.paymentGroups,
          );
          if (!ok) return;
          setShowSignatureModal(false);
          resetSignatureDialogState();
          setPendingProposalData(null);
          setShowProposalModal(false);
          setProposalSteps([{ id: crypto.randomUUID(), title: '', price: 0, paymentGroupId: 1 }]);
          setContractFile(null);
          return;
        } finally {
          setSendingProposal(false);
        }
      }

      if (signatureFlow.type === 'contract') {
        const ticketId = selectedTicketForSignature!.id as number;
        const paymentPref =
          signatureTicketPaymentPref ||
          selectedTicketForSignature?.payment_preference ||
          selectedTicketForSignature?.paymentPreference ||
          null;
        const effectivePref =
          paymentPref === "per_step" ||
          paymentPref === "at_end" ||
          paymentPref === "custom"
            ? paymentPref
            : providerPaymentPreference;
        const ok = await signContract(ticketId, password, {
          setStatus: effectivePref !== "at_end",
        });
        if (!ok) return;

        toast({
          title: 'Documento assinado',
          description: 'O contrato foi assinado e registrado.',
        });
        setShowSignatureModal(false);
        resetSignatureDialogState();

        if (effectivePref === "at_end") {
          await generateTicketDepositPayment(ticketId);
        }
        await handleViewPdf(ticketId);
        return;
      }

      if (signatureFlow.type === 'step-complete') {
        const ok = await handleMarkStepCompleted(
          signatureFlow.stepId,
          password,
          signatureFlow.ticketId,
        );
        if (ok === false) return;
        setShowSignatureModal(false);
        resetSignatureDialogState();
        return;
      }

      if (signatureFlow.type === 'step-accept') {
        const ok = await handleAcceptStep(signatureFlow.step, password);
        if (ok === false) return;
        const isPaid = (signatureFlow.step as any).paid || (signatureFlow.step as any).is_financially_cleared;
        if (signatureFlow.paymentPreference === 'per_step' && !isPaid) {
          await handleClientPayStep(signatureFlow.step as any);
        }
        setShowSignatureModal(false);
        resetSignatureDialogState();
      }
    } finally {
      setSigningDocument(false);
    }
  };

  const handleConfirmStepCompletion = async (stepId: number, password: string) => {
    await confirmFreelancerStep(stepId, password);
  };

  const inviteTicketRef = useRef<number | null>(null);
  const inviteDepositRef = useRef<number | null>(null);
  useEffect(() => {
    const [, queryString] = location.split("?");
    if (!queryString) return;
    const params = new URLSearchParams(queryString);
    const view = params.get("view");
    const ticketParam = params.get("ticket");
    const shouldDeposit =
      params.get("deposit") === "1" || params.get("pay") === "deposit";
    if (view !== "contract" || !ticketParam) return;
    const ticketId = Number(ticketParam);
    if (!Number.isFinite(ticketId) || ticketId <= 0) return;
    if (inviteTicketRef.current === ticketId) return;
    inviteTicketRef.current = ticketId;
    handleViewPdf(ticketId);
    if (shouldDeposit && inviteDepositRef.current !== ticketId) {
      inviteDepositRef.current = ticketId;
      void generateTicketDepositPayment(ticketId);
    }
  }, [location, handleViewPdf, generateTicketDepositPayment]);

  const signatureRequiresAck = signatureFlow
    ? signatureFlow.requireAck ?? (signatureFlow.type === 'contract')
    : true;
  const signatureAgreeHandler = signatureRequiresAck
    ? handleAgreeAndAskPassword
    : () => setShowPasswordField(true);

  const handleViewProfile = useCallback(async () => {
    if (!currentConversation?.otherUser) return;
    const target = currentConversation.otherUser as any;
    try {
      if (target.type === "prestador") {
        let providerId = target.provider_id;
        if (!providerId) {
          const res = await apiRequest("GET", `/providers/user/${target.id}`);
          if (res.ok) {
            const body = await res.json().catch(() => ({}));
            providerId =
              body?.provider?.provider_id ||
              body?.provider_id ||
              body?.id_provider;
          }
        }
        if (providerId) {
          setLocation(`/providers/${providerId}`);
          return;
        }
      }
      setLocation(`/user/${target.id}`);
    } catch {
      setLocation(`/user/${target.id}`);
    }
  }, [currentConversation?.otherUser, setLocation]);

  return (
    <MessagesLayout>
      <div className="flex p-0 md:p-4 bg-gray-100 h-[calc(100dvh-58px)]">
        <div className={`flex flex-col h-full w-full md:w-80 bg-white border-r border-gray-200 ${processedCurrentConversation ? 'hidden md:flex' : 'flex'}`}>
          <ConversationsSidebar
            conversations={processedConversations}
            currentConversation={processedCurrentConversation}
            loading={loadingConversations}
            conversationsError={conversationsError}
            unreadMessageCount={unreadMessageCount}
            onSelectConversation={handleConversationClick}
          />
        </div>

        <div className={`flex-1 flex-col overflow-hidden w-full ${!processedCurrentConversation ? 'hidden md:flex' : 'flex'}`}>
          {processedCurrentConversation ? (
            <>
              <ConversationHeader
                conversation={processedCurrentConversation}
                canCreateProposal={canCreateProposal()}
                onOpenProposal={() => setShowProposalModal(true)}
                onViewProfile={handleViewProfile}
                onBack={() => {
                  selectConversation(null as any); // hack to deselect
                  // Or navigate to /messages root if using router
                  setLocation('/messages');
                }}
              />
              <div className="flex-1 flex overflow-hidden">
                <ChatPanel
                  messages={processedMessages}
                  currentUserId={user?.id}
                  newMessage={newMessage}
                  sendingMessage={sendingMessage}
                  onMessageChange={setNewMessage}
                  onSendMessage={handleSendMessage}
                  messagesEndRef={messagesEndRef}
                />
                <ContractsPanel
                  tickets={tickets}
                  ticketStepsMap={ticketStepsMap}
                  loadingTickets={loadingTickets}
                  canCreateProposal={canCreateProposal()}
                  sortTicketsDesc={sortTicketsDesc}
                  onOpenOlderContracts={() => setShowOlderTickets(true)}
                  onViewProposalDetails={handleViewProposalDetails}
                  onViewPdf={handleViewPdf}
                  onStartSignature={handleStartSignature}
                  onRejectProposal={handleRejectContract}
                  onResumePayment={generateTicketDepositPayment}
                  currentUserType={user?.type}
                />
              </div>
            </>
          ) : (
            <EmptyConversationState />
          )}
        </div>
      </div>

      {/* ===== Modais ===== */}

      <NewProposalDialog
        open={showProposalModal}
        onOpenChange={setShowProposalModal}
        proposalSteps={proposalSteps}
        onAddStep={addProposalStep}
        onRemoveStep={removeProposalStep}
        onUpdateStep={updateProposalStep}
        onContractFileChange={handleContractFileChange}
        onSendProposal={handleSendProposal}
        sendingProposal={sendingProposal}
        paymentPreference={proposalPaymentPreference}
        onPaymentPreferenceChange={setProposalPaymentPreference}
        showToast={({ title, description, variant }) =>
          toast({ title, description, variant: variant ?? 'default' })
        }
      />

      <ProposalDetailsDialog
        open={showProposalDetails}
        onOpenChange={v => {
          setShowProposalDetails(v);
          if (!v) {
            setEditingStep(null);
            setEditStepData({ title: '', price: 0 });
          }
        }}
        steps={selectedTicketSteps}
        loading={loadingSteps}
        userType={user?.type as 'prestador' | 'contratante' | undefined}
        tickets={tickets}
        ticketStatus={
          selectedTicketSteps[0]
            ? tickets.find((t: any) => t.id === selectedTicketSteps[0].ticket_id)?.status
            : undefined
        }
        paymentPreference={
          (() => {
            const currentTicket = selectedTicketSteps[0]
              ? tickets.find((t: any) => t.id === selectedTicketSteps[0].ticket_id)
              : null;
            const pref =
              (currentTicket?.payment_preference as any) ||
              (currentTicket as any)?.paymentPreference ||
              providerPaymentPreference ||
              null;
            return pref;
          })()
        }
        ticketId={selectedTicketSteps[0]?.ticket_id}
        onDeleteTicket={handleDeleteTicket}
        deletingTicket={deletingTicket}
        onRefreshPayment={handleRefreshTicketPayment}
        onPayDeposit={generateTicketDepositPayment}
        onEditStep={step => handleEditStep(step)}
        onDeleteStep={id => handleDeleteStep(id)}
        editingStepId={editingStep}
        editStepData={editStepData}
        onEditStepDataChange={setEditStepData}
        onSaveStep={handleSaveStep}
        onCancelEdit={() => setEditingStep(null)}
        onMarkProviderCompleted={(id, ticketId) =>
          openFreelancerStepSignature(id, ticketId)
        }
        onStartPhase={handleStartPhase}
        onClientAccept={async (step, paymentPref) => {
          openClientStepSignature(step, paymentPref);
        }}

        onClientRejectStep={(step) => handleRejectStep(step)}
        onFeedbackCreated={handleFeedbackCreated}
        onPaySteps={handlePaySteps}
        onConfirmStepPayment={handleConfirmStepPayment}
        confirmingStepPaymentIds={confirmingStepPaymentIds}
        allowGroupedPayment={
          !!groupedPaymentEnabledByTicket[selectedTicketSteps[0]?.ticket_id ?? 0]
        }
        onToggleGroupedPayment={handleToggleGroupedPayment}
        payingStepId={payingStepId}
        currentIndex={(() => {
          const firstNotDone = selectedTicketSteps.findIndex(
            s => (s.status || '').toLowerCase() !== 'concluido',
          );
          return firstNotDone === -1
            ? Math.max(selectedTicketSteps.length - 1, 0)
            : firstNotDone;
        })()}
        onStartSignature={handleStartSignature}
        onOpenSignature={(ticketId: any) =>
          openContractSignatureDialog({ id: ticketId, status: 'pendente' })
        }
        onRejectContract={ticketId => handleRejectContract(ticketId)}
      />

      <OlderContractsDialog
        open={showOlderTickets}
        onOpenChange={setShowOlderTickets}
        tickets={tickets
          .slice()
          .sort(sortTicketsDesc)
          .slice(2)
          .map((t: any, i: number) => (
            <ProposalCard
              key={t.id ?? `ticket-old-${i}`}
              ticket={t}
              steps={ticketStepsMap[t.id] || []}
              currentUserType={user?.type}
              onViewDetails={handleViewProposalDetails}
              onViewPdf={handleViewPdf}
              onStartSignature={handleStartSignature}
              onResumePayment={generateTicketDepositPayment}
            />
          ))}
      />

      <SignatureDialog
        open={showSignatureModal}
        onOpenChange={handleSignatureModalChange}
        ackChecked={ackChecked}
        setAckChecked={setAckChecked}
        signaturePassword={signaturePassword}
        setSignaturePassword={setSignaturePassword}
        showPasswordField={showPasswordField}
        signingDocument={signingDocument}
        onAgree={signatureAgreeHandler}
        onConfirm={handleConfirmSignature}
        title={signatureFlow?.title}
        description={signatureFlow?.description}
        confirmLabel={signatureFlow?.confirmLabel}
        agreeLabel={signatureFlow?.agreeLabel}
        passwordPlaceholder={signatureFlow?.passwordPlaceholder}
        requireAck={signatureRequiresAck}
      />

      <GroupedPaymentDialog
        open={!!groupedPaymentDialog}
        onOpenChange={(open) => {
          if (!open) setGroupedPaymentDialog(null);
        }}
        steps={groupedPaymentDialog?.steps || []}
        data={groupedPaymentDialog?.data || null}
        method={groupedPaymentDialog?.method || lastPaymentMethod}
        loading={groupedPaymentDialog?.loading || false}
        onMethodChange={handleGroupedPaymentMethodChange}
        onGeneratePayment={handleGenerateGroupedPayment}
        onCopyCode={handleCopyPaymentCode}
      />

      <StepPaymentDialog
        dialog={paymentDialog}
        onOpenChange={(open) => {
          if (!open) setPaymentDialog(null);
        }}
        onChangeMethod={handleChangePaymentMethod}
        onGeneratePayment={handleGeneratePayment}
        onCopyPaymentCode={handleCopyPaymentCode}
      />

      <PdfViewerDialog
        open={showPdfViewer}
        onOpenChange={closePdfViewer}
        pdfUrl={pdfUrl}
        pdfBlob={pdfBlob}
        pdfFilename={pdfFilename}
        loading={loadingPdf}
        error={pdfError}
        onReload={() =>
          selectedTicketForPdf && handleViewPdf(selectedTicketForPdf)
        }
        onOpenNew={() => {
          if (pdfUrl) window.open(pdfUrl, '_blank', 'noopener,noreferrer');
        }}
        onDownload={downloadPdf}
        fullscreen={fullscreenPdf}
        setFullscreen={setFullscreenPdf}
      />
    </MessagesLayout>
  );
}
