import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import type { AdminConversationRow, AdminTab, DashboardData } from "../types";
import { formatCurrency, formatDate, preferenceLabel } from "../utils";
import { EmptyState, SectionCard, StatCard, StatusBadge } from "./AdminPrimitives";

type AdminOverviewSectionProps = {
  activeTab: AdminTab;
  dashboard: DashboardData;
  onOpenDocument: (pathOrUrl: string | null | undefined) => void;
  onOpenConversation: (conversationId: number) => void;
};

export function AdminDashboardView({
  activeTab,
  dashboard,
  onOpenDocument,
  onOpenConversation,
}: AdminOverviewSectionProps) {
  if (activeTab !== "dashboard" && activeTab !== "all") {
    return null;
  }

  return (
    <>
      {activeTab === "dashboard" ? (
        <div className="mt-2 space-y-2">
          <div className="grid gap-2 xl:grid-cols-5">
            <StatCard
              label="Usuários cadastrados"
              value={dashboard.summary.filtered.users || 0}
              helper={`${dashboard.summary.totals.users || 0} no total`}
              icon={Users}
            />
            <StatCard
              label="Prestadores"
              value={dashboard.summary.filtered.providers || 0}
              helper={`${dashboard.summary.totals.providers || 0} no total`}
              icon={Building2}
            />
            <StatCard
              label="Clientes"
              value={dashboard.summary.filtered.clients || 0}
              helper={`${dashboard.summary.totals.clients || 0} no total`}
              icon={UserRound}
            />
            <StatCard
              label="Contratos"
              value={dashboard.summary.filtered.contracts || 0}
              helper={`${dashboard.summary.totals.contracts || 0} ativos e históricos`}
              icon={BriefcaseBusiness}
            />
            <StatCard
              label="Pagamentos rodando"
              value={dashboard.summary.filtered.running_payments || 0}
              helper={formatCurrency(dashboard.summary.monetary.running_payments_volume || 0)}
              icon={BadgeDollarSign}
            />
          </div>

          <div className="grid gap-2 xl:grid-cols-[1fr_1fr]">
            <SectionCard title="Insights rápidos" subtitle="Resumo direto da operação.">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Volume de contratos
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">
                    {formatCurrency(dashboard.summary.monetary.contracts_volume)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Documentos assinados
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">
                    {dashboard.summary.filtered.signed_documents}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Conversas monitoradas
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">
                    {dashboard.summary.filtered.conversations}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Valor em cobrança
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">
                    {formatCurrency(dashboard.summary.monetary.running_payments_volume)}
                  </p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Mapa rápido" subtitle="Localização mais frequente do recorte atual.">
              <TopLocationsPanel dashboard={dashboard} emptyStateSuffix="" />
            </SectionCard>
          </div>
        </div>
      ) : null}

      {activeTab === "all" ? (
        <div className="mt-6 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-4">
            <SectionCard
              title="Contratos em destaque"
              subtitle={`Volume filtrado de ${formatCurrency(dashboard.summary.monetary.contracts_volume)}`}
            >
              {dashboard.highlights.recent_contracts.length ? (
                <div className="space-y-3">
                  {dashboard.highlights.recent_contracts.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 transition hover:bg-white"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-base font-semibold text-slate-900">
                              Contrato #{ticket.id}
                            </p>
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
                            <StatusBadge label={preferenceLabel(ticket.payment_preference)} tone="slate" />
                          </div>
                          <p className="mt-2 text-sm text-slate-500">
                            {ticket.contractor?.name || "Cliente"} • {ticket.provider?.name || "Prestador"} •{" "}
                            {ticket.steps_count} etapa(s)
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-slate-950">
                            {formatCurrency(ticket.total_price)}
                          </p>
                          <p className="text-xs text-slate-500">{formatDate(ticket.created_at)}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {ticket.has_signed_document ? (
                          <StatusBadge label="Documento assinado" tone="emerald" />
                        ) : (
                          <StatusBadge label="Aguardando assinatura" tone="amber" />
                        )}
                        {ticket.running_payments_count > 0 ? (
                          <StatusBadge
                            label={`${ticket.running_payments_count} cobrança(s) rodando`}
                            tone="sky"
                          />
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Nenhum contrato entrou no recorte atual"
                  description="Ajuste os filtros ou aguarde novas movimentações para ver os contratos mais recentes aqui."
                />
              )}
            </SectionCard>

            <SectionCard
              title="Pagamentos recentes"
              subtitle={`${dashboard.meta.pagination.payments.running_total} em cobrança • ${dashboard.meta.pagination.payments.paid_total} pagos`}
            >
              {dashboard.highlights.recent_payments.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {dashboard.highlights.recent_payments.map((payment) => (
                    <div key={payment.id} className="rounded-[24px] border border-slate-200 bg-white p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-900">Pagamento #{payment.id}</p>
                        <StatusBadge
                          label={payment.status_bucket === "paid" ? "Pago" : payment.status_bucket === "failed" ? "Falhou" : "Rodando"}
                          tone={
                            payment.status_bucket === "paid"
                              ? "emerald"
                              : payment.status_bucket === "failed"
                                ? "rose"
                                : "sky"
                          }
                        />
                      </div>
                      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        Ticket #{payment.ticket_id} • {payment.contractor?.name || "Cliente"} •{" "}
                        {payment.provider?.name || "Prestador"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Sem pagamentos no recorte atual"
                  description="Quando houver novas cobranças ou liquidações dentro do filtro, elas aparecem aqui."
                />
              )}
            </SectionCard>
          </div>

          <div className="space-y-4">
            <SectionCard
              title="Mapa rápido"
              subtitle="Estados e cidades com maior concentração no filtro atual."
            >
              <TopLocationsPanel dashboard={dashboard} emptyStateSuffix=" no recorte" stacked />
            </SectionCard>

            <SectionCard title="Documentos e suporte" subtitle="Visão curta para ação administrativa imediata.">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Documentos recentes</p>
                  <div className="mt-3 space-y-3">
                    {dashboard.highlights.recent_documents.length ? (
                      dashboard.highlights.recent_documents.map((document) => (
                        <button
                          key={document.id}
                          onClick={() => onOpenDocument(document.download_url || document.pdf_path)}
                          className="flex w-full items-center justify-between rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-3 text-left transition hover:bg-white"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">Documento #{document.id}</p>
                            <p className="text-xs text-slate-500">
                              Ticket #{document.ticket_id} • {document.contractor?.name || "Cliente"}
                            </p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-slate-400" />
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">Sem documentos recentes nesse recorte.</p>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-sm font-semibold text-slate-900">Fila de suporte/admin</p>
                  <div className="mt-3 space-y-3">
                    {dashboard.highlights.support_threads.length ? (
                      dashboard.highlights.support_threads.map((conversation) => (
                        <SupportThreadCard
                          key={conversation.conversation_id}
                          conversation={conversation}
                          onOpenConversation={onOpenConversation}
                        />
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">Nenhuma thread administrativa no recorte.</p>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      ) : null}
    </>
  );
}

type SupportThreadCardProps = {
  conversation: AdminConversationRow;
  onOpenConversation: (conversationId: number) => void;
};

function SupportThreadCard({
  conversation,
  onOpenConversation,
}: SupportThreadCardProps) {
  return (
    <button
      onClick={() => onOpenConversation(conversation.conversation_id)}
      className="w-full rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-3 text-left transition hover:bg-white"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">
          Conversa #{conversation.conversation_id}
        </p>
        <StatusBadge label="Admin" tone="sky" />
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-slate-500">
        {conversation.last_message_preview || "Sem prévia recente"}
      </p>
    </button>
  );
}

type TopLocationsPanelProps = {
  dashboard: DashboardData;
  emptyStateSuffix: string;
  stacked?: boolean;
};

function TopLocationsPanel({
  dashboard,
  emptyStateSuffix,
  stacked = false,
}: TopLocationsPanelProps) {
  return (
    <div className={`grid gap-3 md:grid-cols-2 ${stacked ? "xl:grid-cols-1" : ""}`}>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">Estados</p>
        <div className="mt-3 space-y-2">
          {dashboard.summary.top_locations.states.length ? (
            dashboard.summary.top_locations.states.map((entry) => (
              <div key={entry.label} className="flex items-center justify-between text-sm text-slate-600">
                <span>{entry.label}</span>
                <span className="font-semibold text-slate-900">{entry.value}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Sem dados de estado{emptyStateSuffix}.</p>
          )}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">Cidades</p>
        <div className="mt-3 space-y-2">
          {dashboard.summary.top_locations.cities.length ? (
            dashboard.summary.top_locations.cities.map((entry) => (
              <div key={entry.label} className="flex items-center justify-between text-sm text-slate-600">
                <span>{entry.label}</span>
                <span className="font-semibold text-slate-900">{entry.value}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Sem dados de cidade{emptyStateSuffix}.</p>
          )}
        </div>
      </div>
    </div>
  );
}
