import type { AdminDocumentRow } from "../types";
import {
  formatCurrency,
  formatDateTime,
  openSecureFile,
  participantSubtitle,
} from "../utils";
import { EmptyState, SectionCard, StatusBadge } from "./AdminPrimitives";
import { ExternalLink } from "lucide-react";

type AdminDocumentsSectionProps = {
  documents: AdminDocumentRow[];
};

export function AdminDocumentsSection({ documents }: AdminDocumentsSectionProps) {
  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {documents.length ? (
        documents.map((document) => (
          <SectionCard
            key={document.id}
            title={`Documento #${document.id}`}
            subtitle={`Ticket #${document.ticket_id} • ${document.contractor?.name || "Cliente"}`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <StatusBadge
                  label={document.signed ? "Assinado" : "Pendente"}
                  tone={document.signed ? "emerald" : "amber"}
                />
                <StatusBadge label={document.contract_status || "Sem status"} tone="slate" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[document.contractor, document.provider].map((participant) => (
                  <div
                    key={`${document.id}-${participant?.id || participant?.name || "sem-vinculo"}`}
                    className="rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {participant?.name || "Sem vínculo"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{participantSubtitle(participant)}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[22px] bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Linha do documento
                </p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p>Criado em {formatDateTime(document.created_at)}</p>
                  <p>Assinado em {formatDateTime(document.signed_at)}</p>
                  <p>Valor do contrato: {formatCurrency(document.contract_value)}</p>
                </div>
              </div>

              <button
                onClick={() => openSecureFile(document.download_url || document.pdf_path)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir PDF
              </button>
            </div>
          </SectionCard>
        ))
      ) : (
        <div className="lg:col-span-2 xl:col-span-3">
          <EmptyState
            title="Nenhum documento nesse recorte"
            description="Filtre por assinatura, valor ou tempo para localizar o documento que você precisa."
          />
        </div>
      )}
    </div>
  );
}
