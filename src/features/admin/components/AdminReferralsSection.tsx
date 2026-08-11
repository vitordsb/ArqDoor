import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDateTime } from "../utils";
import { EmptyState, SectionCard, StatusBadge } from "./AdminPrimitives";

type ReferralRow = {
  id: number;
  status: "registered" | "qualified" | "paid" | "void";
  code: string;
  referrer: { id: number; name: string; email: string } | null;
  referred: { id: number; name: string; email: string } | null;
  first_paid_ticket_id: number | null;
  fee_amount: number;
  reward_amount: number;
  created_at: string | null;
  qualified_at: string | null;
  paid_at: string | null;
};

const statusTone = (status: ReferralRow["status"]) => {
  if (status === "paid") return "emerald" as const;
  if (status === "qualified") return "sky" as const;
  if (status === "void") return "slate" as const;
  return "amber" as const;
};

const statusLabel = (status: ReferralRow["status"]) => {
  if (status === "qualified") return "Pronta para pagar";
  if (status === "paid") return "Paga";
  if (status === "void") return "Inválida";
  return "Cadastro criado";
};

export function AdminReferralsSection() {
  const [rows, setRows] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest("GET", "/admin/referrals");
      if (!response.ok) throw new Error((await response.json().catch(() => ({})) as any)?.message || "Erro ao carregar indicações.");
      const body = await response.json();
      setRows(Array.isArray(body?.data) ? body.data : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Erro ao carregar indicações.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const markPaid = async (referral: ReferralRow) => {
    if (!window.confirm(`Confirmar pagamento manual de ${formatCurrency(referral.reward_amount)} para ${referral.referrer?.name || "o indicador"}?`)) return;
    setPayingId(referral.id);
    try {
      const response = await apiRequest("POST", `/admin/referrals/${referral.id}/mark-paid`);
      if (!response.ok) throw new Error((await response.json().catch(() => ({})) as any)?.message || "Erro ao marcar pagamento.");
      await load();
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Erro ao marcar pagamento.");
    } finally {
      setPayingId(null);
    }
  };

  if (loading) return <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Carregando indicações...</div>;
  if (error && !rows.length) return <div className="mt-6"><EmptyState title="Erro ao carregar" description={error} /></div>;

  return (
    <div className="mt-2 space-y-3">
      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div> : null}
      <SectionCard title="Indicações" subtitle="Contas cadastradas por link de recomendação e pagamentos manuais de comissão">
        {!rows.length ? <EmptyState title="Nenhuma indicação ainda" description="Os cadastros feitos por links de recomendação aparecerão aqui." /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-sm">
              <thead className="border-b border-slate-100 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500"><tr><th className="pb-2 pr-3">Indicador</th><th className="pb-2 pr-3">Indicado</th><th className="pb-2 pr-3">Contrato</th><th className="pb-2 pr-3">Comissão</th><th className="pb-2 pr-3">Status</th><th className="pb-2 text-right">Ação</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => <tr key={row.id}><td className="py-3 pr-3"><p className="font-medium text-slate-900">{row.referrer?.name || "Conta removida"}</p><p className="text-xs text-slate-500">{row.referrer?.email || "—"}</p></td><td className="py-3 pr-3"><p className="font-medium text-slate-900">{row.referred?.name || "Conta removida"}</p><p className="text-xs text-slate-500">{formatDateTime(row.created_at)}</p></td><td className="py-3 pr-3 text-slate-600">{row.first_paid_ticket_id ? `#${row.first_paid_ticket_id}` : "—"}</td><td className="py-3 pr-3"><p className="font-semibold text-emerald-700">{formatCurrency(row.reward_amount)}</p><p className="text-[11px] text-slate-500">taxa {formatCurrency(row.fee_amount)}</p></td><td className="py-3 pr-3"><StatusBadge label={statusLabel(row.status)} tone={statusTone(row.status)} /></td><td className="py-3 text-right">{row.status === "qualified" ? <button type="button" onClick={() => void markPaid(row)} disabled={payingId === row.id} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-60">{payingId === row.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}Marcar pago</button> : <span className="text-xs text-slate-400">{row.paid_at ? formatDateTime(row.paid_at) : "—"}</span>}</td></tr>)}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
