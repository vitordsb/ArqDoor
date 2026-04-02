import type { AdminTicketRow } from "../types";
import {
  formatCurrency,
  formatDateTime,
  openSecureFile,
  participantRoleLabel,
  participantSubtitle,
  participantTone,
  preferenceLabel,
} from "../utils";
import { EmptyState, SectionCard, StatusBadge } from "./AdminPrimitives";
import { ExternalLink } from "lucide-react";

type AdminContractsSectionProps = {
  tickets: AdminTicketRow[];
};

export function AdminContractsSection({ tickets }: AdminContractsSectionProps) {
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {tickets.length ? (
        tickets.map((ticket) => (
          <SectionCard
            key={ticket.id}
            title={`Contrato #${ticket.id}`}
            subtitle={`${ticket.contractor?.name || "Cliente"} • ${ticket.provider?.name || "Prestador"}`}
            className="h-full"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
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
                {ticket.has_signed_document ? (
                  <StatusBadge label="Assinado" tone="emerald" />
                ) : (
                  <StatusBadge label="Sem assinatura" tone="amber" />
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[22px] bg-slate-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Valor
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">
                    {formatCurrency(ticket.total_price)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {ticket.steps_count} etapa(s) cadastradas
                  </p>
                </div>
                <div className="rounded-[22px] bg-slate-50/80 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Cobrança
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">
                    {ticket.running_payments_count}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatCurrency(ticket.running_payments_amount)} em aberto
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[ticket.contractor, ticket.provider].map((participant) => (
                  <div
                    key={`${ticket.id}-${participant?.id || participantRoleLabel(participant)}`}
                    className="rounded-[22px] border border-slate-200 bg-white px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {participant?.name || "Sem vínculo"}
                        </p>
                        <p className="text-xs text-slate-500">{participantSubtitle(participant)}</p>
                      </div>
                      <StatusBadge
                        label={participantRoleLabel(participant)}
                        tone={participantTone(participant)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-3">
                <div className="text-sm text-slate-500">
                  Atualizado em {formatDateTime(ticket.updated_at)}
                </div>
                {ticket.latest_document ? (
                  <button
                    onClick={() =>
                      openSecureFile(
                        ticket.latest_document?.download_url || ticket.latest_document?.pdf_path
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir PDF
                  </button>
                ) : (
                  <span className="text-sm text-slate-400">Sem PDF anexado</span>
                )}
              </div>
            </div>
          </SectionCard>
        ))
      ) : (
        <div className="lg:col-span-2 xl:col-span-3">
          <EmptyState
            title="Nenhum contrato apareceu nesse recorte"
            description="Ajuste o status, a faixa de valor ou o período para reenquadrar a busca."
          />
        </div>
      )}
    </div>
  );
}
