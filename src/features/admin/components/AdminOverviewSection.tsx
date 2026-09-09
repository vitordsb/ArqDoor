import { useState } from "react";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  FileSignature,
  HandCoins,
  Loader2,
  Mail,
  MessageSquare,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import type { AdminConversationRow, AdminTab, DashboardData } from "../types";
import { formatCurrency, formatDate, preferenceLabel } from "../utils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { EmptyState, SectionCard, StatCard, StatusBadge } from "./AdminPrimitives";

function PhoneReminderTrigger() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<"dry" | "send" | null>(null);
  const [result, setResult] = useState<{ count?: number; sent?: number; failed?: number } | null>(
    null
  );

  const trigger = async (mode: "dry" | "send") => {
    setLoading(mode);
    try {
      const url =
        mode === "dry"
          ? "/admin/maintenance/send-phone-reminders?dry_run=true"
          : "/admin/maintenance/send-phone-reminders";
      const response = await apiRequest("POST", url, {});
      const body = await response.json().catch(() => ({}));
      if (!response.ok || body?.success === false) {
        throw new Error(body?.message || "Falha na requisição.");
      }
      if (mode === "dry") {
        const count = body?.data?.count ?? 0;
        setResult({ count });
        toast({ title: "Pré-visualização", description: `${count} usuário(s) receberiam o email.` });
      } else {
        const sentCount = body?.data?.sent?.length ?? 0;
        const failedCount = body?.data?.failed?.length ?? 0;
        setResult({ sent: sentCount, failed: failedCount });
        toast({
          title: "Lembretes enviados",
          description: `${sentCount} enviado(s)${failedCount ? `, ${failedCount} falha(s)` : ""}.`,
        });
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Erro ao processar.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-start gap-2">
        <Mail className="h-4 w-4 mt-0.5 text-orange-600" />
        <div>
          <p className="font-semibold text-slate-900">Lembrete: complete o telefone</p>
          <p className="text-[11px] text-slate-500">
            Envia email aos usuários ativos (login nos últimos 30 dias) que estão sem telefone cadastrado. Idempotente: cada usuário recebe no máximo 1 vez.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => trigger("dry")}
          disabled={loading !== null}
        >
          {loading === "dry" ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
          Pré-visualizar (não envia)
        </Button>
        <Button
          size="sm"
          className="bg-orange-600 hover:bg-orange-700 text-white"
          onClick={() => trigger("send")}
          disabled={loading !== null}
        >
          {loading === "send" ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
          Disparar lembretes
        </Button>
      </div>
      {result ? (
        <p className="text-[11px] text-slate-600">
          {"count" in result
            ? `Pré-visualização: ${result.count} candidato(s).`
            : `Resultado: ${result.sent} enviado(s), ${result.failed} falha(s).`}
        </p>
      ) : null}
    </div>
  );
}

type AdminOverviewSectionProps = {
  activeTab: AdminTab;
  dashboard: DashboardData;
  onOpenDocument: (pathOrUrl: string | null | undefined) => void;
  onOpenConversation: (conversationId: number) => void;
  onNavigateToTab?: (tab: AdminTab) => void;
};

export function AdminDashboardView({
  activeTab,
  dashboard,
  onOpenDocument,
  onOpenConversation,
  onNavigateToTab,
}: AdminOverviewSectionProps) {
  if (activeTab !== "dashboard" && activeTab !== "all") {
    return null;
  }

  return (
    <>
      {activeTab === "dashboard" ? (
        <div className="mt-2 space-y-2">
          {/* Cards de "trabalho a fazer" — só aparecem quando há algo acionável.
              Cor amber/rose e clique navega pra aba relevante. */}
          {(() => {
            const transfersReady = dashboard.transfers?.length || 0;
            const failedPayments = dashboard.meta?.pagination?.payments?.failed_total || 0;
            const runningPayments = dashboard.summary.filtered.running_payments || 0;
            const hasAnyAction = transfersReady > 0 || failedPayments > 0;
            if (!hasAnyAction) return null;
            return (
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {transfersReady > 0 ? (
                  <StatCard
                    label="Repasses prontos"
                    value={transfersReady}
                    helper={`${transfersReady} prestador(es) aguardando pagamento`}
                    icon={HandCoins}
                    tone="alert"
                    onClick={() => onNavigateToTab?.("transferencias")}
                  />
                ) : null}
                {failedPayments > 0 ? (
                  <StatCard
                    label="Pagamentos com falha"
                    value={failedPayments}
                    helper="precisam de atenção"
                    icon={BadgeDollarSign}
                    tone="danger"
                    onClick={() => onNavigateToTab?.("pagamentos")}
                  />
                ) : null}
                {runningPayments > 0 ? (
                  <StatCard
                    label="Cobranças em aberto"
                    value={runningPayments}
                    helper={formatCurrency(dashboard.summary.monetary.running_payments_volume || 0)}
                    icon={Wallet}
                    tone="alert"
                    onClick={() => onNavigateToTab?.("pagamentos")}
                  />
                ) : null}
              </div>
            );
          })()}

          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-8">
            <StatCard
              label="Usuários"
              value={dashboard.summary.filtered.users || 0}
              helper={`${dashboard.summary.totals.users || 0} total`}
              icon={Users}
              onClick={() => onNavigateToTab?.("usuarios")}
            />
            <StatCard
              label="Prestadores"
              value={dashboard.summary.filtered.providers || 0}
              helper={`${dashboard.summary.totals.providers || 0} total`}
              icon={Building2}
              onClick={() => onNavigateToTab?.("usuarios")}
            />
            <StatCard
              label="Clientes"
              value={dashboard.summary.filtered.clients || 0}
              helper={`${dashboard.summary.totals.clients || 0} total`}
              icon={UserRound}
              onClick={() => onNavigateToTab?.("usuarios")}
            />
            <StatCard
              label="Contratos"
              value={dashboard.summary.filtered.contracts || 0}
              helper={formatCurrency(dashboard.summary.monetary.contracts_volume)}
              icon={BriefcaseBusiness}
              onClick={() => onNavigateToTab?.("contratos")}
            />
            <StatCard
              label="Cobranças"
              value={dashboard.summary.filtered.running_payments || 0}
              helper={formatCurrency(dashboard.summary.monetary.running_payments_volume || 0)}
              icon={BadgeDollarSign}
              onClick={() => onNavigateToTab?.("pagamentos")}
            />
            <StatCard
              label="Volume aberto"
              value={dashboard.summary.monetary.running_payments_volume || 0}
              helper="valor em cobrança"
              icon={Wallet}
              valueFormat="currency"
              onClick={() => onNavigateToTab?.("pagamentos")}
            />
            <StatCard
              label="Docs assinados"
              value={dashboard.summary.filtered.signed_documents || 0}
              helper="contratos OK"
              icon={FileSignature}
              onClick={() => onNavigateToTab?.("documentos")}
            />
            <StatCard
              label="Conversas"
              value={dashboard.summary.filtered.conversations || 0}
              helper="monitoradas"
              icon={MessageSquare}
              onClick={() => onNavigateToTab?.("conversas")}
            />
          </div>

          <SectionCard title="Manutenção">
            <PhoneReminderTrigger />
          </SectionCard>

          <SectionCard title="Localização">
            <TopLocationsPanel dashboard={dashboard} emptyStateSuffix="" />
          </SectionCard>
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
  const states = dashboard.summary.top_locations.states;
  const cities = dashboard.summary.top_locations.cities;
  const maxStateValue = Math.max(1, ...states.map((s) => s.value));
  const maxCityValue = Math.max(1, ...cities.map((c) => c.value));

  return (
    <div className={`grid gap-2 md:grid-cols-2 ${stacked ? "xl:grid-cols-1" : ""}`}>
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Estados</p>
        <div className="mt-1.5 space-y-1">
          {states.length ? (
            states.map((entry) => (
              <div key={entry.label} className="flex items-center gap-2 text-xs">
                <span className="w-8 font-medium text-slate-700">{entry.label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-slate-200">
                  <div
                    className="h-1.5 rounded-full bg-slate-700"
                    style={{ width: `${(entry.value / maxStateValue) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right font-semibold text-slate-900">{entry.value}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">Sem dados{emptyStateSuffix}.</p>
          )}
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Cidades</p>
        <div className="mt-1.5 space-y-1">
          {cities.length ? (
            cities.map((entry) => (
              <div key={entry.label} className="flex items-center gap-2 text-xs">
                <span className="flex-1 truncate font-medium text-slate-700">{entry.label}</span>
                <div className="w-16 h-1.5 rounded-full bg-slate-200">
                  <div
                    className="h-1.5 rounded-full bg-slate-700"
                    style={{ width: `${(entry.value / maxCityValue) * 100}%` }}
                  />
                </div>
                <span className="w-6 text-right font-semibold text-slate-900">{entry.value}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">Sem dados{emptyStateSuffix}.</p>
          )}
        </div>
      </div>
    </div>
  );
}
