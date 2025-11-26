
import React, { useEffect, useState, useRef, useCallback } from 'react';
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
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { Step, CreateStepRequest } from '@/lib/Interfaces';
import { ConversationsSidebar } from '@/features/messages/components/ConversationsSidebar';
import { ConversationHeader } from '@/features/messages/components/ConversationHeader';
import { ChatPanel } from '@/features/messages/components/ChatPanel';
import { ContractsPanel } from '@/features/messages/components/ContractsPanel';
import { ProposalCard } from '@/features/messages/components/ProposalCard';
import { sortTicketsDesc } from '@/features/messages/utils';

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
  | ({ type: 'step-accept'; step: any } & SignatureDialogOverrides)
  | ({ type: 'proposal-first-step' } & SignatureDialogOverrides);

type ProposalStepPayload = Omit<CreateStepRequest, 'ticket_id'> & {
  startDate?: string;
  endDate?: string;
  start_date?: string;
  end_date?: string;
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
    markStepCompleted,
    confirmFreelancerStep,
    rejectStep,
    sendSystemMessage,
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

  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedTicketForSignature, setSelectedTicketForSignature] = useState<any>(null);
  const [signaturePassword, setSignaturePassword] = useState('');
  const [ackChecked, setAckChecked] = useState(false);
  const [signingDocument, setSigningDocument] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [signatureFlow, setSignatureFlow] = useState<SignatureFlow | null>(null);

  const [showOlderTickets, setShowOlderTickets] = useState(false);
  const [stepPaymentInfo, setStepPaymentInfo] = useState<{ step: Step; data: any } | null>(null);
  const [payingStepId, setPayingStepId] = useState<number | null>(null);
  const [providerPaymentPreference, setProviderPaymentPreference] = useState<"per_step" | "at_end">("per_step");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
          description: 'Informe o valor total da proposta.',
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
      const steps = await getStepsForTicket(ticketId);
      setSelectedTicketSteps(Array.isArray(steps) ? steps : []);
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
  const handleEditStep = (step: any) => {
    if (!step) return;
    const isSignatureStep =
      step.title === SIGNATURE_STEP_TITLE ||
      (selectedTicketSteps[0] && selectedTicketSteps[0].id === step.id);
    if (isSignatureStep) {
      toast({
        title: "Etapa protegida",
        description: "A etapa de assinatura não pode ser editada.",
        variant: "destructive",
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
        variant: "destructive",
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
        variant: 'destructive',
      });
      return false;
    }
    try {
      const ok = await acceptStep(step.id, password);
      if (ok) {
        const updated = await getStepsForTicket(step.ticket_id);
        setSelectedTicketSteps(updated);
        toast({
          title: 'Etapa aceita',
          description: 'A próxima etapa foi iniciada.',
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

  const handleCopyPixCode = useCallback(
    async (code?: string) => {
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code);
        toast({ title: 'Código copiado', description: 'PIX copiado para a área de transferência.' });
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

      if (!step.confirm_freelancer) {
        toast({
          title: 'Aguardando prestador',
          description: 'O prestador precisa marcar a etapa como concluída antes do pagamento.',
          variant: 'destructive',
        });
        return;
      }

      try {
        setPayingStepId(step.id);
        const response = await apiRequest('POST', `/payments/steps/${step.id}`, {
          description: `Pagamento da etapa "${step.title}"`,
        });

        let payload: any = {};
        try {
          payload = await response.json();
        } catch {
          payload = {};
        }

        if (!response.ok || payload?.success === false) {
          throw new Error(payload?.message || 'Não foi possível gerar o pagamento.');
        }

        setStepPaymentInfo({ step, data: payload.data });
        toast({
          title: 'Pagamento gerado',
          description: 'Exibindo o QR Code e o código copia e cola.',
        });
      } catch (error: any) {
        toast({
          title: 'Erro ao gerar pagamento',
          description: error?.message || 'Tente novamente mais tarde.',
          variant: 'destructive',
        });
      } finally {
        setPayingStepId(null);
      }
    },
    [toast, user]
  );

  // ---------- handlers: recusar contrato ----------
  const handleRejectContract = async (ticketId: number) => {
    try {
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
  };

  const openContractSignatureDialog = (ticket: any) => {
    if (!ticket) return;
    resetSignatureDialogState();
    setSelectedTicketForSignature(ticket);
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

  const openClientStepSignature = (step: any) => {
    resetSignatureDialogState();
    setSignatureFlow({
      type: 'step-accept',
      step,
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
        const ok = await signContract(ticketId, password);
        if (!ok) return;

        toast({
          title: 'Documento assinado',
          description: 'O contrato foi assinado e registrado.',
        });
        setShowSignatureModal(false);
        resetSignatureDialogState();

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
        setShowSignatureModal(false);
        resetSignatureDialogState();
      }
    } finally {
      setSigningDocument(false);
    }
  };

  // Prestador confirma etapa (usa senha se sua API exigir)
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
        onClientAccept={async step => {
          openClientStepSignature(step);
        }}

        onClientRejectStep={(step) => handleRejectStep(step)}
        onFeedbackCreated={handleFeedbackCreated}
        onClientPayStep={handleClientPayStep}
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
        open={!!stepPaymentInfo}
        onOpenChange={(open) => {
          if (!open) setStepPaymentInfo(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Pagamento da etapa {stepPaymentInfo?.step?.title ? `- ${stepPaymentInfo.step.title}` : ''}
            </DialogTitle>
            <DialogDescription>
              Use o QR Code ou copie o código PIX para finalizar o pagamento desta etapa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {(() => {
              const enc = stepPaymentInfo?.data?.pix?.qr_code_image;
              if (!enc) return null;
              const src = enc.startsWith('data:image') ? enc : `data:image/png;base64,${enc}`;
              return (
                <div className="flex flex-col items-center gap-2">
                  <img src={src} alt="QR Code PIX" className="w-44 h-44 object-contain" />
                  <span className="text-xs text-gray-500">Escaneie para pagar</span>
                </div>
              );
            })()}

            <div>
              <p className="text-sm font-medium mb-1">Código copia e cola</p>
              <div className="bg-gray-100 rounded-md p-2 text-xs break-all">
                {stepPaymentInfo?.data?.pix?.copy_and_paste || 'Não disponível'}
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyPixCode(stepPaymentInfo?.data?.pix?.copy_and_paste)}
                  disabled={!stepPaymentInfo?.data?.pix?.copy_and_paste}
                >
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copiar código
                </Button>
                {stepPaymentInfo?.data?.invoice_url && (
                  <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700">
                    <a
                      href={stepPaymentInfo.data.invoice_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <QrCode className="h-3.5 w-3.5 mr-1" /> Abrir no Asaas
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {stepPaymentInfo?.data?.pix?.expires_at && (
              <p className="text-xs text-gray-500">
                Expira em{' '}
                {new Date(stepPaymentInfo.data.pix.expires_at).toLocaleString('pt-BR')}
              </p>
            )}
          </div>
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
