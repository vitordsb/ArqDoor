// src/pages/Messages.tsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useLocation, useParams } from 'wouter';
import { useMessaging } from '@/hooks/use-messaging';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessagesLayout from '@/components/layouts/MessagesLayout';
import { Send, Users, MessageCircle, FileText, CheckCircle, XCircle, Plus, Clock, Shield, Eye, Loader2, Maximize2, Download, Edit2, Trash2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { apiRequest } from '@/lib/queryClient';

// === Modais separados ===
import { PdfViewerDialog } from '@/components/modals/PdfViewerDialog';
import { ProposalDetailsDialog } from '@/components/modals/ProposalDetailsDialog';
import { SignatureDialog } from '@/components/modals/SignatureDialog';
import { NewProposalDialog } from '@/components/modals/NewProposalDialog';
import { OlderContractsDialog } from '@/components/modals/OlderContractsDialog';

type ProposalStep = { id: string; title: string; price: number };

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
    tickets,
    unreadMessageCount,
    loadingConversations,
    loadingTickets,
    sendingMessage,
    setNewMessage,
    sendMessage,
    selectConversation,
    conversationsError,
    acceptStep,
    rejectStep,
    createProposal,
    buscarPDF,
    getStepsForTicket,
    updateTicketStatus,
    updateStep,
    deleteStep,
    markStepCompleted,
    confirmStepCompletion,
    signDocument,
  } = useMessaging(initialPartnerId);

  // ---------- helpers/ordenadores ----------
  const sortTicketsDesc = (a: any, b: any) => {
    const aT = new Date(a?.updated_at || a?.created_at || 0).getTime();
    const bT = new Date(b?.updated_at || b?.created_at || 0).getTime();
    if (!isNaN(aT) && !isNaN(bT) && aT !== bT) return bT - aT;
    return (b?.id || 0) - (a?.id || 0);
  };
  const canCreateProposal = () => user?.type === 'prestador' && currentConversation?.otherUser.type !== 'prestador';
  const formatMessageTime = (d: string) => { try { return format(new Date(d), 'HH:mm', { locale: ptBR }); } catch { return ''; } };
  const formatConversationTime = (d: string) => {
    try {
      const date = new Date(d); const now = new Date();
      const diffH = (now.getTime() - date.getTime()) / 36e5;
      return diffH < 24 ? format(date, 'HH:mm', { locale: ptBR }) : format(date, 'dd/MM', { locale: ptBR });
    } catch { return ''; }
  };
  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const calculateProposalTotal = (steps: any[]) => steps.reduce((s, st) => s + (st.price || 0), 0);
  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  // ---------- status UI ----------
  const getStatusConfig = (status?: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'pendente') return { icon: Clock, label: 'Pendente', badgeClass: 'bg-orange-100 text-orange-800 border-orange-300', bg: 'bg-orange-50', border: 'border-orange-200', color: 'text-orange-700' };
    if (s === 'em andamento' || s === 'em_andamento') return { icon: Clock, label: 'Em Andamento', badgeClass: 'bg-blue-100 text-blue-800 border-blue-300', bg: 'bg-blue-50', border: 'border-blue-200', color: 'text-blue-700' };
    if (s === 'concluída' || s === 'concluida') return { icon: CheckCircle, label: 'Concluída', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300', bg: 'bg-emerald-50', border: 'border-emerald-200', color: 'text-emerald-700' };
    if (s === 'cancelada') return { icon: XCircle, label: 'Cancelada', badgeClass: 'bg-red-100 text-red-800 border-red-300', bg: 'bg-red-50', border: 'border-red-200', color: 'text-red-700' };
    return { icon: Clock, label: 'Pendente', badgeClass: 'bg-orange-100 text-orange-800 border-orange-300', bg: 'bg-orange-50', border: 'border-orange-200', color: 'text-orange-700' };
  };

  // ---------- state: proposta nova ----------
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalSteps, setProposalSteps] = useState<ProposalStep[]>([{ id: crypto.randomUUID(), title: '', price: 0 }]);
  const [sendingProposal, setSendingProposal] = useState(false);
  const [contractFile, setContractFile] = useState<File | null>(null);

  // ---------- state: detalhes de proposta / steps ----------
  const [showProposalDetails, setShowProposalDetails] = useState(false);
  const [selectedTicketSteps, setSelectedTicketSteps] = useState<any[]>([]);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [ticketStepsMap, setTicketStepsMap] = useState<Record<number, any[]>>({});
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [editStepData, setEditStepData] = useState({ title: '', price: 0 });

  // ---------- state: PDF viewer ----------
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [pdfFilename, setPdfFilename] = useState<string>('');
  const [selectedTicketForPdf, setSelectedTicketForPdf] = useState<number | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string>('');
  const [fullscreenPdf, setFullscreenPdf] = useState(false);

  // ---------- state: assinatura ----------
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedTicketForSignature, setSelectedTicketForSignature] = useState<any>(null);
  const [signaturePassword, setSignaturePassword] = useState('');
  const [ackChecked, setAckChecked] = useState(false);
  const [signingDocument, setSigningDocument] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);

  // ---------- state: outros ----------
  const [showOlderTickets, setShowOlderTickets] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ---------- efeitos ----------
  useEffect(() => {
    const loadAllTicketSteps = async () => {
      if (tickets.length === 0) return;
      const map: Record<number, any[]> = {};
      for (const t of tickets) {
        try { map[t.id] = await getStepsForTicket(t.id); } catch { map[t.id] = []; }
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
  const addProposalStep = () => setProposalSteps(ps => [...ps, { id: crypto.randomUUID(), title: '', price: 0 }]);
  const removeProposalStep = (id: string) => setProposalSteps(ps => ps.filter(s => s.id !== id));
  const updateProposalStep = (id: string, field: 'title' | 'price', value: string | number) =>
    setProposalSteps(ps => ps.map(s => s.id === id ? { ...s, [field]: value } : s));
  const handleContractFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || f.type !== 'application/pdf') {
      toast({ title: 'Erro', description: 'Selecione um PDF válido.', variant: 'destructive' });
      return;
    }
    setContractFile(f);
  };
  const handleSendProposal = async () => {
    if (!currentConversation || !user || !canCreateProposal()) return;
    const valid = proposalSteps.filter(s => s.title.trim() && s.price > 0);
    if (valid.length < 1) {
      toast({ title: 'Erro', description: 'Adicione pelo menos 1 etapa além da assinatura.', variant: 'destructive' });
      return;
    }
    setSendingProposal(true);
    try {
      const ok = await createProposal(valid, contractFile || undefined);
      if (ok) {
        setShowProposalModal(false);
        setProposalSteps([{ id: crypto.randomUUID(), title: '', price: 0 }]);
        setContractFile(null);
      }
    } finally {
      setSendingProposal(false);
    }
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
      toast({ title: 'Erro', description: e?.message || 'Não foi possível carregar os detalhes.', variant: 'destructive' });
    } finally {
      setLoadingSteps(false);
    }
  };
  const handleEditStep = (step: any) => { setEditingStep(step.id); setEditStepData({ title: step.title, price: step.price }); };
  const handleSaveStep = async () => {
    if (!editingStep) return;
    const ok = await updateStep(editingStep, { title: editStepData.title, price: editStepData.price });
    if (ok) {
      setEditingStep(null);
      const updated = await getStepsForTicket(selectedTicketSteps[0]?.ticket_id);
      setSelectedTicketSteps(updated);
    }
  };
  const handleDeleteStep = async (stepId: number) => {
    const ok = await deleteStep(stepId);
    if (ok) {
      const updated = await getStepsForTicket(selectedTicketSteps[0]?.ticket_id);
      setSelectedTicketSteps(updated);
    }
  };
  const handleMarkStepCompleted = async (stepId: number) => { await markStepCompleted(stepId); };
  const handleConfirmStepCompletion = async (stepId: number, ticketId: number) => { await confirmStepCompletion(stepId, ticketId); };

  // Cliente REJEITA um step específico
  const handleRejectStep = async (step: any) => {
    try {
      const ok = await updateStep(step.id, { status: 'rejected', client_confirmed: false });
      if (!ok) return;
      if (step.indexInTicket === 0 || step.isSignatureStep) await updateTicketStatus(step.ticket_id, 'cancelada');
      const updated = await getStepsForTicket(step.ticket_id);
      setSelectedTicketSteps(updated);
      toast({ title: 'Etapa recusada', description: 'Você recusou esta etapa.' });
    } catch (e: any) {
      toast({ title: 'Erro', description: e?.message || 'Não foi possível recusar a etapa.', variant: 'destructive' });
    }
  };
  // Cliente ACEITA step
  const handleAcceptStep = async (step: any) => {
    try {
      const ok = await updateStep(step.id, { client_confirmed: true, status: 'completed' });
      if (!ok) return;
      const steps = await getStepsForTicket(step.ticket_id);
      const idx = steps.findIndex((s: any) => s.id === step.id);
      const next = steps[idx + 1];
      if (next && !['in_progress', 'completed', 'rejected'].includes(next.status)) {
        await updateStep(next.id, { status: 'in_progress' });
      }
      const updated = await getStepsForTicket(step.ticket_id);
      setSelectedTicketSteps(updated);
      toast({ title: 'Etapa aceita', description: 'A próxima etapa foi iniciada.' });
    } catch (e: any) {
      toast({ title: 'Erro', description: e?.message || 'Não foi possível aceitar a etapa.', variant: 'destructive' });
    }
  };

  // ---------- handlers: recusar contrato (cancela ticket) ----------
  const handleRejectContract = async (ticketId: number) => {
    try {
      await updateTicketStatus(ticketId, 'cancelada');
      await apiRequest('DELETE', `/ticket/${ticketId}`);
      toast({ title: 'Contrato recusado', description: 'O contrato foi recusado e o ticket cancelado.' });
      setShowProposalDetails(false);
    } catch (e: any) {
      toast({ title: 'Erro', description: e?.message || 'Não foi possível recusar o contrato.', variant: 'destructive' });
    }
  };

  // ---------- handlers: assinatura ----------
  const handleStartSignature = (ticket: any) => {
    if (!ticket) return;
    if (['concluída', 'concluida'].includes((ticket.status || '').toLowerCase())) {
      toast({ title: 'Documento já assinado', description: 'Este documento já foi assinado.', variant: 'destructive' });
      return;
    }
    setSelectedTicketForSignature(ticket);
    setSignaturePassword('');
    setAckChecked(false);
    setShowPasswordField(false);
    setShowSignatureModal(true);
  };
  const handleAgreeAndAskPassword = () => {
    if (!ackChecked) {
      toast({ title: 'Confirmação necessária', description: 'Você deve concordar com os termos.', variant: 'destructive' });
      return;
    }
    setShowPasswordField(true);
  };
  const handleConfirmSignature = async () => {
    if (!selectedTicketForSignature) return;
    if (!ackChecked || !signaturePassword.trim()) {
      toast({ title: 'Dados faltando', description: 'Confirme os termos e digite sua senha.', variant: 'destructive' });
      return;
    }
    setSigningDocument(true);

    try {
      const ticketId = selectedTicketForSignature.id as number;

      // 🔐 chama signDocument (já ajustado para PATCH /ticket/signature/{id})
      const ok = await signDocument(ticketId, signaturePassword);
      if (!ok) return;

      // ✅ pós-assinatura: completa step 1 e inicia step 2
      try {
        const steps = await getStepsForTicket(ticketId);
        if (Array.isArray(steps) && steps.length > 0) {
          const first = steps[0];
          await updateStep(first.id, {
            status: 'completed',
            provider_completed: true,
            client_confirmed: true,
          });

          const next = steps[1];
          if (next && !['in_progress', 'completed', 'rejected'].includes(next.status)) {
            await updateStep(next.id, { status: 'in_progress' });
          }
        }
      } catch {
        /* noop */
      }

      toast({ title: 'Documento assinado', description: 'O contrato foi assinado e registrado.' });
      setShowSignatureModal(false);
      setSelectedTicketForSignature(null);
      setSignaturePassword('');
      setAckChecked(false);
      setShowPasswordField(false);

      await handleViewPdf(ticketId);
    } finally {
      setSigningDocument(false);
    }
  };
  // ---------- handlers: PDF ----------
  const handleViewPdf = async (ticketOrId: number | { id: number }) => {
    try {
      setLoadingPdf(true);
      setPdfError('');
      if (pdfUrl) { URL.revokeObjectURL(pdfUrl); setPdfUrl(''); }
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
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  // ---------- componentes internos ----------
  const ProposalCard = ({ ticket, steps, isLatest = false }: { ticket: any, steps: any[], isLatest?: boolean }) => {
    const total = calculateProposalTotal(steps);
    const cfg = getStatusConfig(ticket.status);
    const isSigned = ['concluída', 'concluida'].includes((ticket.status || '').toLowerCase());
    const canSign = user?.type === 'contratante' && (ticket.status || '').toLowerCase() === 'em andamento' && !isSigned;

    return (
      <div className={`group rounded-xl p-5 shadow-sm border transition-all duration-200 hover:shadow-md ${cfg.bg} ${cfg.border} ${isLatest ? 'ring-2 ring-orange-200' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white shadow-sm">
              <cfg.icon className={`h-5 w-5 ${cfg.color}`} />
            </div>
            <h3 className="font-semibold text-gray-900">Proposta #{ticket.id}</h3>
          </div>
          <Badge className={cfg.badgeClass}>{cfg.label}</Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{steps.length} etapas</span>
            <span className="text-lg font-bold text-gray-900">{formatCurrency(total)}</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => handleViewProposalDetails(ticket.id)} className="flex-1 min-w-[120px]">
              <Eye className="h-4 w-4 mr-2" /> Detalhes
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleViewPdf(ticket)} className="flex-1 min-w-[120px]">
              <FileText className="h-4 w-4 mr-2" /> Ver PDF
            </Button>
            {canSign && (
              <Button size="sm" onClick={() => handleStartSignature(ticket)} className="bg-purple-600 hover:bg-purple-700 text-white flex-1 min-w-[160px]">
                <Shield className="h-4 w-4 mr-2" /> Eu assino e confirmo os termos
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <MessagesLayout>
      <div className="flex p-4 bg-gray-100 h-[calc(100dvh-58px)]">
        {/* Sidebar conversas */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" /> Messages
              </h1>
              {unreadMessageCount > 0 && <Badge variant="destructive" className="ml-2">{unreadMessageCount}</Badge>}
            </div>
          </div>

          <ScrollArea className="flex-1">
            {loadingConversations ? (
              <div className="p-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Carregando conversas...</p>
              </div>
            ) : conversationsError ? (
              <div className="p-4 text-center"><p className="text-sm text-red-600">Erro ao carregar conversas</p></div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center">
                <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Nenhuma conversa encontrada</p>
              </div>
            ) : (
              <div className="p-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id ?? conversation.otherUser?.id ?? `conv-${conversation.id}`}
                    onClick={() => handleConversationClick(conversation)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${currentConversation?.id === conversation.id ? 'bg-orange-50 border border-orange-200' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-orange-100 text-orange-700">{getInitials(conversation.otherUser.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 truncate">{conversation.otherUser.name}</p>
                          <span className="text-xs text-gray-500">{formatConversationTime(conversation.updated_at)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600 truncate">{conversation.lastMessage?.content || 'Nenhuma mensagem'}</p>
                          <Badge variant={conversation.otherUser.type === 'prestador' ? 'default' : 'secondary'} className="text-xs">
                            {conversation.otherUser.type === 'prestador' ? 'Prestador' : 'Cliente'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {currentConversation ? (
            <>
              <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-orange-100 text-orange-700">{getInitials(currentConversation.otherUser.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold text-gray-900">{currentConversation.otherUser.name}</h2>
                    <Badge variant={currentConversation.otherUser.type === 'prestador' ? 'default' : 'secondary'} className="text-xs">
                      {currentConversation.otherUser.type === 'prestador' ? 'Prestador' : 'Cliente'}
                    </Badge>
                  </div>
                </div>
                {canCreateProposal() && (
                  <Button onClick={() => setShowProposalModal(true)} className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" /> Nova Proposta
                  </Button>
                )}
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Chat */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full p-4">
                      <div className="space-y-4">
                        {messages.map((m, idx) => (
                          <div key={m.id ?? m.tempId ?? `msg-${idx}`} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${m.sender_id === user?.id ? 'bg-orange-600 text-white' : 'bg-white border border-gray-200 text-gray-900'}`}>
                              <p className="text-sm">{m.content}</p>
                              <p className={`text-xs mt-1 ${m.sender_id === user?.id ? 'text-orange-100' : 'text-gray-500'}`}>{formatMessageTime(m.created_at)}</p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="p-4 bg-white border-t border-gray-200">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Digite sua mensagem..." className="flex-1" disabled={sendingMessage} />
                      <Button type="submit" disabled={!newMessage.trim() || sendingMessage} className="bg-orange-600 hover:bg-orange-700">
                        {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </form>
                  </div>
                </div>

                {/* Sidebar Propostas */}
                <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <FileText className="h-5 w-5" /> Propostas
                    </h3>
                  </div>

                  <ScrollArea className="flex-1 p-4">
                    {loadingTickets ? (
                      <div className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Carregando propostas...</p>
                      </div>
                    ) : tickets.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Nenhuma proposta ainda</p>
                        {canCreateProposal() && <p className="text-xs text-gray-500 mt-1">Crie uma proposta para começar</p>}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {tickets.slice().sort(sortTicketsDesc).slice(0, 2).map((ticket, index) => (
                          <ProposalCard
                            key={ticket.id ?? `ticket-${index}`}
                            ticket={ticket}
                            steps={ticketStepsMap[ticket.id] || []}
                            isLatest={index === 0}
                          />
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  {tickets.length > 2 && (
                    <div className="p-4 border-t border-gray-200">
                      <Button variant="outline" size="sm" onClick={() => setShowOlderTickets(true)}>Acessar outros contratos</Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione uma conversa</h3>
                <p className="text-gray-600">Escolha uma conversa da lista para começar a trocar mensagens</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== Modais (componentes separados) ===== */}

      {/* Nova Proposta */}
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
      />

      {/* 🚨 MODAL DE DETALHES — AGORA MONTADO */}
      <ProposalDetailsDialog
        open={showProposalDetails}
        onOpenChange={(v) => {
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
        onMarkProviderCompleted={(id) => handleMarkStepCompleted(id)}
        onClientAccept={(step) => acceptStep(step.id, step.ticket_id, step.indexInTicket)}
        onClientRejectStep={(step) => rejectStep(step.id, step.ticket_id, step.indexInTicket)}
        onEditStep={(step) => handleEditStep(step)}
        onDeleteStep={(id) => handleDeleteStep(id)}
        editingStepId={editingStep}
        editStepData={editStepData}
        onEditStepDataChange={setEditStepData}
        onSaveStep={handleSaveStep}
        onCancelEdit={() => setEditingStep(null)}
        onStartSignature={(ticket) => handleStartSignature(ticket)}
        onRejectContract={(ticketId) => handleRejectContract(ticketId)}
      />

      {/* Contratos anteriores */}
      <OlderContractsDialog
        open={showOlderTickets}
        onOpenChange={setShowOlderTickets}
        tickets={tickets.slice().sort(sortTicketsDesc).slice(2).map((t: any, i: number) => (
          <ProposalCard key={t.id ?? `ticket-old-${i}`} ticket={t} steps={ticketStepsMap[t.id] || []} />
        ))}
      />

      {/* Assinatura digital */}
      <SignatureDialog
        open={showSignatureModal}
        onOpenChange={setShowSignatureModal}
        ackChecked={ackChecked}
        setAckChecked={setAckChecked}
        signaturePassword={signaturePassword}
        setSignaturePassword={setSignaturePassword}
        showPasswordField={showPasswordField}
        setShowPasswordField={setShowPasswordField}
        signingDocument={signingDocument}
        onAgree={handleAgreeAndAskPassword}
        onConfirm={handleConfirmSignature}
      />

      {/* Visualizador de PDF */}
      <PdfViewerDialog
        open={showPdfViewer}
        onOpenChange={closePdfViewer}
        pdfUrl={pdfUrl}
        pdfBlob={pdfBlob}
        pdfFilename={pdfFilename}
        loading={loadingPdf}
        error={pdfError}
        onReload={() => selectedTicketForPdf && handleViewPdf(selectedTicketForPdf)}
        onOpenNew={() => { if (pdfUrl) window.open(pdfUrl, '_blank', 'noopener,noreferrer'); }}
        onDownload={downloadPdf}
        fullscreen={fullscreenPdf}
        setFullscreen={setFullscreenPdf}
      />
    </MessagesLayout>
  );
}

