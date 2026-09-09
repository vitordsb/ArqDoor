import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { API_BASE_URL } from '@/lib/queryClient';
import { findSignatureContractStep } from '@/constants/contracts';

export function useSignature(conversationId?: number) {
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

    const downloadPath =
      chosen.download_url || `/attchment/file/${chosen.id}`;

    const pdfUrlAbs = downloadPath.startsWith('http')
      ? downloadPath
      : `${API_BASE_URL}/${downloadPath.replace(/^\/+/, '')}`;

    const fileRes = await fetch(pdfUrlAbs, {
      method: 'GET',
      credentials: 'include',
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
    opts?: { setStatus?: boolean; signatureMethod?: 'google' }
  ) => {
    try {
      /**
       * `signatureMethod: 'google'` assina pela própria sessão, sem senha: conta criada
       * pelo Google nasce com senha aleatória que o usuário nunca vê. O servidor confere
       * o `provider` no banco e recusa conta local que tente este caminho.
       */
      const res = await apiRequest('PATCH', `/attchment/ticket/${ticketId}`, {
        signature: true,
        ...(opts?.signatureMethod
          ? { signature_method: opts.signatureMethod }
          : { password }),
      });
      if (!res.ok) throw new Error(await res.text());

      try {
        const stepsRes = await apiRequest('GET', `/tickets/${ticketId}/steps`);
        if (!stepsRes.ok) throw new Error("Falha ao buscar etapas para sincronizar assinatura.");
        const stepsJson = await stepsRes.json();

        // Lógica robusta para extrair as etapas, similar ao useContract
        let steps = stepsJson.steps || stepsJson.data || (Array.isArray(stepsJson) ? stepsJson : []);
        if (!Array.isArray(steps) && steps && typeof steps === 'object') {
          if (Array.isArray(steps.steps)) steps = steps.steps;
          else if (Array.isArray(steps.data)) steps = steps.data;
        }
        if (!Array.isArray(steps)) steps = [];

        if (steps.length > 0) {
          const signatureStep = findSignatureContractStep<any>(steps);
          const status = (signatureStep?.status || '').toLowerCase();
          if (signatureStep && (status !== 'concluido' || !signatureStep.confirm_contractor)) {
            await updateStep(signatureStep.id, {
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

      /**
       * Quem carimba o contrato e o SERVIDOR, nao o navegador.
       *
       * Aqui existia um bloco que baixava o PDF, carimbava no cliente com
       * `stampPdfWithName` e reenviava como anexo novo. Tres problemas:
       *   1. A prova da assinatura era produzida na maquina de quem assina.
       *   2. O reenvio criava um SEGUNDO anexo. Como a tela mostra o mais recente e o
       *      backend marcava o mais antigo como assinado, o documento exibido nao era o
       *      documento assinado. Aconteceu em 5 contratos de producao.
       *   3. A falha caia num `console.warn`: carimbo que nao rolava ainda mostrava
       *      "assinado" na tela.
       * Desde 09/09/2026 `PATCH /attchment/ticket/:id` gera o PDF assinado no servidor,
       * com rodape, pagina de declaracao e hash que cobre o conteudo do documento.
       */
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

  const signStepContract = async (stepId: number, password: string, signatureMethod?: 'google') => {
    try {
      const res = await apiRequest('PATCH', `/step/signature/${stepId}`, {
        signature: true,
        ...(signatureMethod ? { signature_method: signatureMethod } : { password }),
      });
      if (!res.ok) throw new Error(await res.text());
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
    async (stepId: number, password: string, signatureMethod?: 'google') => {
      const ok = await signStepContract(stepId, password, signatureMethod);
      if (ok) {
        await sendSystemMessage(
          `✅ Cliente aceitou/assinou a etapa ${stepId}.`,
          'text',
          { step_id: stepId, action: 'client_signed' }
        );
        queryClient.invalidateQueries({ queryKey: ['tickets', conversationId] });
      }
      return ok;
    },
    [signStepContract, sendSystemMessage, queryClient, conversationId]
  );

  return { signContract, signStepContract, acceptStep, buscarPDF };
}

export default useSignature;
