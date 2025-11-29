import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { stampPdfWithName } from '@/lib/stampPdfWithName';
import { API_BASE_URL } from '@/lib/queryClient';

export function useSignature(conversationId?: number) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendSystemMessage = useCallback(
    async (content: string, type: string = 'text', proposal_data?: any) => {
      if (!conversationId) return;
      try {
        const res = await apiRequest('POST', '/message', {
          conversation_id: conversationId,
          content,
          type,
          proposal_data,
        });
        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        } else {
          console.error(await res.text());
        }
      } catch (err) {
        console.error(err);
      }
    },
    [conversationId, queryClient]
  );

  const updateStep = useCallback(
    async (stepId: number, data: any) => {
      const res = await apiRequest('PATCH', `/step/${stepId}`, data);
      if (!res.ok) throw new Error(await res.text());
      queryClient.invalidateQueries({ queryKey: ['tickets', conversationId] });
      return true;
    },
    [conversationId, queryClient]
  );

  const updateTicketStatus = useCallback(
    async (ticketId: number, status: 'pendente' | 'em andamento' | 'concluída' | 'cancelada') => {
      const res = await apiRequest('PATCH', `/ticket/${ticketId}`, { status });
      if (!res.ok) throw new Error(await res.text());
      queryClient.invalidateQueries({ queryKey: ['tickets', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      return true;
    },
    [conversationId, queryClient]
  );

  // Upload de PDF
  const uploadPDF = useCallback(
    async (ticketId: number, file: File | Blob) => {
      const fd = new FormData();
      fd.append('file', file, (file as File).name || `ticket-${ticketId}.pdf`);
      const res = await apiRequest('POST', `/upload/pdf/${ticketId}`, fd);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      queryClient.invalidateQueries({ queryKey: ['tickets', conversationId] });
      toast({ title: 'Contrato enviado', description: 'Contrato PDF enviado com sucesso!' });
      return json;
    },
    [conversationId, queryClient, toast]
  );

  const buscarPDF = useCallback(async (ticketId: number) => {
    const listRes = await apiRequest('GET', `/attchment/ticket/${ticketId}`);
    if (!listRes.ok) throw new Error(await listRes.text());
    const listJson = await listRes.json();
    const attachments = listJson?.attachments || listJson?.attchments || [];
    if (!attachments.length) throw new Error('Nenhum PDF anexado a este ticket.');

    const chosen = attachments.sort(
      (a: any, b: any) =>
        new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    )[0];

    const pdfUrlAbs = chosen.pdf_path.startsWith('https')
      ? chosen.pdf_path
      : `${API_BASE_URL}/${chosen.pdf_path.replace(/^\/+/, '')}`;

    const token = sessionStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const fileRes = await fetch(pdfUrlAbs, {
      method: 'GET',
      headers,
    });
    if (!fileRes.ok) throw new Error(await fileRes.text());
    const blob = await fileRes.blob();
    const blobUrl = URL.createObjectURL(blob);

    return {
      blob,
      blobUrl,
      filename: `contrato-ticket-${ticketId}.pdf`,
    };
  }, []);

  const signContract = async (
    ticketId: number,
    password: string,
    opts?: { setStatus?: boolean }
  ) => {
    try {
      const res = await apiRequest('PATCH', `/attchment/ticket/${ticketId}`, {
        signature: true,
        password,
      });
      if (!res.ok) throw new Error(await res.text());

      try {
        const stepsRes = await apiRequest('GET', `/step/${ticketId}`);
        const stepsJson = await stepsRes.json();
        const steps = stepsJson.steps || [];
        if (steps.length > 0) {
          const step0 = steps[0];
          const status = (step0.status || '').toLowerCase();
          if (status !== 'concluido' || !step0.confirm_contractor) {
            await updateStep(step0.id, {
              status: 'Concluido',
              confirm_contractor: true,
            });
          }
        }
        if (opts?.setStatus ?? true) {
          await updateTicketStatus(ticketId, 'em andamento');
        }
      } catch (e) {
        console.warn('Assinou, mas falhou ao sincronizar step/ticket:', e);
      }

      try {
        const now = new Date();
        const pdf = await buscarPDF(ticketId);
        if (pdf && pdf.blob) {
          const role: 'cliente' | 'prestador' =
            user?.type === 'prestador' ? 'prestador' : 'cliente';

          const signedBlob = await stampPdfWithName(
            await pdf.blob.arrayBuffer(),
            user?.name || 'Cliente',
            {
              role,
              when: now,      // garante que a data/hora atual seja exibida
              page: 'all',    // garante assinatura em todas as páginas do documento
              watermarkText: `Assinado eletronicamente por ${user?.name || 'Cliente'} (${role})`,
            }
          );

          await uploadPDF(ticketId, signedBlob);
          await sendSystemMessage(
            `🖊️ Contrato do Ticket #${ticketId} assinado por ${user?.name || 'Cliente'} em ${now.toLocaleString('pt-BR')}.`,
            'text',
            { ticket_id: ticketId, action: 'contract_stamped' }
          );
        }
      } catch (e) {
        console.warn('Falhou ao carimbar/reanexar contrato:', e);
      }

      queryClient.invalidateQueries({ queryKey: ['tickets', conversationId] });
      return true;
    } catch (err: any) {
      console.error('❌ Erro ao assinar contrato:', err);
      toast({
        title: 'Erro na assinatura',
        description: err?.message || 'Senha inválida ou falha ao validar o contrato.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const signStepContract = async (stepId: number, password: string) => {
    try {
      const res = await apiRequest('PATCH', `/step/signature/${stepId}`, {
        signature: true,
        password,
      });
      if (!res.ok) throw new Error(await res.text());
      await updateStep(stepId, { status: 'Concluido' });

      // envia mensagem de sistema
      await sendSystemMessage(
        `✅ Cliente aceitou/assinou a etapa ${stepId}.`,
        'text',
        { step_id: stepId, action: 'client_signed' }
      );

      queryClient.invalidateQueries({ queryKey: ['tickets', conversationId] });
      return true;
    } catch (err: any) {
      console.error('❌ Erro ao assinar etapa:', err);
      toast({
        title: 'Erro',
        description: err?.message || 'Erro ao assinar etapa',
        variant: 'destructive',
      });
      return false;
    }
  };

  const acceptStep = useCallback(
    async (stepId: number, password: string) => {
      const ok = await signStepContract(stepId, password);
      if (ok) {
        try {
          const metaRes = await apiRequest('GET', `/step/meta/${stepId}`);
          const meta = await metaRes.json();
          const ticketId = meta.ticket_id;
          const stepsRes = await apiRequest('GET', `/step/${ticketId}`);
          const stepsJson = await stepsRes.json();
          const allDone = (stepsJson.steps || []).every(
            (s: any) => (s.status || '').toLowerCase() === 'concluido'
          );
          if (allDone) {
            await updateTicketStatus(ticketId, 'concluída');
            await sendSystemMessage(
              `🎉 Ticket #${ticketId} concluído! Todas as etapas foram finalizadas.`,
              'text',
              { ticket_id: ticketId, action: 'ticket_concluded' }
            );
          }
        } catch {
        }
      }
      return ok;
    },
    [signStepContract, updateTicketStatus, sendSystemMessage]
  );

  return { signContract, signStepContract, acceptStep, uploadPDF, buscarPDF };
}

export default useSignature;
