import type {
  AdminConversationRow,
  ClientPagination,
  ConversationViewer,
} from "../types";
import {
  cn,
  formatDateTime,
  participantRoleLabel,
  participantSubtitle,
  participantTone,
} from "../utils";
import { EmptyState, PaginationControls, SectionCard, StatusBadge } from "./AdminPrimitives";

type AdminConversationsSectionProps = {
  conversations: AdminConversationRow[];
  selectedConversationId: number | null;
  selectedConversationRow: AdminConversationRow | null;
  conversationViewer: ConversationViewer | null;
  loadingConversationViewer: boolean;
  conversationViewerError: string | null;
  paginatedConversationMessages: ClientPagination<any>;
  onSelectConversation: (conversationId: number) => void | Promise<void>;
  onPrevMessagesPage: () => void;
  onNextMessagesPage: () => void;
};

export function AdminConversationsSection({
  conversations,
  selectedConversationId,
  selectedConversationRow,
  conversationViewer,
  loadingConversationViewer,
  conversationViewerError,
  paginatedConversationMessages,
  onSelectConversation,
  onPrevMessagesPage,
  onNextMessagesPage,
}: AdminConversationsSectionProps) {
  return (
    <div className="mt-4 grid gap-3 xl:grid-cols-[340px_minmax(0,1fr)]">
      <SectionCard title="Threads" subtitle="Lista paginada da aba de conversas.">
        {conversations.length ? (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.conversation_id}
                onClick={() => void onSelectConversation(conversation.conversation_id)}
                className={cn(
                  "w-full rounded-2xl border px-3 py-3 text-left transition",
                  selectedConversationId === conversation.conversation_id
                    ? "border-slate-900 bg-slate-950 text-white"
                    : "border-slate-200 bg-slate-50 hover:bg-white"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">Conversa #{conversation.conversation_id}</p>
                    <p
                      className={cn(
                        "mt-1 truncate text-xs",
                        selectedConversationId === conversation.conversation_id
                          ? "text-slate-300"
                          : "text-slate-500"
                      )}
                    >
                      {conversation.participants.map((participant) => participant.name).join(" • ")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {conversation.is_admin_thread ? (
                      <StatusBadge label="Admin" tone="sky" />
                    ) : conversation.is_negotiation ? (
                      <StatusBadge label="Negociação" tone="emerald" />
                    ) : (
                      <StatusBadge label="Direta" tone="slate" />
                    )}
                  </div>
                </div>
                <p
                  className={cn(
                    "mt-2 line-clamp-2 text-xs",
                    selectedConversationId === conversation.conversation_id
                      ? "text-slate-200"
                      : "text-slate-500"
                  )}
                >
                  {conversation.last_message_preview || "Sem prévia recente."}
                </p>
                <div
                  className={cn(
                    "mt-2 flex flex-wrap gap-3 text-[11px]",
                    selectedConversationId === conversation.conversation_id
                      ? "text-slate-300"
                      : "text-slate-500"
                  )}
                >
                  <span>{conversation.message_count} mensagem(ns)</span>
                  <span>Atualizada em {formatDateTime(conversation.last_message_at)}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhuma conversa encontrada"
            description="Altere o filtro de conversa, cidade ou período para localizar uma thread."
          />
        )}
      </SectionCard>

      <SectionCard
        title={
          selectedConversationRow
            ? `Conversa #${selectedConversationRow.conversation_id}`
            : "Leitura de conversa"
        }
        subtitle={
          selectedConversationRow
            ? "Visualização interna da thread selecionada."
            : "Escolha uma conversa na lateral para abrir o histórico."
        }
      >
        {selectedConversationRow ? (
          <div className="space-y-4">
            {conversationViewerError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {conversationViewerError}
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              {(conversationViewer?.conversation.participants || selectedConversationRow.participants).map(
                (participant) => (
                  <div
                    key={`${selectedConversationRow.conversation_id}-${participant.id}`}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{participant.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{participantSubtitle(participant)}</p>
                      </div>
                      <StatusBadge
                        label={participantRoleLabel(participant)}
                        tone={participantTone(participant)}
                      />
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedConversationRow.is_admin_thread ? (
                <StatusBadge label="Thread administrativa" tone="sky" />
              ) : selectedConversationRow.is_negotiation ? (
                <StatusBadge label="Negociação comercial" tone="emerald" />
              ) : (
                <StatusBadge label="Thread direta" tone="slate" />
              )}
              <StatusBadge
                label={`${selectedConversationRow.message_count} mensagem(ns)`}
                tone="slate"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50">
              <div className="border-b border-slate-200 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">Mensagens</p>
              </div>
              <div className="max-h-[420px] space-y-2 overflow-y-auto px-4 py-4">
                {loadingConversationViewer ? (
                  <p className="text-sm text-slate-500">Carregando mensagens...</p>
                ) : paginatedConversationMessages.items.length ? (
                  paginatedConversationMessages.items.map((message) => {
                    const sender = (
                      conversationViewer?.conversation.participants || selectedConversationRow.participants
                    ).find((participant) => participant.id === message.sender_id) || null;

                    return (
                      <div
                        key={message.message_id}
                        className={cn(
                          "rounded-2xl border px-3 py-2 text-sm",
                          sender?.is_admin
                            ? "ml-auto max-w-[88%] border-sky-200 bg-sky-50 text-sky-900"
                            : sender?.type === "prestador"
                              ? "mr-auto max-w-[88%] border-emerald-200 bg-emerald-50 text-emerald-900"
                              : "mr-auto max-w-[88%] border-slate-200 bg-white text-slate-700"
                        )}
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
                          {sender?.name || `Usuário ${message.sender_id}`}
                        </p>
                        <p className="mt-2 whitespace-pre-wrap leading-6">{message.content}</p>
                        <p className="mt-2 text-[11px] opacity-70">{formatDateTime(message.createdAt)}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-500">Sem mensagens nessa conversa.</p>
                )}
              </div>
            </div>

            <PaginationControls
              page={paginatedConversationMessages.page}
              totalPages={paginatedConversationMessages.totalPages}
              onPrevious={onPrevMessagesPage}
              onNext={onNextMessagesPage}
            />
          </div>
        ) : (
          <EmptyState
            title="Selecione uma thread"
            description="Assim que você escolher uma conversa, o painel mostra participantes, tipo de thread e o histórico completo."
          />
        )}
      </SectionCard>
    </div>
  );
}
