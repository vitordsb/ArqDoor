import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCcw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, PaginationControls, SectionCard, StatusBadge } from "./AdminPrimitives";
import { formatDateTime, formatRelativeTime } from "../utils";

type AuditEntry = {
  id: number;
  admin_email: string;
  action: string;
  target_type: string;
  target_id: number | null;
  metadata: Record<string, any> | null;
  ip: string | null;
  created_at: string;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  total_pages: number;
};

const ACTION_LABEL: Record<string, string> = {
  "conversation.view": "Visualizou conversa",
  "attachment.download": "Baixou documento",
  "user.verify": "Verificou usuário",
  "user.unverify": "Removeu verificação",
  "user.suspend": "Suspendeu usuário",
  "user.unsuspend": "Reativou usuário",
  "step.status.change": "Alterou status de etapa",
  "ticket.delete": "Excluiu contrato",
  "transfer.pay": "Pagou repasse",
};

const ACTION_TONE: Record<string, "emerald" | "amber" | "rose" | "slate" | "sky"> = {
  "conversation.view": "sky",
  "attachment.download": "sky",
  "user.verify": "emerald",
  "user.unverify": "amber",
  "user.suspend": "rose",
  "user.unsuspend": "emerald",
  "step.status.change": "amber",
  "ticket.delete": "rose",
  "transfer.pay": "emerald",
};

const PAGE_SIZE = 50;

export function AdminAuditLogSection() {
  const [items, setItems] = useState<AuditEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState("");
  const [sinceFilter, setSinceFilter] = useState("");
  const [untilFilter, setUntilFilter] = useState("");

  const fetchLogs = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(PAGE_SIZE));
      if (actionFilter) params.set("action", actionFilter);
      if (targetTypeFilter) params.set("target_type", targetTypeFilter);
      if (sinceFilter) params.set("since", sinceFilter);
      if (untilFilter) params.set("until", untilFilter);

      const response = await apiRequest("GET", `/admin/audit-log?${params.toString()}`);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error((body as { message?: string }).message || "Erro ao carregar log.");
      }
      const body = await response.json();
      setItems(body?.data?.items || []);
      setPagination(body?.data?.pagination || pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionFilter, targetTypeFilter, sinceFilter, untilFilter]);

  useEffect(() => {
    void fetchLogs(1);
  }, [fetchLogs]);

  return (
    <div className="mt-2 space-y-2">
      <SectionCard
        title="Filtros"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchLogs(1)}
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <RefreshCcw className="mr-1 h-3 w-3" />}
            Atualizar
          </Button>
        }
      >
        <div className="grid gap-2 md:grid-cols-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Ação
            </label>
            <select
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="">Todas</option>
              {Object.entries(ACTION_LABEL).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Alvo
            </label>
            <select
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm"
              value={targetTypeFilter}
              onChange={(e) => setTargetTypeFilter(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="user">Usuário</option>
              <option value="conversation">Conversa</option>
              <option value="attachment">Documento</option>
              <option value="step">Etapa</option>
              <option value="ticket">Contrato</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              De
            </label>
            <Input
              type="date"
              value={sinceFilter}
              onChange={(e) => setSinceFilter(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Até
            </label>
            <Input
              type="date"
              value={untilFilter}
              onChange={(e) => setUntilFilter(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </SectionCard>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <SectionCard title={`Eventos (${pagination.total})`}>
        {loading && !items.length ? (
          <div className="px-3 py-6 text-center text-sm text-slate-500">
            <Loader2 className="mx-auto h-5 w-5 animate-spin" />
          </div>
        ) : items.length ? (
          <div className="divide-y divide-slate-100">
            <div className="grid grid-cols-[180px_1fr_auto_auto] gap-3 px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <span>Quando</span>
              <span>Ação</span>
              <span>Alvo</span>
              <span>Detalhes</span>
            </div>
            {items.map((entry) => (
              <div
                key={entry.id}
                className="grid grid-cols-[180px_1fr_auto_auto] items-center gap-3 px-2 py-2"
              >
                <span className="text-xs text-slate-600" title={formatDateTime(entry.created_at)}>
                  {formatRelativeTime(entry.created_at)}
                </span>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    label={ACTION_LABEL[entry.action] || entry.action}
                    tone={ACTION_TONE[entry.action] || "slate"}
                  />
                  <span className="text-[11px] text-slate-500">{entry.admin_email}</span>
                </div>
                <span className="text-xs text-slate-700">
                  {entry.target_type}{entry.target_id ? ` #${entry.target_id}` : ""}
                </span>
                <details className="text-[11px] text-slate-500">
                  <summary className="cursor-pointer hover:text-slate-900">ver</summary>
                  <pre className="mt-1 max-w-xs whitespace-pre-wrap rounded-md bg-slate-50 px-2 py-1 text-[10px]">
                    {JSON.stringify(entry.metadata || {}, null, 2)}
                    {entry.ip ? `\nIP: ${entry.ip}` : ""}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sem eventos registrados"
            description="Nenhuma ação administrativa correspondeu aos filtros."
          />
        )}
        {pagination.total_pages > 1 ? (
          <div className="mt-3">
            <PaginationControls
              page={pagination.page}
              totalPages={pagination.total_pages}
              onPrevious={() => void fetchLogs(Math.max(1, pagination.page - 1))}
              onNext={() => void fetchLogs(Math.min(pagination.total_pages, pagination.page + 1))}
            />
          </div>
        ) : null}
      </SectionCard>
    </div>
  );
}
