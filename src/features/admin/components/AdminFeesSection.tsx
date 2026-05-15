import { useEffect, useState } from "react";
import { Loader2, TrendingUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency } from "../utils";
import { EmptyState, SectionCard, StatusBadge } from "./AdminPrimitives";

type FeesReport = {
  summary: {
    total_fees_steps: number;
    total_fees_additional: number;
    total_fees: number;
  };
  steps_by_ticket_status: Record<string, { total_fee: number; steps_count: number }>;
  additional_by_status: Record<string, { total_fee: number; count: number }>;
  top_providers: Array<{
    provider_id: number;
    user_id?: number;
    name?: string;
    email?: string | null;
    total_fee: number;
    steps_count: number;
  }>;
  monthly_histogram: Array<{ month: string; total_fee: number; steps_count: number }>;
  fee_rate: number;
  fee_cap: number;
  generated_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  pendente: "Pendente",
  "em andamento": "Em andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
  PENDING: "Pendente",
  ACCEPTED: "Aceita",
  REFUSED: "Recusada",
  PAID: "Paga",
  CANCELLED: "Cancelada",
};

const formatMonth = (yearMonth: string) => {
  const [y, m] = yearMonth.split("-");
  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];
  const monthIdx = Math.max(0, Math.min(11, Number(m) - 1));
  return `${months[monthIdx]}/${y.slice(2)}`;
};

export function AdminFeesSection() {
  const [report, setReport] = useState<FeesReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiRequest("GET", "/admin/fees-report");
        if (!res.ok) throw new Error(await res.text());
        const body = await res.json();
        if (!cancelled) setReport(body.data);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setError("Não foi possível carregar o relatório de taxas.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mt-6 flex items-center justify-center gap-2 text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando relatório de taxas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6">
        <EmptyState title="Erro ao carregar" description={error} />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="mt-6">
        <EmptyState
          title="Sem dados ainda"
          description="O relatório de taxas estará disponível quando houver propostas com taxa aplicada."
        />
      </div>
    );
  }

  // Histograma: encontra o maior valor pra normalizar barras
  const maxMonthly = Math.max(
    1,
    ...report.monthly_histogram.map((m) => m.total_fee)
  );

  return (
    <div className="mt-2 space-y-2">
      {/* Resumo principal */}
      <div className="grid gap-2 md:grid-cols-3">
        <SectionCard title="Total acumulado" subtitle="Taxas em etapas + adicionais">
          <p className="text-xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(report.summary.total_fees)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Taxa atual: {(report.fee_rate * 100).toFixed(0)}% (teto {formatCurrency(report.fee_cap)})
          </p>
        </SectionCard>
        <SectionCard title="Em etapas" subtitle="Steps de contratos">
          <p className="text-xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(report.summary.total_fees_steps)}
          </p>
        </SectionCard>
        <SectionCard title="Em adicionais" subtitle="Cobranças avulsas">
          <p className="text-xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(report.summary.total_fees_additional)}
          </p>
        </SectionCard>
      </div>

      {/* Histograma mensal */}
      <SectionCard
        title="Histórico mensal"
        subtitle="Últimos 12 meses (taxas em etapas)"
      >
        {report.monthly_histogram.length ? (
          <div className="space-y-2">
            {report.monthly_histogram.map((row) => (
              <div key={row.month} className="flex items-center gap-3">
                <div className="w-16 text-xs font-medium text-slate-600">
                  {formatMonth(row.month)}
                </div>
                <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 transition-all"
                    style={{ width: `${(row.total_fee / maxMonthly) * 100}%` }}
                  />
                </div>
                <div className="w-28 text-right text-sm font-semibold text-slate-900">
                  {formatCurrency(row.total_fee)}
                </div>
                <div className="w-20 text-right text-xs text-slate-500">
                  {row.steps_count} etapa(s)
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Sem dados nos últimos 12 meses.
          </p>
        )}
      </SectionCard>

      {/* Por status do ticket */}
      <div className="grid gap-2 md:grid-cols-2">
        <SectionCard title="Etapas por status do contrato">
          {Object.keys(report.steps_by_ticket_status).length ? (
            <div className="space-y-2">
              {Object.entries(report.steps_by_ticket_status).map(([status, data]) => (
                <div
                  key={status}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <StatusBadge label={STATUS_LABELS[status] || status} tone="slate" />
                    <span className="text-xs text-slate-500">
                      {data.steps_count} etapa(s)
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(data.total_fee)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Sem dados.</p>
          )}
        </SectionCard>

        <SectionCard title="Pagamentos adicionais por status">
          {Object.keys(report.additional_by_status).length ? (
            <div className="space-y-2">
              {Object.entries(report.additional_by_status).map(([status, data]) => (
                <div
                  key={status}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <StatusBadge label={STATUS_LABELS[status] || status} tone="slate" />
                    <span className="text-xs text-slate-500">
                      {data.count} cobrança(s)
                    </span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(data.total_fee)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Sem dados.</p>
          )}
        </SectionCard>
      </div>

      {/* Top prestadores */}
      <SectionCard
        title="Top 10 prestadores por taxa contribuída"
        subtitle="Quem mais contribuiu com taxa pra plataforma"
      >
        {report.top_providers.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="text-left pb-2 pr-2">#</th>
                  <th className="text-left pb-2 pr-2">Prestador</th>
                  <th className="text-left pb-2 pr-2">E-mail</th>
                  <th className="text-right pb-2 pr-2">Etapas</th>
                  <th className="text-right pb-2">Taxa contribuída</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.top_providers.map((p, idx) => (
                  <tr key={p.provider_id}>
                    <td className="py-2 pr-2 text-slate-500">{idx + 1}</td>
                    <td className="py-2 pr-2 font-medium text-slate-900">
                      {p.name || `Provider #${p.provider_id}`}
                    </td>
                    <td className="py-2 pr-2 text-slate-600">{p.email || "-"}</td>
                    <td className="py-2 pr-2 text-right text-slate-600">
                      {p.steps_count}
                    </td>
                    <td className="py-2 text-right font-semibold text-emerald-700">
                      {formatCurrency(p.total_fee)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Nenhuma taxa coletada ainda.
          </p>
        )}
      </SectionCard>

      <p className="flex items-center gap-1 text-xs text-slate-400 justify-end">
        <TrendingUp className="h-3 w-3" />
        Gerado em {new Date(report.generated_at).toLocaleString("pt-BR")}
      </p>
    </div>
  );
}
