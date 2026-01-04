
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
import {
  MessageCircle,
  QrCode,
  Copy,
  CreditCard,
  Banknote,
  Barcode,
  Loader2,
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { Step, CreateStepRequest } from '@/lib/Interfaces';
import { ConversationsSidebar } from '@/features/messages/components/ConversationsSidebar';
import { ConversationHeader } from '@/features/messages/components/ConversationHeader';
import { ChatPanel } from '@/features/messages/components/ChatPanel';
import { ContractsPanel } from '@/features/messages/components/ContractsPanel';
import { ProposalCard } from '@/features/messages/components/ProposalCard';
import { sortTicketsDesc } from '@/features/messages/utils';
import { formatPrice } from '@/lib/utils';
import { PdfViewerDialog } from '@/components/modals/PdfViewerDialog';
import { ProposalDetailsDialog } from '@/components/modals/ProposalDetailsDialog';
import { SignatureDialog } from '@/components/modals/SignatureDialog';
import { NewProposalDialog } from '@/components/modals/NewProposalDialog';
import { OlderContractsDialog } from '@/components/modals/OlderContractsDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type ProposalStep = {
  id: string;
  title: string;
  price: number;
  startDate?: string;
  endDate?: string;
};

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
  | ({ type: 'step-accept'; step: any; paymentPreference?: 'per_step' | 'at_end' | null } & SignatureDialogOverrides)
  | ({ type: 'proposal-first-step' } & SignatureDialogOverrides);

type ProposalStepPayload = Omit<CreateStepRequest, 'ticket_id'> & {
  startDate?: string;
  endDate?: string;
  start_date?: string;
  end_date?: string;
};

type PaymentMethod = 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'DEBIT_CARD';

type PaymentDialogState = {
  step: Step;
  type: 'step' | 'deposit';
  data: any | null;
  method: PaymentMethod;
  loading: boolean;
};

