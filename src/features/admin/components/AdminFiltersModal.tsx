import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Clock3,
  FileBadge2,
  FileSignature,
  Filter,
  MapPin,
  MessageSquareText,
  Search,
  Users,
  X,
} from "lucide-react";
import type { AdminTab, DashboardData, FilterState } from "../types";
import { paymentBucketLabel, preferenceLabel } from "../utils";

type AdminFiltersModalProps = {
  open: boolean;
  activeTab: AdminTab;
  dashboard: DashboardData | null;
  draftFilters: FilterState;
  onClose: () => void;
  onReset: () => void;
  onApply: () => void;
  onChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
};

export function AdminFiltersModal({
  open,
  activeTab,
  dashboard,
  draftFilters,
  onClose,
  onReset,
  onApply,
  onChange,
}: AdminFiltersModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/35 px-3 py-6">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4">
          <div>
            <p className="text-base font-semibold text-slate-900">Filtros da visualização</p>
            <p className="mt-1 text-sm text-slate-500">
              Refine a aba atual sem manter os controles fixos na tela.
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            aria-label="Fechar filtros"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 px-4 py-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <Search className="h-3.5 w-3.5" />
              Busca ampla
            </span>
            <input
              value={draftFilters.search}
              onChange={(event) => onChange("search", event.target.value)}
              placeholder="Nome, ticket, cidade, email mascarado..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
            />
          </label>

          <label className="space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              Estado
            </span>
            <select
              value={draftFilters.state}
              onChange={(event) => onChange("state", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
            >
              <option value="">Todos</option>
              {(dashboard?.filters.options.states || []).map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              Cidade
            </span>
            <select
              value={draftFilters.city}
              onChange={(event) => onChange("city", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
            >
              <option value="">Todas</option>
              {(dashboard?.filters.options.cities || []).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>

          {(activeTab === "usuarios" || activeTab === "dashboard" || activeTab === "all") ? (
            <label className="space-y-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <Users className="h-3.5 w-3.5" />
                Tipo de usuário
              </span>
              <select
                value={draftFilters.userType}
                onChange={(event) => onChange("userType", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
              >
                <option value="">Todos</option>
                {(dashboard?.filters.options.user_types || []).map((userType) => (
                  <option key={userType} value={userType}>
                    {userType === "prestador" ? "Prestador" : "Cliente"}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {(activeTab === "contratos" ||
            activeTab === "transferencias" ||
            activeTab === "all" ||
            activeTab === "dashboard") ? (
            <label className="space-y-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <BriefcaseBusiness className="h-3.5 w-3.5" />
                Status do contrato
              </span>
              <select
                value={draftFilters.contractStatus}
                onChange={(event) => onChange("contractStatus", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
              >
                <option value="">Todos</option>
                {(dashboard?.filters.options.contract_statuses || []).map((contractStatus) => (
                  <option key={contractStatus} value={contractStatus}>
                    {contractStatus}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {(activeTab === "pagamentos" || activeTab === "all" || activeTab === "dashboard") ? (
            <label className="space-y-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <BadgeDollarSign className="h-3.5 w-3.5" />
                Status financeiro
              </span>
              <select
                value={draftFilters.paymentBucket}
                onChange={(event) => onChange("paymentBucket", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
              >
                <option value="">Todos</option>
                {(dashboard?.filters.options.payment_buckets || []).map((paymentBucket) => (
                  <option key={paymentBucket} value={paymentBucket}>
                    {paymentBucketLabel(paymentBucket)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {(activeTab === "contratos" ||
            activeTab === "transferencias" ||
            activeTab === "pagamentos" ||
            activeTab === "all" ||
            activeTab === "dashboard") ? (
            <label className="space-y-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <FileBadge2 className="h-3.5 w-3.5" />
                Configuração de pagamento
              </span>
              <select
                value={draftFilters.paymentPreference}
                onChange={(event) => onChange("paymentPreference", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
              >
                <option value="">Todas</option>
                {(dashboard?.filters.options.payment_preferences || []).map((paymentPreference) => (
                  <option key={paymentPreference} value={paymentPreference}>
                    {preferenceLabel(paymentPreference)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {(activeTab === "documentos" || activeTab === "contratos" || activeTab === "all") ? (
            <label className="space-y-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <FileSignature className="h-3.5 w-3.5" />
                Assinatura
              </span>
              <select
                value={draftFilters.signed}
                onChange={(event) => onChange("signed", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
              >
                <option value="">Todos</option>
                <option value="signed">Assinados</option>
                <option value="pending">Pendentes</option>
              </select>
            </label>
          ) : null}

          {activeTab === "conversas" ? (
            <label className="space-y-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <MessageSquareText className="h-3.5 w-3.5" />
                Tipo de conversa
              </span>
              <select
                value={draftFilters.conversationKind}
                onChange={(event) => onChange("conversationKind", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
              >
                <option value="">Todas</option>
                <option value="admin">Suporte/admin</option>
                <option value="negotiation">Negociação</option>
                <option value="direct">Diretas</option>
              </select>
            </label>
          ) : null}

          <label className="space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <BadgeDollarSign className="h-3.5 w-3.5" />
              Valor mínimo
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={draftFilters.minValue}
              onChange={(event) => onChange("minValue", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
            />
          </label>

          <label className="space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <BadgeDollarSign className="h-3.5 w-3.5" />
              Valor máximo
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={draftFilters.maxValue}
              onChange={(event) => onChange("maxValue", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
            />
          </label>

          <label className="space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <Clock3 className="h-3.5 w-3.5" />
              De
            </span>
            <input
              type="date"
              value={draftFilters.dateFrom}
              onChange={(event) => onChange("dateFrom", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
            />
          </label>

          <label className="space-y-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              <Clock3 className="h-3.5 w-3.5" />
              Até
            </span>
            <input
              type="date"
              value={draftFilters.dateTo}
              onChange={(event) => onChange("dateTo", event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-50"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-4">
          <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Os filtros alteram métricas e listas da aba atual.
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onReset}
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Limpar
            </button>
            <button
              onClick={onApply}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Filter className="h-4 w-4" />
              Aplicar filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
