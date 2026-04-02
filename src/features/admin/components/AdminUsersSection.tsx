import type {
  AdminDirectConversation,
  AdminOperationalConversation,
  AdminOperationalStep,
  AdminOperationalTicket,
  AdminUserOperationsOverview,
  AdminUserRow,
  ClientPagination,
  UserDetailTab,
} from "../types";
import {
  formatCurrency,
  formatDateTime,
  participantRoleLabel,
  participantSubtitle,
  participantTone,
  paymentBucketTone,
  receivingMethodLabel,
  stepPaymentLabel,
  stepStatusTone,
  cn,
} from "../utils";
import { EmptyState, PaginationControls, SectionCard, StatusBadge } from "./AdminPrimitives";
import { SendHorizontal } from "lucide-react";

type AdminUsersSectionProps = {
  users: AdminUserRow[];
  selectedUserId: number | null;
  selectedUser: AdminUserRow | null;
  onSelectUser: (userId: number) => void | Promise<void>;
  detailTab: UserDetailTab;
  onDetailTabChange: (tab: UserDetailTab) => void;
  operationsOverview: AdminUserOperationsOverview | null;
  loadingOperationsOverview: boolean;
  operationsOverviewError: string | null;
  selectedOperationsConversationId: number | null;
  onSelectOperationsConversation: (conversationId: number) => void;
  selectedOperationsTicketId: number | null;
  onSelectOperationsTicket: (ticketId: number) => void;
  paginatedUserConversations: ClientPagination<AdminOperationalConversation>;
  paginatedUserContracts: ClientPagination<AdminOperationalTicket>;
  paginatedUserSteps: ClientPagination<AdminOperationalStep & { ticket_id: number; ticket_status: string; provider_receiving_method: string; }>;
  onPrevUserConversationsPage: () => void;
  onNextUserConversationsPage: () => void;
  onPrevUserContractsPage: () => void;
  onNextUserContractsPage: () => void;
  onPrevUserStepsPage: () => void;
  onNextUserStepsPage: () => void;
  directConversation: AdminDirectConversation | null;
  loadingDirectConversation: boolean;
  directConversationError: string | null;
  paginatedAdminMessages: ClientPagination<any>;
  onPrevAdminMessagesPage: () => void;
  onNextAdminMessagesPage: () => void;
  messageDraft: string;
  onMessageDraftChange: (value: string) => void;
  sendingMessage: boolean;
  adminMessageError: string | null;
  onSendAdminMessage: () => void | Promise<void>;
};

const USER_DETAIL_TABS: Array<{ key: UserDetailTab; label: string }> = [
  { key: "perfil", label: "Perfil" },
  { key: "conversas", label: "Conversas" },
  { key: "contratos", label: "Contratos" },
  { key: "etapas", label: "Etapas" },
  { key: "atendimento", label: "Atendimento" },
];