export default function Messages() {
  const [location, setLocation] = useLocation();
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

  // ---------- state ----------
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalSteps, setProposalSteps] = useState<ProposalStep[]>([
    { id: crypto.randomUUID(), title: '', price: 0 },
  ]);
  const [pendingProposalData, setPendingProposalData] = useState<{
    steps: ProposalStepPayload[];
    contractFile?: File | null;
  } | null>(null);
  const [sendingProposal, setSendingProposal] = useState(false);
  const [contractFile, setContractFile] = useState<File | null>(null);

  const [showProposalDetails, setShowProposalDetails] = useState(false);
  const [selectedTicketSteps, setSelectedTicketSteps] = useState<any[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [ticketStepsMap, setTicketStepsMap] = useState<Record<number, any[]>>({});
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [editStepData, setEditStepData] = useState({ title: '', price: 0 });

  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pdfFilename, setPdfFilename] = useState<string>('');
  const [selectedTicketForPdf, setSelectedTicketForPdf] = useState<number | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string>('');
  const [fullscreenPdf, setFullscreenPdf] = useState(false);
  const [deletingTicket, setDeletingTicket] = useState(false);

  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedTicketForSignature, setSelectedTicketForSignature] = useState<any>(null);
  const [signatureTicketPaymentPref, setSignatureTicketPaymentPref] = useState<"per_step" | "at_end" | null>(null);
  const [signaturePassword, setSignaturePassword] = useState('');
  const [ackChecked, setAckChecked] = useState(false);
  const [signingDocument, setSigningDocument] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [signatureFlow, setSignatureFlow] = useState<SignatureFlow | null>(null);

  const [showOlderTickets, setShowOlderTickets] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState<PaymentDialogState | null>(null);
  const [payingStepId, setPayingStepId] = useState<number | null>(null);
  const [lastPaymentMethod, setLastPaymentMethod] = useState<PaymentMethod>("PIX");
  const [providerPaymentPreference, setProviderPaymentPreference] = useState<"per_step" | "at_end">("per_step");
  const [providerPreferenceCache, setProviderPreferenceCache] = useState<Record<number, "per_step" | "at_end">>({});
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

  // ---------- efeitos ----------
  useEffect(() => {
    const loadPaymentPreference = async () => {
      if (user?.type !== "prestador") return;
      try {
        const res = await apiRequest("GET", `/providers/user/${user.id}`);
        if (res.ok) {
          const body = await res.json();
          const preference = body.provider?.payment_preference || "per_step";
          setProviderPaymentPreference(preference);
        }
      } catch (error) {
        console.error("Erro ao carregar preferência de pagamento:", error);
      }
    };
    loadPaymentPreference();
  }, [user?.id, user?.type]);

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
  const addProposalStep = () =>
    setProposalSteps(ps => [...ps, { id: crypto.randomUUID(), title: '', price: 0, startDate: '', endDate: '' }]);
  const removeProposalStep = (id: string) =>
    setProposalSteps(ps => ps.filter(s => s.id !== id));
  const updateProposalStep = (
    id: string,
    field: 'title' | 'price' | 'startDate' | 'endDate',
    value: string | number,
  ) =>
    setProposalSteps(ps =>
      ps.map(s => (s.id === id ? { ...s, [field]: value } : s)),
    );
  const handleContractFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || f.type !== 'application/pdf') {
      toast({
        title: 'Erro',
        description: 'Selecione um PDF válido.',
        variant: 'destructive',
      });
      return;
    }
    setContractFile(f);
  };

  const handleSendProposal = () => {
    if (!currentConversation || !user || !canCreateProposal()) return;
    if (!contractFile) {
      toast({
        title: 'Contrato obrigatório',
        description: 'Anexe o PDF do contrato para enviar a proposta.',
        variant: 'destructive',
      });
      return;
    }

    // Validação diferente baseada no tipo de pagamento
    let valid: ProposalStep[] = [];
    if (providerPaymentPreference === "per_step") {
      // Modo por etapa: cada etapa precisa de título e preço
      valid = proposalSteps.filter(s => s.title.trim() && s.price > 0);
    } else {
      // Modo conclusão: cada etapa precisa só de título, e pelo menos uma etapa precisa ter preço
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
    }));
    setPendingProposalData({
      steps: payloadSteps,
      contractFile,
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

  // Cliente REJEITA um step específico
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
    const icon = isProblem ? '🚨' : '📝';
    const contextLabel = isProblem ? 'problema relatado' : 'feedback adicionado';
    const messageContent = `${icon} Novo ${contextLabel} ${stepLabel}${titleLabel}: "${snippet}"`;
    void sendSystemMessage(messageContent);

    // se for problema, atualiza a lista de etapas para refletir rollback
    if (isProblem) {
      const ticketId =
        (step as any).ticket_id ??
        (step as any).ticketId ??
        selectedTicket?.id;

      // Atualização otimista local: libera o botão pro prestador refazer
      setSelectedTicketSteps((prev = []) =>
        prev.map((s: any) =>
          s.id === step.id
            ? {
                ...s,
                confirm_freelancer: false,
                confirm_contractor: false,
                status: 'Pendente',
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
        // Força a atualização do status para 'concluido' para garantir que o fluxo continue
        const statusUpdated = await updateStep(step.id, { status: 'concluido' });
        if (statusUpdated) {
          const updated = await getStepsWithPayment(step.ticket_id);
          setSelectedTicketSteps(updated);
          toast({
            title: 'Etapa aceita',
            description: 'Gere o pagamento para liberar a próxima etapa.',
          });
        }
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
    async (code?: string, label: string = 'Código copiado') => {
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code);
        toast({ title: label, description: 'Copiado para a área de transferência.' });
      } catch {
        toast({
          title: 'Não foi possível copiar',
          description: 'Copie manualmente o código exibido.',
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

  const requestPayment = useCallback(
    async (target: PaymentDialogState) => {
      const endpoint =
        target.type === "deposit"
          ? `/payments/tickets/${target.step.ticket_id}`
          : `/payments/steps/${target.step.id}`;

      const response = await apiRequest("POST", endpoint, {
        description:
          target.type === "deposit"
            ? `Depósito em garantia do ticket #${target.step.ticket_id}`
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
        throw new Error(payload?.message || "Não foi possível gerar o pagamento.");
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
      if ((ticket?.payment_preference || providerPaymentPreference) === "at_end") {
        toast({
          title: "Pagamento já em garantia",
          description: "Você já depositou o total na assinatura. Não é necessário pagar por etapa.",
        });
        return;
      }

      if (!step.confirm_freelancer) {
        toast({
          title: 'Aguardando prestador',
          description: 'O prestador precisa marcar a etapa como concluída antes do pagamento.',
          variant: 'warning',
        });
        return;
      }

      // Busca o usuário atualizado para checar CPF/CNPJ antes de gerar pagamento
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
    [openPaymentModal, toast, user]
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
          throw new Error(payload?.message || 'Não foi possível atualizar o pagamento.');
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
          throw new Error(body?.message || "Não foi possível verificar o pagamento.");
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
          title: "Pagamento não encontrado",
          description: error?.message || "Nenhum pagamento registrado ainda. Tente novamente mais tarde.",
          variant: "warning",
        });
      }
    },
    [getStepsForTicket, refetchTickets, toast]
  );

  // Polling rápido para atualizar pagamento enquanto o modal de detalhes estiver aberto
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
    }, 2_000);

    return () => clearInterval(interval);
  }, [showProposalDetails, selectedTicketSteps, getStepsWithPayment]);

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
      let pref = await getProviderPaymentPreference(ticket?.provider_id);

      if (!pref && currentConversation?.otherUser?.type === "prestador") {
        try {
          const res = await apiRequest("GET", `/providers/user/${currentConversation.otherUser.id}`);
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

      const stepsForTicket = ticketStepsMap[ticketId] || [];
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
    [currentConversation, getProviderPaymentPreference, openPaymentModal, providerPaymentPreference, ticketStepsMap, tickets, toast, user?.type]
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
      
      // Envia mensagem de sistema
      await sendSystemMessage(
        '❌ Proposta recusada. O prestador pode enviar uma nova proposta.',
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
    if (!ticket) return;
    resetSignatureDialogState();
    setSelectedTicketForSignature(ticket);
    setSignatureTicketPaymentPref(null);
    (async () => {
      const pref = await getProviderPaymentPreference(ticket?.provider_id);
      if (pref) setSignatureTicketPaymentPref(pref as any);
    })();
    setSignatureFlow({
      type: 'contract',
      ticket,
      title: 'Assinatura Digital',
      description: 'Confirme os termos e insira sua senha.',
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
    resetSignatureDialogState();
    setSignatureFlow({
      type: 'step-complete',
      stepId,
      ticketId,
      title: 'Concluir etapa',
      description: 'Confirme sua senha para concluir esta etapa.',
      confirmLabel: 'Concluir etapa',
      passwordPlaceholder: 'Digite sua senha',
      requireAck: false,
    });
    setSignaturePassword('');
    setAckChecked(true);
    setShowPasswordField(true);
    setShowSignatureModal(true);
  };

  const openClientStepSignature = (step: any, paymentPreference?: 'per_step' | 'at_end' | null) => {
    resetSignatureDialogState();
    setSignatureFlow({
      type: 'step-accept',
      step,
      paymentPreference,
      title: 'Aceitar etapa',
      description: 'Informe sua senha para aceitar esta etapa.',
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
    resetSignatureDialogState();
    setSignatureFlow({
      type: 'proposal-first-step',
      title: 'Confirmar envio',
      description: 'Informe sua senha para validar o contrato em PDF.',
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
          );
          if (!ok) return;
          setShowSignatureModal(false);
          resetSignatureDialogState();
          setPendingProposalData(null);
          setShowProposalModal(false);
          setProposalSteps([{ id: crypto.randomUUID(), title: '', price: 0 }]);
          setContractFile(null);
          return;
        } finally {
          setSendingProposal(false);
        }
      }

      if (signatureFlow.type === 'contract') {
        const ticketId = selectedTicketForSignature!.id as number;
        const ok = await signContract(ticketId, password, {
          setStatus: signatureTicketPaymentPref !== 'at_end',
        });
        if (!ok) return;

        toast({
          title: 'Documento assinado',
          description: 'O contrato foi assinado e registrado.',
        });
        setShowSignatureModal(false);
        resetSignatureDialogState();

        await generateTicketDepositPayment(ticketId);
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
        // Gera pagamento apenas para modelo por fase; em garantia não cobra por etapa
        if (signatureFlow.paymentPreference !== 'at_end') {
          await handleClientPayStep(signatureFlow.step as any);
        }
        setShowSignatureModal(false);
        resetSignatureDialogState();
      }
    } finally {
      setSigningDocument(false);
    }
  };

  // Prestador confirma etapa (usa senha)
  const handleConfirmStepCompletion = async (stepId: number, password: string) => {
    await confirmFreelancerStep(stepId, password);
  };

  // ---------- handlers: PDF ----------
  const handleViewPdf = async (ticketOrId: number | { id: number }) => {
    try {
      setLoadingPdf(true);
      setPdfError('');
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl('');
      }
      const ticketId = typeof ticketOrId === 'number' ? ticketOrId : ticketOrId?.id;
      if (!ticketId) throw new Error('Ticket inválido.');
      setSelectedTicketForPdf(ticketId);
      const res = await buscarPDF(ticketId);
      if (!res) throw new Error('PDF não encontrado para este ticket.');
      const { blob, blobUrl, filename } = res;
      setPdfBlob(blob);
      setPdfUrl(blobUrl);
      setPdfFilename(filename || `contrato-ticket-${ticketId}.pdf`);
      setShowPdfViewer(true);
      setFullscreenPdf(true);
    } catch (e: any) {
      setPdfError(e?.message || 'Falha ao carregar o PDF.');
      setShowPdfViewer(true);
    } finally {
      setLoadingPdf(false);
    }
  };
  const closePdfViewer = () => {
    setShowPdfViewer(false);
    setFullscreenPdf(false);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl('');
    setPdfBlob(null);
    setPdfFilename('');
    setSelectedTicketForPdf(null);
    setPdfError('');
  };
  const downloadPdf = () => {
    if (!pdfBlob || !selectedTicketForPdf) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = pdfFilename || `contrato-ticket-${selectedTicketForPdf}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

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
      <div className="flex p-4 bg-gray-100 h-[calc(100dvh-58px)]">
        <ConversationsSidebar
          conversations={conversations}
          currentConversation={currentConversation}
          loading={loadingConversations}
          conversationsError={conversationsError}
          unreadMessageCount={unreadMessageCount}
          onSelectConversation={handleConversationClick}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {currentConversation ? (
            <>
              <ConversationHeader
                conversation={currentConversation}
                canCreateProposal={canCreateProposal()}
                onOpenProposal={() => setShowProposalModal(true)}
                onViewProfile={handleViewProfile}
              />
              <div className="flex-1 flex overflow-hidden">
                <ChatPanel
                  messages={messages}
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
                  currentUserType={user?.type}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione uma conversa
                </h3>
                <p className="text-gray-600">
                  Escolha uma conversa da lista para começar a trocar mensagens
                </p>
              </div>
            </div>
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
        paymentPreference={providerPaymentPreference}
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
              (currentTicket?.payment ? 'at_end' : null) ||
              providerPaymentPreference ||
              null;
            return pref;
          })()
        }
        ticketId={selectedTicketSteps[0]?.ticket_id}
        onDeleteTicket={handleDeleteTicket}
        deletingTicket={deletingTicket}
        onRefreshPayment={handleRefreshTicketPayment}
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
        onClientPayStep={handleClientPayStep}
        onRefreshStepPayment={handleRefreshStepPayment}
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

      <Dialog
        open={!!paymentDialog}
        onOpenChange={(open) => {
          if (!open) setPaymentDialog(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {paymentDialog?.type === "deposit" ? "Depósito em garantia" : "Pagamento da etapa"}
              {paymentDialog?.step?.title ? ` - ${paymentDialog.step.title}` : ''}
            </DialogTitle>
            <DialogDescription>
              Escolha a forma de pagamento e gere a cobrança diretamente pelo Asaas.
            </DialogDescription>
          </DialogHeader>
          {paymentDialog && (
            <div className="space-y-4">
              <div className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Forma de pagamento</span>
                  {(() => {
                    const amountToShow = paymentDialog.data?.amount ?? paymentDialog.step?.price;
                    if (typeof amountToShow !== "number" || amountToShow <= 0) return null;
                    return (
                      <span className="text-gray-600">
                        Valor: {formatPrice(amountToShow || 0)}
                      </span>
                    );
                  })()}
                </div>
                <RadioGroup
                  value={paymentDialog.method}
                  onValueChange={(v) => handleChangePaymentMethod(v as PaymentMethod)}
                  className="grid gap-2 sm:grid-cols-2"
                >
                  {[
                    { value: "PIX", title: "PIX", description: "QR Code e copia e cola", icon: QrCode },
                    { value: "BOLETO", title: "Boleto", description: "Linha digitável e PDF", icon: Barcode },
                    { value: "CREDIT_CARD", title: "Crédito", description: "Checkout seguro Asaas", icon: CreditCard },
                    { value: "DEBIT_CARD", title: "Débito", description: "Checkout seguro Asaas", icon: Banknote },
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <label
                        key={option.value}
                        htmlFor={`payment-${option.value}`}
                        className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:border-orange-500"
                      >
                        <RadioGroupItem value={option.value} id={`payment-${option.value}`} />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-medium">
                            <Icon className="h-4 w-4 text-orange-600" />
                            {option.title}
                          </div>
                          <p className="text-xs text-gray-600">{option.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </RadioGroup>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={handleGeneratePayment}
                    disabled={paymentDialog.loading}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {paymentDialog.loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <QrCode className="mr-2 h-4 w-4" />
                    )}
                    {paymentDialog.data ? "Atualizar cobrança" : "Gerar cobrança"}
                  </Button>
                  {paymentDialog.data?.invoice_url && (
                    <Button asChild variant="outline">
                      <a
                        href={paymentDialog.data.invoice_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir no Asaas
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {(() => {
                const paymentData = paymentDialog.data;
                const activeMethod = (paymentData?.method as PaymentMethod) || paymentDialog.method;

                if (!paymentData) {
                  return (
                    <p className="text-sm text-gray-600">
                      Clique em &quot;Gerar cobrança&quot; para ver os dados de pagamento.
                    </p>
                  );
                }

                const pixData = paymentData?.pix;
                const boletoData = paymentData?.boleto;
                const checkoutUrl = paymentData?.checkout_url || paymentData?.invoice_url;

                if (activeMethod === "PIX") {
                  const enc = pixData?.qr_code_image;
                  const src = enc
                    ? enc.startsWith("data:image")
                      ? enc
                      : `data:image/png;base64,${enc}`
                    : null;
                  return (
                    <div className="space-y-3">
                      {src && (
                        <div className="flex flex-col items-center gap-2">
                          <img src={src} alt="QR Code PIX" className="w-44 h-44 object-contain" />
                          <span className="text-xs text-gray-500">Escaneie para pagar</span>
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium mb-1">Código copia e cola</p>
                        <div className="bg-gray-100 rounded-md p-2 text-xs break-all">
                          {pixData?.copy_and_paste || "Não disponível"}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyPaymentCode(pixData?.copy_and_paste, "Código PIX copiado")}
                            disabled={!pixData?.copy_and_paste}
                          >
                            <Copy className="h-3.5 w-3.5 mr-1" /> Copiar código
                          </Button>
                          {paymentData?.invoice_url && (
                            <Button asChild size="sm" variant="outline">
                              <a href={paymentData.invoice_url} target="_blank" rel="noreferrer">
                                <QrCode className="h-3.5 w-3.5 mr-1" /> Abrir no Asaas
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>

                      {pixData?.expires_at && (
                        <p className="text-xs text-gray-500">
                          Expira em {new Date(pixData.expires_at).toLocaleString("pt-BR")}
                        </p>
                      )}
                    </div>
                  );
                }

                if (activeMethod === "BOLETO") {
                  return (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Use a linha digitável ou abra o boleto para finalizar o pagamento.
                      </p>
                      <div className="bg-gray-100 rounded-md p-2 text-xs break-all">
                        {boletoData?.digitable_line || "Não disponível"}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyPaymentCode(boletoData?.digitable_line, "Linha digitável copiada")}
                          disabled={!boletoData?.digitable_line}
                        >
                          <Copy className="h-3.5 w-3.5 mr-1" /> Copiar código
                        </Button>
                        {(boletoData?.pdf_url || paymentData?.invoice_url) && (
                          <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700">
                            <a
                              href={boletoData?.pdf_url || paymentData?.invoice_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Barcode className="h-3.5 w-3.5 mr-1" /> Abrir boleto
                            </a>
                          </Button>
                        )}
                      </div>
                      {boletoData?.due_date && (
                        <p className="text-xs text-gray-500">
                          Vencimento em {new Date(boletoData.due_date).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Você será direcionado ao checkout seguro do Asaas para inserir os dados do cartão.
                    </p>
                    {checkoutUrl && (
                      <Button asChild className="bg-orange-600 hover:bg-orange-700">
                        <a href={checkoutUrl} target="_blank" rel="noreferrer">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Abrir checkout do cartão
                        </a>
                      </Button>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
