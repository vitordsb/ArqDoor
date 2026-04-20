import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export interface KanbanOtherUser {
  id: number;
  name: string;
  type: "prestador" | "contratante";
  perfil: string | null;
}

export interface KanbanContract {
  ticket_id: number;
  ticket_status: string;
  conversation_id: number;
  payment_preference: string | null;
  created_at: string;
  updated_at: string;
  other_user: KanbanOtherUser | null;
}

export interface KanbanStep extends KanbanContract {
  step_id: number;
  step_title: string;
  step_price: number;
  step_status: string;
  is_financially_cleared: boolean;
  started_at: string | null;
}

export interface KanbanData {
  pendingContracts: KanbanContract[];
  stepsInProgress: KanbanStep[];
  completedSteps: KanbanStep[];
  pendingPayments: KanbanStep[];
  completedPayments: KanbanStep[];
}

export function useKanban() {
  const { isLoggedIn } = useAuth();

  const { data, isLoading, error, refetch } = useQuery<KanbanData>({
    queryKey: ["kanban"],
    enabled: isLoggedIn,
    staleTime: 10_000,
    refetchInterval: 30_000,
    queryFn: async () => {
      const res = await apiRequest("GET", "/kanban");
      if (!res.ok) throw new Error(`Erro ao buscar Kanban: ${res.status}`);
      const json = await res.json();
      return json.kanban as KanbanData;
    },
  });

  return {
    kanban: data ?? {
      pendingContracts: [],
      stepsInProgress: [],
      completedSteps: [],
      pendingPayments: [],
      completedPayments: [],
    },
    isLoading,
    error,
    refetch,
  };
}