export function AdminUsersSection({
  users,
  selectedUserId,
  selectedUser,
  onSelectUser,
  detailTab,
  onDetailTabChange,
  operationsOverview,
  loadingOperationsOverview,
  operationsOverviewError,
  selectedOperationsConversationId,
  onSelectOperationsConversation,
  selectedOperationsTicketId,
  onSelectOperationsTicket,
  paginatedUserConversations,
  paginatedUserContracts,
  paginatedUserSteps,
  onPrevUserConversationsPage,
  onNextUserConversationsPage,
  onPrevUserContractsPage,
  onNextUserContractsPage,
  onPrevUserStepsPage,
  onNextUserStepsPage,
  directConversation,
  loadingDirectConversation,
  directConversationError,
  paginatedAdminMessages,
  onPrevAdminMessagesPage,
  onNextAdminMessagesPage,
  messageDraft,
  onMessageDraftChange,
  sendingMessage,
  adminMessageError,
  onSendAdminMessage,
}: AdminUsersSectionProps) {
  return (
    <div className="mt-4 grid gap-3 xl:grid-cols-[320px_minmax(0,1fr)]">
      <SectionCard title="Usuários" subtitle="Lista compacta para navegação rápida.">
        {users.length ? (
          <div className="space-y-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => void onSelectUser(user.id)}
                className={cn(
                  "w-full rounded-2xl border px-3 py-3 text-left transition",
                  selectedUserId === user.id
                    ? "border-slate-900 bg-slate-950 text-white"
                    : "border-slate-200 bg-slate-50 hover:bg-white"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p
                      className={cn(
                        "mt-1 truncate text-xs",
                        selectedUserId === user.id ? "text-slate-300" : "text-slate-500"
                      )}
                    >
                      {user.masked_email || "Email indisponível"}
                    </p>
                  </div>
                  <StatusBadge
                    label={user.type === "prestador" ? "Prestador" : "Cliente"}
                    tone={user.type === "prestador" ? "emerald" : "amber"}
                  />
                </div>
                <div
                  className={cn(
                    "mt-3 flex flex-wrap gap-3 text-[11px]",
                    selectedUserId === user.id ? "text-slate-300" : "text-slate-500"
                  )}
                >
                  <span>ID #{user.id}</span>
                  <span>{user.contracts_count} contrato(s)</span>
                  <span>{user.running_payments_count} cobrança(s)</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Nenhum usuário encontrado"
            description="Esse filtro não trouxe usuários para o painel administrativo."
          />
        )}
      </SectionCard>

      <SectionCard
        title={selectedUser ? selectedUser.name : "Detalhe do usuário"}
        subtitle={
          selectedUser
            ? "Perfil, conversas, contratos, etapas e atendimento em uma navegação mais enxuta."
            : "Selecione um usuário na lista para abrir os detalhes."
        }
      >
        {selectedUser ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
              <div>
                <p className="text-base font-semibold text-slate-900">{selectedUser.name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedUser.masked_email || "Email mascarado"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge
                  label={selectedUser.type === "prestador" ? "Prestador" : "Cliente"}
                  tone={selectedUser.type === "prestador" ? "emerald" : "amber"}
                />
                {selectedUser.perfil_completo ? (
                  <StatusBadge label="Perfil completo" tone="sky" />
                ) : (
                  <StatusBadge label="Perfil incompleto" tone="slate" />
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1">
              {USER_DETAIL_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => onDetailTabChange(tab.key)}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-semibold transition",
                    detailTab === tab.key
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {operationsOverviewError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {operationsOverviewError}
              </div>
            ) : null}

            {detailTab === "perfil" ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <SummaryBox
                  label="Localização"
                  value={[selectedUser.city, selectedUser.state].filter(Boolean).join(", ") || "Não informado"}
                />
                <SummaryBox
                  label="Conversas"
                  value={String(operationsOverview?.summary.conversations_count || 0)}
                />
                <SummaryBox
                  label="Contratos ativos"
                  value={String(operationsOverview?.summary.active_contracts_count || 0)}
                />
                <SummaryBox
                  label="Pronto para repasse"
                  value={formatCurrency(operationsOverview?.summary.ready_payout_total || 0)}
                />
              </div>
            ) : null}

            {detailTab === "conversas" ? (
              <ConversationListPanel
                loading={loadingOperationsOverview}
                pagination={paginatedUserConversations}
                selectedConversationId={selectedOperationsConversationId}
                onSelectConversation={onSelectOperationsConversation}
                onPrevious={onPrevUserConversationsPage}
                onNext={onNextUserConversationsPage}
              />
            ) : null}

            {detailTab === "contratos" ? (
              <ContractListPanel
                loading={loadingOperationsOverview}
                pagination={paginatedUserContracts}
                selectedTicketId={selectedOperationsTicketId}
                onSelectTicket={onSelectOperationsTicket}
                onPrevious={onPrevUserContractsPage}
                onNext={onNextUserContractsPage}
              />
            ) : null}

            {detailTab === "etapas" ? (
              <StepListPanel
                loading={loadingOperationsOverview}
                pagination={paginatedUserSteps}
                onPrevious={onPrevUserStepsPage}
                onNext={onNextUserStepsPage}
              />
            ) : null}

            {detailTab === "atendimento" ? (
              <SupportPanel
                directConversation={directConversation}
                loading={loadingDirectConversation}
                error={directConversationError}
                pagination={paginatedAdminMessages}
                onPrevious={onPrevAdminMessagesPage}
                onNext={onNextAdminMessagesPage}
                messageDraft={messageDraft}
                onMessageDraftChange={onMessageDraftChange}
                sendingMessage={sendingMessage}
                adminMessageError={adminMessageError}
                onSendAdminMessage={onSendAdminMessage}
              />
            ) : null}
          </div>
        ) : (
          <EmptyState
            title="Escolha um usuário"
            description="A lateral mostra a lista principal. Ao selecionar um cadastro, os detalhes aparecem aqui."
          />
        )}
      </SectionCard>
    </div>
  );
}

type SummaryBoxProps = {
  label: string;
  value: string;
};

function SummaryBox({ label, value }: SummaryBoxProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

type ConversationListPanelProps = {
  loading: boolean;
  pagination: ClientPagination<AdminOperationalConversation>;
  selectedConversationId: number | null;
  onSelectConversation: (conversationId: number) => void;
  onPrevious: () => void;
  onNext: () => void;
};

function ConversationListPanel({
  loading,
  pagination,
  selectedConversationId,
  onSelectConversation,
  onPrevious,
  onNext,
}: ConversationListPanelProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
        Carregando conversas do usuário...
      </div>
    );
  }

  if (!pagination.items.length) {
    return (
      <EmptyState
        title="Sem conversas"
        description="Esse usuário ainda não possui conversas no recorte atual."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {pagination.items.map((conversation) => (
          <button
            key={conversation.conversation_id}
            onClick={() => onSelectConversation(conversation.conversation_id)}
            className={cn(
              "w-full rounded-2xl border px-3 py-3 text-left transition",
              selectedConversationId === conversation.conversation_id
                ? "border-slate-900 bg-slate-950 text-white"
                : "border-slate-200 bg-slate-50 hover:bg-white"
            )}
          >
            <div className="flex items-center justify-between gap-3">
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
              {conversation.is_admin_thread ? (
                <StatusBadge label="Admin" tone="sky" />
              ) : conversation.is_negotiation ? (
                <StatusBadge label="Negociação" tone="emerald" />
              ) : (
                <StatusBadge label="Direta" tone="slate" />
              )}
            </div>
            <div
              className={cn(
                "mt-3 flex flex-wrap gap-3 text-[11px]",
                selectedConversationId === conversation.conversation_id
                  ? "text-slate-300"
                  : "text-slate-500"
              )}
            >
              <span>{conversation.active_contracts_count} contrato(s)</span>
              <span>{conversation.message_count} mensagem(ns)</span>
              <span>{formatCurrency(conversation.ready_payout_total)} pronto</span>
            </div>
          </button>
        ))}
      </div>
      <PaginationControls
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </div>
  );
}

type ContractListPanelProps = {
  loading: boolean;
  pagination: ClientPagination<AdminOperationalTicket>;
  selectedTicketId: number | null;
  onSelectTicket: (ticketId: number) => void;
  onPrevious: () => void;
  onNext: () => void;
};

function ContractListPanel({
  loading,
  pagination,
  selectedTicketId,
  onSelectTicket,
  onPrevious,
  onNext,
}: ContractListPanelProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
        Carregando contratos...
      </div>
    );
  }

  if (!pagination.items.length) {
    return (
      <EmptyState
        title="Sem contratos"
        description="Não existem contratos ativos ou históricos para esse usuário no recorte atual."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {pagination.items.map((ticket) => (
          <button
            key={ticket.id}
            onClick={() => onSelectTicket(ticket.id)}
            className={cn(
              "w-full rounded-2xl border px-3 py-3 text-left transition",
              selectedTicketId === ticket.id
                ? "border-slate-900 bg-slate-950 text-white"
                : "border-slate-200 bg-slate-50 hover:bg-white"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Contrato #{ticket.id}</p>
                <p
                  className={cn(
                    "mt-1 text-xs",
                    selectedTicketId === ticket.id ? "text-slate-300" : "text-slate-500"
                  )}
                >
                  {formatCurrency(ticket.total_price)} • {ticket.steps.length} etapa(s)
                </p>
              </div>
              <div className="flex gap-2">
                <StatusBadge
                  label={ticket.status}
                  tone={
                    ticket.status === "concluída"
                      ? "emerald"
                      : ticket.status === "cancelada"
                        ? "rose"
                        : "amber"
                  }
                />
                <StatusBadge
                  label={receivingMethodLabel(ticket.provider_receiving_method)}
                  tone="slate"
                />
              </div>
            </div>
            <div
              className={cn(
                "mt-3 flex flex-wrap gap-3 text-[11px]",
                selectedTicketId === ticket.id ? "text-slate-300" : "text-slate-500"
              )}
            >
              <span>{ticket.financially_cleared_steps_count} paga(s)</span>
              <span>{ticket.ready_payout_steps_count} pronta(s)</span>
              <span>{formatCurrency(ticket.ready_payout_total)} disponível</span>
            </div>
          </button>
        ))}
      </div>
      <PaginationControls
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </div>
  );
}

type StepListPanelProps = {
  loading: boolean;
  pagination: ClientPagination<
    AdminOperationalStep & {
      ticket_id: number;
      ticket_status: string;
      provider_receiving_method: string;
    }
  >;
  onPrevious: () => void;
  onNext: () => void;
};

function StepListPanel({
  loading,
  pagination,
  onPrevious,
  onNext,
}: StepListPanelProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
        Carregando etapas...
      </div>
    );
  }

  if (!pagination.items.length) {
    return (
      <EmptyState
        title="Sem etapas"
        description="As etapas pagas, concluídas ou prontas para repasse aparecem aqui."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {pagination.items.map((step) => (
          <div key={step.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Contrato #{step.ticket_id} • {step.group_label}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-950">{formatCurrency(step.price)}</p>
                <p className="mt-1 text-[11px] text-slate-500">{step.payout_reason}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge label={step.status} tone={stepStatusTone(step.status)} />
              <StatusBadge
                label={stepPaymentLabel(step)}
                tone={step.is_financially_cleared ? "emerald" : paymentBucketTone(step.payment_status_bucket)}
              />
              {step.payout_ready ? <StatusBadge label="Pode pagar prestador" tone="sky" /> : null}
            </div>
          </div>
        ))}
      </div>
      <PaginationControls
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </div>
  );
}

type SupportPanelProps = {
  directConversation: AdminDirectConversation | null;
  loading: boolean;
  error: string | null;
  pagination: ClientPagination<any>;
  onPrevious: () => void;
  onNext: () => void;
  messageDraft: string;
  onMessageDraftChange: (value: string) => void;
  sendingMessage: boolean;
  adminMessageError: string | null;
  onSendAdminMessage: () => void | Promise<void>;
};

function SupportPanel({
  directConversation,
  loading,
  error,
  pagination,
  onPrevious,
  onNext,
  messageDraft,
  onMessageDraftChange,
  sendingMessage,
  adminMessageError,
  onSendAdminMessage,
}: SupportPanelProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-slate-50">
        <div className="border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-semibold text-slate-900">Histórico administrativo</p>
        </div>
        <div className="max-h-[340px] space-y-2 overflow-y-auto px-4 py-4">
          {loading ? (
            <p className="text-sm text-slate-500">Carregando histórico administrativo...</p>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : pagination.items.length ? (
            pagination.items.map((message) => (
              <div
                key={message.message_id}
                className={cn(
                  "max-w-[82%] rounded-2xl px-3 py-2 text-sm",
                  message.sender_id === directConversation?.admin_id
                    ? "ml-auto bg-slate-950 text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                )}
              >
                <p className="whitespace-pre-wrap leading-6">{message.content}</p>
                    <p className="mt-2 text-[11px] opacity-70">{formatDateTime(message.createdAt)}</p>
                  </div>
                ))
          ) : (
            <p className="text-sm text-slate-500">Nenhuma mensagem enviada ainda nessa thread.</p>
          )}
        </div>
      </div>

      <PaginationControls
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPrevious={onPrevious}
        onNext={onNext}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Enviar mensagem como ArqDoor ADM</p>
        {adminMessageError ? (
          <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {adminMessageError}
          </div>
        ) : null}
        <textarea
          value={messageDraft}
          onChange={(event) => onMessageDraftChange(event.target.value)}
          rows={4}
          placeholder="Digite aqui uma orientação, esclarecimento ou atualização para o usuário."
          className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Canal iniciado pelo admin e separado da busca comum.
          </p>
          <button
            onClick={() => void onSendAdminMessage()}
            disabled={sendingMessage || !messageDraft.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            <SendHorizontal className="h-4 w-4" />
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
