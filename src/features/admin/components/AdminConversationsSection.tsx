import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <div className="mt-2">
      <SectionCard title="Conversas">
        {conversations.length ? (
          <div className="divide-y divide-slate-100">
            {conversations.map((conversation) => (
              <button
                key={conversation.conversation_id}
                onClick={() => {
                  void onSelectConversation(conversation.conversation_id);
                  setDetailOpen(true);
                }}
                className="grid w-full grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-2 py-1.5 text-left transition hover:bg-slate-50"
              >
                <span className="font-mono text-[11px] text-slate-500 w-12">
                  #{conversation.conversation_id}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {conversation.participants.map((p) => p.name).join(" · ")}
                  </p>
                  <p className="truncate text-[11px] text-slate-500">
                    {conversation.last_message_preview || "Sem prévia"} · {conversation.message_count} msg
                  </p>
                </div>
                {conversation.is_admin_thread ? (
                  <StatusBadge label="Admin" tone="sky" />
                ) : conversation.is_negotiation ? (
                  <StatusBadge label="Negociação" tone="emerald" />
                ) : (
                  <StatusBadge label="Direta" tone="slate" />
                )}
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {formatDateTime(conversation.last_message_at)}
                </span>
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

      <Dialog open={detailOpen && !!selectedConversationRow} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-4 sm:p-5">
          <DialogHeader>
            <DialogTitle className="text-base">
              {selectedConversationRow
                ? `Conversa #${selectedConversationRow.conversation_id}`
                : "Conversa"}
            </DialogTitle>
          </DialogHeader>
          {selectedConversationRow ? (
            <div className="mt-1 space-y-3">
              {conversationViewerError ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {conversationViewerError}
                </div>
              ) : null}

              <div className="grid gap-2 sm:grid-cols-2">
                {(conversationViewer?.conversation.participants || selectedConversationRow.participants).map(
                  (participant) => (
                    <div
                      key={`${selectedConversationRow.conversation_id}-${participant.id}`}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">{participant.name}</p>
                          <p className="truncate text-[11px] text-slate-500">{participantSubtitle(participant)}</p>
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

              <div className="flex flex-wrap gap-1.5">
                {selectedConversationRow.is_admin_thread ? (
                  <StatusBadge label="Administrativa" tone="sky" />
                ) : selectedConversationRow.is_negotiation ? (
                  <StatusBadge label="Negociação" tone="emerald" />
                ) : (
                  <StatusBadge label="Direta" tone="slate" />
                )}
                <StatusBadge
                  label={`${selectedConversationRow.message_count} msg`}
                  tone="slate"
                />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50">
                <div className="border-b border-slate-200 px-3 py-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                    Mensagens
                  </p>
                </div>
                <div className="max-h-[55vh] space-y-2 overflow-y-auto px-3 py-3">
                  {loadingConversationViewer ? (
                    <p className="text-xs text-slate-500">Carregando mensagens…</p>
                  ) : paginatedConversationMessages.items.length ? (
                    paginatedConversationMessages.items.map((message) => {
                      const sender = (
                        conversationViewer?.conversation.participants || selectedConversationRow.participants
                      ).find((participant) => participant.id === message.sender_id) || null;

                      return (
                        <div
                          key={message.message_id}
                          className={cn(
                            "rounded-lg border px-2.5 py-1.5 text-sm",
                            sender?.is_admin
                              ? "ml-auto max-w-[88%] border-sky-200 bg-sky-50 text-sky-900"
                              : sender?.type === "prestador"
                                ? "mr-auto max-w-[88%] border-emerald-200 bg-emerald-50 text-emerald-900"
                                : "mr-auto max-w-[88%] border-slate-200 bg-white text-slate-700"
                          )}
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
                            {sender?.name || `Usuário ${message.sender_id}`}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap leading-5">{message.content}</p>
                          <p className="mt-1 text-[10px] opacity-60">{formatDateTime(message.createdAt)}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-500">Sem mensagens nessa conversa.</p>
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
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
