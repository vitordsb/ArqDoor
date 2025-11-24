import { useCallback } from 'react';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { decodeFeedbackComment, encodeFeedbackComment } from '@/lib/feedback';

interface StepFeedback {
  id: number;
  step_id: number;
  comment: string;
  createdAt: string;
  type?: 'feedback' | 'issue';
  isProblem?: boolean;
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
      const feedbacks = data.feedbacks || [];
      return feedbacks.map((feedback: StepFeedback) => {
        const isProblemApi = feedback.type === 'issue';
        const { comment, isProblem } = decodeFeedbackComment(feedback.comment);
        return {
          ...feedback,
          comment,
          isProblem: isProblemApi || isProblem,
        };
      });
    },
    enabled: !!idStep, // Só executa a query se idStep tiver um valor
    staleTime: 5 * 60 * 1000, // Cache de 5 minutos
  });

  const createFeedbackMutation = useMutation({
    mutationFn: async ({ step_id, comment, isProblem }: { step_id: number; comment: string; isProblem?: boolean }) => {
      const encodedComment = encodeFeedbackComment(comment, isProblem);
      const response = await apiRequest('POST', `/stepfeedback/${step_id}`, {
        comment: encodedComment,
        type: isProblem ? 'issue' : 'feedback',
      }); //
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
      return { data, isProblem };
    },
    onSuccess: (_, variables) => {
      // Invalida a query de busca para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ['stepFeedback', variables.step_id] }); //
      toast({ //
        title: "Sucesso",
        description: variables.isProblem ? "Problema relatado!" : "Feedback enviado!",
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
  const createStepFeedback = useCallback(async (step_id: number, comment: string, options?: { isProblem?: boolean }) => {
    if (!comment?.trim()) {
      toast({ description: "O comentário não pode estar vazio.", variant: "destructive" }); //
      return false;
    }
    try {
      await createFeedbackMutation.mutateAsync({ step_id, comment: comment.trim(), isProblem: options?.isProblem });
      return true;
    } catch (error) {
      return false;
    }
  }, [createFeedbackMutation, toast]); //

  return {
    feedbackData,
    isLoadingFeedback,
    createStepFeedback,
    isCreatingFeedback: createFeedbackMutation.isPending,
  };
}
