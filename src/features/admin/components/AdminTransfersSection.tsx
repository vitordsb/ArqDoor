import { formatCnpj, formatCpf } from "@/lib/utils";
import type { AdminTransferRow, DashboardData } from "../types";
import {
  formatCurrency,
  formatDateTime,
  participantSubtitle,
  receivingMethodLabel,
} from "../utils";
import { EmptyState, SectionCard, StatusBadge } from "./AdminPrimitives";

type AdminTransfersSectionProps = {
  transfers: DashboardData["transfers"];
};

const maskBankDocument = (value: string | null | undefined) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return "Documento não informado";
  if (digits.length <= 11) {
    const formatted = formatCpf(digits);
    return `${formatted.slice(0, 3)}.***.***-${formatted.slice(-2)}`;
  }
  const formatted = formatCnpj(digits);
  return `${formatted.slice(0, 2)}.***.***/****-${formatted.slice(-2)}`;
};

const bankSummary = (contract: AdminTransferRow["contracts"][number]) => {
  const lines: string[] = [];

  if (contract.provider_bank_name) {
    lines.push(
      [
        contract.provider_bank_name,
        contract.provider_bank_agency ? `Agência ${contract.provider_bank_agency}` : null,
        contract.provider_bank_account ? `Conta ${contract.provider_bank_account}` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    );
  }

  if (contract.provider_bank_document) {
    lines.push(`Documento da conta: ${maskBankDocument(contract.provider_bank_document)}`);
  }

  if (contract.provider_pix_key) {
    lines.push(`PIX: ${contract.provider_pix_key}`);
  }

  return lines;
};

export function AdminTransfersSection({ transfers }: AdminTransfersSectionProps) {
  return (
    <div className="mt-6 space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <SectionCard title="Prestadores prontos" subtitle="Com repasse liberado">
          <p className="text-3xl font-semibold tracking-tight text-slate-950">
            {transfers.length}
          </p>
        </SectionCard>
        <SectionCard title="Etapas liberadas" subtitle="Já pagas e concluídas">
          <p className="text-3xl font-semibold tracking-tight text-slate-950">
            {transfers.reduce((sum, item) => sum + Number(item.ready_steps_count || 0), 0)}
          </p>
        </SectionCard>
        <SectionCard title="Total para repasse" subtitle="Valor disponível agora">
          <p className="text-3xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(
              transfers.reduce((sum, item) => sum + Number(item.ready_total || 0), 0)
            )}
          </p>
        </SectionCard>
      </div>

      {transfers.length ? (
        <div className="space-y-4">
          {transfers.map((transfer) => (
            <SectionCard
              key={`${transfer.provider?.id || "provider"}-${transfer.provider_id || "na"}`}
              title={transfer.provider?.name || "Prestador"}
              subtitle={participantSubtitle(transfer.provider)}
            >
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <InfoBox
                    label="Pronto para repasse"
                    value={formatCurrency(transfer.ready_total)}
                  />
                  <InfoBox
                    label="Etapas liberadas"
                    value={`${transfer.ready_steps_count} etapa(s)`}
                  />
                  <InfoBox
                    label="Contratos ativos"
                    value={`${transfer.active_contracts_count} ativo(s)`}
                  />
                </div>

                <div className="space-y-3">
                  {transfer.contracts.map((contract) => (
                    <div
                      key={contract.ticket_id}
                      className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-900">
                              Contrato #{contract.ticket_id}
                            </p>
                            <StatusBadge label={contract.status} tone="amber" />
                            <StatusBadge
                              label={receivingMethodLabel(contract.provider_receiving_method)}
                              tone={contract.provider_receiving_method === "standard" ? "sky" : "slate"}
                            />
                          </div>
                          <p className="mt-2 text-sm text-slate-500">
                            Cliente: {contract.contractor?.name || "Não identificado"}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            Atualizado em {formatDateTime(contract.updated_at)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-semibold text-slate-950">
                            {formatCurrency(contract.ready_total)}
                          </p>
                          <p className="text-sm text-slate-500">
                            {contract.ready_steps_count} etapa(s) pronta(s)
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Etapas disponíveis
                          </p>
                          <div className="space-y-2">
                            {contract.steps.map((step) => (
                              <div
                                key={step.id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {step.title}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    {step.group_label} • {step.payout_reason}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-slate-900">
                                    {formatCurrency(step.price)}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {formatDateTime(step.updated_at)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Dados para transferência
                          </p>

                          <div className="space-y-2 text-sm text-slate-600">
                            <p className="font-semibold text-slate-900">
                              {contract.provider_receiving_account_label || "Conta selecionada no contrato"}
                            </p>
                            {contract.provider_receiving_method === "standard" ? (
                              bankSummary(contract).length ? (
                                bankSummary(contract).map((line) => <p key={line}>{line}</p>)
                              ) : (
                                <p>Nenhum dado bancário salvo no snapshot desse contrato.</p>
                              )
                            ) : (
                              <p>
                                Recebimento via Escrow. O contrato está pronto para repasse, mas não
                                usa conta bancária manual neste fluxo.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nenhum repasse pronto agora"
          description="Quando uma etapa estiver paga pelo cliente e concluída pelo prestador, ela aparece aqui com os dados de recebimento do contrato."
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
