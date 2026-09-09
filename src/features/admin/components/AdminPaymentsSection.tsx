import type { DashboardData } from "../types";
import { formatCurrency, formatDate, formatDateTime, participantRoleLabel, participantSubtitle, participantTone, preferenceLabel } from "../utils";
import { EmptyState, SectionCard, StatusBadge } from "./AdminPrimitives";

type AdminPaymentsSectionProps = {
  dashboard: DashboardData;
};

export function AdminPaymentsSection({ dashboard }: AdminPaymentsSectionProps) {
  return (
    <div className="mt-2 space-y-2">
      <div className="grid gap-2 grid-cols-3">
        <SectionCard title="Rodando" subtitle="Cobranças em aberto">
          <p className="text-xl font-semibold tracking-tight text-slate-950">
            {dashboard.meta.pagination.payments.running_total}
          </p>
        </SectionCard>
        <SectionCard title="Pagos" subtitle="Pagamentos confirmados">
          <p className="text-xl font-semibold tracking-tight text-slate-950">
            {dashboard.meta.pagination.payments.paid_total}
          </p>
        </SectionCard>
        <SectionCard title="Falharam" subtitle="Cobranças com problema">
          <p className="text-xl font-semibold tracking-tight text-slate-950">
            {dashboard.meta.pagination.payments.failed_total}
          </p>
        </SectionCard>
      </div>

      {dashboard.payments.items.length ? (
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {dashboard.payments.items.map((payment) => (
            <SectionCard
              key={payment.id}
              title={`Pagamento #${payment.id}`}
              subtitle={`Ticket #${payment.ticket_id} • ${preferenceLabel(payment.payment_preference)}`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-2xl font-semibold tracking-tight text-slate-950">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-sm text-slate-500">
                      Criado em {formatDateTime(payment.created_at)}
                    </p>
                  </div>
                  <StatusBadge
                    label={
                      payment.status_bucket === "paid"
                        ? "Pago"
                        : payment.status_bucket === "failed"
                          ? "Falhou"
                          : "Rodando"
                    }
                    tone={
                      payment.status_bucket === "paid"
                        ? "emerald"
                        : payment.status_bucket === "failed"
                          ? "rose"
                          : "sky"
                    }
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[payment.contractor, payment.provider].map((participant) => (
                    <div
                      key={`${payment.id}-${participant?.id || participantRoleLabel(participant)}`}
                      className="rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-3"
                    >
                      <p className="text-sm font-semibold text-slate-900">
                        {participant?.name || "Sem vínculo"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {participantSubtitle(participant)}
                      </p>
                      <div className="mt-3">
                        <StatusBadge
                          label={participantRoleLabel(participant)}
                          tone={participantTone(participant)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <InfoBox label="Método" value={payment.method || "—"} />
                  {/* PIX é instantâneo, não tem vencimento — mostra só pra boleto/outros */}
                  {String(payment.method || "").toUpperCase() === "PIX" ? (
                    <InfoBox label="Tipo" value="Instantâneo" />
                  ) : (
                    <InfoBox label="Vencimento" value={formatDate(payment.due_date)} />
                  )}
                  <InfoBox label="Pago em" value={formatDate(payment.paid_at)} />
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum pagamento retornado"
          description="Ajuste o recorte de status financeiro, localização, valor ou período."
        />
      )}
    </div>
  );
}

type InfoBoxProps = {
  label: string;
  value: string;
};

function InfoBox({ label, value }: InfoBoxProps) {
  return (
    <div className="rounded-[22px] bg-slate-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
