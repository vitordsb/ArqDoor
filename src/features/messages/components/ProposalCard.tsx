import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Eye, FileText, Shield, CheckCircle, XCircle } from 'lucide-react';
import { formatTotalDurationFromDays } from '@/lib/utils';
import { useMemo } from 'react';

interface ProposalCardProps {
  ticket: any;
  steps: any[];
  isLatest?: boolean;
  currentUserType?: string;
  onViewDetails: (ticketId: number) => void;
  onViewPdf: (ticket: any) => void;
  onStartSignature: (ticket: any) => void;
  onRejectProposal?: (ticketId: number) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const calculateProposalTotal = (steps: any[]) =>
  steps.reduce((sum, step) => sum + (step.price || 0), 0);

const STATUS_CONFIG = {
  pendente: {
    label: 'Pendente',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    color: 'text-orange-700',
    icon: Clock,
  },
  'em andamento': {
    label: 'Em Andamento',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    color: 'text-blue-700',
    icon: Clock,
  },
  concluída: {
    label: 'Concluída',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    color: 'text-emerald-700',
    icon: CheckCircle,
  },
  cancelada: {
    label: 'Cancelada',
    badgeClass: 'bg-red-100 text-red-800 border-red-300',
    bg: 'bg-red-50',
    border: 'border-red-200',
    color: 'text-red-700',
    icon: XCircle,
  },
} as const;

const PAYMENT_MODE_LABELS: Record<string, string> = {
  per_step: "Pagamento por etapa",
  at_end: "Depósito em garantia",
  custom: "Personalizado",
};

const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  awaiting_deposit: {
    label: "Aguardando depósito",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
  },
  deposit_pending: {
    label: "Depósito pendente",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
  },
  deposit_paid: {
    label: "Depósito confirmado",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  awaiting_steps: {
    label: "Aguardando pagamento",
    badgeClass: "bg-sky-100 text-sky-800 border-sky-200",
  },
  partial_steps: {
    label: "Pagamento parcial",
    badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  steps_paid: {
    label: "Pagamento finalizado",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
};

const getStatusConfig = (status?: string) => {
  const normalized = (status || '').toLowerCase() as keyof typeof STATUS_CONFIG;
  return STATUS_CONFIG[normalized] ?? STATUS_CONFIG.pendente;
};

const getPaymentStatus = (ticket: any, steps: any[]) => {
  const raw =
    (ticket.payment_status || ticket.paymentStatus || "").toString().toLowerCase();
  if (raw && PAYMENT_STATUS_CONFIG[raw]) return raw;

  const preference =
    (ticket.payment_preference || ticket.paymentPreference || "at_end")
      .toString()
      .toLowerCase();
  if (preference === "at_end") {
    return ticket.payment ? "deposit_paid" : "awaiting_deposit";
  }

  const payableSteps = (steps || []).filter((step, index) => {
    const price = Number(step?.price || 0);
    return index !== 0 && price > 0;
  });
  if (payableSteps.length === 0) return "steps_paid";

  const paidCount = payableSteps.filter(
    (step) => step?.is_financially_cleared || step?.paid
  ).length;
  if (paidCount === 0) return "awaiting_steps";
  if (paidCount < payableSteps.length) return "partial_steps";
  return "steps_paid";
};

export function ProposalCard({
  ticket,
  steps,
  isLatest = false,
  currentUserType,
  onViewDetails,
  onViewPdf,
  onStartSignature,
  onRejectProposal,
}: ProposalCardProps) {
  const total = useMemo(() => calculateProposalTotal(steps), [steps]);
  const cfg = getStatusConfig(ticket.status);
  const paymentStatusKey = getPaymentStatus(ticket, steps);
  const paymentCfg = PAYMENT_STATUS_CONFIG[paymentStatusKey];
  const paymentModeKey = (ticket.payment_preference || ticket.paymentPreference || "at_end")
    .toString()
    .toLowerCase();
  const paymentModeLabel =
    PAYMENT_MODE_LABELS[paymentModeKey] || "Pagamento por etapa";
  const isSigned = ['concluída', 'concluida', 'cancelado'].includes(
    (ticket.status || '').toLowerCase(),
  );
  const canSign =
    currentUserType === 'contratante' &&
    (ticket.status || '').toLowerCase() === 'pendente' &&
    !isSigned;

  const formattedDuration = formatTotalDurationFromDays(ticket.total_date);

  return (
    <div
      className={`flex flex-col justify-between p-3 shadow-sm border transition-all duration-200 hover:shadow-md ${cfg.bg} ${cfg.border}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-lg bg-white shadow-sm">
            <cfg.icon className={`h-5 w-5 ${cfg.color}`} />
          </div>
          <h3 className="font-semibold text-gray-900">Proposta #{ticket.id}</h3>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge className={cfg.badgeClass}>{cfg.label}</Badge>
          {paymentCfg && (
            <Badge className={paymentCfg.badgeClass}>{paymentCfg.label}</Badge>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{steps.length} etapas</span>
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(total)}
          </span>
        </div>

        {formattedDuration && (
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1.5 opacity-70" />
            Duração total: {formattedDuration}
          </div>
        )}
        <div className="text-xs text-gray-600">
          Pagamento: <span className="font-medium">{paymentModeLabel}</span>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(ticket.id)}
            className="flex-1 min-w-[120px]"
          >
            <Eye className="h-4 w-4 mr-2" /> Detalhes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewPdf(ticket)}
            className="flex-1 min-w-[120px]"
          >
            <FileText className="h-4 w-4 mr-2" /> Ver PDF
          </Button>
          {canSign && (
            <>
              <Button
                size="sm"
                onClick={() => onStartSignature(ticket)}
                className="bg-purple-600 hover:bg-purple-700 text-white flex-1 min-w-[160px]"
              >
                <Shield className="h-4 w-4 mr-2" /> Eu assino e confirmo os termos
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onRejectProposal?.(ticket.id)}
                className="flex-1 min-w-[120px]"
              >
                <XCircle className="h-4 w-4 mr-2" /> Recusar proposta
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
