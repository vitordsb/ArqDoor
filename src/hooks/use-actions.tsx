import { useCallback } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface StepFeedback {
  id: number;
  step_id: number;
  comment: string;
  createdAt: string;
}

export function useStepFeedbackActions(idStep?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast(); //

  const { data: feedbackData, isLoading: isLoadingFeedback } = useQuery<StepFeedback[]>({
    queryKey: ['stepFeedback', idStep],
    queryFn: async () => {
      if (!idStep) return []; // Retorna array vazio se idStep não for fornecido
      const response = await apiRequest('GET', `/stepfeedback/${idStep}`); //
      if (!response.ok) {
        throw new Error('Erro ao buscar feedback da etapa');
      }
      const data = await response.json();
      console.log(data)
      return data.feedbacks || []; // Ajuste 'data.feedback' conforme a resposta da sua API
    },
    enabled: !!idStep, // Só executa a query se idStep tiver um valor
    staleTime: 5 * 60 * 1000, // Cache de 5 minutos
  });

  const createFeedbackMutation = useMutation({
    mutationFn: async ({ step_id, comment }: { step_id: number; comment: string }) => {
      const response = await apiRequest('POST', `/stepfeedback/${step_id}`, { comment }); //
      if (!response.ok) {
        // Tenta pegar a mensagem de erro da API, se disponível
        let errorMessage = 'Erro ao criar feedback';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Ignora erro ao parsear JSON, mantém a mensagem padrão
        }
        throw new Error(errorMessage);
      }
      const data = await response.json();
      console.log(data)
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalida a query de busca para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ['stepFeedback', variables.step_id] }); //
      toast({ //
        title: "Sucesso",
        description: "Feedback enviado!",
      });
    },
    onError: (error: Error) => {
      toast({ //
        title: "Erro",
        description: error.message || "Não foi possível enviar o feedback.",
        variant: "destructive",
      });
    },
  });

  // Função para chamar a criação de feedback
  const createStepFeedback = useCallback((step_id: number, comment: string) => {
    if (!comment?.trim()) {
      toast({ description: "O comentário não pode estar vazio.", variant: "destructive" }); //
      return;
    }
    createFeedbackMutation.mutate({ step_id, comment });
  }, [createFeedbackMutation, toast]); //

  return {
    feedbackData,
    isLoadingFeedback,
    createStepFeedback,
    isCreatingFeedback: createFeedbackMutation.isPending,
  };
}

