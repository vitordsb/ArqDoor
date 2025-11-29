import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Conversation,
  Message,
  CreateMessageRequest,
  CreateConversationRequest,
} from "@/lib/Interfaces";
import { useContract } from "./use-contract";

export function useMessaging(initialPartnerId?: string | null) {
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);

  const {
    data: conversationsData,
    isLoading: loadingConversations,
    error: conversationsError,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ["conversations"],
    enabled: isLoggedIn && !!user,
    staleTime: 5_000,
    refetchInterval: 10_000,
    queryFn: async () => {
      const response = await apiRequest("GET", "/conversation");
      if (!response.ok) throw new Error("Erro ao buscar conversas");
      const data = await response.json();
      return data;
    },
  });

  const userIds = useMemo(() => {
    if (!conversationsData?.conversations || !user) return [];
    return conversationsData.conversations.map((conv: any) =>
      conv.user1_id === user.id ? conv.user2_id : conv.user1_id
    );
  }, [conversationsData, user]);

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ["users", userIds],
    enabled: userIds.length > 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      if (userIds.length === 0) return {};
      const userPromises = userIds.map(async (userId: number) => {
        try {
          const response = await apiRequest("GET", `/users/${userId}`);
          if (!response.ok) return { id: userId, data: null };
          const data = await response.json();
          return { id: userId, data: data.user };
        } catch {
          return { id: userId, data: null };
        }
      });
      const results = await Promise.all(userPromises);
      const usersMap: Record<number, any> = {};
      results.forEach(({ id, data }) => {
        usersMap[id] =
          data || ({
            id,
            name: "Usuário",
            email: "",
            type: "contratante" as const,
          } as any);
      });
      return usersMap;
    },
  });

  const conversations: Conversation[] = useMemo(() => {
    if (!conversationsData?.conversations || !user || !usersData) return [];
    return conversationsData.conversations
      .map((conv: any) => {
        const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
        const otherUser = usersData[otherUserId];
        const processed: Conversation = {
          id: conv.conversation_id,
          user1_id: conv.user1_id,
          user2_id: conv.user2_id,
          isNegotiation: true,
          created_at: conv.createdAt,
          updated_at: conv.updatedAt,
          otherUser:
            otherUser ||
            ({
              id: otherUserId,
              name: "Usuário",
              email: "",
              type: "contratante" as const,
            } as any),
          unreadCount: 0,
        };
        if (!processed.id || typeof processed.id !== "number") return null;
        return processed;
      })
      .filter(Boolean) as Conversation[];
  }, [conversationsData, user, usersData]);

  const {
    data: messages = [],
    isLoading: loadingMessages,
    error: messagesError,
  } = useQuery<Message[]>({
    queryKey: ["messages", currentConversation?.id],
    enabled: !!currentConversation?.id && isLoggedIn,
    staleTime: 1_000,
    refetchInterval: 1_000,
    queryFn: async () => {
      if (!currentConversation?.id) return [];
      const response = await apiRequest("GET", `/message/conversation/${currentConversation.id}`);
      if (!response.ok) throw new Error(`Erro ao buscar mensagens: ${response.status}`);
      const data = await response.json();
      const processed = (data.messages || []).map((msg: any) => {
        if (msg.content?.includes("📋") && msg.content?.includes("**") && msg.content?.includes("Total:")) {
          return { ...msg, type: "proposal" };
        }
        return { ...msg, type: "text" };
      });
      return processed;
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: CreateMessageRequest) => {
      const response = await apiRequest("POST", "/message", {
        conversation_id: data.conversation_id,
        content: data.content.trim(),
        type: data.type || "text",
        proposal_data: data.proposal_data,
      });
      if (!response.ok) throw new Error(`Erro ao enviar mensagem: ${response.status}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", currentConversation?.id] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setNewMessage("");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const sendMessage = useCallback(async () => {
    if (!currentConversation || !newMessage.trim()) return;
    await sendMessageMutation.mutateAsync({
      conversation_id: currentConversation.id,
      content: newMessage.trim(),
      type: "text",
    });
  }, [currentConversation, newMessage, sendMessageMutation]);

  const selectConversation = useCallback((conversation: Conversation) => {
    if (!conversation || !conversation.id || typeof conversation.id !== "number") return;
    setCurrentConversation(conversation);
  }, []);

  const createConversationMutation = useMutation({
    mutationFn: async (data: CreateConversationRequest) => {
      const response = await apiRequest("POST", "/conversation", data);
      if (!response.ok) throw new Error(`Erro ao criar conversa: ${response.status}`);
      return await response.json();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setTimeout(async () => {
        await refetchConversations();
      }, 500);
    },
  });

  const startConversation = useCallback(
    async (targetUserId: number) => {
      if (!user || !isLoggedIn) {
        toast({
          title: "Login necessário",
          description: "Você precisa estar logado para iniciar uma conversa.",
          variant: "destructive",
        });
        return false;
      }
      if (isInitializing) return false;

      try {
        setIsInitializing(true);
        const existing = conversations.find((c) => c.otherUser.id === targetUserId);
        if (existing) {
          setCurrentConversation(existing);
          return true;
        }
        await createConversationMutation.mutateAsync({
          user1_id: user.id,
          user2_id: targetUserId,
        });
        return true;
      } catch (err) {
        console.error("❌ Erro ao iniciar conversa:", err);
        return false;
      } finally {
        setIsInitializing(false);
      }
    },
    [user, isLoggedIn, isInitializing, conversations, createConversationMutation, toast]
  );

  const startConversationAndNavigate = useCallback(
    async (targetUserId: number, setLocation: (path: string) => void) => {
      const ok = await startConversation(targetUserId);
      if (ok) setLocation(`/messages/${targetUserId}`);
    },
    [startConversation]
  );

  useEffect(() => {
    if (loadingConversations || loadingUsers || isInitializing) return;

    if (initialPartnerId) {
      const targetId = parseInt(initialPartnerId);
      const found = conversations.find((c) => c.otherUser.id === targetId);
      if (found) {
        setCurrentConversation(found);
      } else if (!isInitializing) {
        startConversation(targetId);
      }
    } else if (!currentConversation && conversations.length > 0) {
      const mostRecent = conversations
        .slice()
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
      if (mostRecent) setCurrentConversation(mostRecent);
    }
  }, [
    initialPartnerId,
    conversations,
    currentConversation,
    loadingConversations,
    loadingUsers,
    isInitializing,
    startConversation,
  ]);

  useEffect(() => {
    if (initialPartnerId && !loadingConversations && !loadingUsers && conversations.length > 0) {
      const targetId = parseInt(initialPartnerId);
      const nextConv = conversations.find((c) => c.otherUser.id === targetId);
      if (nextConv && (!currentConversation || currentConversation.id !== nextConv.id)) {
        setCurrentConversation(nextConv);
      }
    }
  }, [conversations, initialPartnerId, currentConversation, loadingConversations, loadingUsers]);

  const contract = useContract(currentConversation?.id);

  return {
    conversations,
    currentConversation,
    messages,
    newMessage,
    tickets: contract.tickets,
    unreadMessageCount: 0,
    loadingConversations,
    loadingMessages,
    loadingTickets: contract.loadingTickets,
    sendingMessage: (sendMessageMutation as any).isPending,
    setNewMessage,
    sendMessage,
    selectConversation,
    startConversation,
    startConversationAndNavigate,
    createProposal: contract.createProposal,
    getStepsForTicket: contract.getStepsForTicket,
    getActiveTicket: contract.getActiveTicket,
    updateTicketStatus: contract.updateTicketStatus,
    updateStep: contract.updateStep,
    markStepCompleted: contract.markStepCompleted,
    confirmStepCompletion: contract.confirmStepCompletion,
    conversationsError,
    messagesError,
  };
}

export default useMessaging;
